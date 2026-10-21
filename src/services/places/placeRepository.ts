import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STORAGE_CUSTOM_PLACES_KEY = '@cityverse_custom_places';

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
  private customPlaces: Place[] = [];
  private isStorageLoaded: boolean = false;

  constructor() {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    if (this.isStorageLoaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_CUSTOM_PLACES_KEY);
      if (stored) {
        const parsed: Place[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.customPlaces = parsed;
          // Prepend to MOCK_VIETNAM_PLACES avoiding duplicate IDs
          parsed.forEach((customPlace) => {
            if (!MOCK_VIETNAM_PLACES.some((p) => p.id === customPlace.id)) {
              MOCK_VIETNAM_PLACES.unshift(customPlace);
            }
          });
        }
      }
    } catch (e) {
      console.warn('[PlaceRepository] Failed to load custom places from storage:', e);
    } finally {
      this.isStorageLoaded = true;
    }
  }

  /**
   * Helper to merge custom places into any list of places based on bbox and categories
   */
  private mergeCustomPlaces(
    places: Place[],
    bbox?: BoundingBox,
    categories?: PlaceCategory[]
  ): Place[] {
    const matchedCustom = this.customPlaces.filter((place) => {
      const inBox = bbox
        ? isPointInBoundingBox(place.longitude, place.latitude, bbox)
        : true;
      const matchesCategory =
        !categories || categories.length === 0 || categories.includes(place.category);
      return inBox && matchesCategory;
    });

    const seen = new Set<string>();
    const result: Place[] = [];

    // Prioritize custom places first so newly added places appear at the top
    for (const p of matchedCustom) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
      }
    }

    for (const p of places) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
      }
    }

    return result;
  }

  /**
   * Fetches places inside visible bounding box (debounced viewport loader)
   */
  async getPlacesInViewport(params: ViewportPlacesParams): Promise<Place[]> {
    await this.initStorage();
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

        const supabasePlaces = (data as Place[]) || [];
        return this.mergeCustomPlaces(supabasePlaces, bbox, categories).slice(0, limit);
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
    await this.initStorage();
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

        const supabasePlaces = (data as Place[]) || [];
        return this.mergeCustomPlaces(supabasePlaces).slice(0, limit);
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
    await this.initStorage();
    if (!query && !categoryFilter) return [];

    let pool: Place[] = [];
    if (isSupabaseConfigured) {
      try {
        let queryBuilder = supabase
          .from('places')
          .select('*')
          .eq('is_active', true)
          .limit(30);

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
        pool = MOCK_VIETNAM_PLACES;
      }
    } else {
      pool = MOCK_VIETNAM_PLACES;
    }

    // Merge custom places into pool
    pool = this.mergeCustomPlaces(pool, undefined, categoryFilter ? [categoryFilter] : undefined);

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
    await this.initStorage();
    const { placeId, userCoords, photoUrl, caption } = params;

    // 1. Try Supabase RPC first if user is logged into Supabase
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

        if (!error && data) {
          this.incrementPlaceCheckinCount(placeId);
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
        }
      } catch (_) {
        // Fall through to guest/local verification
      }
    }

    // 2. Fallback local proximity verification (works for guest users, offline & custom places)
    let targetPlace =
      this.customPlaces.find((p) => p.id === placeId) ||
      MOCK_VIETNAM_PLACES.find((p) => p.id === placeId);

    // If still not found, try querying from Supabase directly
    if (!targetPlace && isSupabaseConfigured) {
      try {
        const { data } = await supabase.from('places').select('*').eq('id', placeId).single();
        if (data) {
          targetPlace = data as Place;
        }
      } catch (_) {}
    }

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
    this.incrementPlaceCheckinCount(placeId);

    return {
      success: true,
      checkinId: `local-${Date.now()}`,
      distanceMeters: verification.distanceMeters,
      isVerified: verification.isVerified,
      xpAwarded: xp,
      message: verification.isVerified
        ? `Đã xác thực vị trí GPS tại địa điểm! Nhận +${xp} XP.`
        : `Check-in thành công (${verification.reason}). Nhận +${xp} XP.`,
    };
  }

  /**
   * Increments checkin count on a place locally and in storage
   */
  incrementPlaceCheckinCount(placeId: string): void {
    // Update in custom places
    let found = false;
    this.customPlaces = this.customPlaces.map((p) => {
      if (p.id === placeId) {
        found = true;
        return { ...p, checkin_count: (p.checkin_count || 0) + 1 };
      }
      return p;
    });

    // Update in mock array
    const mockTarget = MOCK_VIETNAM_PLACES.find((p) => p.id === placeId);
    if (mockTarget) {
      mockTarget.checkin_count = (mockTarget.checkin_count || 0) + 1;
    }

    if (found) {
      this.saveCustomPlacesToStorage();
    }
  }

  // --- Viewport & Local Helpers ---
  getMockPlacesInViewport(
    bbox: BoundingBox,
    categories?: PlaceCategory[],
    limit: number = 60
  ): Place[] {
    const centerLng = (bbox.minLng + bbox.maxLng) / 2;
    const centerLat = (bbox.minLat + bbox.maxLat) / 2;

    const allPlaces = this.mergeCustomPlaces(MOCK_VIETNAM_PLACES, bbox, categories);

    // Filter places directly inside viewport bbox
    let matched = allPlaces.filter((place) => {
      const inBox = isPointInBoundingBox(place.longitude, place.latitude, bbox);
      const matchesCategory =
        !categories || categories.length === 0 || categories.includes(place.category);
      return inBox && matchesCategory;
    });

    // If viewport has few places, expand up to 30km radius around center to populate pins
    if (matched.length < 8) {
      const nearby = allPlaces.filter((place) => {
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
    const allPlaces = this.mergeCustomPlaces(MOCK_VIETNAM_PLACES);
    return allPlaces
      .map((p) => {
        const distance = haversineDistance(latitude, longitude, p.latitude, p.longitude);
        return { ...p, distance_meters: Math.round(distance) };
      })
      .filter((p) => (p.distance_meters || 0) <= radiusMeters)
      .sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0))
      .slice(0, limit);
  }

  private async saveCustomPlacesToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_CUSTOM_PLACES_KEY, JSON.stringify(this.customPlaces));
    } catch (e) {
      console.warn('[PlaceRepository] Failed to save custom places to storage:', e);
    }
  }

  addCustomPlace(place: Place): void {
    // 1. Prepend to custom places and mock cache
    const existingIndex = this.customPlaces.findIndex((p) => p.id === place.id);
    if (existingIndex >= 0) {
      this.customPlaces[existingIndex] = place;
    } else {
      this.customPlaces.unshift(place);
    }

    if (!MOCK_VIETNAM_PLACES.some((p) => p.id === place.id)) {
      MOCK_VIETNAM_PLACES.unshift(place);
    }

    // 2. Persist to AsyncStorage immediately
    this.saveCustomPlacesToStorage();

    // 3. Attempt to sync to Supabase database
    if (isSupabaseConfigured) {
      (async () => {
        try {
          const { error } = await supabase.from('places').insert({
            name: place.name,
            slug: place.slug,
            description: place.description,
            category: place.category,
            address: place.address,
            location: `POINT(${place.longitude} ${place.latitude})`,
            cover_image_url: place.cover_image_url,
            checkin_count: place.checkin_count || 1,
            rating_average: place.rating_average || 5.0,
            is_active: true,
            data_source: 'COMMUNITY',
            verification_status: 'verified',
          });
          if (error) {
            console.warn('[PlaceRepository] Supabase insert place info:', error.message);
          }
        } catch (e: any) {
          console.warn('[PlaceRepository] Supabase insert exception:', e?.message);
        }
      })();
    }
  }

  /**
   * Deletes a place from custom places and active pool
   */
  deletePlace(placeId: string): boolean {
    const prevLen = this.customPlaces.length;
    this.customPlaces = this.customPlaces.filter((p) => p.id !== placeId);

    // Also remove from mock array if present
    const mockIdx = MOCK_VIETNAM_PLACES.findIndex((p) => p.id === placeId);
    if (mockIdx >= 0) {
      MOCK_VIETNAM_PLACES.splice(mockIdx, 1);
    }

    if (this.customPlaces.length !== prevLen) {
      this.saveCustomPlacesToStorage();
    }

    if (isSupabaseConfigured) {
      (async () => {
        try {
          await supabase.from('places').update({ is_active: false }).eq('id', placeId);
        } catch (_) {}
      })();
    }

    return true;
  }

  /**
   * Returns all active places
   */
  getAllPlaces(): Place[] {
    return this.mergeCustomPlaces(MOCK_VIETNAM_PLACES);
  }

  /**
   * Searches repository for place matching name or coordinate proximity
   */
  findPlaceByNameOrCoords(name?: string, coords?: [number, number]): Place | undefined {
    const all = this.getAllPlaces();

    if (name && name.trim()) {
      const q = name.trim();
      const directMatch = all.find(
        (p) => matchesVietnameseSearch(p.name, q) || matchesVietnameseSearch(q, p.name)
      );
      if (directMatch) return directMatch;
    }

    if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
      const closeMatch = all.find((p) => {
        const dist = haversineDistance(coords[1], coords[0], p.latitude, p.longitude);
        return dist <= 250; // within 250m
      });
      if (closeMatch) return closeMatch;
    }

    return undefined;
  }
}

export const placeRepository = new PlaceRepository();

