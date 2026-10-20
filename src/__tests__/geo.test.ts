import {
  haversineDistance,
  isValidCoordinate,
  isWithinVietnam,
  isPointInBoundingBox,
  formatDistance,
  verifyProximityForCheckin,
} from '../utils/geo';

describe('Geospatial Calculations & Validation', () => {
  test('isValidCoordinate accepts valid WGS84 coordinates', () => {
    expect(isValidCoordinate(105.8542, 21.0285)).toBe(true); // Hanoi
    expect(isValidCoordinate(106.7009, 10.7769)).toBe(true); // HCMC
    expect(isValidCoordinate(-181, 10)).toBe(false);
    expect(isValidCoordinate(105, 95)).toBe(false);
    expect(isValidCoordinate(NaN, 21)).toBe(false);
  });

  test('isWithinVietnam accurately checks Vietnam territorial bounds', () => {
    expect(isWithinVietnam(105.8542, 21.0285)).toBe(true); // Hanoi
    expect(isWithinVietnam(108.2208, 16.0544)).toBe(true); // Da Nang
    expect(isWithinVietnam(108.8000, 15.1200)).toBe(true); // Quang Ngai
    expect(isWithinVietnam(2.3522, 48.8566)).toBe(false); // Paris, France
    expect(isWithinVietnam(139.6917, 35.6895)).toBe(false); // Tokyo, Japan
  });

  test('haversineDistance calculates accurate distance between landmarks', () => {
    // Hoan Kiem Lake (105.8524, 21.0287) to Hanoi Opera House (105.8576, 21.0245)
    const distance = haversineDistance(21.0287, 105.8524, 21.0245, 105.8576);
    // Real physical distance is approx 710 meters
    expect(distance).toBeGreaterThan(600);
    expect(distance).toBeLessThan(850);
  });

  test('formatDistance produces correct human-readable strings', () => {
    expect(formatDistance(85)).toBe('85 m');
    expect(formatDistance(950)).toBe('950 m');
    expect(formatDistance(2450)).toBe('2.5 km');
    expect(formatDistance(12800)).toBe('12.8 km');
  });

  test('isPointInBoundingBox filters correctly', () => {
    const bbox = { minLng: 105.8, minLat: 21.0, maxLng: 105.9, maxLat: 21.1 };
    expect(isPointInBoundingBox(105.85, 21.05, bbox)).toBe(true);
    expect(isPointInBoundingBox(106.5, 21.05, bbox)).toBe(false);
  });

  test('verifyProximityForCheckin verifies close check-in (<200m) and flags distant check-in', () => {
    const place = { longitude: 105.8524, latitude: 21.0287 };

    // User is 50 meters away
    const closeUser = {
      longitude: 105.8528,
      latitude: 21.0289,
      accuracy: 10,
    };
    const verifiedResult = verifyProximityForCheckin(closeUser, place);
    expect(verifiedResult.isVerified).toBe(true);
    expect(verifiedResult.distanceMeters).toBeLessThan(200);

    // User is 2.5 km away
    const distantUser = {
      longitude: 105.88,
      latitude: 21.01,
      accuracy: 15,
    };
    const distantResult = verifyProximityForCheckin(distantUser, place);
    expect(distantResult.isVerified).toBe(false);
    expect(distantResult.distanceMeters).toBeGreaterThan(1000);
  });
});
