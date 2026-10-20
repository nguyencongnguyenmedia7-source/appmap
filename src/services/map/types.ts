import { Place, MapDisplayMode, BoundingBox } from '@/types';

export interface MapCameraControls {
  flyTo: (coords: [number, number], zoom?: number, pitch?: number, bearing?: number) => void;
  setPitch: (pitch: number) => void;
  setBearing: (bearing: number) => void;
  resetNorth: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface CityMapProps {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  displayMode: MapDisplayMode;
  places: Place[];
  selectedPlace: Place | null;
  userLocation: [number, number] | null;
  onSelectPlace: (place: Place) => void;
  onRegionChangeComplete: (bbox: BoundingBox, center: [number, number], zoom: number) => void;
  onMapReady?: () => void;
  onLongPressCoordinate?: (coords: [number, number]) => void;
}
