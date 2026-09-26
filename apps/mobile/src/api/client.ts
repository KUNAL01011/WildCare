import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { CONFIG } from "../constants/config";

export const apiClient = axios.create({
  baseURL: CONFIG.API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

apiClient.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    // Auto sign-out on 401
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("access_token");
      // The auth store will react via restoreSession
      // on next boot — or we can trigger a redirect
      const { router } = require("expo-router");
      router.replace("/(auth)/login");
    }

    const message =
      error.response?.data?.error?.message ?? "Something went wrong";
    const code = error.response?.data?.error?.code ?? "UNKNOWN_ERROR";

    return Promise.reject({
      message,
      code,
      status: error.response?.status,
    });
  }
);
