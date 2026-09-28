import * as SecureStore from 'expo-secure-store';

export const secureTokenStore = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync('accessToken');
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', token);
  },

  async clearAccessToken(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
  },
};
