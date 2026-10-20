import { placeRepository } from '../services/places/placeRepository';

describe('Place Repository Viewport & Proximity Logic', () => {
  test('getPlacesInViewport filters places strictly within bounding box', async () => {
    // Hanoi bounding box
    const hanoiBbox = {
      minLng: 105.80,
      minLat: 21.00,
      maxLng: 105.90,
      maxLat: 21.06,
    };

    const places = await placeRepository.getPlacesInViewport({
      bbox: hanoiBbox,
    });

    expect(places.length).toBeGreaterThan(0);
    // All returned places must reside in Hanoi bbox
    places.forEach((p) => {
      expect(p.longitude).toBeGreaterThanOrEqual(hanoiBbox.minLng);
      expect(p.longitude).toBeLessThanOrEqual(hanoiBbox.maxLng);
      expect(p.latitude).toBeGreaterThanOrEqual(hanoiBbox.minLat);
      expect(p.latitude).toBeLessThanOrEqual(hanoiBbox.maxLat);
    });
  });

  test('getPlacesNearby sorts by distance ascending', async () => {
    // Search around Hoan Kiem Lake
    const nearby = await placeRepository.getPlacesNearby({
      longitude: 105.8524,
      latitude: 21.0287,
      radiusMeters: 5000,
      limit: 10,
    });

    expect(nearby.length).toBeGreaterThan(0);
    // First result should be Hoan Kiem Lake itself (distance ~ 0)
    expect(nearby[0].distance_meters).toBeLessThan(50);

    // Verify sorted ascending
    for (let i = 1; i < nearby.length; i++) {
      expect((nearby[i].distance_meters || 0)).toBeGreaterThanOrEqual(
        (nearby[i - 1].distance_meters || 0)
      );
    }
  });

  test('searchPlaces with category filter returns only matching category', async () => {
    const coffeePlaces = await placeRepository.searchPlaces('', 'coffee');
    expect(coffeePlaces.length).toBeGreaterThan(0);
    coffeePlaces.forEach((p) => {
      expect(p.category).toBe('coffee');
    });
  });
});
