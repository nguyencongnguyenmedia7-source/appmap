import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  MapPin,
  Star,
  CircleCheckBig,
  X,
  Navigation2,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '@/constants/theme';
import { PLACE_CATEGORIES } from '@/constants/vietnam';
import { Place } from '@/types';
import { formatDistance, haversineDistance } from '@/utils/geo';
import { useMapStore } from '@/store/mapStore';
import { triggerHaptic } from '@/utils/haptics';

interface PlaceDetailSheetProps {
  place: Place;
  onClose: () => void;
  onOpenCheckin: () => void;
}

export const PlaceDetailSheet: React.FC<PlaceDetailSheetProps> = ({
  place,
  onClose,
  onOpenCheckin,
}) => {
  const { userLocation } = useMapStore();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const categoryMeta = PLACE_CATEGORIES[place.category];

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  const handleOpenCheckin = () => {
    triggerHaptic('medium');
    onOpenCheckin();
  };

  const distanceMeters = userLocation
    ? haversineDistance(
        userLocation[1],
        userLocation[0],
        place.latitude,
        place.longitude
      )
    : place.distance_meters || null;

  return (
    <View style={[styles.sheetContainer, !isMobile && styles.sheetContainerFloating]}>
      {/* Cover Image & Close Button */}
      <View style={styles.imageContainer}>
        {place.cover_image_url ? (
          <Image source={{ uri: place.cover_image_url }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: categoryMeta?.color || THEME.colors.surface },
            ]}
          />
        )}
        <View style={styles.imageGradientOverlay} />

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Category Pill Over Image */}
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryMeta?.color || THEME.colors.primary },
          ]}
        >
          <Text style={styles.categoryBadgeText}>
            {categoryMeta ? categoryMeta.label : place.category}
          </Text>
        </View>
      </View>

      {/* Place Information Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.placeName} numberOfLines={1}>
            {place.name}
          </Text>
          {place.verification_status === 'verified' && (
            <View style={styles.verifiedBadge}>
              <CircleCheckBig size={13} color="#10B981" />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
          )}
        </View>

        {/* Stats Row: Rating, Check-ins, Distance */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Star size={13} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>{place.rating_average.toFixed(1)}</Text>
          </View>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>{place.checkin_count} lượt check-in</Text>
          {distanceMeters !== null && (
            <>
              <Text style={styles.statDivider}>•</Text>
              <View style={styles.statItem}>
                <Navigation2 size={12} color="#38BDF8" />
                <Text style={styles.distanceText}>{formatDistance(distanceMeters)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Address */}
        <View style={styles.addressRow}>
          <MapPin size={13} color="#94A3B8" style={styles.addressIcon} />
          <Text style={styles.addressText} numberOfLines={1}>
            {place.address}
          </Text>
        </View>

        {/* Action Button: Check in */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.checkinBtn}
            onPress={handleOpenCheckin}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.checkinBtnText}>Check-in nhận điểm thưởng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 84,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(24px)' as any,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetContainerFloating: {
    maxWidth: 440,
    marginHorizontal: 'auto',
    left: 20,
    right: 20,
  },
  imageContainer: {
    width: '100%',
    height: 124,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 54,
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(8, 13, 24, 0.75)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  placeName: {
    flex: 1,
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32, 214, 231, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 214, 231, 0.28)',
  },
  verifiedText: {
    color: '#20D6E7',
    fontSize: 10.5,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 12.5,
    fontWeight: '700',
  },
  statText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    color: '#76839A',
    fontSize: 11,
  },
  distanceText: {
    color: '#20D6E7',
    fontSize: 12,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 5,
  },
  addressIcon: {
    marginTop: 1,
  },
  addressText: {
    flex: 1,
    color: '#A3AEC2',
    fontSize: 12,
  },
  actionRow: {
    marginTop: 12,
  },
  checkinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F7DFF',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#4F7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  checkinBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
