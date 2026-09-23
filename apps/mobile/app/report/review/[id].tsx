import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../src/constants/colors";
import { useReport } from "../../../src/hooks/useReports";
import { useReviewReport } from "../../../src/hooks/useReviewReport";
import { AIAnalysisCard } from "../../../src/components/shared/AIAnalysisCard";
import { ImageStrip } from "../../../src/components/shared/ImageStrip";
import { TextInput } from "../../../src/components/ui/TextInput";
import { SelectPill } from "../../../src/components/ui/SelectPill";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";

// ── Options ───────────────────────────────────────────────
const CONDITION_OPTIONS = [
  { label: "Injured", value: "injured", color: COLORS.warning },
  { label: "Dead", value: "dead", color: COLORS.error },
  { label: "Trapped", value: "trapped", color: "#7C3AED" },
  { label: "Distressed", value: "distressed", color: "#0891B2" },
  { label: "Healthy", value: "healthy", color: COLORS.success },
];

const SEVERITY_OPTIONS = [
  { label: "High", value: "high", color: COLORS.error },
  { label: "Medium", value: "medium", color: COLORS.warning },
  { label: "Low", value: "low", color: COLORS.success },
];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isLoading } = useReport(id);
  const { save, submit, isSaving, isSubmitting, submitError } =
    useReviewReport(id);

  // ── Local form state ──────────────────────────────────
  const [animalName, setAnimalName] = useState("");
  const [condition, setCondition] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Seed form from report once loaded
  useEffect(() => {
    if (!report || hasInitialized) return;

    setAnimalName(report.animal?.name ?? "");
    setCondition(report.condition.citizen ?? report.condition.ai ?? null);
    setSeverity(report.severity ?? null);
    setDescription("");
    setHasInitialized(true);
  }, [report, hasInitialized]);

  // Mark dirty on any change
  const markDirty = useCallback(() => setIsDirty(true), []);

  // ── Save draft ────────────────────────────────────────
  const handleSave = useCallback(async () => {
    try {
      await save({
        animalName: animalName.trim() || undefined,
        citizenCondition: condition ?? undefined,
        severity: severity ?? undefined,
        description: description.trim() || undefined,
      });
      setIsDirty(false);
    } catch {
      Alert.alert("Save failed", "Could not save your changes.");
    }
  }, [animalName, condition, severity, description, save]);

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    // Save any unsaved changes first
    if (isDirty) {
      await handleSave();
    }

    Alert.alert(
      "Submit Report",
      "Once submitted, you can contact a responder. Are you ready?",
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            try {
              await submit();
              router.replace(`/report/responders/${id}`);
            } catch {
              Alert.alert(
                "Submission failed",
                submitError ?? "Please try again."
              );
            }
          },
        },
      ]
    );
  }, [isDirty, handleSave, submit, id, submitError]);

  // ── Loading ───────────────────────────────────────────
  if (isLoading || !report) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading report…</Text>
      </View>
    );
  }

  // ── Location display ──────────────────────────────────
  const locationParts = [report.location.city, report.location.state].filter(
    Boolean
  );

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Report number header ── */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportNumber}>{report.reportNumber}</Text>
          <Text style={styles.reportSub}>
            Review and correct details before submitting
          </Text>
        </View>

        {/* ── Photos ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <ImageStrip images={report.images} />
        </View>

        {/* ── AI Analysis ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <AIAnalysisCard
            animal={report.animal}
            condition={report.condition}
            severity={report.severity}
          />
        </View>

        {/* ── Citizen Review Form ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assessment</Text>
            {isDirty && <View style={styles.unsavedDot} />}
          </View>

          <Card style={styles.formCard}>
            <View style={styles.form}>
              {/* Animal name */}
              <TextInput
                label="Animal / Species"
                placeholder="e.g. deer, leopard, peacock"
                value={animalName}
                onChangeText={t => {
                  setAnimalName(t);
                  markDirty();
                }}
                autoCapitalize="none"
              />

              {/* Condition */}
              <SelectPill
                label="Condition"
                options={CONDITION_OPTIONS}
                value={condition}
                onChange={v => {
                  setCondition(v);
                  markDirty();
                }}
              />

              {/* Severity */}
              <SelectPill
                label="Severity"
                options={SEVERITY_OPTIONS}
                value={severity}
                onChange={v => {
                  setSeverity(v);
                  markDirty();
                }}
              />

              {/* Description */}
              <TextInput
                label="Additional Details"
                placeholder="Describe what you saw — location context, animal behavior, any hazards nearby…"
                value={description}
                onChangeText={t => {
                  setDescription(t);
                  markDirty();
                }}
                multiline
                optional
              />

              {/* Save draft */}
              {isDirty && (
                <Button
                  label={isSaving ? "Saving…" : "Save Changes"}
                  onPress={handleSave}
                  loading={isSaving}
                  variant="secondary"
                  size="sm"
                  style={styles.saveBtn}
                />
              )}
            </View>
          </Card>
        </View>

        {/* ── Location card ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Location</Text>
          <Card style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={18} color={COLORS.primary} />
              <View style={styles.locationText}>
                {locationParts.length > 0 ? (
                  <Text style={styles.locationMain}>
                    {locationParts.join(", ")}
                  </Text>
                ) : null}
                <Text style={styles.locationCoords}>
                  {report.location.latitude.toFixed(5)},{" "}
                  {report.location.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* ── Notice ── */}
        <View style={styles.notice}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={COLORS.primaryMuted}
          />
          <Text style={styles.noticeText}>
            After submission, we'll match you with nearby responders who can
            help.
          </Text>
        </View>
      </ScrollView>

      {/* ── Fixed footer ── */}
      <View style={styles.footer}>
        <Button
          label={isSubmitting ? "Submitting…" : "Submit Report"}
          onPress={handleSubmit}
          loading={isSubmitting}
          fullWidth
          size="lg"
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
    gap: 12,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  content: {
    paddingVertical: 20,
    gap: 24,
    paddingBottom: 16,
  },

  // Report header
  reportHeader: {
    paddingHorizontal: 20,
    gap: 4,
  },
  reportNumber: {
    fontSize: 13,
    fontFamily: "monospace",
    color: COLORS.primaryMuted,
    fontWeight: "600",
  },
  reportSub: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
  },
  unsavedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },

  // Form card
  formCard: {
    marginHorizontal: 20,
    padding: 0,
    overflow: "hidden",
  },
  form: {
    padding: 16,
    gap: 18,
  },
  saveBtn: {
    alignSelf: "flex-end",
  },

  // Location
  locationCard: {
    marginHorizontal: 20,
    padding: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  locationText: {
    flex: 1,
    gap: 2,
  },
  locationMain: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  locationCoords: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: "monospace",
  },

  // Notice
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
