import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { Card } from "../ui/Card";

type Props = {
  feedback: {
    overallRating: number;
    responseTimeRating: number;
    professionalismRating: number;
    outcome: string;
    comment: string | null;
    createdAt: string;
  };
};

const OUTCOME_LABELS: Record<string, string> = {
  SUCCESSFUL: "✅ Successful",
  PARTIALLY_SUCCESSFUL: "⚠️ Partially Successful",
  UNSUCCESSFUL: "❌ Unsuccessful",
  UNKNOWN: "❓ Unknown",
};

function Stars({ value }: { value: number }) {
  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <Text key={i} style={i < value ? styles.starFilled : styles.starEmpty}>
          ★
        </Text>
      ))}
    </Text>
  );
}

export function FeedbackSummaryCard({ feedback }: Props) {
  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Feedback</Text>
        <View style={styles.outcomeBadge}>
          <Text style={styles.outcomeText}>
            {OUTCOME_LABELS[feedback.outcome] ?? feedback.outcome}
          </Text>
        </View>
      </View>

      {/* Ratings grid */}
      <View style={styles.grid}>
        <View style={styles.gridCell}>
          <Stars value={feedback.overallRating} />
          <Text style={styles.gridLabel}>Overall</Text>
        </View>
        <View style={styles.gridDivider} />
        <View style={styles.gridCell}>
          <Stars value={feedback.responseTimeRating} />
          <Text style={styles.gridLabel}>Response Time</Text>
        </View>
        <View style={styles.gridDivider} />
        <View style={styles.gridCell}>
          <Stars value={feedback.professionalismRating} />
          <Text style={styles.gridLabel}>Professionalism</Text>
        </View>
      </View>

      {/* Comment */}
      {feedback.comment && (
        <View style={styles.commentBlock}>
          <Text style={styles.commentLabel}>Comment</Text>
          <Text style={styles.comment}>"{feedback.comment}"</Text>
        </View>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surfaceAlt,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  outcomeBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outcomeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: "row",
    padding: 14,
    gap: 0,
  },
  gridCell: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  gridDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  stars: {
    fontSize: 14,
    letterSpacing: 1,
  },
  starFilled: {
    color: "#F59E0B",
  },
  starEmpty: {
    color: COLORS.borderLight,
  },
  gridLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  commentBlock: {
    padding: 14,
    paddingTop: 0,
    gap: 4,
  },
  commentLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  comment: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
