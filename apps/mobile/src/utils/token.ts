import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';

export const tokenStorage = {
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  remove: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};