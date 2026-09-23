import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants/colors';
import { StatusBadge } from '../ui/StatusBadge';
import type { ReportSummary } from './ReportCard';

type Props = {
  report: ReportSummary;
};

export function ActiveReportBanner({ report }: Props) {
  const animal = report.animalName
    ? report.animalName.charAt(0).toUpperCase() + report.animalName.slice(1)
    : 'Incident';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/report/${report.id}`)}
      style={styles.container}
    >
      <View style={styles.left}>
        <Text style={styles.label}>Active Report</Text>
        <Text style={styles.animal}>{animal}</Text>
        <Text style={styles.number}>{report.reportNumber}</Text>
      </View>
      <View style={styles.right}>
        <StatusBadge status={report.status as any} />
        <Text style={styles.cta}>View →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  left: {
    gap: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  animal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  number: {
    fontSize: 12,
    color: COLORS.accent,
    fontFamily: 'monospace',
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  cta: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: '600',
  },
});