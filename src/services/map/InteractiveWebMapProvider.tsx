import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { CityMapProps, MapCameraControls } from './types';
import { THEME } from '@/constants/theme';
import { PLACE_CATEGORIES } from '@/constants/vietnam';
import { Layers, MapPin, Globe } from 'lucide-react-native';

const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

const TILE_CONFIGS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
    labelUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    title: 'Bản đồ Vệ tinh thực tế (Esri Satellite)',
  },
  '3D': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, © OpenStreetMap',
    },
    labelUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    title: 'Bản đồ Đêm & 3D (Esri Dark Canvas)',
  },
  '2D': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Esri, HERE, Garmin, USGS, NGA',
    },
    title: 'Bản đồ Đường phố thực tế (Esri Streets)',
  },
};

import { useAdminStore } from '@/store/adminStore';

export const InteractiveWebMapProvider = forwardRef<MapCameraControls, CityMapProps>(
  (props, ref) => {
    const { config } = useAdminStore();
    const {
      center,
      zoom,
      displayMode,
      places,
      selectedPlace,
      userLocation,
      onSelectPlace,
      onRegionChangeComplete,
    } = props;

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<any>(null);
    const tileLayerRef = useRef<any>(null);
    const labelLayerRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);
    const userMarkerRef = useRef<any>(null);
    const isProgrammaticMoveRef = useRef<boolean>(false);
    const [isMapReady, setIsMapReady] = useState(false);

    // 1. Inject Leaflet styles
    useEffect(() => {
      if (typeof document === 'undefined') return;

      const linkId = 'cityverse-leaflet-css';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = LEAFLET_CSS_URL;
        document.head.appendChild(link);
      }

      const styleId = 'cityverse-marker-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          .cityverse-marker-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          .cityverse-marker-container:hover {
            transform: scale(1.15) translateY(-4px);
            z-index: 9999 !important;
          }
          .cityverse-marker-container.selected {
            transform: scale(1.25) translateY(-6px);
            z-index: 10000 !important;
          }
          .cityverse-pin {
            width: 32px;
            height: 32px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 10px var(--pin-glow);
            border: 2px solid #ffffff;
            transition: all 0.2s ease;
          }
          .cityverse-marker-container.selected .cityverse-pin {
            border-color: #F59E0B;
            border-width: 3px;
            box-shadow: 0 0 18px #F59E0B;
          }
          .cityverse-pin-label {
            margin-top: 3px;
            background: rgba(15, 23, 42, 0.92);
            color: #F8FAFC;
            padding: 2px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 600;
            white-space: nowrap;
            max-width: 130px;
            overflow: hidden;
            text-overflow: ellipsis;
            border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(4px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          }
          .cityverse-user-pin {
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cityverse-user-pulse {
            position: absolute;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.4);
            animation: userPulse 2s infinite ease-out;
          }
          .cityverse-user-center {
            position: relative;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #3B82F6;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 10px #3B82F6;
          }
          @keyframes userPulse {
            0% { transform: scale(0.6); opacity: 0.9; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          .leaflet-container {
            width: 100% !important;
            height: 100% !important;
            background: #0B1120 !important;
            font-family: inherit !important;
          }
          .leaflet-control-attribution {
            background: rgba(15, 23, 42, 0.7) !important;
            color: #64748B !important;
            font-size: 9px !important;
            border-radius: 4px;
            margin: 4px !important;
            padding: 2px 6px !important;
          }
          .leaflet-control-attribution a {
            color: #94A3B8 !important;
          }
        `;
        document.head.appendChild(style);
      }
    }, []);

    // 2. Initialize Leaflet map
    useEffect(() => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      let L: any = null;
      try {
        L = require('leaflet');
      } catch (e) {
        console.error('Leaflet require error:', e);
        return;
      }

      let resizeObserver: any = null;

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const initLat = Number.isFinite(center?.[1]) ? center[1] : 21.0285;
        const initLng = Number.isFinite(center?.[0]) ? center[0] : 105.8542;
        const initZoom = Number.isFinite(zoom) ? zoom : 14;

        const map = L.map(mapContainerRef.current, {
          center: [initLat, initLng],
          zoom: initZoom,
          zoomControl: false,
          attributionControl: true,
        });

        // Initialize Tile Layer based on displayMode
        const config = TILE_CONFIGS[displayMode] || TILE_CONFIGS['2D'];
        tileLayerRef.current = L.tileLayer(config.url, config.options).addTo(map);

        if ('labelUrl' in config && config.labelUrl) {
          labelLayerRef.current = L.tileLayer(config.labelUrl, {
            maxZoom: config.options.maxZoom,
            opacity: 0.95,
          }).addTo(map);
        }

        markersLayerRef.current = L.layerGroup().addTo(map);

        // Viewport change listener with safe boundary validation
        map.on('moveend', () => {
          if (isProgrammaticMoveRef.current) {
            isProgrammaticMoveRef.current = false;
            return;
          }
          try {
            const size = map.getSize();
            if (!size || size.x <= 0 || size.y <= 0) return;

            const c = map.getCenter();
            const z = map.getZoom();
            const bounds = map.getBounds();

            if (
              !c ||
              !Number.isFinite(c.lat) ||
              !Number.isFinite(c.lng) ||
              !bounds ||
              !Number.isFinite(bounds.getWest()) ||
              !Number.isFinite(bounds.getSouth()) ||
              !Number.isFinite(bounds.getEast()) ||
              !Number.isFinite(bounds.getNorth())
            ) {
              return;
            }

            onRegionChangeComplete(
              {
                minLng: bounds.getWest(),
                minLat: bounds.getSouth(),
                maxLng: bounds.getEast(),
                maxLat: bounds.getNorth(),
              },
              [c.lng, c.lat],
              z
            );
          } catch (_) {
            // Silently ignore boundary calculation errors during layout transitions
          }
        });

        mapInstanceRef.current = map;
        setIsMapReady(true);

        // Delayed size recalculation to ensure container has completed CSS layout
        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch (_) {}
        }, 150);

        // Auto-recalculate map size when parent container resizes
        if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            try {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.invalidateSize();
              }
            } catch (_) {}
          });
          resizeObserver.observe(mapContainerRef.current);
        }
      }

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch (_) {}
          mapInstanceRef.current = null;
          setIsMapReady(false);
        }
      };
    }, []);

    // 3. Switch tile layer when displayMode changes
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || typeof window === 'undefined') return;

      const L = require('leaflet');
      const config = TILE_CONFIGS[displayMode] || TILE_CONFIGS['2D'];

      // Remove existing tile layer
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }
      if (labelLayerRef.current) {
        map.removeLayer(labelLayerRef.current);
        labelLayerRef.current = null;
      }

      // Add new layer
      tileLayerRef.current = L.tileLayer(config.url, config.options).addTo(map);

      // If mode has label overlay (satellite and 3D dark canvas), add it
      if ('labelUrl' in config && config.labelUrl) {
        labelLayerRef.current = L.tileLayer(config.labelUrl, {
          maxZoom: config.options.maxZoom,
          opacity: 0.95,
        }).addTo(map);
      }
    }, [displayMode]);

    // 3.5 Auto-fly to selectedPlace when changed from outside (e.g. from suggest or search)
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || !selectedPlace) return;

      const lat = Number(selectedPlace.latitude);
      const lng = Number(selectedPlace.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        isProgrammaticMoveRef.current = true;
        map.flyTo([lat, lng], Math.max(map.getZoom(), 16), {
          duration: 0.9,
        });

        const timer = setTimeout(() => {
          try {
            const bounds = map.getBounds();
            onRegionChangeComplete(
              {
                minLng: bounds.getWest(),
                minLat: bounds.getSouth(),
                maxLng: bounds.getEast(),
                maxLat: bounds.getNorth(),
              },
              [lng, lat],
              map.getZoom()
            );
          } catch (_) {}
        }, 950);

        return () => clearTimeout(timer);
      }
    }, [selectedPlace?.id]);

    // 4. Update Place Markers
    useEffect(() => {
      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;
      if (!map || !markersLayer || typeof window === 'undefined') return;

      const L = require('leaflet');
      markersLayer.clearLayers();

      // Ensure selectedPlace is always included in the marker list
      const displayPlaces = [...places];
      if (selectedPlace && !displayPlaces.some((p) => p.id === selectedPlace.id)) {
        displayPlaces.unshift(selectedPlace);
      }

      displayPlaces.forEach((place) => {
        if (!place) return;
        const lat = Number(place.latitude);
        const lng = Number(place.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        const isSelected = selectedPlace?.id === place.id;
        const categoryMeta = PLACE_CATEGORIES[place.category];
        const markerColor = categoryMeta ? categoryMeta.color : THEME.colors.primary;

        const pinEmojis: Record<string, string> = {
          coffee: '☕',
          restaurant: '🍜',
          tourism: '🏖️',
          culture: '🏛️',
          hotel: '🏨',
          nightlife: '🍸',
          entertainment: '🎡',
          park: '🌳',
          shopping: '🛍️',
          community: '👥',
        };
        const emoji = pinEmojis[place.category] || '📍';

        const customIcon = L.divIcon({
          className: 'cityverse-marker-wrapper-icon',
          html: `
            <div class="cityverse-marker-container ${isSelected ? 'selected' : ''}" style="--pin-glow: ${markerColor}66;">
              <div class="cityverse-pin" style="background-color: ${markerColor};">
                <span style="font-size: 13px; line-height: 1;">${emoji}</span>
              </div>
              <div class="cityverse-pin-label">
                ${place.name}
              </div>
            </div>
          `,
          iconSize: [40, 56],
          iconAnchor: [20, 28],
        });

        try {
          const marker = L.marker([lat, lng], {
            icon: customIcon,
            title: place.name,
            zIndexOffset: isSelected ? 500 : 10,
          });

          marker.on('click', () => {
            onSelectPlace(place);
          });

          markersLayer.addLayer(marker);
        } catch (_) {}
      });
    }, [places, selectedPlace, isMapReady]);

    // 5. Update User Location Marker
    useEffect(() => {
      const map = mapInstanceRef.current;
      if (!map || typeof window === 'undefined') return;

      const L = require('leaflet');

      if (userMarkerRef.current) {
        try {
          map.removeLayer(userMarkerRef.current);
        } catch (_) {}
        userMarkerRef.current = null;
      }

      if (userLocation && Array.isArray(userLocation)) {
        const userLng = Number(userLocation[0]);
        const userLat = Number(userLocation[1]);

        if (Number.isFinite(userLat) && Number.isFinite(userLng)) {
          const userIcon = L.divIcon({
            className: 'cityverse-user-wrapper-icon',
            html: `
              <div class="cityverse-user-pin">
                <div class="cityverse-user-pulse"></div>
                <div class="cityverse-user-center"></div>
              </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });

          try {
            const marker = L.marker([userLat, userLng], {
              icon: userIcon,
              zIndexOffset: 1000,
            }).addTo(map);

            userMarkerRef.current = marker;
          } catch (_) {}
        }
      }
    }, [userLocation, isMapReady]);

    // 6. Camera Controls ref implementation
    useImperativeHandle(ref, () => ({
      flyTo: (coords: [number, number], targetZoom = 16) => {
        const map = mapInstanceRef.current;
        if (!map || !Array.isArray(coords)) return;
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const validZoom = Number.isFinite(targetZoom) ? targetZoom : 16;

        try {
          isProgrammaticMoveRef.current = true;
          map.flyTo([lat, lng], validZoom, {
            duration: 1.2,
            easeLinearity: 0.25,
          });
        } catch (_) {}
      },
      setPitch: () => {},
      setBearing: () => {},
      resetNorth: () => {
        const map = mapInstanceRef.current;
        if (map) {
          try {
            map.setView(map.getCenter(), map.getZoom());
          } catch (_) {}
        }
      },
      zoomIn: () => {
        try {
          mapInstanceRef.current?.zoomIn();
        } catch (_) {}
      },
      zoomOut: () => {
        try {
          mapInstanceRef.current?.zoomOut();
        } catch (_) {}
      },
    }));

    const activeConfig = TILE_CONFIGS[displayMode] || TILE_CONFIGS['2D'];

    return (
      <View style={styles.container}>
        {/* Real Interactive Map Canvas (Leaflet) */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />

        {/* Runtime Map Mode Real Badge */}
        {config.showMapBadge && (
          <View style={styles.providerBadge}>
            {displayMode === 'satellite' ? (
              <Globe size={13} color="#20D6E7" />
            ) : (
              <Layers size={13} color="#20D6E7" />
            )}
            <Text style={styles.providerText} numberOfLines={1} ellipsizeMode="tail">
              {activeConfig.title}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080D18',
    overflow: 'hidden',
    position: 'relative',
  },
  providerBadge: {
    position: 'absolute',
    bottom: 88,
    left: 14,
    maxWidth: 210,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    zIndex: 90,
    backdropFilter: 'blur(16px)' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  providerText: {
    color: '#F4F7FF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
