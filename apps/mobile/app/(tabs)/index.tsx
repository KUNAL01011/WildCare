import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/authStore";
import { useAuth } from "../../src/hooks/useAuth";
import { useReports } from "../../src/hooks/useReports";
import { COLORS } from "../../src/constants/colors";
import { ReportCard } from "../../src/components/shared/ReportCard";
import { ActiveReportBanner } from "../../src/components/shared/ActiveReportBanner";
import { Button } from "../../src/components/ui/Button";

const ACTIVE_STATUSES = [
  "ANALYZING",
  "READY_FOR_REVIEW",
  "SUBMITTED",
  "RESPONDER_CONTACTED",
  "RESPONDER_ACCEPTED",
  "IN_PROGRESS",
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useReports({
    limit: 20,
  } as any);

  const allReports = data?.reports ?? [];

  // Split into active vs recent resolved
  const activeReport = allReports.find(r => ACTIVE_STATUSES.includes(r.status));
  const recentReports = allReports
    .filter(r => r.id !== activeReport?.id)
    .slice(0, 10);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>
              Help wildlife, one report at a time.
            </Text>
          </View>

          <TouchableOpacity onPress={signOut} style={styles.avatarWrapper}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Active report banner ── */}
        {activeReport && <ActiveReportBanner report={activeReport} />}

        {/* ── Create CTA ── */}
        <TouchableOpacity
          style={styles.createCard}
          activeOpacity={0.88}
          onPress={() => router.push("/report/create")}
        >
          <View style={styles.createLeft}>
            <Text style={styles.createTitle}>Report an Incident</Text>
            <Text style={styles.createSub}>
              Spotted a wildlife emergency? Tap to report.
            </Text>
          </View>
          <Text style={styles.createIcon}>📸</Text>
        </TouchableOpacity>

        {/* ── Recent Reports ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/reports")}>
              <Text style={styles.sectionLink}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading reports…</Text>
            </View>
          ) : recentReports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌿</Text>
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptyText}>
                Your submitted reports will appear here.
              </Text>
            </View>
          ) : (
            recentReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  avatarWrapper: {
    marginLeft: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textInverse,
  },

  // Create CTA card
  createCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  createLeft: {
    flex: 1,
    gap: 4,
  },
  createTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textInverse,
  },
  createSub: {
    fontSize: 13,
    color: COLORS.accent,
    lineHeight: 18,
  },
  createIcon: {
    fontSize: 36,
    marginLeft: 12,
  },

  // Section
  section: {
    gap: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    color: COLORS.primaryMuted,
    fontWeight: "600",
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
});
