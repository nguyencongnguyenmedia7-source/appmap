import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { THEME } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = THEME.borderRadius.sm,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const ProfileSkeleton: React.FC = () => (
  <View style={styles.profileSkeletonWrapper}>
    {/* Avatar */}
    <SkeletonBox width={90} height={90} borderRadius={45} style={styles.center} />
    <SkeletonBox width={160} height={20} borderRadius={10} style={styles.centerBlock} />
    <SkeletonBox width={120} height={14} borderRadius={7} style={styles.centerBlock} />

    {/* Stats row */}
    <View style={styles.statsRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statSkeleton}>
          <SkeletonBox width={40} height={22} borderRadius={8} style={styles.center} />
          <SkeletonBox width={60} height={12} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>

    {/* Card rows */}
    {[1, 2, 3].map((i) => (
      <SkeletonBox key={i} width="100%" height={64} borderRadius={THEME.borderRadius.lg} style={styles.cardSkeleton} />
    ))}
  </View>
);

export const LeaderboardSkeleton: React.FC = () => (
  <View>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <View key={i} style={styles.leaderboardRow}>
        <SkeletonBox width={28} height={28} borderRadius={14} />
        <SkeletonBox width={38} height={38} borderRadius={19} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width="60%" height={14} borderRadius={7} />
          <SkeletonBox width="40%" height={11} borderRadius={5} />
        </View>
        <SkeletonBox width={60} height={20} borderRadius={8} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: THEME.colors.surface,
  },
  profileSkeletonWrapper: {
    padding: 20,
    gap: 12,
  },
  center: {
    alignSelf: 'center',
  },
  centerBlock: {
    alignSelf: 'center',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  statSkeleton: {
    alignItems: 'center',
    gap: 4,
  },
  cardSkeleton: {
    marginBottom: 8,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
});
