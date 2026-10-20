import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';
import { THEME } from '@/constants/theme';
import { useMapStore } from '@/store/mapStore';
import { MapPin } from 'lucide-react-native';
import { triggerHaptic } from '@/utils/haptics';

interface CityQuickSelectorProps {
  onCitySelected: (coords: [number, number], zoom: number, pitch: number) => void;
}

export const CityQuickSelector: React.FC<CityQuickSelectorProps> = ({
  onCitySelected,
}) => {
  const { selectedCityId, selectCity } = useMapStore();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const handleSelect = (cityId: string) => {
    triggerHaptic('selection');
    selectCity(cityId);
    const city = VIETNAM_CITY_PRESETS.find((c) => c.id === cityId);
    if (city) {
      onCitySelected(city.coordinates, city.defaultZoom, city.defaultPitch);
    }
  };

  return (
    <View style={[styles.container, !isMobile && styles.containerFloating]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {VIETNAM_CITY_PRESETS.map((city) => {
          const isSelected = selectedCityId === city.id;
          return (
            <TouchableOpacity
              key={city.id}
              activeOpacity={0.8}
              style={[styles.cityChip, isSelected && styles.cityChipActive]}
              onPress={() => handleSelect(city.id)}
            >
              <MapPin
                size={13}
                color={isSelected ? '#F4F7FF' : THEME.colors.textSecondary}
                strokeWidth={2.2}
              />
              <Text style={[styles.cityText, isSelected && styles.cityTextActive]}>
                {city.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 104,
    left: 12,
    right: 12,
    zIndex: 90,
  },
  containerFloating: {
    maxWidth: 480,
    marginHorizontal: 'auto',
    left: 20,
    right: 20,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 12,
    alignItems: 'center',
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  cityChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  cityText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  cityTextActive: {
    color: '#F4F7FF',
    fontWeight: '700',
  },
});
