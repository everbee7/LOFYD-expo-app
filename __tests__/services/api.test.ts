import AsyncStorage from '@react-native-async-storage/async-storage';

// Factories that only use literals — no external variable references needed at hoist time
jest.mock('axios', () => ({
  create: jest.fn(),
  isAxiosError: jest.fn((e: any) => Boolean(e?.__isAxiosError)),
}));

jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} } },
}));

jest.mock('../../store/authStore', () => ({
  default: { getState: jest.fn() },
}));

// File-level references populated in beforeAll
let requestHandler: (config: any) => Promise<any>;
let responseErrorHandler: (error: any) => Promise<any>;
let mockApiClientFn: jest.Mock;
let mockRefreshPost: jest.Mock;
let mockLogout: jest.Mock;

beforeAll(() => {
  const axios = jest.requireMock('axios') as any;
  const authStoreMock = jest.requireMock('../../store/authStore') as any;

  mockApiClientFn = jest.fn();
  mockRefreshPost = jest.fn();
  mockLogout = jest.fn();

  const requestUseFn = jest.fn();
  const responseUseFn = jest.fn();

  (mockApiClientFn as any).interceptors = {
    request: { use: requestUseFn },
    response: { use: responseUseFn },
  };

  authStoreMock.default.getState.mockReturnValue({ logout: mockLogout });

  // Configure create() before the module loads so the right instances are returned
  axios.create
    .mockReturnValueOnce(mockApiClientFn)   // apiClient
    .mockReturnValue({ post: mockRefreshPost }); // refreshApiClient

  // Load services/api here (not at top level) so it sees the configured mocks
  require('../../services/api');

  requestHandler = requestUseFn.mock.calls[0][0];
  responseErrorHandler = responseUseFn.mock.calls[0][1];
});

beforeEach(async () => {
  jest.clearAllMocks();
  mockApiClientFn.mockReset();
  mockRefreshPost.mockReset();
  // Re-configure authStore after clearAllMocks resets it
  const authStoreMock = jest.requireMock('../../store/authStore') as any;
  authStoreMock.default.getState.mockReturnValue({ logout: mockLogout });
  await (AsyncStorage as any).clear();
});

// ─── Request interceptor ───────────────────────────────────────────────────

describe('request interceptor', () => {
  it('adds Authorization header when idToken is stored', async () => {
    await AsyncStorage.setItem('idToken', 'test-id-token');

    const config = { headers: {} };
    const result = await requestHandler(config);

    expect(result.headers['Authorization']).toBe('Bearer test-id-token');
  });

  it('does not add Authorization header when no idToken is stored', async () => {
    const config = { headers: {} };
    const result = await requestHandler(config);

    expect(result.headers['Authorization']).toBeUndefined();
  });
});

// ─── Response interceptor — expired token ─────────────────────────────────

