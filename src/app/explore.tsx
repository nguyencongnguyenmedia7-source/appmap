import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import {
  Sparkles,
  Heart,
  MessageCircle,
  MapPin,
  Trophy,
  CircleCheckBig,
  Flame,
  Award,
  Navigation,
  Plus,
  Share2,
  X,
  Send,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { usePlacesStore } from '@/store/placesStore';
import { useMapStore } from '@/store/mapStore';
import { triggerHaptic } from '@/utils/haptics';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';

interface CommunityFeedItem {
  id: string;
  userName: string;
  userAvatar: string;
  placeName: string;
  placeCity: string;
  coordinates: [number, number]; // [lng, lat]
  timeAgo: string;
  caption: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  isVerified: boolean;
  xpEarned: number;
}

const INITIAL_FEED: CommunityFeedItem[] = [
  {
    id: 'f1',
    userName: 'Lan Hương',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    placeName: 'Hồ Hoàn Kiếm (Hồ Gươm)',
    placeCity: 'Hà Nội',
    coordinates: [105.8524, 21.0287],
    timeAgo: '15 phút trước',
    caption: 'Sáng sớm se lạnh đi dạo quanh Bờ Hồ ngắm Tháp Rùa và thưởng thức cà phê trứng! Thủ đô đẹp quá 🇻🇳',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    likes: 42,
    comments: 6,
    isVerified: true,
    xpEarned: 75,
  },
  {
    id: 'f2',
    userName: 'Minh Tuấn',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    placeName: 'Landmark 81',
    placeCity: 'TP. Hồ Chí Minh',
    coordinates: [106.7218, 10.7952],
    timeAgo: '1 giờ trước',
    caption: 'Góc nhìn 3D từ công viên bờ sông nhìn lên đỉnh Landmark 81 cực kỳ hiện đại và hoành tráng!',
    imageUrl: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    likes: 89,
    comments: 12,
    isVerified: true,
    xpEarned: 100,
  },
  {
    id: 'f3',
    userName: 'Quốc Bảo',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    placeName: 'Cầu Rồng Đà Nẵng',
    placeCity: 'Đà Nẵng',
    coordinates: [108.2272, 16.0611],
    timeAgo: '3 giờ trước',
    caption: 'Đón xem màn phun lửa và phun nước của Cầu Rồng tối cuối tuần cùng hội bạn thân.',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    likes: 67,
    comments: 8,
    isVerified: true,
    xpEarned: 75,
  },
  {
    id: 'f4',
    userName: 'Hoàng Yến',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    placeName: 'Đại Nội Huế',
    placeCity: 'Huế',
    coordinates: [107.5796, 16.4697],
    timeAgo: '5 giờ trước',
    caption: 'Cố đô trầm mặc và cổ kính. Đi vào mùa thu thời tiết man mác nhẹ nhàng.',
    imageUrl: 'https://images.unsplash.com/photo-1570783457582-77e8a93ffc2b?auto=format&fit=crop&w=800&q=80',
    likes: 54,
    comments: 5,
    isVerified: true,
    xpEarned: 80,
  },
];

const FILTER_TABS = ['Tất cả', 'Cà phê ☕', 'Ẩm thực 🍜', 'Hà Nội', 'TP. HCM', 'Đà Nẵng'];

export default function ExploreScreen() {
  const { user, addXp } = useAuthStore();
  const { places, setSelectedPlace } = usePlacesStore();
  const { setCenter, setZoom, selectCity } = useMapStore();

  const [feed, setFeed] = useState<CommunityFeedItem[]>(INITIAL_FEED);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newPlaceName, setNewPlaceName] = useState('');

  const handleToggleLike = (postId: string) => {
    triggerHaptic('light');
    setLikedPosts((prev) => {
      const isLiked = !prev[postId];
      setFeed((currentFeed) =>
        currentFeed.map((item) =>
          item.id === postId
            ? { ...item, likes: item.likes + (isLiked ? 1 : -1) }
            : item
        )
      );
      return { ...prev, [postId]: isLiked };
    });
  };

  // Jump to map and focus on the selected place
  const handleViewOnMap = (item: CommunityFeedItem) => {
    triggerHaptic('selection');
    setCenter(item.coordinates);
    setZoom(16.5);

    // If matches city, select city
    const matchedCity = VIETNAM_CITY_PRESETS.find(
      (c) => item.placeCity.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matchedCity) {
      selectCity(matchedCity.id);
    }

    // Try finding place in repository
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

  const handleCreatePost = () => {
    if (!newCaption.trim() || !newPlaceName.trim()) return;

    triggerHaptic('success');
    const newFeedItem: CommunityFeedItem = {
      id: `user-post-${Date.now()}`,
      userName: user?.full_name || 'Khách khám phá',
      userAvatar:
        user?.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      placeName: newPlaceName.trim(),
      placeCity: 'Việt Nam',
      coordinates: [105.8542, 21.0285],
      timeAgo: 'Vừa xong',
      caption: newCaption.trim(),
      likes: 1,
      comments: 0,
      isVerified: true,
      xpEarned: 25,
    };

    setFeed([newFeedItem, ...feed]);
    addXp(25);
    setNewCaption('');
    setNewPlaceName('');
    setIsPostModalOpen(false);
  };

  const filteredFeed = feed.filter((item) => {
    if (activeTab === 'Tất cả') return true;
    if (activeTab === 'Cà phê ☕') {
      return (
        item.caption.toLowerCase().includes('cà phê') ||
        item.placeName.toLowerCase().includes('cà phê')
      );
    }
    if (activeTab === 'Ẩm thực 🍜') {
      return (
        item.caption.toLowerCase().includes('ẩm thực') ||
        item.caption.toLowerCase().includes('ăn') ||
        item.placeName.toLowerCase().includes('ẩm thực')
      );
    }
    return item.placeCity.includes(activeTab);
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>Khám phá & Cộng đồng</Text>
            <Text style={styles.subtitle}>
              Hoạt động check-in sôi nổi tại các thành phố Việt Nam
            </Text>
          </View>

          <TouchableOpacity
            style={styles.createPostBtn}
            onPress={() => {
              triggerHaptic('medium');
              setIsPostModalOpen(true);
            }}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.createPostBtnText}>Đăng bài</Text>
          </TouchableOpacity>
        </View>

        {/* User Gamification Card */}
        {user && (
          <View style={styles.userCard}>
            <Image source={{ uri: user.avatar_url || '' }} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.full_name}</Text>
                <View style={styles.levelBadge}>
                  <Award size={12} color="#F59E0B" />
                  <Text style={styles.levelText}>Cấp {user.level}</Text>
                </View>
              </View>
              <Text style={styles.xpText}>
                {user.xp} XP • {user.streak_days} ngày hoạt động liên tục 🔥
              </Text>

              {/* Progress to next level */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${((user.xp % 500) / 500) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Weekly Mission Challenge Banner */}
        <View style={styles.challengeBox}>
          <View style={styles.challengeHeader}>
            <Trophy size={18} color="#F59E0B" />
            <Text style={styles.challengeTitle}>Nhiệm vụ tuần: Khám phá Cố Đô</Text>
          </View>
          <Text style={styles.challengeDesc}>
            Check-in 3 địa danh văn hóa tại Huế hoặc Hà Nội để nhận huy hiệu "Sứ Giả Di Sản" & +200 XP.
          </Text>
        </View>

        {/* Feed Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => {
                  triggerHaptic('selection');
                  setActiveTab(tab);
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Feed Posts List */}
        <View style={styles.feedList}>
          {filteredFeed.map((item) => {
            const isLiked = Boolean(likedPosts[item.id]);

            return (
              <View key={item.id} style={styles.postCard}>
                {/* Author Info */}
                <View style={styles.authorRow}>
                  <Image source={{ uri: item.userAvatar }} style={styles.authorAvatar} />
                  <View style={styles.authorMeta}>
                    <Text style={styles.authorName}>{item.userName}</Text>
                    {/* Location Badge (clickable to view on map) */}
                    <TouchableOpacity
                      style={styles.locationTagRow}
                      onPress={() => handleViewOnMap(item)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={12} color="#20D6E7" />
                      <Text style={styles.locationTagText} numberOfLines={1}>
                        {item.placeName} • {item.placeCity}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {item.isVerified && (
                    <View style={styles.verifiedChip}>
                      <CircleCheckBig size={12} color="#10B981" />
                      <Text style={styles.verifiedChipText}>+{item.xpEarned} XP</Text>
                    </View>
                  )}
                </View>

                {/* Caption */}
                <Text style={styles.postCaption}>{item.caption}</Text>

                {/* Media Image */}
                {item.imageUrl && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                    <TouchableOpacity
                      style={styles.mapFloatingBtn}
                      onPress={() => handleViewOnMap(item)}
                      activeOpacity={0.8}
                    >
                      <Navigation size={13} color="#FFFFFF" />
                      <Text style={styles.mapFloatingText}>Xem trên bản đồ</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Post Footer Actions */}
                <View style={styles.footerRow}>
                  <View style={styles.footerLeftActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleToggleLike(item.id)}
                      activeOpacity={0.7}
                    >
                      <Heart
                        size={17}
                        color={isLiked ? '#EF4444' : THEME.colors.textSecondary}
                        fill={isLiked ? '#EF4444' : 'transparent'}
                      />
                      <Text style={[styles.actionCount, isLiked && styles.likedText]}>
                        {item.likes}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                      <MessageCircle size={17} color={THEME.colors.textSecondary} />
                      <Text style={styles.actionCount}>{item.comments}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal: Write New Check-in Post */}
      <Modal
        visible={isPostModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPostModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chia sẻ trải nghiệm khám phá</Text>
              <TouchableOpacity
                onPress={() => setIsPostModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Tên địa điểm bạn đã đến:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="VD: Cà Phê Trứng Giảng, Hồ Gươm..."
              placeholderTextColor={THEME.colors.textMuted}
              value={newPlaceName}
              onChangeText={setNewPlaceName}
            />

            <Text style={styles.inputLabel}>Cảm nghĩ & đánh giá:</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Chia sẻ vài điều thú vị về địa điểm này..."
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={4}
              value={newCaption}
              onChangeText={setNewCaption}
            />

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              onPress={handleCreatePost}
              activeOpacity={0.8}
            >
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.modalSubmitBtnText}>Đăng bài nhận +25 XP</Text>
            </TouchableOpacity>
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
    paddingBottom: 110, // Safe padding above bottom tab bar
  },
  header: {
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitleWrap: {
    flex: 1,
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
    marginTop: 3,
  },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4F7DFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#4F7DFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  createPostBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#4F7DFF',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    color: '#F4F7FF',
    fontSize: 15,
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  xpText: {
    color: '#A3AEC2',
    fontSize: 11.5,
    marginTop: 3,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F7DFF',
    borderRadius: 3,
  },
  challengeBox: {
    backgroundColor: '#1B2435',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 14,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  challengeTitle: {
    color: '#F59E0B',
    fontSize: 13.5,
    fontWeight: '700',
  },
  challengeDesc: {
    color: '#A3AEC2',
    fontSize: 12,
    lineHeight: 17,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: '#4F7DFF',
    borderColor: '#4F7DFF',
  },
  filterChipText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedList: {
    gap: 14,
  },
  postCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  locationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationTagText: {
    color: '#20D6E7',
    fontSize: 11,
    fontWeight: '600',
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedChipText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  postCaption: {
    color: '#F4F7FF',
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapFloatingBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17, 24, 39, 0.88)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)' as any,
  },
  mapFloatingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  footerLeftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  actionCount: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  likedText: {
    color: '#EF4444',
  },
  timeAgoText: {
    color: '#76839A',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '700',
  },
  inputLabel: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#1B2435',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F7FF',
    fontSize: 13,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F7DFF',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 18,
    shadowColor: '#4F7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
