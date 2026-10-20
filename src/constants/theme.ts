/**
 * CITYVERSE Premium Dark Explorer Design Tokens
 * Clean, high-contrast, commercial-grade mobile map application aesthetics.
 */

export const THEME = {
  colors: {
    // Canvas & Surfaces
    background: '#080D18',
    surface: '#111827',
    surfaceElevated: '#1B2435',
    backgroundElevated: '#1B2435',
    backgroundGlass: 'rgba(17, 24, 39, 0.94)',
    backgroundGlassLight: 'rgba(27, 36, 53, 0.88)',
    surfaceBorder: 'rgba(255, 255, 255, 0.10)',
    surfaceBorderActive: '#4F7DFF',

    // Primary & Accent Brand Colors
    primary: '#4F7DFF', // Primary Blue
    primaryGlow: 'rgba(79, 125, 255, 0.25)',
    secondary: '#8B7CFF', // Accent Violet
    secondaryGlow: 'rgba(139, 124, 255, 0.25)',
    accentCyan: '#20D6E7', // Electric Cyan
    accentViolet: '#8B7CFF',
    accentGold: '#F59E0B',
    accentPink: '#EC4899',

    // Typography & Content
    textPrimary: '#F4F7FF', // Main Text
    textSecondary: '#A3AEC2', // Secondary Text
    textMuted: '#76839A', // Muted Text
    textInverse: '#080D18',

    // Status & Feedback
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#4F7DFF',

    // Map Specific
    mapBuilding3D: '#1B2435',
    mapWater: '#0F1A30',
    mapRoad: '#243048',
    mapUserPulse: '#20D6E7',
  },
  typography: {
    fontFamily: {
      regular: 'Plus Jakarta Sans, System',
      medium: 'Plus Jakarta Sans, System',
      bold: 'Plus Jakarta Sans, System',
    },
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  borderRadius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 6,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 10,
    },
    glow: {
      shadowColor: '#4F7DFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// Compatibility exports
export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F8FAFC',
    backgroundElement: '#E2E8F0',
    backgroundSelected: '#CBD5E1',
  },
  dark: {
    text: '#F4F7FF',
    textSecondary: '#A3AEC2',
    background: '#080D18',
    backgroundElement: '#111827',
    backgroundSelected: '#1B2435',
  },
};

export type ThemeColor = 'text' | 'textSecondary' | 'background' | 'backgroundElement' | 'backgroundSelected';

export const Fonts = {
  mono: 'monospace',
};

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
};

export const MaxContentWidth = 600;
export const BottomTabInset = 76;
