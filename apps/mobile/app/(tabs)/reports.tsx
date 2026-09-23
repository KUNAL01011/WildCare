import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useReports } from "../../src/hooks/useReports";
import { ReportCard } from "../../src/components/shared/ReportCard";
import { COLORS } from "../../src/constants/colors";

const FILTERS = [
  { label: "All", value: undefined },
  { label: "Active", value: "SUBMITTED" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function ReportsScreen() {
  const [activeFilter, setActiveFilter] = useState<string | undefined>(
    undefined
  );

  const { data, isLoading, refetch, isRefetching } = useReports({
    status: activeFilter,
  });

  const reports = data?.reports ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Filter pills */}
      <View style={styles.filters}>
        {FILTERS.map(f => {
          const isActive = activeFilter === f.value;
          return (
            <TouchableOpacity
              key={f.label}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setActiveFilter(f.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.pillText, isActive && styles.pillTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => <ReportCard report={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            {isLoading ? (
              <Text style={styles.emptyText}>Loading…</Text>
            ) : (
              <>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No reports found</Text>
                <Text style={styles.emptyText}>
                  Reports you submit will appear here.
                </Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: COLORS.textInverse,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
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
