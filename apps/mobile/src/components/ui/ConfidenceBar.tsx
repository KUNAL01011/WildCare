import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

type Props = {
  confidence: number; // 0–1
  label?: string;
};

export function ConfidenceBar({ confidence, label }: Props) {
  const pct = Math.round(confidence * 100);

  const color =
    pct >= 80
      ? COLORS.success
      : pct >= 50
      ? COLORS.warning
      : COLORS.error;

  return (
    <View style={styles.wrapper}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.pct, { color }]}>{pct}%</Text>
        </View>
      )}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pct: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 6,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});