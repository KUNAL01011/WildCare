import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Share,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/colors";
import { useFullReport } from "../../src/hooks/useReports";
import { StatusBadge } from "../../src/components/ui/StatusBadge";
import { SeverityDot } from "../../src/components/ui/SeverityDot";
import { Card } from "../../src/components/ui/Card";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { DetailRow } from "../../src/components/ui/DetailRow";
import { ImageStrip } from "../../src/components/shared/ImageStrip";
import { AIAnalysisCard } from "../../src/components/shared/AIAnalysisCard";
import { ReportTimeline } from "../../src/components/shared/ReportTimeline";
import { FeedbackSummaryCard } from "../../src/components/shared/FeedbackSummaryCard";
import { ActiveFlowCTA } from "../../src/components/shared/ActiveFlowCTA";

const TERMINAL_STATUSES = ["RESOLVED", "CANCELLED"];
const ACTIVE_STATUSES = [
  "ANALYZING",
  "READY_FOR_REVIEW",
  "SUBMITTED",
  "RESPONDER_CONTACTED",
  "RESPONDER_ACCEPTED",
  "IN_PROGRESS",
  "UNABLE_TO_REACH_RESPONDER",
];

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading, refetch, isRefetching } = useFullReport(id);

  // ── Share report number ───────────────────────────────
  const handleShare = useCallback(async () => {
    if (!report) return;
    await Share.share({
      message: `WildCare Report ${report.reportNumber} — ${
        report.animal?.name ?? "Wildlife Incident"
      } at ${report.location.city}, ${report.location.state}`,
    });
  }, [report]);

  // ── Loading ───────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading report…</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Report not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = ACTIVE_STATUSES.includes(report.status);
  const isResolved = report.status === "RESOLVED";
  const isTerminal = TERMINAL_STATUSES.includes(report.status);

  const animalDisplay = report.animal?.name
    ? report.animal.name.charAt(0).toUpperCase() + report.animal.name.slice(1)
    : "Unknown animal";

  const locationDisplay = [report.location.city, report.location.state]
    .filter(Boolean)
    .join(", ");

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      {/* Dynamic header with share button */}
      <Stack.Screen
        options={{
          title: report.reportNumber,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
              <Ionicons
                name="share-outline"
                size={22}
                color={COLORS.textInverse}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
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
          {/* ── Hero section ── */}
          <View style={styles.hero}>
            <View style={styles.heroLeft}>
              <Text style={styles.animalName}>{animalDisplay}</Text>
              <Text style={styles.location}>📍 {locationDisplay}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={report.status as any} />
                {report.severity && (
                  <SeverityDot severity={report.severity} showLabel />
                )}
              </View>
            </View>
          </View>

          {/* ── Active flow CTA ── */}
          {isActive && (
            <View style={styles.section}>
              <SectionHeader
                title="Continue"
                subtitle="Pick up where you left off"
              />
              <View style={styles.sectionBody}>
                <ActiveFlowCTA reportId={report.id} status={report.status} />
              </View>
            </View>
          )}

          {/* ── Photos ── */}
          {report.images.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Photos"
                subtitle={`${report.images.length} photo${
                  report.images.length > 1 ? "s" : ""
                } attached`}
              />
              <ImageStrip images={report.images} />
            </View>
          )}

          {/* ── Incident details ── */}
          <View style={styles.section}>
            <SectionHeader title="Incident Details" />
            <View style={styles.sectionBody}>
              <Card style={styles.detailsCard}>
                <DetailRow
                  label="Report Number"
                  value={report.reportNumber}
                  mono
                />
                <DetailRow label="Animal" value={animalDisplay} />
                <DetailRow
                  label="AI Condition"
                  value={
                    report.condition.ai
                      ? report.condition.ai.charAt(0).toUpperCase() +
                        report.condition.ai.slice(1)
                      : null
                  }
                />
                <DetailRow
                  label="Your Assessment"
                  value={
                    report.condition.citizen
                      ? report.condition.citizen.charAt(0).toUpperCase() +
                        report.condition.citizen.slice(1)
                      : null
                  }
                  valueColor={COLORS.primary}
                />
                <DetailRow
                  label="Severity"
                  value={
                    report.severity
                      ? report.severity.charAt(0).toUpperCase() +
                        report.severity.slice(1)
                      : null
                  }
                />
                <DetailRow label="Location" value={locationDisplay} />
                <DetailRow
                  label="Coordinates"
                  value={`${report.location.latitude.toFixed(
                    5
                  )}, ${report.location.longitude.toFixed(5)}`}
                  mono
                />
                <DetailRow
                  label="Reported At"
                  value={formatDate(report.createdAt)}
                />
                {report.submittedAt && (
                  <DetailRow
                    label="Submitted At"
                    value={formatDate(report.submittedAt)}
                  />
                )}
                {report.resolvedAt && (
                  <DetailRow
                    label="Resolved At"
                    value={formatDate(report.resolvedAt)}
                    valueColor={COLORS.primary}
                  />
                )}
              </Card>

              {/* Description */}
              {report.description && (
                <Card style={styles.descCard}>
                  <Text style={styles.descLabel}>Description</Text>
                  <Text style={styles.descText}>{report.description}</Text>
                </Card>
              )}
            </View>
          </View>

          {/* ── AI Analysis ── */}
          <View style={styles.section}>
            <SectionHeader title="AI Analysis" />
            <View style={styles.sectionBody}>
              <AIAnalysisCard
                animal={report.animal}
                condition={report.condition}
                severity={report.severity}
              />
            </View>
          </View>

          {/* ── Contact history ── */}
          {report.contacts && report.contacts.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Contact History"
                subtitle="Responders you contacted"
              />
              <View style={styles.sectionBody}>
                <Card style={styles.contactsCard}>
                  {report.contacts.map((contact, index) => (
                    <View
                      key={contact.id}
                      style={[
                        styles.contactRow,
                        index < (report.contacts ?? []).length - 1 &&
                          styles.contactRowBorder,
                      ]}
                    >
                      <View style={styles.contactIcon}>
                        <Ionicons
                          name="call-outline"
                          size={14}
                          color={COLORS.primaryMuted}
                        />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>
                          {contact.bodyName ?? "Responder"}
                        </Text>
                        <Text style={styles.contactMeta}>
                          {contact.type} ·{" "}
                          {new Date(contact.initiatedAt).toLocaleString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.contactStatus,
                          {
                            backgroundColor: COLORS.surfaceAlt,
                          },
                        ]}
                      >
                        <Text style={styles.contactStatusText}>
                          {contact.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </View>
            </View>
          )}

          {/* ── Feedback ── */}
          {report.feedback && (
            <View style={styles.section}>
              <SectionHeader title="Feedback Submitted" />
              <View style={styles.sectionBody}>
                <FeedbackSummaryCard feedback={report.feedback} />
              </View>
            </View>
          )}

          {/* ── Timeline ── */}
          {report.events && report.events.length > 0 && (
            <View style={styles.section}>
              <SectionHeader
                title="Timeline"
                subtitle="Full history of this report"
              />
              <View style={styles.sectionBody}>
                <Card style={styles.timelineCard}>
                  <ReportTimeline events={report.events} />
                </Card>
              </View>
            </View>
          )}

          {/* ── Feedback CTA for resolved with no feedback ── */}
          {isResolved && !report.feedback && (
            <View style={styles.section}>
              <View style={styles.sectionBody}>
                <TouchableOpacity
                  style={styles.feedbackCTA}
                  onPress={() => router.push(`/report/feedback/${report.id}`)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.feedbackCTAIcon}>⭐</Text>
                  <View style={styles.feedbackCTAText}>
                    <Text style={styles.feedbackCTATitle}>Leave feedback</Text>
                    <Text style={styles.feedbackCTASub}>
                      Share your experience with the responder
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={COLORS.primaryMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
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
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorIcon: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  backBtnText: {
    color: COLORS.textInverse,
    fontWeight: "600",
    fontSize: 14,
  },
  headerBtn: {
    padding: 4,
    marginRight: 4,
  },
  content: {
    paddingVertical: 20,
    gap: 28,
    paddingBottom: 48,
  },

  // Hero
  hero: {
    paddingHorizontal: 20,
    gap: 12,
  },
  heroLeft: {
    gap: 6,
  },
  animalName: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionBody: {
    paddingHorizontal: 20,
    gap: 10,
  },

  // Details card
  detailsCard: {
    padding: 16,
    gap: 0,
  },
  descCard: {
    padding: 14,
    gap: 6,
  },
  descLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  descText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Contacts
  contactsCard: {
    padding: 0,
    overflow: "hidden",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  contactRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  contactMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  contactStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  contactStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // Timeline card
  timelineCard: {
    padding: 16,
  },

  // Feedback CTA
  feedbackCTA: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackCTAIcon: {
    fontSize: 28,
  },
  feedbackCTAText: {
    flex: 1,
    gap: 2,
  },
  feedbackCTATitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  feedbackCTASub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
