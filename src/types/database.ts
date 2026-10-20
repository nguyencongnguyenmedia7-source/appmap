/**
 * CITYVERSE Database Schema Definitions (Supabase + PostGIS)
 * Aligned with PostGIS geography(Point, 4326) and RLS requirements.
 */

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs_review';

export type PlaceCategory =
  | 'coffee'
  | 'restaurant'
  | 'tourism'
  | 'entertainment'
  | 'hotel'
  | 'park'
  | 'shopping'
  | 'culture'
  | 'nightlife'
  | 'community';

export interface Place {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: PlaceCategory;
  address: string;
  province_code: string | null;
  administrative_metadata: Record<string, unknown> | null;
  // In API queries, PostGIS returns geojson or separate coordinates
  latitude: number;
  longitude: number;
  entrance_latitude: number | null;
  entrance_longitude: number | null;
  location_accuracy_meters: number | null;
  data_source: string; // 'CITYVERSE' | 'OSM' | 'COMMUNITY' | 'MAPBOX'
  external_source_id: string | null;
  verification_status: VerificationStatus;
  opening_hours: Record<string, string> | null;
  phone: string | null;
  website: string | null;
  cover_image_url: string | null;
  checkin_count: number;
  post_count: number;
  rating_average: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_verified_at: string | null;
  is_active: boolean;
  distance_meters?: number; // Calculated dynamically in nearby queries
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  latitude: number;
  longitude: number;
  description: string | null;
  cover_image_url: string | null;
  submitted_by: string;
  status: VerificationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string; // references auth.users
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  xp: number;
  streak_days: number;
  last_active_at: string;
  is_verified: boolean;
  is_profile_private: boolean;
  is_location_sharing_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type FriendshipStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  place_id: string;
  latitude: number;
  longitude: number;
  gps_accuracy_meters: number;
  is_verified_proximity: boolean;
  photo_url: string | null;
  caption: string | null;
  xp_awarded: number;
  created_at: string;
  user?: Profile;
  place?: Place;
}

export interface Post {
  id: string;
  user_id: string;
  place_id: string | null;
  content: string;
  like_count: number;
  comment_count: number;
  is_location_public: boolean;
  created_at: string;
  updated_at: string;
  user?: Profile;
  place?: Place;
  media?: PostMedia[];
  has_liked?: boolean;
}

export interface PostMedia {
  id: string;
  post_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  place_id: string;
  organizer_id: string;
  category: string;
  start_time: string;
  end_time: string;
  cover_image_url: string | null;
  attendee_count: number;
  is_verified: boolean;
  created_at: string;
  place?: Place;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'interested' | 'not_going';
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  badge_name: string;
  badge_icon_url: string | null;
  category: PlaceCategory | 'all';
  required_checkins: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  current_progress: number;
  is_completed: boolean;
  completed_at: string | null;
  challenge?: Challenge;
}

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'checkin' | 'friend_request' | 'like' | 'comment' | 'badge' | 'system';
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  target_type: 'place' | 'post' | 'comment' | 'event' | 'user';
  target_id: string;
  reason: string;
  description: string | null;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface UserLocationShare {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  is_active: boolean;
  expires_at: string;
  updated_at: string;
}
