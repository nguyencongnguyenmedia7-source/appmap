import React, { useRef, useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Sparkles, X } from 'lucide-react-native';
import { CityMap } from '@/services/map/CityMap';
import { MapCameraControls } from '@/services/map/types';
import { MapHeaderSearch } from '@/components/MapHeaderSearch';
import { MapControls } from '@/components/MapControls';
import { PlaceDetailSheet } from '@/components/PlaceDetailSheet';
import { CheckinModal } from '@/components/CheckinModal';
import { useMapStore } from '@/store/mapStore';
import { usePlacesStore } from '@/store/placesStore';
import { useAuthStore } from '@/store/authStore';
import { useAdminStore } from '@/store/adminStore';
import { placeRepository } from '@/services/places/placeRepository';
import { locationService } from '@/services/location/locationService';
import { Place, BoundingBox } from '@/types';
import { THEME } from '@/constants/theme';

export default function CityverseMapScreen() {
  const mapRef = useRef<MapCameraControls>(null);

  const {
    center,
    zoom,
    pitch,
    bearing,
    displayMode,
    setCenter,
    setZoom,
    setBbox,
    userLocation,
    setUserLocation,
  } = useMapStore();

  const {
    places,
    setPlaces,
    selectedPlace,
    setSelectedPlace,
    activeCategoryFilter,
    searchQuery,
    incrementCheckinCount,
  } = usePlacesStore();

  const { initializeAuth } = useAuthStore();
  const { config, updateConfig } = useAdminStore();

  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Initialize auth session, GPS, and initial Vietnam places
  useEffect(() => {
    initializeAuth();
    loadInitialLocation();

    // Immediately load places for starting viewport
    const loadInit = async () => {
      const initialBbox: BoundingBox = {
        minLng: center[0] - 0.08,
        minLat: center[1] - 0.08,
        maxLng: center[0] + 0.08,
        maxLat: center[1] + 0.08,
      };
      const initialPlaces = await placeRepository.getPlacesInViewport({
        bbox: initialBbox,
        categories: activeCategoryFilter ? [activeCategoryFilter] : undefined,
        limit: 60,
      });
      setPlaces(initialPlaces);
    };
    loadInit();
  }, []);

  const loadInitialLocation = async () => {
    try {
      const { coords } = await locationService.getCurrentPosition();
      if (coords && Number.isFinite(coords.longitude) && Number.isFinite(coords.latitude)) {
        setUserLocation([coords.longitude, coords.latitude], coords.accuracy || undefined);
      }
    } catch (_) {}
  };

  // Viewport Region Change Handler (Debounced to control costs & network traffic)
  const handleRegionChangeComplete = useCallback(
    (bbox: BoundingBox, newCenter: [number, number], newZoom: number) => {
      setCenter(newCenter);
      setZoom(newZoom);
      setBbox(bbox);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        const fetched = await placeRepository.getPlacesInViewport({
          bbox,
          categories: activeCategoryFilter ? [activeCategoryFilter] : undefined,
          limit: 60,
        });
        setPlaces(fetched);
      }, 250);
    },
    [activeCategoryFilter]
  );

  // Search places when query or category changes
  useEffect(() => {
    let isCancelled = false;
    const runSearch = async () => {
      const results = await placeRepository.searchPlaces(
        searchQuery,
        activeCategoryFilter || undefined
      );
      if (!isCancelled) {
        setSearchResults(results);
      }
    };
    runSearch();
    return () => {
      isCancelled = true;
    };
  }, [searchQuery, activeCategoryFilter]);

  // Handle selecting a place (flies camera to place coordinates)
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    mapRef.current?.flyTo([place.longitude, place.latitude], 17, 60, 0);
  };

  // Quick jump between Vietnam cities
  const handleCitySelected = (coords: [number, number], targetZoom: number, targetPitch: number) => {
    setSelectedPlace(null);
    mapRef.current?.flyTo(coords, targetZoom, targetPitch, 0);

    // Immediately load places for this city so pins show up right away
    const cityBbox: BoundingBox = {
      minLng: coords[0] - 0.1,
      minLat: coords[1] - 0.1,
      maxLng: coords[0] + 0.1,
      maxLat: coords[1] + 0.1,
    };
    const cityPlaces = placeRepository.getMockPlacesInViewport(
      cityBbox,
      activeCategoryFilter ? [activeCategoryFilter] : undefined,
      60
    );
    setPlaces(cityPlaces);
  };

  // Locate me button handler
  const handleLocateMe = async () => {
    try {
      const { coords } = await locationService.getCurrentPosition();
      if (coords && Number.isFinite(coords.longitude) && Number.isFinite(coords.latitude)) {
        setUserLocation([coords.longitude, coords.latitude], coords.accuracy || undefined);
        mapRef.current?.flyTo([coords.longitude, coords.latitude], 16, 55, 0);
      }
    } catch (_) {}
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Map Engine (Mapbox 3D or Fallback Web Engine) */}
      <CityMap
        ref={mapRef}
        center={center}
        zoom={zoom}
        pitch={pitch}
        bearing={bearing}
        displayMode={displayMode}
        places={places}
        selectedPlace={selectedPlace}
        userLocation={userLocation}
        onSelectPlace={handleSelectPlace}
        onRegionChangeComplete={handleRegionChangeComplete}
      />

      {/* Header Search with Vietnamese normalization and integrated dual filter rows */}
      <MapHeaderSearch
        onSelectPlaceResult={handleSelectPlace}
        searchResults={searchResults}
        onCitySelected={handleCitySelected}
      />

      {/* System Announcement Banner (Admin configurable) */}
      {Boolean(config.announcementBanner && config.announcementBanner.trim().length > 0) && (
        <View style={styles.announcementBannerWrap}>
          <View style={styles.announcementBanner}>
            <View style={styles.announcementContent}>
              <Sparkles size={14} color="#20D6E7" />
              <Text style={styles.announcementText} numberOfLines={1}>
                {config.announcementBanner}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => updateConfig({ announcementBanner: '' })}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={14} color="#76839A" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Floating Map Controls */}
      {config.showFloatingControls && (
        <MapControls
          onLocateMe={handleLocateMe}
          onResetNorth={() => mapRef.current?.resetNorth()}
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
        />
      )}

      {/* Place Detail Sheet */}
      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          onOpenCheckin={() => setIsCheckinModalOpen(true)}
        />
      )}

      {/* Check-in Modal with GPS Proximity Verification */}
      {selectedPlace && (
        <CheckinModal
          visible={isCheckinModalOpen}
          place={selectedPlace}
          onClose={() => setIsCheckinModalOpen(false)}
          onSuccess={() => {
            if (selectedPlace) {
              incrementCheckinCount(selectedPlace.id);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  announcementBannerWrap: {
    position: 'absolute',
    top: 156,
    left: 14,
    right: 14,
    zIndex: 95,
  },
  announcementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 24, 39, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(32, 214, 231, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backdropFilter: 'blur(16px)' as any,
  },
  announcementContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  announcementText: {
    color: '#F4F7FF',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
