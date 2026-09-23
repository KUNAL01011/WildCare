import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { COLORS } from "../src/constants/colors";
import { useAuth } from "../src/hooks/useAuth";
import { useAuthStore } from "../src/store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 2 },
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
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <AppBootstrap>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: COLORS.primary },
              headerTintColor: COLORS.textInverse,
              headerTitleStyle: { fontWeight: "700" },
              contentStyle: { backgroundColor: COLORS.background },
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
                headerStyle: { backgroundColor: COLORS.primary },
                headerTintColor: COLORS.textInverse,
                // Prevent going back to create screen mid-analysis
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
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
