/**
 * Geo and Map Types for CITYVERSE
 * Adheres strictly to WGS84 (EPSG:4326) coordinate standards.
 * GeoJSON conventions: [longitude, latitude]
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null; // Accuracy in meters
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
}

export type GeoJsonPoint = [number, number]; // [longitude, latitude]

export interface BoundingBox {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface MapViewport {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number; // 0 to 60/80 degrees for 3D depth
  bearing: number; // 0 to 360 degrees
  bbox?: BoundingBox;
}

export type MapDisplayMode = '3D' | '2D' | 'satellite';

export interface VietnamCityPreset {
  id: string;
  name: string;
  province: string;
  coordinates: [number, number]; // [lng, lat]
  defaultZoom: number;
  defaultPitch: number;
  description: string;
}
