import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../src/constants/colors";
import {
  useResponderMatches,
  useRecordContact,
} from "../../../src/hooks/useResponders";
import { ResponderCard } from "../../../src/components/shared/ResponderCard";
import { ResponderDetailSheet } from "../../../src/components/shared/ResponderDetailSheet";
import { Card } from "../../../src/components/ui/Card";
import type { ResponderMatch } from "../../../src/api/responders";
import {
  Skeleton,
  ResponderCardSkeleton,
} from '../../../src/components/ui/Skeleton';

export default function RespondersScreen() {
  const { id: reportId } = useLocalSearchParams<{ id: string }>();

  const {
    data: responders,
    isLoading,
    refetch,
    isRefetching,
  } = useResponderMatches(reportId);

  const { mutateAsync: recordContact } = useRecordContact();

  const [selectedResponder, setSelectedResponder] =
    useState<ResponderMatch | null>(null);

  // ── Call handler ──────────────────────────────────────
  const handleCall = useCallback(
    async (responder: ResponderMatch) => {
      if (!responder.phone) {
        Alert.alert(
          "No phone number",
          "This responder has not provided a phone number."
        );
        return;
      }

      try {
        // Record the contact attempt first
        await recordContact({
          reportId,
          bodyId: responder.id,
        });
      } catch {
        // Non-blocking — still open dialer even if recording fails
      }

      const tel = `tel:${responder.phone}`;
      const canCall = await Linking.canOpenURL(tel);

      if (canCall) {
        await Linking.openURL(tel);
        // Navigate to tracking after dialer opens
        router.push(`/report/tracking/${reportId}`);
      } else {
        Alert.alert(
          "Cannot make call",
          `Please call ${responder.name} at ${responder.phone}`
        );
      }
    },
    [reportId, recordContact]
  );

  // ── Loading ───────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.skeletonContent}>
          <Skeleton height={72} borderRadius={12} />
          <View style={{ height: 8 }} />
          {[1, 2, 3].map(i => (
            <View key={i} style={{ marginBottom: 12 }}>
              <ResponderCardSkeleton />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const list = responders ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <FlatList
        data={list}
        keyExtractor={item => item.id}
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
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Info banner */}
            <Card style={styles.infoBanner}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={COLORS.primaryMuted}
                />
                <Text style={styles.infoText}>
                  These responders are matched based on your incident location
                  and animal type. Call the best match and update the response
                  status.
                </Text>
              </View>
            </Card>

            <Text style={styles.sectionTitle}>
              {list.length > 0
                ? `${list.length} Matched Responder${list.length > 1 ? "s" : ""}`
                : "No Responders Found"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No responders matched</Text>
            <Text style={styles.emptyText}>
              We couldn't find verified responders near your incident location.
              Try contacting local wildlife or forest authorities directly.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <ResponderCard
            responder={item}
            rank={index + 1}
            onCall={handleCall}
            onViewDetails={setSelectedResponder}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          list.length > 0 ? (
            <View style={styles.footer}>
              <Ionicons
                name="shield-outline"
                size={14}
                color={COLORS.textMuted}
              />
              <Text style={styles.footerText}>
                WildCare does not automatically dispatch responders. Calling
                initiates contact on your behalf.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Detail sheet */}
      <ResponderDetailSheet
        responder={selectedResponder}
        onClose={() => setSelectedResponder(null)}
        onCall={r => {
          setSelectedResponder(null);
          handleCall(r);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  skeletonContent: {
  padding: 20,
  paddingTop: 16,
},
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 0,
  },

  // Header
  header: {
    gap: 16,
    marginBottom: 16,
  },
  infoBanner: {
    padding: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  // Separator
  separator: {
    height: 12,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
    paddingHorizontal: 20,
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
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },

  // Footer
  footer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    paddingTop: 20,
    paddingHorizontal: 4,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
