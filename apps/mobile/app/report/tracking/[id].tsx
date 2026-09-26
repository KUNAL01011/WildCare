import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { COLORS } from "../../../src/constants/colors";
import { useReport } from "../../../src/hooks/useReports";
import { contactApi } from "../../../src/api/contact";
import { REPORTS_KEY } from "../../../src/hooks/useReports";
import { Card } from "../../../src/components/ui/Card";
import { Button } from "../../../src/components/ui/Button";
import { StatusBadge } from "../../../src/components/ui/StatusBadge";
import {
  TRACKING_STEPS,
  UNABLE_STEP,
  getStepIndex,
} from "../../../src/utils/trackingUtils";
import type { ResponseStatus } from "../../../src/api/contact";

export default function TrackingScreen() {
  const { id: reportId } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useReport(reportId);
  const [updating, setUpdating] = useState(false);

  const { mutateAsync: updateStatus } = useMutation({
    mutationFn: (status: ResponseStatus) =>
      contactApi.updateResponse(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REPORTS_KEY, reportId],
      });
      queryClient.invalidateQueries({
        queryKey: [REPORTS_KEY],
      });
    },
  });

  // ── Handle status update ──────────────────────────────
  const handleStatusUpdate = useCallback(
    async (status: ResponseStatus) => {
      setUpdating(true);
      try {
        await updateStatus(status);

        if (status === "RESOLVED") {
          Alert.alert(
            "Incident Resolved 🎉",
            "Thank you for following up. Would you like to leave feedback for the responder?",
            [
              {
                text: "Skip",
                style: "cancel",
                onPress: () => router.replace("/(tabs)"),
              },
              {
                text: "Leave Feedback",
                onPress: () => router.push(`/report/feedback/${reportId}`),
              },
            ]
          );
        }
      } catch {
        Alert.alert(
          "Update failed",
          "Could not update the status. Please try again."
        );
      } finally {
        setUpdating(false);
      }
    },
    [reportId, updateStatus]
  );

  // ── Unable to reach ───────────────────────────────────
  const handleUnableToReach = useCallback(() => {
    Alert.alert(
      "Unable to Reach Responder?",
      "This will mark the responder as unreachable. You can go back and try another responder.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Unreachable",
          style: "destructive",
          onPress: () => handleStatusUpdate("UNABLE_TO_REACH_RESPONDER"),
        },
      ]
    );
  }, [handleStatusUpdate]);

  if (isLoading || !report) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const currentStatus = report.status as ResponseStatus;
  const currentStepIndex = getStepIndex(currentStatus);
  const isUnableToReach = currentStatus === "UNABLE_TO_REACH_RESPONDER";
  const isResolved = currentStatus === "RESOLVED";

  // Next available status
  const nextStep =
    !isResolved && !isUnableToReach
      ? TRACKING_STEPS[
          Math.min(currentStepIndex + 1, TRACKING_STEPS.length - 1)
        ]
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Report header ── */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportNumber}>{report.reportNumber}</Text>
          <StatusBadge status={currentStatus as any} />
        </View>

        {/* ── Status stepper ── */}
        <Card style={styles.stepperCard}>
          <Text style={styles.stepperTitle}>Response Progress</Text>

          <View style={styles.stepper}>
            {TRACKING_STEPS.map((step, index) => {
              const isDone = index <= currentStepIndex;
              const isActive = index === currentStepIndex;
              const isLast = index === TRACKING_STEPS.length - 1;

              return (
                <View key={step.status} style={styles.stepRow}>
                  {/* Icon */}
                  <View style={styles.stepLeft}>
                    <View
                      style={[
                        styles.stepCircle,
                        isDone
                          ? {
                              backgroundColor: step.color,
                            }
                          : styles.stepCircleInactive,
                      ]}
                    >
                      <Ionicons
                        name={step.icon as any}
                        size={14}
                        color={isDone ? "#fff" : COLORS.textMuted}
                      />
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepConnector,
                          index < currentStepIndex && styles.stepConnectorDone,
                        ]}
                      />
                    )}
                  </View>

                  {/* Text */}
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        !isDone && styles.stepLabelInactive,
                        isActive && {
                          color: step.color,
                        },
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isActive && <Text style={styles.stepSub}>{step.sub}</Text>}
                  </View>
                </View>
              );
            })}

            {/* Unable to reach branch */}
            {isUnableToReach && (
              <View style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View
                    style={[
                      styles.stepCircle,
                      { backgroundColor: COLORS.error },
                    ]}
                  >
                    <Ionicons
                      name={UNABLE_STEP.icon as any}
                      size={14}
                      color="#fff"
                    />
                  </View>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepLabel, { color: COLORS.error }]}>
                    {UNABLE_STEP.label}
                  </Text>
                  <Text style={styles.stepSub}>{UNABLE_STEP.sub}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* ── Action area ── */}
        {!isResolved && !isUnableToReach && nextStep && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionTitle}>Update Status</Text>
            <Text style={styles.actionSub}>
              What has happened since your last update?
            </Text>

            <Button
              label={`Mark as: ${nextStep.label}`}
              onPress={() => handleStatusUpdate(nextStep.status)}
              loading={updating}
              fullWidth
              size="lg"
            />

            <TouchableOpacity
              style={styles.unableBtn}
              onPress={handleUnableToReach}
              disabled={updating}
            >
              <Ionicons
                name="close-circle-outline"
                size={16}
                color={COLORS.error}
              />
              <Text style={styles.unableBtnText}>
                Unable to reach responder
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* ── Resolved state ── */}
        {isResolved && (
          <Card style={styles.resolvedCard}>
            <Text style={styles.resolvedEmoji}>🎉</Text>
            <Text style={styles.resolvedTitle}>Incident Resolved</Text>
            <Text style={styles.resolvedSub}>
              Thank you for making a difference for wildlife.
            </Text>
            <Button
              label="Leave Feedback"
              onPress={() => router.push(`/report/feedback/${reportId}`)}
              fullWidth
            />
            <Button
              label="Back to Home"
              onPress={() => router.replace("/(tabs)")}
              variant="ghost"
              fullWidth
            />
          </Card>
        )}

        {/* ── Unable to reach state ── */}
        {isUnableToReach && (
          <Card style={styles.unableCard}>
            <Text style={styles.unableTitle}>Try Another Responder</Text>
            <Text style={styles.unableSub}>
              You can go back and contact another matched responder.
            </Text>
            <Button
              label="View Other Responders"
              onPress={() => router.push(`/report/responders/${reportId}`)}
              fullWidth
            />
          </Card>
        )}

        {/* ── Help card ── */}
        {!isResolved && !isUnableToReach && (
          <View style={styles.helpCard}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <Text style={styles.helpText}>
              Update the status as the situation develops. This helps WildCare
              track incident outcomes.
            </Text>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },

  // Report header
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportNumber: {
    fontSize: 13,
    fontFamily: "monospace",
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  // Stepper card
  stepperCard: {
    padding: 16,
    gap: 16,
  },
  stepperTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  stepper: {
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
  },
  stepLeft: {
    alignItems: "center",
    width: 32,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleInactive: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: COLORS.borderLight,
    marginVertical: 3,
  },
  stepConnectorDone: {
    backgroundColor: COLORS.primaryMuted,
  },
  stepContent: {
    flex: 1,
    paddingTop: 6,
    paddingBottom: 16,
    gap: 3,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  stepLabelInactive: {
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  stepSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Action card
  actionCard: {
    padding: 16,
    gap: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  actionSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  unableBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  unableBtnText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: "600",
  },

  // Resolved card
  resolvedCard: {
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  resolvedEmoji: {
    fontSize: 48,
  },
  resolvedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  resolvedSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },

  // Unable card
  unableCard: {
    padding: 16,
    gap: 10,
  },
  unableTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  unableSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Help
  helpCard: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
  },
  helpText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
});
