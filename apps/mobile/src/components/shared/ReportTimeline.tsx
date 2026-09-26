import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export type TimelineEvent = {
  id: string;
  type: string;
  description?: string | null;
  createdAt: string;
};

const EVENT_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  REPORT_CREATED: {
    icon: 'document-text-outline',
    color: COLORS.primary,
    label: 'Report Created',
  },
  AI_ANALYSIS_COMPLETED: {
    icon: 'scan-outline',
    color: '#2563EB',
    label: 'AI Analysis Done',
  },
  REPORT_SUBMITTED: {
    icon: 'checkmark-circle-outline',
    color: '#7C3AED',
    label: 'Report Submitted',
  },
  CONTACT_INITIATED: {
    icon: 'call-outline',
    color: '#0891B2',
    label: 'Contact Initiated',
  },
  RESPONDER_CONTACTED: {
    icon: 'person-outline',
    color: '#0891B2',
    label: 'Responder Contacted',
  },
  RESPONDER_ACCEPTED: {
    icon: 'thumbs-up-outline',
    color: '#059669',
    label: 'Responder Accepted',
  },
  RESPONSE_STARTED: {
    icon: 'car-outline',
    color: COLORS.warning,
    label: 'Response Started',
  },
  REPORT_RESOLVED: {
    icon: 'shield-checkmark-outline',
    color: COLORS.primary,
    label: 'Resolved',
  },
  FEEDBACK_SUBMITTED: {
    icon: 'star-outline',
    color: '#F59E0B',
    label: 'Feedback Submitted',
  },
};

const DEFAULT_EVENT = {
  icon: 'ellipse-outline',
  color: COLORS.textMuted,
  label: 'Update',
};

type Props = {
  events: TimelineEvent[];
};

export function ReportTimeline({ events }: Props) {
  if (!events.length) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const config =
          EVENT_CONFIG[event.type] ?? DEFAULT_EVENT;
        const isLast = index === events.length - 1;

        return (
          <View key={event.id} style={styles.row}>
            {/* Left column: icon + connector */}
            <View style={styles.leftCol}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: config.color + '18' },
                ]}
              >
                <Ionicons
                  name={config.icon as any}
                  size={14}
                  color={config.color}
                />
              </View>
              {!isLast && (
                <View style={styles.connector} />
              )}
            </View>

            {/* Right column: content */}
            <View
              style={[
                styles.content,
                !isLast && styles.contentSpaced,
              ]}
            >
              <Text style={styles.eventLabel}>
                {config.label}
              </Text>
              {event.description && (
                <Text style={styles.eventDesc}>
                  {event.description}
                </Text>
              )}
              <Text style={styles.eventTime}>
                {formatTime(event.createdAt)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  leftCol: {
    alignItems: 'center',
    width: 32,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: COLORS.borderLight,
    marginVertical: 3,
  },
  content: {
    flex: 1,
    paddingTop: 6,
    gap: 2,
  },
  contentSpaced: {
    paddingBottom: 16,
  },
  eventLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  eventTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});