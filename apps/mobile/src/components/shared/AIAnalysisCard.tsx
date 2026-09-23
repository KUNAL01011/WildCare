import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { Card } from "../ui/Card";
import { ConfidenceBar } from "../ui/ConfidenceBar";

type Props = {
  animal: { name: string; confidence: number } | null;
  condition: {
    ai: string | null;
    confidence: number | null;
  };
  severity: string | null;
  observations?: string[];
};

export function AIAnalysisCard({
  animal,
  condition,
  severity,
  observations,
}: Props) {
  const hasData = animal || condition.ai;

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.aiLabel}>🤖 AI Assessment</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Auto-generated</Text>
        </View>
      </View>

      {!hasData ? (
        <Text style={styles.noData}>
          AI could not analyze the images. Please fill in the details manually.
        </Text>
      ) : (
        <View style={styles.rows}>
          {/* Animal */}
          {animal && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Animal</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {animal.name.charAt(0).toUpperCase() + animal.name.slice(1)}
                </Text>
                <ConfidenceBar
                  confidence={animal.confidence}
                  label="Confidence"
                />
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Condition */}
          {condition.ai && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Condition</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {condition.ai.charAt(0).toUpperCase() + condition.ai.slice(1)}
                </Text>
                {condition.confidence !== null && (
                  <ConfidenceBar
                    confidence={condition.confidence}
                    label="Confidence"
                  />
                )}
              </View>
            </View>
          )}

          {/* Severity */}
          {severity && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Severity</Text>
                <View style={styles.rowRight}>
                  <Text
                    style={[
                      styles.rowValue,
                      severity === "high" && { color: COLORS.error },
                      severity === "medium" && {
                        color: COLORS.warning,
                      },
                      severity === "low" && {
                        color: COLORS.success,
                      },
                    ]}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Observations */}
          {observations && observations.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.obsBlock}>
                <Text style={styles.rowLabel}>Observations</Text>
                {observations.map((obs, i) => (
                  <View key={i} style={styles.obsRow}>
                    <Text style={styles.obsDot}>·</Text>
                    <Text style={styles.obsText}>{obs}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          AI assessments are suggestions only. Please review and correct any
          errors below.
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: COLORS.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  aiLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  badge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "600",
  },
  noData: {
    padding: 16,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  rows: {
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  rowLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    width: 80,
    paddingTop: 2,
  },
  rowRight: {
    flex: 1,
    gap: 6,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
  obsBlock: {
    gap: 6,
  },
  obsRow: {
    flexDirection: "row",
    gap: 8,
    paddingLeft: 4,
  },
  obsDot: {
    fontSize: 16,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  obsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: "#FFFBEB",
    borderTopWidth: 1,
    borderTopColor: "#FEF3C7",
    padding: 12,
  },
  disclaimerText: {
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
  },
});
