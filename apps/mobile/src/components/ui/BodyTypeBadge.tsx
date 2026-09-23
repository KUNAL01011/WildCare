import { View, Text, StyleSheet } from "react-native";
import { BODY_TYPE_CONFIG } from "../../utils/responderUtils";
import type { BodyType } from "../../api/responders";

type Props = {
  type: BodyType;
  showEmoji?: boolean;
};

export function BodyTypeBadge({ type, showEmoji = true }: Props) {
  const config = BODY_TYPE_CONFIG[type];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      {showEmoji && <Text style={styles.emoji}>{config.emoji}</Text>}
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  emoji: {
    fontSize: 11,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
