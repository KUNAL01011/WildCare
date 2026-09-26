import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../constants/colors';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
};

export function StarRating({
  label,
  value,
  onChange,
  max = 5,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.stars}>
        {Array.from({ length: max }, (_, i) => i + 1).map(
          (star) => (
            <TouchableOpacity
              key={star}
              onPress={() => onChange(star)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Text
                style={[
                  styles.star,
                  star <= value
                    ? styles.starFilled
                    : styles.starEmpty,
                ]}
              >
                ★
              </Text>
            </TouchableOpacity>
          )
        )}
        <Text style={styles.valueText}>
          {value > 0 ? `${value}/${max}` : 'Tap to rate'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  star: {
    fontSize: 30,
  },
  starFilled: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: COLORS.borderLight,
  },
  valueText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 6,
  },
});