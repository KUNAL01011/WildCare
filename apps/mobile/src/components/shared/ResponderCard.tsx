import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { BodyTypeBadge } from '../ui/BodyTypeBadge';
import { ServiceChips } from '../ui/ServiceChips';
import {
  formatDistance,
  formatResponseTime,
} from '../../utils/responderUtils';
import type { ResponderMatch } from '../../api/responders';

type Props = {
  responder: ResponderMatch;
  onCall: (responder: ResponderMatch) => void;
  onViewDetails: (responder: ResponderMatch) => void;
  rank: number;
};

export function ResponderCard({
  responder,
  onCall,
  onViewDetails,
  rank,
}: Props) {
  return (
    <View style={styles.card}>
      {/* Rank ribbon */}
      {rank === 1 && (
        <View style={styles.topPickRibbon}>
          <Text style={styles.topPickText}>Best Match</Text>
        </View>
      )}

      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {responder.name}
            </Text>
            {responder.verified && (
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.primary}
                style={styles.verifiedIcon}
              />
            )}
          </View>
          <BodyTypeBadge type={responder.type} />
        </View>

        {/* Distance */}
        <View style={styles.distanceBlock}>
          <Text style={styles.distanceValue}>
            {formatDistance(responder.distanceKm)}
          </Text>
          <Text style={styles.distanceLabel}>away</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons
            name="time-outline"
            size={13}
            color={COLORS.textMuted}
          />
          <Text style={styles.statText}>
            {formatResponseTime(
              responder.averageResponseTimeMinutes
            )}
          </Text>
        </View>

        {responder.verified && (
          <View style={styles.stat}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={COLORS.primary}
            />
            <Text
              style={[
                styles.statText,
                { color: COLORS.primary },
              ]}
            >
              Verified
            </Text>
          </View>
        )}
      </View>

      {/* Services */}
      <ServiceChips services={responder.services} max={3} />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => onViewDetails(responder)}
          activeOpacity={0.8}
        >
          <Text style={styles.detailBtnText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => onCall(responder)}
          activeOpacity={0.85}
        >
          <Ionicons
            name="call-outline"
            size={16}
            color={COLORS.textInverse}
          />
          <Text style={styles.callBtnText}>Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },

  // Top pick ribbon
  topPickRibbon: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 10,
  },
  topPickText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textInverse,
    letterSpacing: 0.5,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  verifiedIcon: {
    marginTop: 2,
  },

  // Distance
  distanceBlock: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 10,
    padding: 8,
    minWidth: 60,
  },
  distanceValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  distanceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  detailBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  detailBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  callBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});