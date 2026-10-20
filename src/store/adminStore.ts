import { create } from 'zustand';
import { MapDisplayMode, Place } from '@/types';

export interface AdminUiConfig {
  primaryAccent: string;
  defaultMapMode: MapDisplayMode;
  showMapBadge: boolean;
  showCityQuickSelector: boolean;
  showFloatingControls: boolean;
  enableHaptics: boolean;
  enableGlassmorphism: boolean;
  announcementBanner: string;
  maintenanceMode: boolean;
}

interface AdminState {
  config: AdminUiConfig;
  updateConfig: (partial: Partial<AdminUiConfig>) => void;
  resetConfig: () => void;
  approvedPlacesCount: number;
  incrementApprovedCount: () => void;
}

export const ACCENT_PALETTES = [
  { name: 'Royal Blue (Mặc định)', color: '#4F7DFF' },
  { name: 'Electric Cyan', color: '#20D6E7' },
  { name: 'Emerald Cyber', color: '#10B981' },
  { name: 'Sunset Amber', color: '#F59E0B' },
  { name: 'Neon Violet', color: '#8B7CFF' },
  { name: 'Ruby Crimson', color: '#EF4444' },
];

const DEFAULT_CONFIG: AdminUiConfig = {
  primaryAccent: '#4F7DFF',
  defaultMapMode: '3D',
  showMapBadge: true,
  showCityQuickSelector: true,
  showFloatingControls: true,
  enableHaptics: true,
  enableGlassmorphism: true,
  announcementBanner: 'Chào mừng bạn đến với CITYVERSE - Bản đồ số khám phá Việt Nam 3D',
  maintenanceMode: false,
};

export const useAdminStore = create<AdminState>((set) => ({
  config: DEFAULT_CONFIG,
  approvedPlacesCount: 75,

  updateConfig: (partial) =>
    set((state) => ({ config: { ...state.config, ...partial } })),

  resetConfig: () => set({ config: DEFAULT_CONFIG }),

  incrementApprovedCount: () =>
    set((state) => ({ approvedPlacesCount: state.approvedPlacesCount + 1 })),
}));
