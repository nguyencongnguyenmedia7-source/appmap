import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
} from 'react-native';
import {
  Award,
  MapPin,
  Flame,
  Star,
  Trophy,
  CircleCheckBig,
  ChevronRight,
  Settings,
  Share2,
  Navigation,
  Sparkles,
  Zap,
  Clock,
  Compass,
  X,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { usePlacesStore } from '@/store/placesStore';
import { useMapStore } from '@/store/mapStore';
import { triggerHaptic } from '@/utils/haptics';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';

interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  description: string;
}

interface CheckinHistoryItem {
  id: string;
  placeName: string;
  city: string;
  coordinates: [number, number];
  timeAgo: string;
  xpEarned: number;
  photoUrl?: string;
  isVerified: boolean;
}

const BADGES: BadgeItem[] = [
  { id: 'b1', name: 'Người Khám Phá', icon: '🗺️', color: '#4F7DFF', earned: true, description: 'Check-in 10 địa điểm đầu tiên trên toàn quốc' },
  { id: 'b2', name: 'Sứ Giả Di Sản', icon: '🏛️', color: '#8B7CFF', earned: true, description: 'Check-in 3 di tích di sản văn hóa Việt Nam' },
  { id: 'b3', name: 'Tín Đồ Cà Phê', icon: '☕', color: '#F59E0B', earned: true, description: 'Check-in 5 quán cà phê đặc sản' },
  { id: 'b4', name: 'Chinh Phục Thủ Đô', icon: '🇻🇳', color: '#EF4444', earned: true, description: 'Khám phá 10 địa danh biểu tượng của Hà Nội' },
  { id: 'b5', name: 'Đêm Sài Gòn', icon: '🌃', color: '#20D6E7', earned: false, description: 'Check-in 5 địa điểm nổi tiếng về đêm tại TP. HCM' },
  { id: 'b6', name: 'Phượt Thủ 3 Miền', icon: '🏔️', color: '#10B981', earned: false, description: 'Khám phá ít nhất 5 tỉnh thành khác nhau' },
  { id: 'b7', name: 'Khai Phá Bản Đồ', icon: '📍', color: '#EC4899', earned: true, description: 'Đóng góp địa điểm mới được cộng đồng xác nhận' },
  { id: 'b8', name: 'Ngôi Sao Check-in', icon: '⭐', color: '#F59E0B', earned: false, description: 'Đạt chuỗi 14 ngày check-in liên tục' },
];

const CHECKIN_HISTORY: CheckinHistoryItem[] = [
  {
    id: 'c1',
    placeName: 'Café Giảng (Cà Phê Trứng)',
    city: 'Hà Nội',
    coordinates: [105.8542, 21.0335],
    timeAgo: '2 giờ trước',
    xpEarned: 100,
    photoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
  },
  {
    id: 'c2',
    placeName: 'Hồ Hoàn Kiếm (Hồ Gươm)',
    city: 'Hà Nội',
    coordinates: [105.8524, 21.0287],
    timeAgo: 'Hôm qua',
    xpEarned: 75,
    photoUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
  },
  {
    id: 'c3',
    placeName: 'Landmark 81',
    city: 'TP. Hồ Chí Minh',
    coordinates: [106.7218, 10.7952],
    timeAgo: '3 ngày trước',
    xpEarned: 50,
    isVerified: true,
  },
  {
    id: 'c4',
    placeName: 'Cầu Rồng Đà Nẵng',
    city: 'Đà Nẵng',
    coordinates: [108.2272, 16.0611],
    timeAgo: '1 tuần trước',
    xpEarned: 75,
    photoUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
  },
];

