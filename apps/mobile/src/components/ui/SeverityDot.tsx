import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const SEVERITY_CONFIG = {
  high:   { color: COLORS.severityHigh,   label: 'High' },
  medium: { color: COLORS.severityMedium, label: 'Medium' },
  low:    { color: COLORS.severityLow,    label: 'Low' },
};

type Props = {
  severity: 'high' | 'medium' | 'low' | string;
  showLabel?: boolean;
};

export function SeverityDot({ severity, showLabel = true }: Props) {
  const config =
    SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG] ??
    SEVERITY_CONFIG.medium;

  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      {showLabel && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});