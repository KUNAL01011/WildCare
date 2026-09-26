import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "../../constants/colors";

type Props = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          height,
          borderRadius,
          backgroundColor: COLORS.borderLight,
          opacity,
        },
        // width goes in a separate plain style object
        { width: width as any },
        style,
      ]}
    />
  );
}

// ── Pre-built skeleton layouts ────────────────────────────

export function ReportCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width={64} height={64} borderRadius={10} />
      <View style={skeletonStyles.content}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width="50%" height={12} />
        <Skeleton width={80} height={22} borderRadius={20} />
      </View>
    </View>
  );
}

export function ResponderCardSkeleton() {
  return (
    <View style={skeletonStyles.responderCard}>
      <View style={skeletonStyles.responderHeader}>
        <View style={skeletonStyles.responderLeft}>
          <Skeleton width="70%" height={16} />
          <Skeleton width={80} height={22} borderRadius={12} />
        </View>
        <Skeleton width={60} height={52} borderRadius={10} />
      </View>
      <View style={skeletonStyles.responderChips}>
        <Skeleton width={100} height={24} borderRadius={8} />
        <Skeleton width={80} height={24} borderRadius={8} />
        <Skeleton width={90} height={24} borderRadius={8} />
      </View>
      <View style={skeletonStyles.responderActions}>
        <Skeleton height={40} borderRadius={10} style={{ flex: 1 }} />
        <Skeleton height={40} borderRadius={10} style={{ flex: 2 }} />
      </View>
    </View>
  );
}

export function ReportDetailSkeleton() {
  return (
    <View style={skeletonStyles.detail}>
      <Skeleton width="50%" height={28} />
      <Skeleton width="40%" height={14} />
      <Skeleton width={100} height={26} borderRadius={20} />
      <View style={{ height: 16 }} />
      <Skeleton height={120} borderRadius={10} />
      <View style={{ height: 8 }} />
      <Skeleton height={180} borderRadius={10} />
      <View style={{ height: 8 }} />
      <Skeleton height={120} borderRadius={10} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  responderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 16,
    gap: 14,
  },
  responderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  responderLeft: {
    flex: 1,
    gap: 8,
    paddingRight: 12,
  },
  responderChips: {
    flexDirection: "row",
    gap: 8,
  },
  responderActions: {
    flexDirection: "row",
    gap: 10,
  },
  detail: {
    padding: 20,
    gap: 10,
  },
});
