import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { COLORS } from "../../../src/constants/colors";
import { feedbackApi } from "../../../src/api/feedback";
import type { FeedbackOutcome } from "../../../src/api/feedback";
import { useResponderMatches } from "../../../src/hooks/useResponders";
import { StarRating } from "../../../src/components/ui/StarRating";
import { SelectPill } from "../../../src/components/ui/SelectPill";
import { TextInput } from "../../../src/components/ui/TextInput";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";

const OUTCOME_OPTIONS = [
  {
    label: "✅ Successful",
    value: "SUCCESSFUL",
    color: COLORS.success,
  },
  {
    label: "⚠️ Partial",
    value: "PARTIALLY_SUCCESSFUL",
    color: COLORS.warning,
  },
  {
    label: "❌ Unsuccessful",
    value: "UNSUCCESSFUL",
    color: COLORS.error,
  },
  {
    label: "❓ Unknown",
    value: "UNKNOWN",
    color: COLORS.textMuted,
  },
];

export default function FeedbackScreen() {
  const { id: reportId } = useLocalSearchParams<{ id: string }>();

  // Get responders to know which body to attach feedback to
  const { data: responders, isLoading: loadingResponders } =
    useResponderMatches(reportId);

  const [overallRating, setOverallRating] = useState(0);
  const [responseTimeRating, setResponseTimeRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [outcome, setOutcome] = useState<FeedbackOutcome | null>(null);
  const [comment, setComment] = useState("");

  const { mutateAsync: submitFeedback, isPending } = useMutation({
    mutationFn: (bodyId: string) =>
      feedbackApi.submit(reportId, {
        bodyId,
        overallRating,
        responseTimeRating,
        professionalismRating,
        outcome: outcome!,
        comment: comment.trim() || undefined,
      }),
  });

  // ── Validation ────────────────────────────────────────
  const isValid =
    overallRating > 0 &&
    responseTimeRating > 0 &&
    professionalismRating > 0 &&
    outcome !== null;

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert(
        "Incomplete",
        "Please provide all ratings and select an outcome."
      );
      return;
    }

    // Use first (best matched) responder
    const primaryResponder = responders?.[0];
    if (!primaryResponder) {
      Alert.alert(
        "No responder found",
        "Could not determine which responder to attach feedback to."
      );
      return;
    }

    try {
      await submitFeedback(primaryResponder.id);

      Alert.alert(
        "Thank you! 🙏",
        "Your feedback helps improve wildlife response in your area.",
        [
          {
            text: "Done",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (err: any) {
      // Feedback already submitted
      if (err?.code === "FEEDBACK_ALREADY_EXISTS") {
        Alert.alert(
          "Already submitted",
          "You have already submitted feedback for this report."
        );
        router.replace("/(tabs)");
        return;
      }
      Alert.alert("Submission failed", err?.message ?? "Please try again.");
    }
  }, [
    isValid,
    overallRating,
    responseTimeRating,
    professionalismRating,
    outcome,
    comment,
    responders,
    submitFeedback,
  ]);

  if (loadingResponders) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const responderName = responders?.[0]?.name ?? "the responder";

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>⭐</Text>
          <Text style={styles.headerTitle}>How did it go?</Text>
          <Text style={styles.headerSub}>
            Share your experience with{" "}
            <Text style={styles.responderName}>{responderName}</Text>. Your
            feedback helps other citizens and improves response quality.
          </Text>
        </View>

        {/* ── Ratings ── */}
        <Card style={styles.ratingsCard}>
          <Text style={styles.sectionTitle}>Ratings</Text>

          <StarRating
            label="Overall Experience"
            value={overallRating}
            onChange={setOverallRating}
          />

          <View style={styles.divider} />

          <StarRating
            label="Response Time"
            value={responseTimeRating}
            onChange={setResponseTimeRating}
          />

          <View style={styles.divider} />

          <StarRating
            label="Professionalism"
            value={professionalismRating}
            onChange={setProfessionalismRating}
          />
        </Card>

        {/* ── Outcome ── */}
        <Card style={styles.outcomeCard}>
          <SelectPill
            label="Incident Outcome"
            options={OUTCOME_OPTIONS}
            value={outcome}
            onChange={v => setOutcome(v as FeedbackOutcome)}
          />
        </Card>

        {/* ── Comment ── */}
        <Card style={styles.commentCard}>
          <TextInput
            label="Additional Comments"
            placeholder="What went well? What could be improved? Any details that might help future responders…"
            value={comment}
            onChangeText={setComment}
            multiline
            optional
            containerStyle={styles.commentInput}
          />
        </Card>

        {/* ── Validation hint ── */}
        {!isValid && (
          <Text style={styles.validationHint}>
            Please complete all star ratings and select an outcome to submit.
          </Text>
        )}
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <Button
          label={isPending ? "Submitting…" : "Submit Feedback"}
          onPress={handleSubmit}
          loading={isPending}
          disabled={!isValid}
          fullWidth
          size="lg"
        />

        <Button
          label="Skip"
          onPress={() => router.replace("/(tabs)")}
          variant="ghost"
          fullWidth
          size="md"
        />
      </View>
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
    paddingBottom: 16,
    gap: 16,
  },

  // Header
  header: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  headerEmoji: {
    fontSize: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  responderName: {
    fontWeight: "700",
    color: COLORS.primary,
  },

  // Ratings card
  ratingsCard: {
    padding: 16,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },

  // Outcome card
  outcomeCard: {
    padding: 16,
  },

  // Comment card
  commentCard: {
    padding: 16,
  },
  commentInput: {
    gap: 6,
  },

  // Validation
  validationHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 8,
  },
});
