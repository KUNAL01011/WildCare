import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

type Props = {
  label: string;
  value: string | null | undefined;
  valueColor?: string;
  mono?: boolean;
};

export function DetailRow({
  label,
  value,
  valueColor,
  mono = false,
}: Props) {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          valueColor ? { color: valueColor } : undefined,
          mono && styles.mono,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  mono: {
    fontFamily: 'monospace',
  },
});