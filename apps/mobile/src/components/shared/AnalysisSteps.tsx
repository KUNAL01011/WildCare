import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { PulsingDot } from '../ui/PulsingDot';

type Step = {
  label: string;
  sub: string;
  state: 'done' | 'active' | 'waiting';
};

type Props = {
  steps: Step[];
};

export function AnalysisSteps({ steps }: Props) {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step.label} style={styles.row}>
          {/* Connector line above (skip first) */}
          {index > 0 && (
            <View
              style={[
                styles.connector,
                step.state !== 'waiting' && styles.connectorDone,
              ]}
            />
          )}

          <View style={styles.content}>
            {/* Icon / indicator */}
            <View style={styles.iconCol}>
              {step.state === 'done' ? (
                <View style={styles.doneCircle}>
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={COLORS.textInverse}
                  />
                </View>
              ) : step.state === 'active' ? (
                <PulsingDot
                  color={COLORS.primaryMuted}
                  size={10}
                />
              ) : (
                <View style={styles.waitingCircle} />
              )}
            </View>

            {/* Text */}
            <View style={styles.textCol}>
              <Text
                style={[
                  styles.label,
                  step.state === 'waiting' && styles.labelMuted,
                ]}
              >
                {step.label}
              </Text>
              <Text style={styles.sub}>{step.sub}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  row: {
    position: 'relative',
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.borderLight,
    marginLeft: 23,
  },
  connectorDone: {
    backgroundColor: COLORS.primaryMuted,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  iconCol: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  labelMuted: {
    color: COLORS.textMuted,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});