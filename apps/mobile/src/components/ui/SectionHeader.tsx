import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 2,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});