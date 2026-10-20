import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import {
  Trophy,
  Crown,
  Medal,
  Zap,
  MapPin,
  Flame,
  ChevronUp,
  ChevronDown,
  Minus,
  Navigation,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useMapStore } from '@/store/mapStore';
import { triggerHaptic } from '@/utils/haptics';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';
import { LeaderboardSkeleton } from '@/components/SkeletonLoader';

type LeaderboardPeriod = 'week' | 'month' | 'alltime';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  province: string;
  xp: number;
  checkins: number;
  level: number;
  rankChange: number;
  isCurrentUser?: boolean;
}

const generateLeaderboard = (
  period: LeaderboardPeriod,
  currentUserXp: number,
  currentUserName: string,
  currentUserAvatar: string,
  currentUserLevel: number
): LeaderboardEntry[] => {
  const base: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'u1',
      userName: 'Nguyễn Thành Lộc',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      province: 'TP. HCM',
      xp: period === 'week' ? 2850 : period === 'month' ? 12400 : 58900,
      checkins: period === 'week' ? 38 : 156,
      level: 12,
      rankChange: 0,
    },
    {
      rank: 2,
      userId: 'u2',
      userName: 'Trần Minh Phúc',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      province: 'Hà Nội',
      xp: period === 'week' ? 2640 : period === 'month' ? 11200 : 51200,
      checkins: period === 'week' ? 34 : 142,
      level: 11,
      rankChange: 1,
    },
    {
      rank: 3,
      userId: 'u3',
      userName: 'Lê Thu Hương',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      province: 'Đà Nẵng',
      xp: period === 'week' ? 2210 : period === 'month' ? 9800 : 44500,
      checkins: period === 'week' ? 28 : 118,
      level: 10,
      rankChange: -1,
    },
    {
      rank: 4,
      userId: 'u4',
      userName: 'Phạm Quốc Bảo',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      province: 'Huế',
      xp: period === 'week' ? 1980 : period === 'month' ? 8600 : 39200,
      checkins: period === 'week' ? 25 : 102,
      level: 9,
      rankChange: 2,
    },
    {
      rank: 5,
      userId: 'u5',
      userName: 'Võ Thị Lan Anh',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      province: 'Hà Nội',
      xp: period === 'week' ? 1750 : period === 'month' ? 7900 : 35100,
      checkins: period === 'week' ? 22 : 94,
      level: 8,
      rankChange: 0,
    },
    {
      rank: 6,
      userId: 'u6',
      userName: 'Hoàng Việt Anh',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      province: 'TP. HCM',
      xp: period === 'week' ? 1520 : period === 'month' ? 6800 : 31400,
      checkins: period === 'week' ? 19 : 86,
      level: 7,
      rankChange: -2,
    },
    {
      rank: 7,
      userId: 'u7',
      userName: 'Nguyễn Thị Mai',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      province: 'Cần Thơ',
      xp: period === 'week' ? 1340 : period === 'month' ? 5900 : 28700,
      checkins: period === 'week' ? 17 : 76,
      level: 7,
      rankChange: 1,
    },
    {
      rank: 8,
      userId: 'u8',
      userName: 'Đặng Minh Tuấn',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      province: 'Quảng Ngãi',
      xp: period === 'week' ? 1190 : period === 'month' ? 5200 : 25300,
      checkins: period === 'week' ? 15 : 68,
      level: 6,
      rankChange: 0,
    },
    // Current user dynamic entry
    {
      rank: 12,
      userId: 'current-user',
      userName: currentUserName || 'Nguyễn Việt Explorer',
      avatarUrl: currentUserAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      province: 'Hà Nội',
      xp: currentUserXp,
      checkins: Math.floor(currentUserXp / 50),
      level: currentUserLevel,
      rankChange: 3,
      isCurrentUser: true,
    },
  ];
  return base;
};

