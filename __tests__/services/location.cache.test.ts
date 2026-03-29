import AsyncStorage from '@react-native-async-storage/async-storage';
import { locationService } from '../../services/location';

beforeEach(() => {
  jest.clearAllMocks();
  // Cast to any to access the jest mock reset method provided by async-storage mock
  (AsyncStorage as any).clear();
});

describe('locationService tag cache', () => {
  const sampleTags = { experience: ['Bar'], cuisine: ['American'], taste: ['Beer'] };
  const key = 'cache:locationTags:locale:dallas';

  describe('_setTagCache', () => {
    it('stores data with a timestamp', async () => {
      await locationService._setTagCache('location', key, sampleTags);
      const raw = await AsyncStorage.getItem(key);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.data).toEqual(sampleTags);
      expect(typeof parsed.timestamp).toBe('number');
    });

    it('adds the key to the index', async () => {
      await locationService._setTagCache('location', key, sampleTags);
      const indexRaw = await AsyncStorage.getItem(locationService._tagIndexKey);
      const index: string[] = JSON.parse(indexRaw!);
      expect(index).toContain(key);
    });

    it('does not duplicate the key in the index', async () => {
      await locationService._setTagCache('location', key, sampleTags);
      await locationService._setTagCache('location', key, sampleTags);
      const indexRaw = await AsyncStorage.getItem(locationService._tagIndexKey);
      const index: string[] = JSON.parse(indexRaw!);
      expect(index.filter(k => k === key)).toHaveLength(1);
    });
  });

  describe('_getTagCache', () => {
    it('returns cached data when within TTL', async () => {
      await locationService._setTagCache('location', key, sampleTags);
      const result = await locationService._getTagCache('location', key);
      expect(result).toEqual(sampleTags);
    });

    it('returns null when key is not in storage', async () => {
      const result = await locationService._getTagCache('location', 'cache:locationTags:locale:missing');
      expect(result).toBeNull();
    });

    it('returns null when TTL has expired', async () => {
      const expiredPayload = JSON.stringify({
        timestamp: Date.now() - locationService._tagTTLMs - 1000,
        data: sampleTags,
      });
      await AsyncStorage.setItem(key, expiredPayload);
      const result = await locationService._getTagCache('location', key);
      expect(result).toBeNull();
    });

    it('returns null for malformed storage entry', async () => {
      await AsyncStorage.setItem(key, 'not-valid-json{{{');
      const result = await locationService._getTagCache('location', key);
      expect(result).toBeNull();
    });
  });

  describe('clearTagCaches', () => {
    it('removes all cached tag entries and the index', async () => {
      const key2 = 'cache:locationTags:coords:0,0';
      await locationService._setTagCache('location', key, sampleTags);
      await locationService._setTagCache('location', key2, sampleTags);

      await locationService.clearTagCaches();

      expect(await AsyncStorage.getItem(key)).toBeNull();
      expect(await AsyncStorage.getItem(key2)).toBeNull();
      expect(await AsyncStorage.getItem(locationService._tagIndexKey)).toBeNull();
    });

    it('succeeds silently when cache is empty', async () => {
      await expect(locationService.clearTagCaches()).resolves.not.toThrow();
    });
  });
});
