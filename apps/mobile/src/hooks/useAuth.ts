import { useCallback } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/authStore';
import { loginWithGoogle, getMe } from '../api/auth';
import { tokenStorage } from '../utils/token';
import { CONFIG } from '../constants/config';

WebBrowser.maybeCompleteAuthSession();

export const useAuth = () => {
  const { setAuth, clearAuth, setLoading, user, isAuthenticated, isLoading } =
    useAuthStore();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: CONFIG.GOOGLE_CLIENT_ID,
    // For standalone builds you also need iosClientId / androidClientId
    // iosClientId: CONFIG.GOOGLE_IOS_CLIENT_ID,
    // androidClientId: CONFIG.GOOGLE_ANDROID_CLIENT_ID,
  });

  // Called once on app boot — checks if we already have a token
  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const token = await tokenStorage.get();
      if (!token) {
        clearAuth();
        return;
      }
      // Token exists — verify it with backend
      const me = await getMe();
      setAuth(me, token);
    } catch {
      // Token expired or invalid
      await tokenStorage.remove();
      clearAuth();
    }
  }, []);

  // Called after Google prompt returns a token
  const handleGoogleResponse = useCallback(async () => {
    if (response?.type !== 'success') return;

    const idToken = response.authentication?.idToken;
    if (!idToken) return;

    setLoading(true);
    try {
      const { user, accessToken } = await loginWithGoogle(idToken);
      await tokenStorage.set(accessToken);
      setAuth(user, accessToken);
    } catch (err) {
      clearAuth();
      throw err;
    }
  }, [response]);

  const signOut = useCallback(async () => {
    await tokenStorage.remove();
    clearAuth();
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    request,
    promptAsync,
    handleGoogleResponse,
    restoreSession,
    signOut,
  };
};