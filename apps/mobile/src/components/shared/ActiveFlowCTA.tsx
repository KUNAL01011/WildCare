import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type Props = {
  reportId: string;
  status: string;
};

type FlowTarget = {
  label: string;
  sub: string;
  icon: string;
  route: string;
  color: string;
};

const FLOW_MAP: Partial<Record<string, FlowTarget>> = {
  ANALYZING: {
    label: 'Analysis in progress',
    sub: 'Tap to check AI results',
    icon: 'scan-outline',
    route: 'analyzing',
    color: '#2563EB',
  },
  READY_FOR_REVIEW: {
    label: 'Review required',
    sub: 'Check AI analysis and confirm details',
    icon: 'create-outline',
    route: 'review',
    color: COLORS.warning,
  },
  SUBMITTED: {
    label: 'Find a responder',
    sub: 'Contact nearby wildlife responders',
    icon: 'people-outline',
    route: 'responders',
    color: '#7C3AED',
  },
  RESPONDER_CONTACTED: {
    label: 'Update response status',
    sub: 'Track the ongoing response',
    icon: 'pulse-outline',
    route: 'tracking',
    color: '#0891B2',
  },
  RESPONDER_ACCEPTED: {
    label: 'Response accepted',
    sub: 'Track progress and mark resolved',
    icon: 'car-outline',
    route: 'tracking',
    color: '#059669',
  },
  IN_PROGRESS: {
    label: 'Response in progress',
    sub: 'Update status or mark resolved',
    icon: 'fitness-outline',
    route: 'tracking',
    color: COLORS.warning,
  },
  UNABLE_TO_REACH_RESPONDER: {
    label: 'Try another responder',
    sub: 'Contact a different responder',
    icon: 'refresh-outline',
    route: 'responders',
    color: COLORS.error,
  },
};

export function ActiveFlowCTA({ reportId, status }: Props) {
  const target = FLOW_MAP[status];
  if (!target) return null;

  const handlePress = () => {
    router.push(`/report/${target.route}/${reportId}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: target.color + '40' },
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: target.color + '18' },
        ]}
      >
        <Ionicons
          name={target.icon as any}
          size={20}
          color={target.color}
        />
      </View>

      <View style={styles.textBlock}>
        <Text
          style={[styles.label, { color: target.color }]}
        >
          {target.label}
        </Text>
        <Text style={styles.sub}>{target.sub}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={target.color}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});