function RankDisplay({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={22} color="#F59E0B" fill="#F59E0B" />;
  if (rank === 2) return <Medal size={22} color="#CBD5E1" fill="#CBD5E1" />;
  if (rank === 3) return <Medal size={22} color="#F97316" fill="#F97316" />;
  return <Text style={rankStyles.rankNum}>#{rank}</Text>;
}

const rankStyles = StyleSheet.create({
  rankNum: {
    color: '#76839A',
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
});

function RankChange({ change }: { change: number }) {
  if (change > 0)
    return (
      <View style={[rankChangeStyles.chip, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
        <ChevronUp size={10} color="#10B981" />
        <Text style={[rankChangeStyles.text, { color: '#10B981' }]}>{change}</Text>
      </View>
    );
  if (change < 0)
    return (
      <View style={[rankChangeStyles.chip, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
        <ChevronDown size={10} color="#EF4444" />
        <Text style={[rankChangeStyles.text, { color: '#EF4444' }]}>{Math.abs(change)}</Text>
      </View>
    );
  return (
    <View style={[rankChangeStyles.chip, { backgroundColor: 'rgba(118, 131, 154, 0.15)' }]}>
      <Minus size={10} color="#76839A" />
    </View>
  );
}

const rankChangeStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  text: {
    fontSize: 9.5,
    fontWeight: '700',
  },
});

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.filter((e) => e.rank <= 3 && !e.isCurrentUser).slice(0, 3);
  if (top3.length < 3) return null;

  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const heights = [90, 120, 80];
  const colors = ['#CBD5E1', '#F59E0B', '#F97316'];

  return (
    <View style={podiumStyles.container}>
      {order.map((entry, i) => (
        <View key={entry.userId} style={podiumStyles.podiumSlot}>
          <Image source={{ uri: entry.avatarUrl }} style={[podiumStyles.avatar, { borderColor: colors[i] }]} />
          <Text style={podiumStyles.name} numberOfLines={1}>
            {entry.userName.split(' ').pop()}
          </Text>
          <Text style={[podiumStyles.xp, { color: colors[i] }]}>
            {(entry.xp / 1000).toFixed(1)}K XP
          </Text>
          <View
            style={[
              podiumStyles.block,
              {
                height: heights[i],
                backgroundColor: `${colors[i]}22`,
                borderTopColor: colors[i],
              },
            ]}
          >
            <RankDisplay rank={entry.rank} />
          </View>
        </View>
      ))}
    </View>
  );
}

const podiumStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    marginBottom: 16,
  },
  podiumSlot: {
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    marginBottom: 4,
  },
  name: {
    color: '#F4F7FF',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  xp: {
    fontSize: 10.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  block: {
    width: '100%',
    borderTopWidth: 2.5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
});

export default function LeaderboardScreen() {
  const { user } = useAuthStore();
  const { setCenter, setZoom, selectCity } = useMapStore();

  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsLoading(true);
    fadeAnim.setValue(0);
    const timer = setTimeout(() => {
      setEntries(
        generateLeaderboard(
          period,
          user?.xp || 1850,
          user?.full_name || 'Nguyễn Việt Explorer',
          user?.avatar_url || '',
          user?.level || 4
        )
      );
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }, 400);
    return () => clearTimeout(timer);
  }, [period, user?.xp, user?.level]);

  const handlePeriodChange = (p: LeaderboardPeriod) => {
    triggerHaptic('selection');
    setPeriod(p);
  };

  const handleJumpToCity = (cityName: string) => {
    triggerHaptic('selection');
    const matched = VIETNAM_CITY_PRESETS.find(
      (c) =>
        cityName.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(cityName.toLowerCase())
    );
    if (matched) {
      selectCity(matched.id);
      setCenter(matched.coordinates);
      setZoom(matched.defaultZoom);
    }
    router.replace('/');
  };

  const myEntry = entries.find((e) => e.isCurrentUser);
  const topEntries = entries.filter((e) => !e.isCurrentUser && e.rank <= 8);

  const periodLabels: Record<LeaderboardPeriod, string> = {
    week: 'Tuần này',
    month: 'Tháng này',
    alltime: 'Toàn thời gian',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bảng Xếp Hạng</Text>
          <Text style={styles.subtitle}>Top Explorer 63 tỉnh thành Việt Nam</Text>
        </View>
        <Trophy size={26} color="#F59E0B" />
      </View>

      {/* Period Selector Tabs */}
      <View style={styles.periodSelector}>
        {(Object.keys(periodLabels) as LeaderboardPeriod[]).map((p) => {
          const isActive = period === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, isActive && styles.periodBtnActive]}
              onPress={() => handlePeriodChange(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodBtnText, isActive && styles.periodBtnTextActive]}>
                {periodLabels[p]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingTop: 20 }}>
            <LeaderboardSkeleton />
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Top 3 Podium */}
            <Podium entries={entries} />

            {/* Current User Floating Card */}
            {myEntry && (
              <View style={styles.myPositionCard}>
                <View style={styles.myPositionLeft}>
                  <Text style={styles.myPositionLabel}>Vị trí của bạn</Text>
                  <Text style={styles.myPositionRank}>#{myEntry.rank}</Text>
                </View>
                <View style={styles.myPositionCenter}>
                  <Image source={{ uri: myEntry.avatarUrl }} style={styles.myAvatar} />
                  <View>
                    <Text style={styles.myName}>{myEntry.userName}</Text>
                    <Text style={styles.myXp}>{myEntry.xp.toLocaleString()} XP</Text>
                  </View>
                </View>
                <RankChange change={myEntry.rankChange} />
              </View>
            )}

            {/* Leaderboard Table Card */}
            <View style={styles.listContainer}>
              <Text style={styles.listHeader}>Bảng Xếp Hạng Explorer</Text>
              {topEntries.map((entry, idx) => (
                <TouchableOpacity
                  key={entry.userId}
                  style={[
                    styles.entryRow,
                    idx === 0 && styles.goldRow,
                    idx === 1 && styles.silverRow,
                    idx === 2 && styles.bronzeRow,
                  ]}
                  onPress={() => handleJumpToCity(entry.province)}
                  activeOpacity={0.75}
                >
                  {/* Rank */}
                  <View style={styles.rankCol}>
                    <RankDisplay rank={entry.rank} />
                  </View>

                  {/* Avatar */}
                  <Image source={{ uri: entry.avatarUrl }} style={styles.entryAvatar} />

                  {/* Info */}
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName} numberOfLines={1}>
                      {entry.userName}
                    </Text>
                    <View style={styles.entryMeta}>
                      <MapPin size={10} color="#20D6E7" />
                      <Text style={styles.entryProvince}>{entry.province}</Text>
                      <Text style={styles.entryMetaDivider}>•</Text>
                      <Text style={styles.entryLevel}>Cấp {entry.level}</Text>
                    </View>
                  </View>

                  {/* Right Column: XP + Rank Change */}
                  <View style={styles.entryRight}>
                    <View style={styles.xpBadge}>
                      <Zap size={10} color="#F59E0B" />
                      <Text style={styles.xpBadgeText}>{(entry.xp / 1000).toFixed(1)}K</Text>
                    </View>
                    <RankChange change={entry.rankChange} />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Separator + Current user in ranking */}
              {myEntry && (
                <>
                  <View style={styles.ellipsisRow}>
                    <Text style={styles.ellipsisText}>• • •</Text>
                  </View>
                  <View style={[styles.entryRow, styles.myEntryRow]}>
                    <View style={styles.rankCol}>
                      <Text style={rankStyles.rankNum}>#{myEntry.rank}</Text>
                    </View>
                    <Image source={{ uri: myEntry.avatarUrl }} style={styles.entryAvatar} />
                    <View style={styles.entryInfo}>
                      <Text style={[styles.entryName, { color: '#4F7DFF' }]}>
                        {myEntry.userName} (Bạn)
                      </Text>
                      <View style={styles.entryMeta}>
                        <MapPin size={10} color="#20D6E7" />
                        <Text style={styles.entryProvince}>{myEntry.province}</Text>
                        <Text style={styles.entryMetaDivider}>•</Text>
                        <Text style={styles.entryLevel}>Cấp {myEntry.level}</Text>
                      </View>
                    </View>
                    <View style={styles.entryRight}>
                      <View style={[styles.xpBadge, { backgroundColor: 'rgba(79, 125, 255, 0.15)' }]}>
                        <Zap size={10} color="#4F7DFF" />
                        <Text style={[styles.xpBadgeText, { color: '#4F7DFF' }]}>
                          {(myEntry.xp / 1000).toFixed(1)}K
                        </Text>
                      </View>
                      <RankChange change={myEntry.rankChange} />
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* Motivation Card */}
            <View style={styles.motivationCard}>
              <Flame size={22} color="#F97316" />
              <View style={{ flex: 1 }}>
                <Text style={styles.motivationTitle}>
                  Cần thêm {((myEntry?.rank ?? 12) - 10) * 150} XP để vào Top 10!
                </Text>
                <Text style={styles.motivationSub}>
                  Hãy check-in thêm địa điểm mới và đóng góp bản đồ để thăng hạng 🚀
                </Text>
              </View>
            </View>

            {/* Province Stats Section (clickable to view on map) */}
            <View style={styles.provinceSection}>
              <Text style={styles.listHeader}>Top Tỉnh Thành Sôi Nổi Nhất</Text>
              {[
                { province: 'TP. Hồ Chí Minh', checkins: 4280, color: '#EF4444', flag: '🏙️' },
                { province: 'Hà Nội', checkins: 3950, color: '#4F7DFF', flag: '🏯' },
                { province: 'Đà Nẵng', checkins: 2140, color: '#10B981', flag: '🌉' },
                { province: 'Hội An', checkins: 1890, color: '#F59E0B', flag: '🏮' },
                { province: 'Huế', checkins: 1620, color: '#8B7CFF', flag: '🏛️' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.province}
                  style={styles.provinceRow}
                  onPress={() => handleJumpToCity(p.province)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.provinceFlag}>{p.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.provinceNameRow}>
                      <Text style={styles.provinceName}>{p.province}</Text>
                      <Text style={[styles.provinceCheckins, { color: p.color }]}>
                        {p.checkins.toLocaleString()} check-in
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${(p.checkins / 4280) * 100}%` as any,
                            backgroundColor: p.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Navigation size={13} color="#76839A" />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080D18',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#F4F7FF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#76839A',
    fontSize: 12,
    marginTop: 2,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  periodBtnActive: {
    backgroundColor: '#4F7DFF',
    borderColor: '#4F7DFF',
  },
  periodBtnText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  periodBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  myPositionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'rgba(79, 125, 255, 0.12)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(79, 125, 255, 0.35)',
    padding: 14,
    gap: 12,
  },
  myPositionLeft: {
    alignItems: 'center',
    minWidth: 44,
  },
  myPositionLabel: {
    color: '#A3AEC2',
    fontSize: 9.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  myPositionRank: {
    color: '#4F7DFF',
    fontSize: 20,
    fontWeight: '900',
  },
  myPositionCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  myAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: '#4F7DFF',
  },
  myName: {
    color: '#F4F7FF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  myXp: {
    color: '#4F7DFF',
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 2,
  },
  listContainer: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  listHeader: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '700',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  goldRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  silverRow: {
    backgroundColor: 'rgba(203, 213, 225, 0.03)',
  },
  bronzeRow: {
    backgroundColor: 'rgba(249, 115, 22, 0.04)',
  },
  myEntryRow: {
    backgroundColor: 'rgba(79, 125, 255, 0.10)',
  },
  rankCol: {
    width: 30,
    alignItems: 'center',
  },
  entryAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    color: '#F4F7FF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  entryProvince: {
    color: '#20D6E7',
    fontSize: 11,
    fontWeight: '600',
  },
  entryMetaDivider: {
    color: '#76839A',
    fontSize: 10,
  },
  entryLevel: {
    color: '#A3AEC2',
    fontSize: 11,
  },
  entryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  ellipsisRow: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  ellipsisText: {
    color: '#76839A',
    fontSize: 12,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1B2435',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    marginBottom: 14,
  },
  motivationTitle: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '700',
  },
  motivationSub: {
    color: '#A3AEC2',
    fontSize: 11.5,
    marginTop: 2,
  },
  provinceSection: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    overflow: 'hidden',
  },
  provinceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  provinceFlag: {
    fontSize: 18,
  },
  provinceNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  provinceName: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '700',
  },
  provinceCheckins: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
