import axios, { isAxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // send httpOnly cookies on every request
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ── 401 → silent token refresh → retry ───────────────────────────────────
// When the accessToken cookie expires the backend returns 401.
// We attempt one silent refresh. If that also fails (expired refresh token),
// we redirect to /login.

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function drainQueue(error: unknown, token?: unknown) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401s that aren't themselves refresh or login calls
    if (
      !isAxiosError(error) ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/api/auth/refresh");
      drainQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      drainQueue(refreshError);
      // Refresh failed — session is truly expired, kick to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);