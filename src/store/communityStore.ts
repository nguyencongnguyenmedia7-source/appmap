import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CommunityFeedItem {
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
  createdAt: number;
}

export interface CheckinHistoryItem {
  id: string;
  placeName: string;
  city: string;
  coordinates: [number, number];
  timeAgo: string;
  xpEarned: number;
  photoUrl?: string;
  caption?: string;
  isVerified: boolean;
  createdAt: number;
}

export interface FeedComment {
  id: string;
  postId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timeAgo: string;
  createdAt: number;
}

const STORAGE_FEED_KEY = '@cityverse_community_feed';
const STORAGE_CHECKIN_KEY = '@cityverse_checkin_history';
const STORAGE_COMMENTS_KEY = '@cityverse_feed_comments';

export const INITIAL_FEED: CommunityFeedItem[] = [
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
    comments: 2,
    isVerified: true,
    xpEarned: 75,
    createdAt: Date.now() - 15 * 60 * 1000,
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
    comments: 3,
    isVerified: true,
    xpEarned: 100,
    createdAt: Date.now() - 60 * 60 * 1000,
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
    comments: 1,
    isVerified: true,
    xpEarned: 75,
    createdAt: Date.now() - 3 * 3600 * 1000,
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
    comments: 2,
    isVerified: true,
    xpEarned: 80,
    createdAt: Date.now() - 5 * 3600 * 1000,
  },
];

export const INITIAL_CHECKINS: CheckinHistoryItem[] = [
  {
    id: 'c1',
    placeName: 'Café Giảng (Cà Phê Trứng)',
    city: 'Hà Nội',
    coordinates: [105.8542, 21.0335],
    timeAgo: '2 giờ trước',
    xpEarned: 100,
    photoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80',
    isVerified: true,
    createdAt: Date.now() - 2 * 3600 * 1000,
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
    createdAt: Date.now() - 24 * 3600 * 1000,
  },
  {
    id: 'c3',
    placeName: 'Landmark 81',
    city: 'TP. Hồ Chí Minh',
    coordinates: [106.7218, 10.7952],
    timeAgo: '3 ngày trước',
    xpEarned: 50,
    isVerified: true,
    createdAt: Date.now() - 3 * 24 * 3600 * 1000,
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
    createdAt: Date.now() - 7 * 24 * 3600 * 1000,
  },
];

export const INITIAL_COMMENTS: FeedComment[] = [
  {
    id: 'cm1',
    postId: 'f1',
    userName: 'Minh Tuấn',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    text: 'Cà phê trứng Giảng ngay gần đó uống chuẩn bài luôn chị ơi!',
    timeAgo: '10 phút trước',
    createdAt: Date.now() - 10 * 60 * 1000,
  },
  {
    id: 'cm2',
    postId: 'f1',
    userName: 'Quốc Bảo',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    text: 'Sáng mai mình cũng ra Bờ Hồ chạy bộ.',
    timeAgo: '5 phút trước',
    createdAt: Date.now() - 5 * 60 * 1000,
  },
  {
    id: 'cm3',
    postId: 'f2',
    userName: 'Lan Hương',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    text: 'Landmark 81 chụp đêm góc này cực đỉnh luôn!',
    timeAgo: '45 phút trước',
    createdAt: Date.now() - 45 * 60 * 1000,
  },
];

interface CommunityState {
  feed: CommunityFeedItem[];
  checkins: CheckinHistoryItem[];
  comments: FeedComment[];
  isLoaded: boolean;

  loadInitialData: () => Promise<void>;
  addFeedItem: (item: Omit<CommunityFeedItem, 'id' | 'createdAt'>) => void;
  toggleLikePost: (postId: string, isLiked: boolean) => void;
  addCheckinRecord: (record: Omit<CheckinHistoryItem, 'id' | 'createdAt'>) => void;
  addComment: (postId: string, userName: string, userAvatar: string, text: string) => void;
  getCommentsForPost: (postId: string) => FeedComment[];
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  feed: INITIAL_FEED,
  checkins: INITIAL_CHECKINS,
  comments: INITIAL_COMMENTS,
  isLoaded: false,

  loadInitialData: async () => {
    if (get().isLoaded) return;
    try {
      const [feedData, checkinData, commentData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_FEED_KEY),
        AsyncStorage.getItem(STORAGE_CHECKIN_KEY),
        AsyncStorage.getItem(STORAGE_COMMENTS_KEY),
      ]);

      set({
        feed: feedData ? JSON.parse(feedData) : INITIAL_FEED,
        checkins: checkinData ? JSON.parse(checkinData) : INITIAL_CHECKINS,
        comments: commentData ? JSON.parse(commentData) : INITIAL_COMMENTS,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  addFeedItem: (item) => {
    const newItem: CommunityFeedItem = {
      ...item,
      id: `post-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [newItem, ...get().feed];
    set({ feed: updated });
    AsyncStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(updated)).catch(() => {});
  },

  toggleLikePost: (postId: string, isLiked: boolean) => {
    const updated = get().feed.map((item) =>
      item.id === postId
        ? { ...item, likes: Math.max(0, item.likes + (isLiked ? 1 : -1)) }
        : item
    );
    set({ feed: updated });
    AsyncStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(updated)).catch(() => {});
  },

  addCheckinRecord: (record) => {
    const newRecord: CheckinHistoryItem = {
      ...record,
      id: `chk-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updatedCheckins = [newRecord, ...get().checkins];
    set({ checkins: updatedCheckins });
    AsyncStorage.setItem(STORAGE_CHECKIN_KEY, JSON.stringify(updatedCheckins)).catch(() => {});

    // Also share to community feed automatically
    const newFeedItem: CommunityFeedItem = {
      id: `post-chk-${Date.now()}`,
      userName: 'Bạn',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      placeName: record.placeName,
      placeCity: record.city,
      coordinates: record.coordinates,
      timeAgo: 'Vừa xong',
      caption: record.caption || `Đã check-in tại ${record.placeName} và nhận +${record.xpEarned} XP!`,
      imageUrl: record.photoUrl,
      likes: 1,
      comments: 0,
      isVerified: record.isVerified,
      xpEarned: record.xpEarned,
      createdAt: Date.now(),
    };
    const updatedFeed = [newFeedItem, ...get().feed];
    set({ feed: updatedFeed });
    AsyncStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(updatedFeed)).catch(() => {});
  },

  addComment: (postId: string, userName: string, userAvatar: string, text: string) => {
    if (!text.trim()) return;
    const newComment: FeedComment = {
      id: `cm-${Date.now()}`,
      postId,
      userName,
      userAvatar,
      text: text.trim(),
      timeAgo: 'Vừa xong',
      createdAt: Date.now(),
    };
    const updatedComments = [...get().comments, newComment];

    // Increment post comment count
    const updatedFeed = get().feed.map((post) =>
      post.id === postId ? { ...post, comments: post.comments + 1 } : post
    );

    set({ comments: updatedComments, feed: updatedFeed });
    AsyncStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(updatedComments)).catch(() => {});
    AsyncStorage.setItem(STORAGE_FEED_KEY, JSON.stringify(updatedFeed)).catch(() => {});
  },

  getCommentsForPost: (postId: string) => {
    return get().comments.filter((c) => c.postId === postId);
  },
}));
