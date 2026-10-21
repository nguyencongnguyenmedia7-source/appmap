import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {
  Search,
  X,
  History,
  MapPin,
  Sparkles,
  Coffee,
  UtensilsCrossed,
  Compass,
  Landmark,
  Hotel,
  Moon,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import { THEME } from '@/constants/theme';
import { PLACE_CATEGORIES, VIETNAM_CITY_PRESETS } from '@/constants/vietnam';
import { Place, PlaceCategory } from '@/types';
import { usePlacesStore } from '@/store/placesStore';
import { useMapStore } from '@/store/mapStore';
import { useAdminStore } from '@/store/adminStore';
import { triggerHaptic } from '@/utils/haptics';

interface MapHeaderSearchProps {
  onSelectPlaceResult: (place: Place) => void;
  searchResults: Place[];
  onCitySelected?: (coords: [number, number], zoom: number, pitch: number) => void;
}

export const MapHeaderSearch: React.FC<MapHeaderSearchProps> = ({
  onSelectPlaceResult,
  searchResults,
  onCitySelected,
}) => {
  const { config } = useAdminStore();
  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    activeCategoryFilter,
    setActiveCategoryFilter,
  } = usePlacesStore();

  const { selectedCityId, selectCity } = useMapStore();
  const [isFocused, setIsFocused] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  const categories = Object.values(PLACE_CATEGORIES);

  const handleSelectPlace = (place: Place) => {
    triggerHaptic('selection');
    addSearchHistory(place.name);
    setSearchQuery('');
    setIsFocused(false);
    onSelectPlaceResult(place);
  };

  const handleSelectHistory = (historyItem: string) => {
    triggerHaptic('light');
    setSearchQuery(historyItem);
  };

  const handleClearQuery = () => {
    triggerHaptic('light');
    setSearchQuery('');
  };

  const handleCategoryPress = (category: PlaceCategory | null) => {
    triggerHaptic('selection');
    setActiveCategoryFilter(activeCategoryFilter === category ? null : category);
  };

  const handleSelectCity = (cityId: string) => {
    triggerHaptic('selection');
    selectCity(cityId);
    const city = VIETNAM_CITY_PRESETS.find((c) => c.id === cityId);
    if (city && onCitySelected) {
      onCitySelected(city.coordinates, city.defaultZoom, city.defaultPitch);
    }
  };

  const renderCategoryIcon = (category: string, isActive: boolean) => {
    const iconColor = isActive ? '#F4F7FF' : '#A3AEC2';
    const size = 13.5;

    switch (category) {
      case 'coffee':
        return <Coffee size={size} color={iconColor} />;
      case 'restaurant':
      case 'food':
        return <UtensilsCrossed size={size} color={iconColor} />;
      case 'tourism':
        return <Compass size={size} color={iconColor} />;
      case 'culture':
      case 'heritage':
        return <Landmark size={size} color={iconColor} />;
      case 'hotel':
        return <Hotel size={size} color={iconColor} />;
      case 'nightlife':
        return <Moon size={size} color={iconColor} />;
      case 'community':
        return <Users size={size} color={iconColor} />;
      default:
        return <MapPin size={size} color={iconColor} />;
    }
  };

  const renderResultIcon = (category: string) => {
    const size = 15;
    const catMeta = PLACE_CATEGORIES[category as PlaceCategory];
    const color = catMeta?.color || THEME.colors.primary;

    switch (category) {
      case 'coffee':
        return <Coffee size={size} color={color} />;
      case 'restaurant':
      case 'food':
        return <UtensilsCrossed size={size} color={color} />;
      case 'tourism':
        return <Compass size={size} color={color} />;
      case 'culture':
      case 'heritage':
        return <Landmark size={size} color={color} />;
      case 'hotel':
        return <Hotel size={size} color={color} />;
      case 'nightlife':
        return <Moon size={size} color={color} />;
      case 'community':
        return <Users size={size} color={color} />;
      default:
        return <MapPin size={size} color={color} />;
    }
  };

  const isDropdownVisible = isFocused;

  return (
    <View style={[styles.container, !isMobile && styles.containerFloating]}>
      {/* 4. Search Bar Pill */}
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <View style={styles.searchIcon}>
          <Search size={18} color={THEME.colors.accentCyan} strokeWidth={2.2} />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Tìm địa điểm, quán cà phê, di tích..."
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsFocused(true)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearQuery}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <X size={14} color={THEME.colors.textSecondary} strokeWidth={2.2} />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Dropdown Flyout when searching / focused */}
      {isDropdownVisible ? (
        <View style={styles.dropdownContainer}>
          {searchQuery.trim().length > 0 ? (
            <View style={styles.resultsWrap}>
              {/* Autocomplete Header Bar */}
              <View style={styles.autocompleteHeader}>
                <View style={styles.autocompleteTitleRow}>
                  <Sparkles size={13} color={THEME.colors.accentCyan} />
                  <Text style={styles.autocompleteTitle}>
                    Gợi ý tự động ({searchResults.length})
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFocused(false)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.dismissText}>Thu gọn</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                style={styles.resultsList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      Không tìm thấy địa điểm nào khớp với "{searchQuery}"
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const catMeta = PLACE_CATEGORIES[item.category];

                  return (
                    <TouchableOpacity
                      style={styles.resultItem}
                      onPress={() => handleSelectPlace(item)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.resultIconWrap,
                          {
                            backgroundColor: catMeta
                              ? `${catMeta.color}22`
                              : 'rgba(79, 125, 255, 0.15)',
                          },
                        ]}
                      >
                        {renderResultIcon(item.category)}
                      </View>
                      <View style={styles.resultTextContainer}>
                        <View style={styles.resultTitleRow}>
                          <Text style={styles.resultName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {catMeta && (
                            <Text style={styles.resultCategoryTag}>
                              {catMeta.label}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.resultAddress} numberOfLines={1}>
                          {item.address}
                        </Text>
                      </View>
                      <View style={styles.resultMetaColumn}>
                        <View style={styles.resultRatingBadge}>
                          <Text style={styles.resultRatingText}>
                            ★ {item.rating_average.toFixed(1)}
                          </Text>
                        </View>
                        <ChevronRight size={13} color={THEME.colors.textMuted} />
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <View style={styles.historyTitleRow}>
                  <History size={13} color={THEME.colors.textMuted} />
                  <Text style={styles.historyTitle}>Tìm kiếm gần đây</Text>
                </View>
                {searchHistory.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      triggerHaptic('light');
                      clearSearchHistory();
                    }}
                  >
                    <Text style={styles.clearHistoryText}>Xóa tất cả</Text>
                  </TouchableOpacity>
                )}
              </View>

              {searchHistory.length > 0 ? (
                <View style={styles.historyTags}>
                  {searchHistory.map((item, idx) => (
                    <TouchableOpacity
                      key={`hist-${idx}`}
                      style={styles.historyTag}
                      onPress={() => handleSelectHistory(item)}
                    >
                      <Text style={styles.historyTagText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>Chưa có lịch sử tìm kiếm</Text>
              )}

              <TouchableOpacity
                style={styles.closeDropdownBtn}
                onPress={() => setIsFocused(false)}
              >
                <Text style={styles.closeDropdownText}>Đóng gợi ý</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* Dual Filter Rows: Beautiful vertical rhythm, zero overlapping, independent horizontal scroll */
        <View style={styles.filterRowsWrapper}>
          {/* Row 1: Categories Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.categoryPill,
                activeCategoryFilter === null && styles.categoryPillActive,
              ]}
              onPress={() => handleCategoryPress(null)}
            >
              <Sparkles
                size={13}
                color={activeCategoryFilter === null ? '#F4F7FF' : '#A3AEC2'}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  activeCategoryFilter === null && styles.categoryPillTextActive,
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const isActive = activeCategoryFilter === cat.category;
              const displayLabel = cat.category === 'culture' ? 'Di sản' : cat.label;

              return (
                <TouchableOpacity
                  key={cat.category}
                  activeOpacity={0.8}
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive,
                  ]}
                  onPress={() => handleCategoryPress(isActive ? null : cat.category)}
                >
                  {renderCategoryIcon(cat.category, isActive)}
                  <Text
                    style={[
                      styles.categoryPillText,
                      isActive && styles.categoryPillTextActive,
                    ]}
                  >
                    {displayLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Row 2: Vietnam Cities Quick Selector */}
          {config.showCityQuickSelector && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cityScroll}
            >
              {VIETNAM_CITY_PRESETS.map((city) => {
                const isSelected = selectedCityId === city.id;

                return (
                  <TouchableOpacity
                    key={city.id}
                    activeOpacity={0.8}
                    style={[
                      styles.cityPill,
                      isSelected && styles.cityPillActive,
                    ]}
                    onPress={() => handleSelectCity(city.id)}
                  >
                    <MapPin
                      size={12}
                      color={isSelected ? '#20D6E7' : '#76839A'}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.cityPillText,
                        isSelected && styles.cityPillTextActive,
                      ]}
                    >
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 14,
    left: 12,
    right: 12,
    zIndex: 100,
  },
  containerFloating: {
    maxWidth: 480,
    marginHorizontal: 'auto',
    left: 20,
    right: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  inputFocused: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.surfaceElevated,
  },
  searchIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: THEME.colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRowsWrapper: {
    marginTop: 8,
    gap: 7,
  },
  categoryScroll: {
    paddingRight: 24,
    gap: 7,
    alignItems: 'center',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    height: 35,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 6,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  categoryPillText: {
    color: THEME.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '600',
  },
  categoryPillTextActive: {
    color: '#F4F7FF',
    fontWeight: '700',
  },
  cityScroll: {
    paddingRight: 24,
    gap: 7,
    alignItems: 'center',
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 11,
    height: 31,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  cityPillActive: {
    backgroundColor: 'rgba(32, 214, 231, 0.12)',
    borderColor: '#20D6E7',
    borderWidth: 1.2,
  },
  cityPillText: {
    color: '#8E9BB5',
    fontSize: 11.5,
    fontWeight: '600',
  },
  cityPillTextActive: {
    color: '#20D6E7',
    fontWeight: '700',
  },
  dropdownContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    maxHeight: 340,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 14,
    backdropFilter: 'blur(20px)' as any,
  },
  resultsWrap: {
    maxHeight: 340,
  },
  autocompleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(27, 36, 53, 0.65)',
  },
  autocompleteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autocompleteTitle: {
    color: '#20D6E7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dismissText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsList: {
    maxHeight: 280,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  resultIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultName: {
    flex: 1,
    color: '#F4F7FF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  resultCategoryTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#A3AEC2',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  resultAddress: {
    color: '#A3AEC2',
    fontSize: 11,
    marginTop: 2,
  },
  resultMetaColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resultRatingBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  resultRatingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  historyContainer: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyTitle: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  clearHistoryText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  historyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  historyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  historyTagText: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
  closeDropdownBtn: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 6,
  },
  closeDropdownText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
