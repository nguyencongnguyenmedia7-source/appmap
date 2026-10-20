import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Sparkles,
  Camera,
  CircleCheck,
  CircleAlert,
  Navigation,
} from 'lucide-react-native';
import { THEME } from '@/constants/theme';
import { Place } from '@/types';
import { locationService } from '@/services/location/locationService';
import { placeRepository } from '@/services/places/placeRepository';
import { verifyProximityForCheckin, formatDistance } from '@/utils/geo';
import { useAuthStore } from '@/store/authStore';
import { useMapStore } from '@/store/mapStore';

interface CheckinModalProps {
  visible: boolean;
  place: Place;
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  visible,
  place,
  onClose,
  onSuccess,
}) => {
  const [caption, setCaption] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    isVerified: boolean;
    reason: string;
  } | null>(null);

  const { addXp } = useAuthStore();
  const { setUserLocation } = useMapStore();

  useEffect(() => {
    if (visible) {
      evaluateLocation();
    }
  }, [visible]);

  const evaluateLocation = async () => {
    setGpsLoading(true);
    const { coords } = await locationService.getCurrentPosition();
    setUserLocation([coords.longitude, coords.latitude], coords.accuracy || undefined);

    const verification = verifyProximityForCheckin(coords, {
      longitude: place.longitude,
      latitude: place.latitude,
    });

    setDistanceInfo({
      distance: verification.distanceMeters,
      isVerified: verification.isVerified,
      reason: verification.reason,
    });
    setGpsLoading(false);
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Cần quyền', 'Vui lòng cấp quyền truy cập ảnh để đính kèm hình check-in.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { coords } = await locationService.getCurrentPosition();

    const result = await placeRepository.performCheckin({
      placeId: place.id,
      userCoords: coords,
      photoUrl: photoUri || undefined,
      caption: caption.trim() || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      addXp(result.xpAwarded);
      Alert.alert('Thành công 🎉', result.message, [
        {
          text: 'Tuyệt vời',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } else {
      Alert.alert('Lỗi check-in', result.message);
    }
  };

  const xpReward = 50 + (distanceInfo?.isVerified ? 25 : 0) + (photoUri ? 25 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Check-in Thành Phố</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {place.name}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* GPS Proximity Badge */}
          <View style={styles.statusBox}>
            {gpsLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={THEME.colors.primary} />
                <Text style={styles.statusText}>Đang đọc tọa độ GPS thực tế...</Text>
              </View>
            ) : distanceInfo?.isVerified ? (
              <View style={styles.verifiedRow}>
                <CircleCheck size={18} color="#10B981" />
                <View style={styles.statusTextCol}>
                  <Text style={styles.verifiedTitle}>
                    Đã xác thực vị trí thực tế ({formatDistance(distanceInfo.distance)})
                  </Text>
                  <Text style={styles.verifiedSub}>Bạn đang có mặt tại địa điểm (+25 XP thưởng)</Text>
                </View>
              </View>
            ) : (
              <View style={styles.warningRow}>
                <CircleAlert size={18} color="#F59E0B" />
                <View style={styles.statusTextCol}>
                  <Text style={styles.warningTitle}>
                    Cách xa địa điểm ({formatDistance(distanceInfo?.distance || 0)})
                  </Text>
                  <Text style={styles.warningSub}>
                    Check-in sẽ được ghi nhận là đóng góp từ xa.
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Caption Input */}
          <TextInput
            style={styles.captionInput}
            placeholder="Bạn đang trải nghiệm gì ở đây? (Chia sẻ cảm nhận, mẹo cho bạn bè...)"
            placeholderTextColor={THEME.colors.textMuted}
            multiline
            numberOfLines={3}
            value={caption}
            onChangeText={setCaption}
          />

          {/* Photo Attach */}
          <View style={styles.photoSection}>
            {photoUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setPhotoUri(null)}
                >
                  <X size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addPhotoBtn} onPress={handlePickImage}>
                <Camera size={20} color={THEME.colors.primary} />
                <Text style={styles.addPhotoText}>Thêm ảnh thực tế (+25 XP)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* XP Summary Footer */}
          <View style={styles.xpFooter}>
            <View style={styles.xpBox}>
              <Sparkles size={16} color="#F59E0B" />
              <Text style={styles.xpTotal}>+{xpReward} XP</Text>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || gpsLoading}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Xác nhận Check-in</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.backgroundElevated,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: THEME.colors.textMuted,
    fontSize: THEME.typography.sizes.sm,
    marginTop: 2,
    maxWidth: 260,
  },
  closeBtn: {
    padding: 6,
  },
  statusBox: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    marginBottom: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.typography.sizes.xs,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusTextCol: {
    flex: 1,
  },
  verifiedTitle: {
    color: '#10B981',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  verifiedSub: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  warningTitle: {
    color: '#F59E0B',
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  warningSub: {
    color: THEME.colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  captionInput: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: 12,
    color: THEME.colors.textPrimary,
    fontSize: THEME.typography.sizes.sm,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  photoSection: {
    marginBottom: 20,
  },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.lg,
    paddingVertical: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  addPhotoText: {
    color: THEME.colors.primary,
    fontSize: THEME.typography.sizes.xs,
    fontWeight: '700',
  },
  previewContainer: {
    position: 'relative',
    height: 120,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    gap: 12,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
  },
  xpTotal: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: THEME.typography.sizes.base,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: THEME.typography.sizes.base,
  },
});
