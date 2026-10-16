import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const STORE_PREFIX = 'flowday-';

export async function buildExport(now: Date = new Date()): Promise<string> {
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(STORE_PREFIX)).sort();
  const entries = await AsyncStorage.multiGet(keys);

  const stores: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (value === null) continue;
    try {
      stores[key.slice(STORE_PREFIX.length)] = JSON.parse(value);
    } catch {
      stores[key.slice(STORE_PREFIX.length)] = value;
    }
  }

  return JSON.stringify(
    {
      app: 'Flowday',
      appVersion: Constants.expoConfig?.version ?? null,
      exportedAt: now.toISOString(),
      stores,
    },
    null,
    2
  );
}
