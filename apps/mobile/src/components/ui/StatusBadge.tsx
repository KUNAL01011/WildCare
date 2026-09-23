import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

type ReportStatus =
  | 'DRAFT'
  | 'ANALYZING'
  | 'READY_FOR_REVIEW'
  | 'SUBMITTED'
  | 'RESPONDER_CONTACTED'
  | 'RESPONDER_ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'UNABLE_TO_REACH_RESPONDER'
  | 'CANCELLED';

const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string }
> = {
  DRAFT:                      { label: 'Draft',              color: COLORS.textMuted,       bg: '#EEF2F0' },
  ANALYZING:                  { label: 'Analyzing',          color: '#2563EB',              bg: '#EFF6FF' },
  READY_FOR_REVIEW:           { label: 'Review Needed',      color: '#D97706',              bg: '#FFFBEB' },
  SUBMITTED:                  { label: 'Submitted',          color: '#7C3AED',              bg: '#F5F3FF' },
  RESPONDER_CONTACTED:        { label: 'Contacted',          color: '#0891B2',              bg: '#ECFEFF' },
  RESPONDER_ACCEPTED:         { label: 'Accepted',           color: '#059669',              bg: '#ECFDF5' },
  IN_PROGRESS:                { label: 'In Progress',        color: '#D97706',              bg: '#FFFBEB' },
  RESOLVED:                   { label: 'Resolved',           color: COLORS.primary,         bg: '#ECFDF5' },
  UNABLE_TO_REACH_RESPONDER:  { label: 'Unreachable',        color: COLORS.error,           bg: '#FEF2F2' },
  CANCELLED:                  { label: 'Cancelled',          color: COLORS.error,           bg: '#FEF2F2' },
};

type Props = {
  status: ReportStatus;
  size?: 'sm' | 'md';
};

export function StatusBadge({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.color },
          isSmall && styles.textSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});