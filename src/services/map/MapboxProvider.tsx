import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { CityMapProps, MapCameraControls } from './types';
import { env, isMapboxConfigured } from '@/lib/env';
import { PLACE_CATEGORIES } from '@/constants/vietnam';
import { THEME } from '@/constants/theme';

let MapboxGL: any = null;
if (Platform.OS !== 'web') {
  try {
    MapboxGL = require('@rnmapbox/maps').default;
    if (MapboxGL && isMapboxConfigured) {
      MapboxGL.setAccessToken(env.MAPBOX_ACCESS_TOKEN);
    }
  } catch (e) {
    console.warn('[MapboxProvider] Mapbox native module is not available in current runtime:', e);
  }
}

export const MapboxProvider = forwardRef<MapCameraControls, CityMapProps>(
  (props, ref) => {
    const {
      center,
      zoom,
      pitch,
      bearing,
      displayMode,
      places,
      selectedPlace,
      userLocation,
      onSelectPlace,
      onRegionChangeComplete,
    } = props;

    const cameraRef = useRef<any>(null);
    const mapRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      flyTo: (coords: [number, number], targetZoom = 16, targetPitch = 55, targetBearing = 0) => {
        cameraRef.current?.setCamera({
          centerCoordinate: coords,
          zoomLevel: targetZoom,
          pitch: targetPitch,
          heading: targetBearing,
          animationDuration: 1200,
          animationMode: 'flyTo',
        });
      },
      setPitch: (newPitch: number) => {
        cameraRef.current?.setCamera({ pitch: newPitch, animationDuration: 400 });
      },
      setBearing: (newBearing: number) => {
        cameraRef.current?.setCamera({ heading: newBearing, animationDuration: 400 });
      },
      resetNorth: () => {
        cameraRef.current?.setCamera({ heading: 0, pitch: 0, animationDuration: 600 });
      },
      zoomIn: () => {
        cameraRef.current?.zoomTo(zoom + 1, 300);
      },
      zoomOut: () => {
        cameraRef.current?.zoomTo(zoom - 1, 300);
      },
    }));

    if (!MapboxGL || !isMapboxConfigured) {
      return null;
    }

    const styleUrl =
      displayMode === 'satellite'
        ? MapboxGL.StyleURL.SatelliteStreet
        : env.MAPBOX_STYLE_URL || MapboxGL.StyleURL.Street;

    return (
      <View style={styles.container}>
        <MapboxGL.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={styleUrl}
          rotateEnabled={true}
          pitchEnabled={true}
          onRegionDidChange={async () => {
            if (mapRef.current) {
              const bounds = await mapRef.current.getVisibleBounds();
              const currentCenter = await mapRef.current.getCenter();
              const currentZoom = await mapRef.current.getZoom();
              if (bounds && bounds.length === 2) {
                // bounds: [ne, sw] -> [[maxLng, maxLat], [minLng, minLat]]
                onRegionChangeComplete(
                  {
                    minLng: bounds[1][0],
                    minLat: bounds[1][1],
                    maxLng: bounds[0][0],
                    maxLat: bounds[0][1],
                  },
                  currentCenter,
                  currentZoom
                );
              }
            }
          }}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            centerCoordinate={center}
            zoomLevel={zoom}
            pitch={displayMode === '3D' ? pitch : 0}
            heading={bearing}
          />

          {/* User Location Indicator */}
          <MapboxGL.UserLocation visible={true} showsUserHeadingIndicator={true} />

          {/* 3D Buildings Extrusion Layer (Active in 3D Mode) */}
          {displayMode === '3D' && (
            <MapboxGL.VectorSource id="composite" url="mapbox://mapbox.mapbox-streets-v8">
              <MapboxGL.FillExtrusionLayer
                id="3d-buildings"
                sourceLayerID="building"
                filter={['==', 'extrude', 'true']}
                minZoomLevel={14}
                style={{
                  fillExtrusionColor: THEME.colors.mapBuilding3D,
                  fillExtrusionHeight: ['get', 'height'],
                  fillExtrusionBase: ['get', 'min_height'],
                  fillExtrusionOpacity: 0.85,
                }}
              />
            </MapboxGL.VectorSource>
          )}

          {/* Places Annotations / Markers */}
          {places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            const categoryMeta = PLACE_CATEGORIES[place.category];
            const markerBg = categoryMeta ? categoryMeta.color : THEME.colors.primary;

            return (
              <MapboxGL.PointAnnotation
                key={place.id}
                id={place.id}
                coordinate={[place.longitude, place.latitude]}
                onSelected={() => onSelectPlace(place)}
              >
                <View
                  style={[
                    styles.markerContainer,
                    { backgroundColor: markerBg },
                    isSelected && styles.markerSelected,
                  ]}
                >
                  <Text style={styles.markerText}>{place.name[0]}</Text>
                </View>
              </MapboxGL.PointAnnotation>
            );
          })}
        </MapboxGL.MapView>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelected: {
    transform: [{ scale: 1.25 }],
    borderColor: '#F59E0B',
    borderWidth: 3.5,
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
