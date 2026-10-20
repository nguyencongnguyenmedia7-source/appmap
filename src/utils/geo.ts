import { BoundingBox, Coordinates } from '@/types';
import { CHECKIN_CONFIG, VIETNAM_BOUNDING_BOX } from '@/constants/vietnam';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates Great-Circle distance using Haversine Formula (meters)
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Validates coordinate numbers and ranges
 */
export function isValidCoordinate(longitude: number, latitude: number): boolean {
  if (
    typeof longitude !== 'number' ||
    typeof latitude !== 'number' ||
    isNaN(longitude) ||
    isNaN(latitude)
  ) {
    return false;
  }
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Checks whether coordinates fall within Vietnam's territorial bounding box
 */
export function isWithinVietnam(longitude: number, latitude: number): boolean {
  if (!isValidCoordinate(longitude, latitude)) return false;
  return (
    longitude >= VIETNAM_BOUNDING_BOX.minLng &&
    longitude <= VIETNAM_BOUNDING_BOX.maxLng &&
    latitude >= VIETNAM_BOUNDING_BOX.minLat &&
    latitude <= VIETNAM_BOUNDING_BOX.maxLat
  );
}

/**
 * Checks if a point lies inside a bounding box
 */
export function isPointInBoundingBox(
  longitude: number,
  latitude: number,
  bbox: BoundingBox
): boolean {
  return (
    longitude >= bbox.minLng &&
    longitude <= bbox.maxLng &&
    latitude >= bbox.minLat &&
    latitude <= bbox.maxLat
  );
}

/**
 * Formats distance into localized readable string (m or km)
 */
export function formatDistance(meters: number): string {
  if (meters < 0) return '0 m';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export interface ProximityVerificationResult {
  isVerified: boolean;
  distanceMeters: number;
  reason: string;
}

/**
 * Verifies if user GPS location is close enough to a place for a legitimate check-in
 */
export function verifyProximityForCheckin(
  userCoords: Coordinates,
  placeCoords: { longitude: number; latitude: number }
): ProximityVerificationResult {
  if (!isValidCoordinate(userCoords.longitude, userCoords.latitude)) {
    return {
      isVerified: false,
      distanceMeters: Infinity,
      reason: 'Tọa độ thiết bị không hợp lệ.',
    };
  }

  const distance = haversineDistance(
    userCoords.latitude,
    userCoords.longitude,
    placeCoords.latitude,
    placeCoords.longitude
  );

  const accuracy = userCoords.accuracy || 20;

  // Strict check: distance within verified radius
  if (distance <= CHECKIN_CONFIG.VERIFIED_RADIUS_METERS) {
    return {
      isVerified: true,
      distanceMeters: Math.round(distance),
      reason: 'Đã xác thực vị trí thực tế tại địa điểm.',
    };
  }

  // Tolerance check if device GPS accuracy is imperfect
  if (
    accuracy > 50 &&
    distance <= CHECKIN_CONFIG.WEAK_GPS_RADIUS_METERS &&
    accuracy <= CHECKIN_CONFIG.MAX_ALLOWED_ACCURACY_METERS
  ) {
    return {
      isVerified: true,
      distanceMeters: Math.round(distance),
      reason: 'Xác thực với sai số GPS cho phép.',
    };
  }

  return {
    isVerified: false,
    distanceMeters: Math.round(distance),
    reason: `Bạn đang ở cách địa điểm ${formatDistance(distance)}. Hãy đến gần hơn (dưới ${CHECKIN_CONFIG.VERIFIED_RADIUS_METERS}m) để được xác thực.`,
  };
}
