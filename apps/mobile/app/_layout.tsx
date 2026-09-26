import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth";
import { useAuthStore } from "../src/store/authStore";
import { ToastProvider } from "../src/components/ui/Toast";
import { ErrorBoundary } from "../src/components/ui/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry auth errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 1000 * 60 * 2,
    },
    mutations: {
      onError: (error: any) => {
        // Silent — individual hooks handle UI feedback
        console.error("[Mutation error]", error);
      },
    },
  },
});

function AppBootstrap({ children }: { children: React.ReactNode }) {
  const { restoreSession } = useAuth();
  const { isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.primary,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <AppBootstrap>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: COLORS.primary,
                  },
                  headerTintColor: COLORS.textInverse,
                  headerTitleStyle: { fontWeight: "700" },
                  contentStyle: {
                    backgroundColor: COLORS.background,
                  },
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="report/create"
                  options={{ title: "New Report" }}
                />
                <Stack.Screen
                  name="report/camera"
                  options={{
                    headerShown: false,
                    presentation: "fullScreenModal",
                  }}
                />
                <Stack.Screen
                  name="report/analyzing/[id]"
                  options={{
                    title: "Analyzing",
                    headerBackVisible: false,
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen
                  name="report/review/[id]"
                  options={{
                    title: "Review Report",
                    headerBackVisible: false,
                    gestureEnabled: false,
                  }}
                />
                <Stack.Screen
                  name="report/responders/[id]"
                  options={{ title: "Responders" }}
                />
                <Stack.Screen
                  name="report/tracking/[id]"
                  options={{ title: "Response Tracking" }}
                />
                <Stack.Screen
                  name="report/feedback/[id]"
                  options={{ title: "Leave Feedback" }}
                />
                <Stack.Screen
                  name="report/[id]"
                  options={{ title: "Report Details" }}
                />
              </Stack>
            </AppBootstrap>
          </ToastProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
