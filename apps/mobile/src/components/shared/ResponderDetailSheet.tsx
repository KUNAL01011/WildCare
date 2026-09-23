import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { BodyTypeBadge } from '../ui/BodyTypeBadge';
import { ServiceChips } from '../ui/ServiceChips';
import type { ResponderMatch } from '../../api/responders';

type Props = {
  responder: ResponderMatch | null;
  onClose: () => void;
  onCall: (responder: ResponderMatch) => void;
};

export function ResponderDetailSheet({
  responder,
  onClose,
  onCall,
}: Props) {
  if (!responder) return null;

  return (
    <Modal
      visible={!!responder}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleBlock}>
              <View style={styles.nameVerifiedRow}>
                <Text style={styles.sheetName}>
                  {responder.name}
                </Text>
                {responder.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={COLORS.primary}
                  />
                )}
              </View>
              <BodyTypeBadge type={responder.type} />
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
            >
              <Ionicons
                name="close"
                size={22}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {responder.distanceKm.toFixed(1)} km
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCell}>
                <Text style={styles.statValue}>
                  {responder.averageResponseTimeMinutes
                    ? `${responder.averageResponseTimeMinutes}m`
                    : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCell}>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: responder.verified
                        ? COLORS.primary
                        : COLORS.textMuted,
                    },
                  ]}
                >
                  {responder.verified ? 'Yes' : 'No'}
                </Text>
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </View>

            {/* Services */}
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Services</Text>
              <ServiceChips
                services={responder.services}
                max={6}
              />
            </View>

            {/* Contact info */}
            {responder.phone && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>
                  Contact
                </Text>
                <View style={styles.contactRow}>
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.contactText}>
                    {responder.phone}
                  </Text>
                </View>
              </View>
            )}

            {/* Verification notice */}
            {!responder.verified && (
              <View style={styles.unverifiedNotice}>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={COLORS.warning}
                />
                <Text style={styles.unverifiedText}>
                  This organization is not yet verified by
                  WildCare. Proceed with caution.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Call CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={() => {
                onClose();
                onCall(responder);
              }}
              activeOpacity={0.85}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color={COLORS.textInverse}
              />
              <Text style={styles.callBtnText}>
                Call {responder.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Sheet header
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sheetTitleBlock: {
    flex: 1,
    gap: 6,
  },
  nameVerifiedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  sheetName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    marginLeft: 8,
  },

  // Body
  body: {
    padding: 20,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Block
  block: {
    gap: 10,
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  // Unverified notice
  unverifiedNotice: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  unverifiedText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  callBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
});