describe('response interceptor — expired token (401)', () => {
  const makeExpiredError = (config: any = { headers: {}, _retry: false }) => ({
    config,
    response: { status: 401, data: { message: 'The incoming token has expired' } },
  });

  const stubRefreshSuccess = (idToken = 'new-id-token') =>
    mockRefreshPost.mockResolvedValue({
      data: { userId: 'user-1', token: { idToken, accessToken: 'new-access' } },
    });

  it('calls the refresh endpoint with stored userId and refreshToken', async () => {
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');
    stubRefreshSuccess();
    mockApiClientFn.mockResolvedValue({ data: {} });

    await responseErrorHandler(makeExpiredError());

    expect(mockRefreshPost).toHaveBeenCalledWith('/auth/refresh-token', {
      userId: 'user-1',
      refreshToken: 'rt-abc',
    });
  });

  it('retries the original request with the new token in the Authorization header', async () => {
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');
    stubRefreshSuccess('refreshed-token');
    mockApiClientFn.mockResolvedValue({ data: {} });

    const config = { headers: {}, _retry: false };
    await responseErrorHandler(makeExpiredError(config));

    expect(mockApiClientFn).toHaveBeenCalledWith(
      expect.objectContaining({
        _retry: true,
        headers: expect.objectContaining({ Authorization: 'Bearer refreshed-token' }),
      }),
    );
  });

  it('stores the new idToken in AsyncStorage after a successful refresh', async () => {
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');
    stubRefreshSuccess('fresh-token');
    mockApiClientFn.mockResolvedValue({ data: {} });

    await responseErrorHandler(makeExpiredError());

    expect(await AsyncStorage.getItem('idToken')).toBe('fresh-token');
  });

  it('clears all stored tokens when refresh fails', async () => {
    await AsyncStorage.setItem('idToken', 'old-id');
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');
    await AsyncStorage.setItem('accessToken', 'old-ac');
    mockRefreshPost.mockRejectedValue(new Error('Network error'));

    await expect(responseErrorHandler(makeExpiredError())).rejects.toBeDefined();

    expect(await AsyncStorage.getItem('idToken')).toBeNull();
    expect(await AsyncStorage.getItem('userId')).toBeNull();
    expect(await AsyncStorage.getItem('accessToken')).toBeNull();
    expect(await AsyncStorage.getItem('refreshToken')).toBeNull();
  });

  it('rejects with the refresh error when refresh fails', async () => {
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');
    const refreshError = new Error('Token refresh failed');
    mockRefreshPost.mockRejectedValue(refreshError);

    await expect(responseErrorHandler(makeExpiredError())).rejects.toBe(refreshError);
  });

  it('queues concurrent 401s and retries all after a single refresh', async () => {
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');

    let resolveRefresh!: (v: any) => void;
    mockRefreshPost.mockReturnValue(
      new Promise(res => {
        resolveRefresh = res;
      }),
    );
    mockApiClientFn.mockResolvedValue({ data: {} });

    const config1 = { headers: {}, _retry: false };
    const config2 = { headers: {}, _retry: false };

    // First request sets isRefreshing = true; second gets queued
    const p1 = responseErrorHandler(makeExpiredError(config1));
    const p2 = responseErrorHandler(makeExpiredError(config2));

    resolveRefresh({
      data: { userId: 'user-1', token: { idToken: 'new-token', accessToken: 'new-ac' } },
    });

    await Promise.all([p1, p2]);

    // Both requests should have been retried via apiClient
    expect(mockApiClientFn).toHaveBeenCalledTimes(2);
  });

  it('rejects all queued requests when refresh fails', async () => {
    await AsyncStorage.setItem('userId', 'user-1');
    await AsyncStorage.setItem('refreshToken', 'rt-abc');

    let rejectRefresh!: (e: any) => void;
    mockRefreshPost.mockReturnValue(
      new Promise((_, rej) => {
        rejectRefresh = rej;
      }),
    );

    const config1 = { headers: {}, _retry: false };
    const config2 = { headers: {}, _retry: false };

    const p1 = responseErrorHandler(makeExpiredError(config1));
    const p2 = responseErrorHandler(makeExpiredError(config2));

    rejectRefresh(new Error('Refresh failed'));

    await expect(p1).rejects.toBeDefined();
    await expect(p2).rejects.toBeDefined();
  });
});

// ─── Response interceptor — non-expired errors ────────────────────────────

describe('response interceptor — non-expired errors', () => {
  it('passes through 401 with a different error message without refreshing', async () => {
    const error = {
      config: { headers: {}, _retry: false },
      response: { status: 401, data: { message: 'Unauthorized' } },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(mockRefreshPost).not.toHaveBeenCalled();
  });

  it('passes through non-401 errors without refreshing', async () => {
    const error = {
      config: { headers: {} },
      response: { status: 500, data: { message: 'Internal Server Error' } },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(mockRefreshPost).not.toHaveBeenCalled();
  });

  it('does not retry a request that already has _retry set', async () => {
    const error = {
      config: { headers: {}, _retry: true },
      response: { status: 401, data: { message: 'The incoming token has expired' } },
    };

    await expect(responseErrorHandler(error)).rejects.toBe(error);
    expect(mockRefreshPost).not.toHaveBeenCalled();
  });
});