type ProfileTab = 'activity' | 'badges' | 'stats';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { places, setSelectedPlace } = usePlacesStore();
  const { setCenter, setZoom, selectCity } = useMapStore();

  const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const xpCurrent = user?.xp || 1850;
  const level = user?.level || 4;
  const xpInCurrentLevel = xpCurrent % 500;
  const xpNeededNext = 500 - xpInCurrentLevel;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  const handleTabChange = (tab: ProfileTab) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const handleJumpToPlace = (item: CheckinHistoryItem) => {
    triggerHaptic('selection');
    setCenter(item.coordinates);
    setZoom(16.5);

    const matchedCity = VIETNAM_CITY_PRESETS.find(
      (c) => item.city.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCity) {
      selectCity(matchedCity.id);
    }

    const matchedPlace = places.find(
      (p) =>
        p.name.toLowerCase().includes(item.placeName.toLowerCase()) ||
        item.placeName.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matchedPlace) {
      setSelectedPlace(matchedPlace);
    }

    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.profileTopRow}>
            <Image
              source={{
                uri:
                  user?.avatar_url ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.avatar}
            />

            <View style={styles.profileTextMeta}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.userName}>{user?.full_name || 'Nguyễn Việt Explorer'}</Text>
                <View style={styles.verifiedMark}>
                  <CircleCheckBig size={14} color="#20D6E7" />
                </View>
              </View>

              <Text style={styles.userHandle}>@{user?.username || 'vietnam_explorer'}</Text>

              <View style={styles.levelTagRow}>
                <View style={styles.levelBadge}>
                  <Award size={12} color="#F59E0B" />
                  <Text style={styles.levelBadgeText}>Cấp {level} Explorer</Text>
                </View>
                <View style={styles.streakBadge}>
                  <Flame size={12} color="#F97316" />
                  <Text style={styles.streakBadgeText}>{user?.streak_days || 7} ngày liên tục</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.bioText}>
            {user?.bio || 'Đam mê khám phá các thành phố 3D và check-in ẩm thực Việt Nam.'}
          </Text>

          {/* XP Progress Card */}
          <View style={styles.xpCard}>
            <View style={styles.xpHeaderRow}>
              <View style={styles.xpTitleWrap}>
                <Zap size={14} color="#4F7DFF" />
                <Text style={styles.xpTitle}>Tiến trình cấp bậc</Text>
              </View>
              <Text style={styles.xpSummaryText}>
                {xpCurrent.toLocaleString()} XP • Còn {xpNeededNext} XP lên Cấp {level + 1}
              </Text>
            </View>

            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Stats 4-Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>28</Text>
              <Text style={styles.statLbl}>Check-in</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>5</Text>
              <Text style={styles.statLbl}>Huy hiệu</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>4</Text>
              <Text style={styles.statLbl}>Thành phố</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>#12</Text>
              <Text style={styles.statLbl}>Xếp hạng</Text>
            </View>
          </View>
        </View>

        {/* Tab Segment Controls */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'activity' && styles.tabBtnActive]}
            onPress={() => handleTabChange('activity')}
            activeOpacity={0.8}
          >
            <Clock size={14} color={activeTab === 'activity' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'activity' && styles.tabBtnTextActive]}>
              Hoạt động
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'badges' && styles.tabBtnActive]}
            onPress={() => handleTabChange('badges')}
            activeOpacity={0.8}
          >
            <Award size={14} color={activeTab === 'badges' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'badges' && styles.tabBtnTextActive]}>
              Huy hiệu ({BADGES.filter((b) => b.earned).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'stats' && styles.tabBtnActive]}
            onPress={() => handleTabChange('stats')}
            activeOpacity={0.8}
          >
            <Compass size={14} color={activeTab === 'stats' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'stats' && styles.tabBtnTextActive]}>
              Thống kê
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content: Activity */}
        {activeTab === 'activity' && (
          <View style={styles.tabContentWrap}>
            <Text style={styles.sectionTitle}>Lịch Sử Check-in & Đóng Góp</Text>
            {CHECKIN_HISTORY.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.checkinCard}
                onPress={() => handleJumpToPlace(item)}
                activeOpacity={0.75}
              >
                {item.photoUrl ? (
                  <Image source={{ uri: item.photoUrl }} style={styles.checkinThumb} />
                ) : (
                  <View style={styles.checkinThumbPlaceholder}>
                    <MapPin size={18} color="#20D6E7" />
                  </View>
                )}

                <View style={styles.checkinInfo}>
                  <Text style={styles.checkinPlaceName} numberOfLines={1}>
                    {item.placeName}
                  </Text>
                  <View style={styles.checkinMetaRow}>
                    <MapPin size={11} color="#20D6E7" />
                    <Text style={styles.checkinCityText}>{item.city}</Text>
                    <Text style={styles.dotDivider}>•</Text>
                    <Text style={styles.checkinTimeText}>{item.timeAgo}</Text>
                  </View>
                </View>

                <View style={styles.checkinRight}>
                  <View style={styles.xpRewardTag}>
                    <Text style={styles.xpRewardText}>+{item.xpEarned} XP</Text>
                  </View>
                  <Navigation size={13} color="#76839A" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tab Content: Badges */}
        {activeTab === 'badges' && (
          <View style={styles.tabContentWrap}>
            <Text style={styles.sectionTitle}>Bộ Sưu Tập Huy Hiệu Explorer</Text>
            <View style={styles.badgeGrid}>
              {BADGES.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.badgeCard, !b.earned && styles.badgeCardLocked]}
                  onPress={() => {
                    triggerHaptic('light');
                    setSelectedBadge(b);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.badgeEmoji}>{b.icon}</Text>
                  <Text style={[styles.badgeName, !b.earned && styles.badgeNameLocked]}>
                    {b.name}
                  </Text>
                  <Text style={styles.badgeStatusText}>
                    {b.earned ? 'Đã đạt được' : 'Chưa mở khóa'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tab Content: Stats */}
        {activeTab === 'stats' && (
          <View style={styles.tabContentWrap}>
            <Text style={styles.sectionTitle}>Hành Trình Khám Phá Việt Nam</Text>
            <View style={styles.statsCard}>
              <View style={styles.statProgressItem}>
                <View style={styles.statProgressHeader}>
                  <Text style={styles.statProgressTitle}>Hà Nội</Text>
                  <Text style={styles.statProgressVal}>14/20 địa điểm</Text>
                </View>
                <View style={styles.statProgressBar}>
                  <View style={[styles.statProgressBarFill, { width: '70%', backgroundColor: '#4F7DFF' }]} />
                </View>
              </View>

              <View style={styles.statProgressItem}>
                <View style={styles.statProgressHeader}>
                  <Text style={styles.statProgressTitle}>TP. Hồ Chí Minh</Text>
                  <Text style={styles.statProgressVal}>8/20 địa điểm</Text>
                </View>
                <View style={styles.statProgressBar}>
                  <View style={[styles.statProgressBarFill, { width: '40%', backgroundColor: '#EF4444' }]} />
                </View>
              </View>

              <View style={styles.statProgressItem}>
                <View style={styles.statProgressHeader}>
                  <Text style={styles.statProgressTitle}>Đà Nẵng & Hội An</Text>
                  <Text style={styles.statProgressVal}>6/15 địa điểm</Text>
                </View>
                <View style={styles.statProgressBar}>
                  <View style={[styles.statProgressBarFill, { width: '40%', backgroundColor: '#10B981' }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Admin Console Management Entry */}
        <View style={styles.adminEntrySection}>
          <TouchableOpacity
            style={styles.adminEntryCard}
            activeOpacity={0.85}
            onPress={() => {
              triggerHaptic('selection');
              router.push('/admin');
            }}
          >
            <View style={styles.adminEntryLeft}>
              <View style={styles.adminEntryIcon}>
                <SlidersHorizontal size={20} color="#20D6E7" />
              </View>
              <View style={styles.adminEntryTextWrap}>
                <View style={styles.adminEntryHeaderRow}>
                  <Text style={styles.adminEntryTitle}>Bảng Quản Trị Hệ Thống</Text>
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>ADMIN</Text>
                  </View>
                </View>
                <Text style={styles.adminEntrySubtitle}>
                  Tùy chỉnh giao diện, theme màu, quản lý ghim & camera
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#A3AEC2" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal: Badge Details */}
      <Modal
        visible={Boolean(selectedBadge)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSelectedBadge(null)}
            >
              <X size={18} color="#A3AEC2" />
            </TouchableOpacity>

            {selectedBadge && (
              <View style={styles.modalBadgeBody}>
                <Text style={styles.modalBadgeIcon}>{selectedBadge.icon}</Text>
                <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                <Text style={styles.modalBadgeDesc}>{selectedBadge.description}</Text>
                <View
                  style={[
                    styles.modalStatusPill,
                    selectedBadge.earned
                      ? styles.modalStatusPillEarned
                      : styles.modalStatusPillLocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalStatusText,
                      selectedBadge.earned ? styles.earnedText : styles.lockedText,
                    ]}
                  >
                    {selectedBadge.earned ? '✓ Đã hoàn thành' : '🔒 Đang tiến hành'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    paddingTop: 14,
    paddingBottom: 120,
  },
  profileHeaderCard: {
    backgroundColor: '#111827',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    padding: 16,
    marginBottom: 14,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#4F7DFF',
  },
  profileTextMeta: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  verifiedMark: {
    marginTop: 1,
  },
  userHandle: {
    color: '#76839A',
    fontSize: 12,
    marginTop: 1,
  },
  levelTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 6,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  streakBadgeText: {
    color: '#F97316',
    fontSize: 11,
    fontWeight: '700',
  },
  bioText: {
    color: '#A3AEC2',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  xpCard: {
    backgroundColor: '#1B2435',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  xpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  xpTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  xpTitle: {
    color: '#F4F7FF',
    fontSize: 12,
    fontWeight: '700',
  },
  xpSummaryText: {
    color: '#20D6E7',
    fontSize: 11,
    fontWeight: '700',
  },
  xpBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#4F7DFF',
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2435',
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    color: '#F4F7FF',
    fontSize: 15,
    fontWeight: '800',
  },
  statLbl: {
    color: '#76839A',
    fontSize: 10.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#4F7DFF',
  },
  tabBtnText: {
    color: '#A3AEC2',
    fontSize: 11.5,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabContentWrap: {
    gap: 10,
  },
  sectionTitle: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  checkinThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  checkinThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 214, 231, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinInfo: {
    flex: 1,
  },
  checkinPlaceName: {
    color: '#F4F7FF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  checkinMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  checkinCityText: {
    color: '#20D6E7',
    fontSize: 11,
    fontWeight: '600',
  },
  dotDivider: {
    color: '#76839A',
    fontSize: 10,
  },
  checkinTimeText: {
    color: '#76839A',
    fontSize: 11,
  },
  checkinRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpRewardTag: {
    backgroundColor: 'rgba(79, 125, 255, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  xpRewardText: {
    color: '#4F7DFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  badgeName: {
    color: '#F4F7FF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  badgeNameLocked: {
    color: '#76839A',
  },
  badgeStatusText: {
    color: '#20D6E7',
    fontSize: 10,
    marginTop: 3,
  },
  statsCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  statProgressItem: {
    gap: 5,
  },
  statProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statProgressTitle: {
    color: '#F4F7FF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  statProgressVal: {
    color: '#A3AEC2',
    fontSize: 11.5,
  },
  statProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  modalBadgeBody: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalBadgeIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  modalBadgeName: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalBadgeDesc: {
    color: '#A3AEC2',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  modalStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modalStatusPillEarned: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  modalStatusPillLocked: {
    backgroundColor: 'rgba(118, 131, 154, 0.15)',
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  earnedText: {
    color: '#10B981',
  },
  lockedText: {
    color: '#76839A',
  },
  adminEntrySection: {
    marginTop: 20,
    marginBottom: 10,
  },
  adminEntryCard: {
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(32, 214, 231, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  adminEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  adminEntryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(32, 214, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(32, 214, 231, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminEntryTextWrap: {
    flex: 1,
  },
  adminEntryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  adminEntryTitle: {
    color: '#F4F7FF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  adminBadge: {
    backgroundColor: '#20D6E7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#080D18',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adminEntrySubtitle: {
    color: '#A3AEC2',
    fontSize: 12,
    lineHeight: 16,
  },
});
