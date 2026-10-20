import { create } from 'zustand';
import { BoundingBox, MapDisplayMode } from '@/types';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';

interface MapState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  displayMode: MapDisplayMode;
  selectedCityId: string;
  bbox: BoundingBox | null;
  userLocation: [number, number] | null;
  userAccuracy: number | null;

  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setPitch: (pitch: number) => void;
  setBearing: (bearing: number) => void;
  setDisplayMode: (mode: MapDisplayMode) => void;
  toggleDisplayMode: () => void;
  setBbox: (bbox: BoundingBox) => void;
  setUserLocation: (coords: [number, number], accuracy?: number) => void;
  selectCity: (cityId: string) => void;
}

export const useMapStore = create<MapState>((set, get) => {
  const defaultCity = VIETNAM_CITY_PRESETS[0]; // Hà Nội

  return {
    center: defaultCity.coordinates,
    zoom: defaultCity.defaultZoom,
    pitch: defaultCity.defaultPitch,
    bearing: 0,
    displayMode: '3D',
    selectedCityId: defaultCity.id,
    bbox: null,
    userLocation: null,
    userAccuracy: null,

    setCenter: (center) => set({ center }),
    setZoom: (zoom) => set({ zoom }),
    setPitch: (pitch) => set({ pitch }),
    setBearing: (bearing) => set({ bearing }),
    setDisplayMode: (displayMode) => set({ displayMode }),
    toggleDisplayMode: () => {
      const current = get().displayMode;
      const next: MapDisplayMode = current === '3D' ? '2D' : current === '2D' ? 'satellite' : '3D';
      set({ displayMode: next });
    },
    setBbox: (bbox) => set({ bbox }),
    setUserLocation: (coords, accuracy) =>
      set({ userLocation: coords, userAccuracy: accuracy ?? null }),
    selectCity: (cityId) => {
      const city = VIETNAM_CITY_PRESETS.find((c) => c.id === cityId);
      if (city) {
        set({
          selectedCityId: city.id,
          center: city.coordinates,
          zoom: city.defaultZoom,
          pitch: city.defaultPitch,
          bearing: 0,
        });
      }
    },
  };
});
