import { VietnamCityPreset, PlaceCategory } from '@/types';

/**
 * Vietnam Geospatial Constants & Presets
 * EPSG:4326 Coordinate system [longitude, latitude]
 */

export const VIETNAM_BOUNDING_BOX = {
  minLng: 102.144411,
  minLat: 8.179066,
  maxLng: 109.464638,
  maxLat: 23.393395,
};

export const VIETNAM_CITY_PRESETS: VietnamCityPreset[] = [
  {
    id: 'hanoi',
    name: 'Hà Nội',
    province: 'Hà Nội',
    coordinates: [105.8542, 21.0285], // [lng, lat]
    defaultZoom: 16,
    defaultPitch: 55,
    description: 'Thủ đô nghìn năm văn hiến, phố cổ và hồ Gươm thơ mộng',
  },
  {
    id: 'hcmc',
    name: 'TP. Hồ Chí Minh',
    province: 'Hồ Chí Minh',
    coordinates: [106.7009, 10.7769], // [lng, lat]
    defaultZoom: 16,
    defaultPitch: 60,
    description: 'Đô thị sôi động, trung tâm kinh tế và tòa nhà Landmark 81',
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    province: 'Đà Nẵng',
    coordinates: [108.2208, 16.0544], // [lng, lat]
    defaultZoom: 16,
    defaultPitch: 50,
    description: 'Thành phố của những cây cầu, bãi biển Mỹ Khê và bán đảo Sơn Trà',
  },
  {
    id: 'hue',
    name: 'Huế',
    province: 'Thừa Thiên Huế',
    coordinates: [107.5796, 16.4637], // [lng, lat]
    defaultZoom: 16,
    defaultPitch: 45,
    description: 'Cố đô di sản văn hóa thế giới với Đại Nội và dòng sông Hương',
  },
  {
    id: 'quangngai',
    name: 'Quảng Ngãi',
    province: 'Quảng Ngãi',
    coordinates: [108.8000, 15.1200], // [lng, lat]
    defaultZoom: 15,
    defaultPitch: 40,
    description: 'Vùng đất núi Ấn sông Trà, thiên nhiên hoang sơ và đảo Lý Sơn',
  },
];

export interface CategoryInfo {
  category: PlaceCategory;
  label: string;
  icon: string;
  color: string;
  bgGlow: string;
}

export const PLACE_CATEGORIES: Record<PlaceCategory, CategoryInfo> = {
  coffee: {
    category: 'coffee',
    label: 'Cà phê',
    icon: 'Coffee',
    color: '#F59E0B',
    bgGlow: 'rgba(245, 158, 11, 0.2)',
  },
  restaurant: {
    category: 'restaurant',
    label: 'Ẩm thực',
    icon: 'Utensils',
    color: '#EF4444',
    bgGlow: 'rgba(239, 68, 68, 0.2)',
  },
  tourism: {
    category: 'tourism',
    label: 'Du lịch',
    icon: 'Camera',
    color: '#3B82F6',
    bgGlow: 'rgba(59, 130, 246, 0.2)',
  },
  culture: {
    category: 'culture',
    label: 'Di sản & Văn hóa',
    icon: 'Landmark',
    color: '#8B5CF6',
    bgGlow: 'rgba(139, 92, 246, 0.2)',
  },
  entertainment: {
    category: 'entertainment',
    label: 'Giải trí',
    icon: 'Sparkles',
    color: '#EC4899',
    bgGlow: 'rgba(236, 72, 153, 0.2)',
  },
  park: {
    category: 'park',
    label: 'Công viên',
    icon: 'Trees',
    color: '#10B981',
    bgGlow: 'rgba(16, 185, 129, 0.2)',
  },
  shopping: {
    category: 'shopping',
    label: 'Mua sắm',
    icon: 'ShoppingBag',
    color: '#F97316',
    bgGlow: 'rgba(249, 115, 22, 0.2)',
  },
  hotel: {
    category: 'hotel',
    label: 'Khách sạn',
    icon: 'Building2',
    color: '#6366F1',
    bgGlow: 'rgba(99, 102, 241, 0.2)',
  },
  nightlife: {
    category: 'nightlife',
    label: 'Về đêm',
    icon: 'Moon',
    color: '#A855F7',
    bgGlow: 'rgba(168, 85, 247, 0.2)',
  },
  community: {
    category: 'community',
    label: 'Cộng đồng',
    icon: 'Users',
    color: '#06B6D4',
    bgGlow: 'rgba(6, 182, 212, 0.2)',
  },
};

export const CHECKIN_CONFIG = {
  VERIFIED_RADIUS_METERS: 200, // Maximum distance to consider verified check-in
  WEAK_GPS_RADIUS_METERS: 500, // Tolerance if accuracy is poor
  MAX_ALLOWED_ACCURACY_METERS: 150, // Reject or flag GPS with accuracy > 150m
  BASE_XP_REWARD: 50,
  VERIFIED_BONUS_XP: 25,
  PHOTO_BONUS_XP: 25,
  MIN_CHECKIN_INTERVAL_MINUTES: 30, // Anti-cheat rate limit for same place
};
