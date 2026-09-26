import { Tabs, router } from "expo-router";
import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuthStore } from "../../src/store/authStore";
import { useReports } from "../../src/hooks/useReports";
import { COLORS } from "../../src/constants/colors";
import { Ionicons } from "@expo/vector-icons";

const ACTIVE_STATUSES = [
  "ANALYZING",
  "READY_FOR_REVIEW",
  "SUBMITTED",
  "RESPONDER_CONTACTED",
  "RESPONDER_ACCEPTED",
  "IN_PROGRESS",
];

function Badge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={badgeStyles.badge}>
      <Text style={badgeStyles.text}>{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  text: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  const { data } = useReports({ limit: 50 } as any);
  const activeCount =
    data?.reports?.filter(r => ACTIVE_STATUSES.includes(r.status)).length ?? 0;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 10,
          paddingTop: 6,
        },
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.textInverse,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "WildCare",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "My Reports",
          tabBarLabel: "Reports",
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons
                name="document-text-outline"
                size={size}
                color={color}
              />
              <Badge count={activeCount} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
