import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { COLORS } from "../../constants/colors";
import { StatusBadge } from "../ui/StatusBadge";
import { SeverityDot } from "../ui/SeverityDot";
import { Card } from "../ui/Card";

export type ReportSummary = {
  id: string;
  reportNumber: string;
  status: string;
  animalName?: string | null;
  severity?: string | null;
  location: {
    city?: string | null;
    state?: string | null;
  };
  images?: { url: string }[];
  createdAt?: string;
};

type Props = {
  report: ReportSummary;
};

export function ReportCard({ report }: Props) {
  const imageUrl = report.images?.[0]?.url;
  const locationText = [report.location.city, report.location.state]
    .filter(Boolean)
    .join(", ");

  const animal = report.animalName
    ? report.animalName.charAt(0).toUpperCase() + report.animalName.slice(1)
    : "Unknown animal";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      // Replace the existing onPress in ReportCard:
      onPress={() => {
        if (report.status === "ANALYZING") {
          router.push(`/report/analyzing/${report.id}`);
        } else {
          router.push(`/report/${report.id}`);
        }
      }}
    >
      <Card style={styles.card} padded={false}>
        <View style={styles.row}>
          {/* Thumbnail */}
          <View style={styles.thumb}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.thumbImage} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Text style={styles.thumbEmoji}>🦌</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.topRow}>
              <Text style={styles.animal}>{animal}</Text>
              {report.severity && (
                <SeverityDot severity={report.severity} showLabel={false} />
              )}
            </View>

            <Text style={styles.reportNumber}>{report.reportNumber}</Text>

            {locationText ? (
              <Text style={styles.location}>📍 {locationText}</Text>
            ) : null}

            <View style={styles.bottomRow}>
              <StatusBadge status={report.status as any} size="sm" />
            </View>
          </View>

          {/* Chevron */}
          <Text style={styles.chevron}>›</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceAlt,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
  },
  thumbEmoji: {
    fontSize: 28,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  animal: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  reportNumber: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: "monospace",
  },
  location: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  bottomRow: {
    marginTop: 4,
  },
  chevron: {
    fontSize: 22,
    color: COLORS.textMuted,
    paddingLeft: 4,
  },
});
