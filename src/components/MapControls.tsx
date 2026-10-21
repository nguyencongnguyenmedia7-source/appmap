import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Compass, Crosshair, Plus, Minus, Box, Layers, Globe } from 'lucide-react-native';
import { THEME } from '@/constants/theme';
import { useMapStore } from '@/store/mapStore';
import { usePlacesStore } from '@/store/placesStore';
import { triggerHaptic } from '@/utils/haptics';

interface MapControlsProps {
  onLocateMe: () => void;
  onResetNorth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onLocateMe,
  onResetNorth,
  onZoomIn,
  onZoomOut,
}) => {
  const { displayMode, toggleDisplayMode, userLocation } = useMapStore();
  const { selectedPlace } = usePlacesStore();

  const handleToggleMode = () => {
    triggerHaptic('medium');
    toggleDisplayMode();
  };

  const handleResetNorth = () => {
    triggerHaptic('light');
    onResetNorth();
  };

  const handleLocateMe = () => {
    triggerHaptic('success');
    onLocateMe();
  };

  const handleZoomIn = () => {
    triggerHaptic('light');
    onZoomIn();
  };

  const handleZoomOut = () => {
    triggerHaptic('light');
    onZoomOut();
  };

  const renderModeIcon = () => {
    switch (displayMode) {
      case 'satellite':
        return <Globe size={18} color={THEME.colors.accentCyan} strokeWidth={2.2} />;
      case '3D':
        return <Box size={18} color={THEME.colors.primary} strokeWidth={2.2} />;
      case '2D':
      default:
        return <Layers size={18} color={THEME.colors.textSecondary} strokeWidth={2.2} />;
    }
  };

  const getModeLabel = () => {
    switch (displayMode) {
      case 'satellite':
        return 'SAT';
      case '3D':
        return '3D';
      case '2D':
      default:
        return '2D';
    }
  };

  return (
    <View style={[styles.container, selectedPlace && styles.containerElevated]}>
      {/* 1. Mode Switcher (2D / 3D / SAT) */}
      <TouchableOpacity
        style={styles.btn}
        onPress={handleToggleMode}
        activeOpacity={0.75}
      >
        {renderModeIcon()}
        <Text style={[styles.modeText, displayMode !== '2D' && styles.modeTextActive]}>
          {getModeLabel()}
        </Text>
      </TouchableOpacity>

      {/* 2. Compass / Reset North */}
      <TouchableOpacity
        style={styles.btn}
        onPress={handleResetNorth}
        activeOpacity={0.75}
      >
        <Compass size={18} color={THEME.colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      {/* 3. Locate Me (GPS) */}
      <TouchableOpacity
        style={[styles.btn, !!userLocation && styles.btnGpsActive]}
        onPress={handleLocateMe}
        activeOpacity={0.75}
      >
        <Crosshair
          size={18}
          color={userLocation ? THEME.colors.accentCyan : THEME.colors.textSecondary}
          strokeWidth={userLocation ? 2.4 : 2}
        />
        {userLocation && <View style={styles.gpsPulseDot} />}
      </TouchableOpacity>

      {/* 4. Zoom Controls Capsule (+ / -) */}
      <View style={styles.zoomGroup}>
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={handleZoomIn}
          activeOpacity={0.7}
        >
          <Plus size={16} color={THEME.colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity
          style={styles.zoomBtn}
          onPress={handleZoomOut}
          activeOpacity={0.7}
        >
          <Minus size={16} color={THEME.colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 14,
    bottom: 88,
    zIndex: 90,
    gap: 9,
    alignItems: 'center',
  },
  containerElevated: {
    bottom: 275,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    position: 'relative',
  },
  btnGpsActive: {
    borderColor: 'rgba(32, 214, 231, 0.4)',
    backgroundColor: THEME.colors.surfaceElevated,
  },
  gpsPulseDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.accentCyan,
  },
  modeText: {
    color: THEME.colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
    letterSpacing: 0.4,
  },
  modeTextActive: {
    color: THEME.colors.textPrimary,
  },
  zoomGroup: {
    width: 44,
    backgroundColor: THEME.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  zoomBtn: {
    width: 44,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: THEME.colors.surfaceBorder,
  },
});
