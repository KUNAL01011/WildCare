import { apiClient } from './client';
import type { AuthUser } from '../store/authStore';

type GoogleAuthResponse = {
  user: AuthUser;
  accessToken: string;
};

// Send Google idToken to backend, get back our app token
export const loginWithGoogle = async (
  idToken: string
): Promise<GoogleAuthResponse> => {
  const res = await apiClient.post('/auth/google', { idToken });
  return res.data.data;
};

// Get currently authenticated user (used on app boot)
export const getMe = async (): Promise<AuthUser> => {
  const res = await apiClient.get('/auth/me');
  return res.data.data;
};