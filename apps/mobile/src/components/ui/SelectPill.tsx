import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';

type Option = {
  label: string;
  value: string;
  color?: string;
};

type Props = {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  optional?: boolean;
};

export function SelectPill({
  label,
  options,
  value,
  onChange,
  optional = false,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional && (
          <Text style={styles.optional}>optional</Text>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {options.map((opt) => {
          const isActive = value === opt.value;
          const activeColor = opt.color ?? COLORS.primary;

          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
              style={[
                styles.pill,
                isActive
                  ? { backgroundColor: activeColor, borderColor: activeColor }
                  : styles.pillInactive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  isActive
                    ? styles.pillTextActive
                    : styles.pillTextInactive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  optional: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 2,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillInactive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.textInverse,
  },
  pillTextInactive: {
    color: COLORS.textSecondary,
  },
});