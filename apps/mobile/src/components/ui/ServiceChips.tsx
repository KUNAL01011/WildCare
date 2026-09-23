import { View, Text, StyleSheet } from "react-native";
import { SERVICE_LABELS } from "../../utils/responderUtils";
import type { ResponderService } from "../../api/responders";
import { COLORS } from "../../constants/colors";

type Props = {
  services: ResponderService[];
  max?: number;
};

export function ServiceChips({ services, max = 3 }: Props) {
  const visible = services.slice(0, max);
  const extra = services.length - max;

  return (
    <View style={styles.row}>
      {visible.map(s => (
        <View key={s} style={styles.chip}>
          <Text style={styles.chipText}>{SERVICE_LABELS[s] ?? s}</Text>
        </View>
      ))}
      {extra > 0 && (
        <View style={[styles.chip, styles.chipExtra]}>
          <Text style={[styles.chipText, styles.chipTextExtra]}>
            +{extra} more
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  chipExtra: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
  },
  chipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  chipTextExtra: {
    color: COLORS.textMuted,
  },
});
