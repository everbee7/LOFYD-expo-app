// services/api.ts
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });

    failedQueue = [];
};

// Helper functions
const getStoredTokens = async () => {
    const [idToken, userId, refreshToken] = await Promise.all([
        AsyncStorage.getItem('idToken'),
        AsyncStorage.getItem('userId'),
        AsyncStorage.getItem('refreshToken')
    ]);

    return { idToken, userId, refreshToken };
};

const clearStoredTokens = async () => {
    await Promise.all([
        AsyncStorage.removeItem('idToken'),
        AsyncStorage.removeItem('userId'),
        AsyncStorage.removeItem('accessToken'),
        AsyncStorage.removeItem('refreshToken')
    ]);
};

const updateStoredTokens = async (tokens: {
    idToken: string;
    userId: string;
    accessToken: string;
    refreshToken: string;
}) => {
    await Promise.all([
        AsyncStorage.setItem('idToken', tokens.idToken),
        AsyncStorage.setItem('userId', tokens.userId),
        AsyncStorage.setItem('accessToken', tokens.accessToken),
        AsyncStorage.setItem('refreshToken', tokens.refreshToken)
    ]);
};

// Create a separate axios instance for token refresh (no interceptors)
const refreshApiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

// Token refresh function that bypasses interceptors
const refreshAuthToken = async (): Promise<string> => {
    const { userId, refreshToken } = await getStoredTokens();

    if (!userId || !refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        // Use separate axios instance to avoid circular dependency
        const response = await refreshApiClient.post('/auth/refresh-token', {
            userId,
            refreshToken
        });

        const { token } = response.data;

        await updateStoredTokens({
            idToken: token.idToken,
            userId: response.data.userId,
            accessToken: token.accessToken,
            refreshToken: refreshToken
        });

        return token.idToken;
    } catch (error) {
        console.error('Token refresh failed:', error);
        throw error;
    }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        const { idToken } = await getStoredTokens();

        if (idToken) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${idToken}`;
        }

        console.info(`API Request: ${config.method?.toUpperCase()}`, config.url);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if error is due to token expiration
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (error.response && error.response.data && error.response.data.message && error.response.data.message === "The incoming token has expired") {
                if (isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(() => {
                        return apiClient(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const newToken = await refreshAuthToken();
                    processQueue(null, newToken);

                    // Update authorization header and retry original request
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return apiClient(originalRequest);

                } catch (refreshError) {
                    processQueue(refreshError, null);

                    // If refresh fails, clear tokens and redirect to login
                    await clearStoredTokens();

                    // Notify auth store about logout
                    try {
                        const { default: useAuthStore } = await import('../store/authStore');
                        useAuthStore.getState().logout();
                    } catch (error) {
                        console.warn('Failed to notify auth store:', error);
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }

        // Enhanced error logging
        if (axios.isAxiosError(error)) {
            console.error(`API Error:`, {
                url: error.config?.url,
                method: error.config?.method,
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
        }

        return Promise.reject(error);
    }
);

// Main API request function
export const apiRequest = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any
): Promise<T> => {
    try {
        const response = await apiClient({
            url: endpoint,
            method,
            data,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw error.response?.data?.error || error.response?.data?.message || error.message;
        } else {
            console.error(`Unexpected Error (${endpoint}):`, error);
            throw error;
        }
    }
};

// Form data request function
export const formDataRequest = async <T>(
    endpoint: string,
    formData: FormData
): Promise<T> => {
    try {
        const response = await apiClient.post(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        });

        return response.data;
    } catch (error) {
        console.error('FormData API Error:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};

// Export the configured axios instance for direct use if needed
export { apiClient };