import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/env';
import { Place, BoundingBox, Coordinates, PlaceCategory } from '@/types';
import { MOCK_VIETNAM_PLACES } from './mockVietnamPlaces';
import {
  isPointInBoundingBox,
  haversineDistance,
  verifyProximityForCheckin,
} from '@/utils/geo';
import { matchesVietnameseSearch } from '@/utils/vietnamese';

export interface ViewportPlacesParams {
  bbox: BoundingBox;
  categories?: PlaceCategory[];
  limit?: number;
}

export interface NearbyPlacesParams {
  longitude: number;
  latitude: number;
  radiusMeters?: number;
  limit?: number;
}

export interface CheckinSubmissionParams {
  placeId: string;
  userCoords: Coordinates;
  photoUrl?: string;
  caption?: string;
}

export interface CheckinResult {
  success: boolean;
  checkinId: string;
  distanceMeters: number;
  isVerified: boolean;
  xpAwarded: number;
  message: string;
}

class PlaceRepository {
  /**
   * Fetches places inside visible bounding box (debounced viewport loader)
   */
  async getPlacesInViewport(params: ViewportPlacesParams): Promise<Place[]> {
    const { bbox, categories, limit = 50 } = params;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_places_in_viewport', {
          min_lng: bbox.minLng,
          min_lat: bbox.minLat,
          max_lng: bbox.maxLng,
          max_lat: bbox.maxLat,
          p_categories: categories && categories.length > 0 ? categories : null,
          p_limit: limit,
        });

        if (error) {
          console.warn('[PlaceRepository] Supabase viewport query error:', error.message);
          return this.getMockPlacesInViewport(bbox, categories, limit);
        }

        return (data as Place[]) || [];
      } catch (err) {
        console.warn('[PlaceRepository] Viewport exception:', err);
        return this.getMockPlacesInViewport(bbox, categories, limit);
      }
    }

    return this.getMockPlacesInViewport(bbox, categories, limit);
  }

  /**
   * Fetches places nearby a specific coordinate
   */
  async getPlacesNearby(params: NearbyPlacesParams): Promise<Place[]> {
    const { longitude, latitude, radiusMeters = 2000, limit = 30 } = params;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('get_places_nearby', {
          p_lng: longitude,
          p_lat: latitude,
          p_radius_meters: radiusMeters,
          p_limit: limit,
        });

        if (error) {
          console.warn('[PlaceRepository] Supabase nearby error:', error.message);
          return this.getMockPlacesNearby(longitude, latitude, radiusMeters, limit);
        }

        return (data as Place[]) || [];
      } catch (err) {
        console.warn('[PlaceRepository] Nearby exception:', err);
        return this.getMockPlacesNearby(longitude, latitude, radiusMeters, limit);
      }
    }

    return this.getMockPlacesNearby(longitude, latitude, radiusMeters, limit);
  }

  /**
   * Search places by query text (Vietnamese diacritic-insensitive)
   */
  async searchPlaces(query: string, categoryFilter?: PlaceCategory): Promise<Place[]> {
    if (!query && !categoryFilter) return [];

    let pool: Place[] = [];
    if (isSupabaseConfigured) {
      try {
        let queryBuilder = supabase
          .from('places')
          .select('*')
          .eq('is_active', true)
          .limit(20);

        if (categoryFilter) {
          queryBuilder = queryBuilder.eq('category', categoryFilter);
        }

        if (query.trim()) {
          queryBuilder = queryBuilder.ilike('name', `%${query.trim()}%`);
        }

        const { data, error } = await queryBuilder;
        if (!error && data) {
          pool = data as Place[];
        } else {
          pool = MOCK_VIETNAM_PLACES;
        }
      } catch (e) {
        // Fallback to local verified pool
        pool = MOCK_VIETNAM_PLACES;
      }
    } else {
      pool = MOCK_VIETNAM_PLACES;
    }

    // Apply client-side Vietnamese normalization
    return pool.filter((place) => {
      const matchesCategory = categoryFilter ? place.category === categoryFilter : true;
      const matchesText =
        !query ||
        matchesVietnameseSearch(place.name, query) ||
        matchesVietnameseSearch(place.address, query) ||
        matchesVietnameseSearch(place.description || '', query);

      return matchesCategory && matchesText;
    });
  }

  /**
   * Submits check-in with GPS proximity verification and anti-cheat
   */
  async performCheckin(params: CheckinSubmissionParams): Promise<CheckinResult> {
    const { placeId, userCoords, photoUrl, caption } = params;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.rpc('perform_verified_checkin', {
          p_place_id: placeId,
          p_user_lng: userCoords.longitude,
          p_user_lat: userCoords.latitude,
          p_accuracy: userCoords.accuracy || 15,
          p_photo_url: photoUrl || null,
          p_caption: caption || null,
        });

        if (error) {
          throw new Error(error.message);
        }

        return {
          success: true,
          checkinId: data.checkin_id,
          distanceMeters: data.distance_meters,
          isVerified: data.is_verified,
          xpAwarded: data.xp_awarded,
          message: data.is_verified
            ? `Check-in thành công! Bạn nhận được +${data.xp_awarded} XP.`
            : `Đã lưu check-in từ xa (+${data.xp_awarded} XP). Hãy đến gần địa điểm hơn để nhận huy hiệu xác thực.`,
        };
      } catch (err: any) {
        return {
          success: false,
          checkinId: '',
          distanceMeters: 0,
          isVerified: false,
          xpAwarded: 0,
          message: err?.message || 'Không thể thực hiện check-in.',
        };
      }
    }

    // Fallback simulation with exact same rules
    const targetPlace = MOCK_VIETNAM_PLACES.find((p) => p.id === placeId);
    if (!targetPlace) {
      return {
        success: false,
        checkinId: '',
        distanceMeters: 0,
        isVerified: false,
        xpAwarded: 0,
        message: 'Không tìm thấy địa điểm.',
      };
    }

    const verification = verifyProximityForCheckin(userCoords, {
      longitude: targetPlace.longitude,
      latitude: targetPlace.latitude,
    });

    const xp = verification.isVerified ? 75 : 50;

    return {
      success: true,
      checkinId: `local-${Date.now()}`,
      distanceMeters: verification.distanceMeters,
      isVerified: verification.isVerified,
      xpAwarded: xp,
      message: verification.isVerified
        ? `Đã xác thực vị trí thực tế! Nhận +${xp} XP.`
        : `Check-in thành công (${verification.reason}). Nhận +${xp} XP.`,
    };
  }

  // --- Viewport & Local Helpers ---
  getMockPlacesInViewport(
    bbox: BoundingBox,
    categories?: PlaceCategory[],
    limit: number = 60
  ): Place[] {
    const centerLng = (bbox.minLng + bbox.maxLng) / 2;
    const centerLat = (bbox.minLat + bbox.maxLat) / 2;

    // Filter places directly inside viewport bbox
    let matched = MOCK_VIETNAM_PLACES.filter((place) => {
      const inBox = isPointInBoundingBox(place.longitude, place.latitude, bbox);
      const matchesCategory =
        !categories || categories.length === 0 || categories.includes(place.category);
      return inBox && matchesCategory;
    });

    // If viewport has few places, expand up to 25km radius around center to populate pins
    if (matched.length < 8) {
      const nearby = MOCK_VIETNAM_PLACES.filter((place) => {
        const matchesCategory =
          !categories || categories.length === 0 || categories.includes(place.category);
        if (!matchesCategory) return false;
        const dist = haversineDistance(centerLat, centerLng, place.latitude, place.longitude);
        return dist <= 30000; // 30km
      });

      const idSet = new Set(matched.map((p) => p.id));
      for (const p of nearby) {
        if (!idSet.has(p.id)) {
          matched.push(p);
          idSet.add(p.id);
        }
      }
    }

    return matched.slice(0, limit);
  }

  private getMockPlacesNearby(
    longitude: number,
    latitude: number,
    radiusMeters: number,
    limit: number = 30
  ): Place[] {
    return MOCK_VIETNAM_PLACES.map((p) => {
      const distance = haversineDistance(latitude, longitude, p.latitude, p.longitude);
      return { ...p, distance_meters: Math.round(distance) };
    })
      .filter((p) => (p.distance_meters || 0) <= radiusMeters)
      .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0))
      .slice(0, limit);
  }

  addCustomPlace(place: Place): void {
    MOCK_VIETNAM_PLACES.unshift(place);
  }
}

export const placeRepository = new PlaceRepository();
