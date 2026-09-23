import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../src/constants/colors";
import { useReportPolling } from "../../../src/hooks/useReportPolling";
import { AnalysisSteps } from "../../../src/components/shared/AnalysisSteps";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";

export default function AnalyzingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const hasNavigated = useRef(false);

  // ── Polling ───────────────────────────────────────────
  const { status, report, attemptCount } = useReportPolling({
    reportId: id,
    intervalMs: 3000,
    timeoutMs: 90000,

    onReady: r => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      // Small delay so user sees the "Ready" state briefly
      setTimeout(() => {
        router.replace(`/report/review/${r.id}`);
      }, 800);
    },

    onFailed: () => {
      // AI failed but report is saved — still go to review
      // Backend should put it in READY_FOR_REVIEW with null AI fields
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      router.replace(`/report/review/${id}`);
    },

    onTimeout: () => {
      Alert.alert(
        "Taking longer than usual",
        "The AI analysis is taking a while. You can wait or check back from your reports list.",
        [
          {
            text: "Keep waiting",
            onPress: () => {
              // Reset navigate guard to allow eventual redirect
              hasNavigated.current = false;
            },
          },
          {
            text: "Go to My Reports",
            style: "default",
            onPress: () => router.replace("/(tabs)/reports"),
          },
        ]
      );
    },
  });

  // ── Derive step states ────────────────────────────────
  const isReady = status === "ready";
  const isFailed = status === "failed";
  const isTimeout = status === "timeout";

  const steps = [
    {
      label: "Photos uploaded",
      sub: "Incident evidence secured",
      state: "done" as const,
    },
    {
      label: "AI analysis",
      sub: isReady
        ? "Species and condition identified"
        : isFailed
          ? "Analysis unavailable — you can fill in details"
          : "Identifying species and condition…",
      state: isReady || isFailed ? ("done" as const) : ("active" as const),
    },
    {
      label: "Report ready",
      sub: isReady ? "Redirecting to review…" : "Waiting for analysis",
      state: isReady ? ("done" as const) : ("waiting" as const),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* ── Icon area ── */}
        <View style={styles.iconArea}>
          {isReady ? (
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={48} color={COLORS.textInverse} />
            </View>
          ) : isFailed ? (
            <View style={styles.warnCircle}>
              <Ionicons
                name="warning-outline"
                size={48}
                color={COLORS.textInverse}
              />
            </View>
          ) : (
            <View style={styles.brainCircle}>
              <Text style={styles.brainEmoji}>🔍</Text>
            </View>
          )}
        </View>

        {/* ── Heading ── */}
        <View style={styles.heading}>
          <Text style={styles.title}>
            {isReady
              ? "Analysis complete"
              : isFailed
                ? "Analysis unavailable"
                : isTimeout
                  ? "Still working…"
                  : "Analyzing incident"}
          </Text>
          <Text style={styles.subtitle}>
            {isReady
              ? "Your report is ready to review."
              : isFailed
                ? "You can still submit your report manually."
                : isTimeout
                  ? "AI is taking longer than expected."
                  : "Our AI is examining the photos to identify the animal and assess its condition."}
          </Text>
        </View>

        {/* ── Steps ── */}
        <Card style={styles.stepsCard}>
          <AnalysisSteps steps={steps} />
        </Card>

        {/* ── Attempt counter ── */}
        {!isReady && !isFailed && (
          <View style={styles.meta}>
            <PulsingIndicator />
            <Text style={styles.metaText}>
              Checking for results
              {attemptCount > 0 ? ` · ${attemptCount} checks` : ""}
            </Text>
          </View>
        )}

        {/* ── Info card ── */}
        {!isReady && !isFailed && (
          <View style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <Text style={styles.infoText}>
              Analysis usually takes 10–30 seconds depending on image
              complexity.
            </Text>
          </View>
        )}

        {/* ── Timeout actions ── */}
        {isTimeout && (
          <View style={styles.timeoutActions}>
            <Button
              label="Go to My Reports"
              onPress={() => router.replace("/(tabs)/reports")}
              variant="secondary"
              fullWidth
            />
            <Button
              label="Continue to Review Anyway"
              onPress={() => router.replace(`/report/review/${id}`)}
              fullWidth
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Small inline pulsing bar
function PulsingIndicator() {
  const { useEffect, useRef } = require("react");
  const { Animated } = require("react-native");

  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primaryMuted,
        opacity,
      }}
    />
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
  },

  // Icon
  iconArea: {
    marginBottom: 4,
  },
  brainCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  brainEmoji: {
    fontSize: 48,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  warnCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.warning,
    justifyContent: "center",
    alignItems: "center",
  },

  // Heading
  heading: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Steps card
  stepsCard: {
    width: "100%",
    padding: 20,
  },

  // Meta
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Info
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Timeout
  timeoutActions: {
    width: "100%",
    gap: 10,
  },
});
