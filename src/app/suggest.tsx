import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  MapPin,
  Camera,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  X,
  Info,
  Navigation,
  Coffee,
  Utensils,
  Landmark,
  Trees,
  ShoppingBag,
  Moon,
  Hotel,
  Users,
  Compass,
  Crosshair,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { THEME } from '@/constants/theme';
import { PLACE_CATEGORIES, VIETNAM_CITY_PRESETS } from '@/constants/vietnam';
import { Place, PlaceCategory } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { usePlacesStore } from '@/store/placesStore';
import { useMapStore } from '@/store/mapStore';
import { placeRepository } from '@/services/places/placeRepository';
import { locationService } from '@/services/location/locationService';
import { triggerHaptic } from '@/utils/haptics';

interface SuggestFormState {
  name: string;
  address: string;
  category: PlaceCategory | null;
  city: string;
  description: string;
  phone: string;
  website: string;
  photos: string[];
  latitude?: number;
  longitude?: number;
  locationSource: 'gps' | 'map_center' | 'city';
}

export default function SuggestPlaceScreen() {
  const { user, addXp } = useAuthStore();
  const { addPlace, setSelectedPlace } = usePlacesStore();
  const { center, setCenter, setZoom, selectCity } = useMapStore();

  const [form, setForm] = useState<SuggestFormState>({
    name: '',
    address: '',
    category: null,
    city: 'Hà Nội',
    description: '',
    phone: '',
    website: '',
    photos: [],
    latitude: undefined,
    longitude: undefined,
    locationSource: 'city',
  });

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [submittedPlace, setSubmittedPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof SuggestFormState, string>>>({});

  const handleUseCurrentGps = async () => {
    triggerHaptic('selection');
    setIsGettingGps(true);
    try {
      const { coords } = await locationService.getCurrentPosition();
      if (coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) {
        setForm((prev) => ({
          ...prev,
          latitude: coords.latitude,
          longitude: coords.longitude,
          locationSource: 'gps',
        }));
        Alert.alert(
          'Đã lấy vị trí GPS',
          `Toạ độ: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
        );
      }
    } catch (_) {
      Alert.alert(
        'Không thể lấy GPS',
        'Vui lòng kiểm tra quyền truy cập vị trí trên trình duyệt hoặc thiết bị.'
      );
    } finally {
      setIsGettingGps(false);
    }
  };

  const handleUseMapCenter = () => {
    triggerHaptic('selection');
    setForm((prev) => ({
      ...prev,
      longitude: center[0],
      latitude: center[1],
      locationSource: 'map_center',
    }));
    Alert.alert(
      'Đã chọn tâm bản đồ',
      `Toạ độ: ${center[1].toFixed(5)}, ${center[0].toFixed(5)}`
    );
  };

  const updateField = (field: keyof SuggestFormState, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddPhoto = async () => {
    triggerHaptic('light');
    if (form.photos.length >= 5) {
      Alert.alert('Giới hạn ảnh', 'Bạn chỉ có thể tải lên tối đa 5 ảnh.');
      return;
    }

    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.75,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('photos', [...form.photos, result.assets[0].uri]);
      }
    } catch {
      // Fallback demo photo
      updateField('photos', [
        ...form.photos,
        'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
      ]);
    }
  };

  const removePhoto = (index: number) => {
    triggerHaptic('light');
    updateField(
      'photos',
      form.photos.filter((_, i) => i !== index)
    );
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SuggestFormState, string>> = {};

    if (!form.name.trim() || form.name.trim().length < 3) {
      newErrors.name = 'Tên địa điểm phải có ít nhất 3 ký tự';
    }
    if (!form.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
    }
    if (!form.category) {
      newErrors.category = 'Vui lòng chọn danh mục địa điểm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('medium');
    setIsSubmitting(true);

    const matchedCity = VIETNAM_CITY_PRESETS.find(
      (c) => c.name.toLowerCase() === form.city.toLowerCase()
    );

    let targetLng = form.longitude;
    let targetLat = form.latitude;

    if (!targetLng || !targetLat) {
      if (matchedCity) {
        targetLng = matchedCity.coordinates[0];
        targetLat = matchedCity.coordinates[1];
      } else {
        targetLng = center[0];
        targetLat = center[1];
      }
    }

    await new Promise((r) => setTimeout(r, 600));

    // Generate valid UUIDv4 for Postgres/Supabase compatibility
    const hex = (len: number) =>
      Math.floor(Math.random() * 0xffffffff)
        .toString(16)
        .padStart(8, '0')
        .slice(0, len);
    const validUuid = `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;

    const newPlace: Place = {
      id: validUuid,
      name: form.name.trim(),
      slug: null,
      description: form.description.trim() || 'Địa điểm mới được đóng góp bởi cộng đồng CITYVERSE.',
      category: form.category || 'coffee',
      address: `${form.address.trim()}, ${form.city}`,
      province_code: matchedCity?.province || 'VN',
      administrative_metadata: null,
      latitude: targetLat,
      longitude: targetLng,
      entrance_latitude: null,
      entrance_longitude: null,
      location_accuracy_meters: 10,
      data_source: 'COMMUNITY',
      external_source_id: null,
      verification_status: 'verified',
      opening_hours: null,
      phone: form.phone.trim() || null,
      website: form.website.trim() || null,
      cover_image_url:
        form.photos[0] ||
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      checkin_count: 1,
      post_count: 0,
      rating_average: 5.0,
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      is_active: true,
    };

    // Save into repository and Zustand stores
    placeRepository.addCustomPlace(newPlace);
    addPlace(newPlace);
    addXp(50);

    setIsSubmitting(false);
    setSubmittedPlace(newPlace);
    triggerHaptic('success');
  };

  const handleReset = () => {
    triggerHaptic('light');
    setForm({
      name: '',
      address: '',
      category: null,
      city: 'Hà Nội',
      description: '',
      phone: '',
      website: '',
      photos: [],
      latitude: undefined,
      longitude: undefined,
      locationSource: 'city',
    });
    setErrors({});
    setSubmittedPlace(null);
  };

  const handleViewSubmittedOnMap = () => {
    if (!submittedPlace) return;
    triggerHaptic('selection');
    setCenter([submittedPlace.longitude, submittedPlace.latitude]);
    setZoom(17);
    setSelectedPlace(submittedPlace);
    router.replace('/');
  };

  // --- Success Screen ---
  if (submittedPlace) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <CheckCircle2 size={64} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Đóng góp thành công! 🎉</Text>
          <Text style={styles.successDesc}>
            Địa điểm "{submittedPlace.name}" đã được ghim trực tiếp lên bản đồ CITYVERSE và sẵn sàng cho cộng đồng khám phá & check-in.
          </Text>
          <View style={styles.successReward}>
            <Sparkles size={18} color="#F59E0B" />
            <Text style={styles.successRewardText}>Bạn đã nhận +50 XP đóng góp cộng đồng!</Text>
          </View>

          <View style={styles.successActionButtons}>
            <TouchableOpacity
              style={styles.viewOnMapBtn}
              onPress={handleViewSubmittedOnMap}
              activeOpacity={0.8}
            >
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.viewOnMapBtnText}>Xem ngay trên Bản đồ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addAnotherBtn}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.addAnotherBtnText}>Thêm địa điểm khác</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <Text style={styles.title}>Đóng Góp Địa Điểm</Text>
            <Text style={styles.subtitle}>
              Ghim các quán cà phê, quán ăn hoặc danh thắng mới lên bản đồ Việt Nam
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Field: Name */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tên địa điểm <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="VD: Cà phê Trứng Giảng, Bánh mì Phượng..."
                placeholderTextColor={THEME.colors.textMuted}
                value={form.name}
                onChangeText={(v) => updateField('name', v)}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Field: City Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Thành phố / Tỉnh</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipRow}
              >
                {VIETNAM_CITY_PRESETS.map((c) => {
                  const isSelected = form.city === c.name;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => {
                        triggerHaptic('selection');
                        updateField('city', c.name);
                      }}
                      activeOpacity={0.8}
                    >
                      <MapPin
                        size={12}
                        color={isSelected ? '#20D6E7' : '#76839A'}
                      />
                      <Text
                        style={[styles.chipText, isSelected && styles.chipTextActive]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Field: Category Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Danh mục địa điểm <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.categoryGrid}>
                {Object.values(PLACE_CATEGORIES).map((cat) => {
                  const isSelected = form.category === cat.category;
                  return (
                    <TouchableOpacity
                      key={cat.category}
                      style={[
                        styles.categoryGridItem,
                        isSelected && styles.categoryGridItemActive,
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        updateField('category', cat.category);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.categoryGridItemText,
                          isSelected && styles.categoryGridItemTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            {/* Field: Address */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Địa chỉ chi tiết <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Số nhà, tên đường, phường/xã..."
                placeholderTextColor={THEME.colors.textMuted}
                value={form.address}
                onChangeText={(v) => updateField('address', v)}
              />
              {errors.address && (
                <Text style={styles.errorText}>{errors.address}</Text>
              )}
            </View>

            {/* Field: Map Coordinates Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Toạ độ ghim trên bản đồ</Text>
              <View style={styles.coordsButtonRow}>
                <TouchableOpacity
                  style={[
                    styles.coordsBtn,
                    form.locationSource === 'gps' && styles.coordsBtnActive,
                  ]}
                  onPress={handleUseCurrentGps}
                  activeOpacity={0.8}
                >
                  <Crosshair
                    size={14}
                    color={form.locationSource === 'gps' ? '#4F7DFF' : '#A3AEC2'}
                  />
                  <Text
                    style={[
                      styles.coordsBtnText,
                      form.locationSource === 'gps' && styles.coordsBtnTextActive,
                    ]}
                  >
                    {isGettingGps ? 'Đang lấy GPS...' : 'Lấy GPS của tôi'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.coordsBtn,
                    form.locationSource === 'map_center' && styles.coordsBtnActive,
                  ]}
                  onPress={handleUseMapCenter}
                  activeOpacity={0.8}
                >
                  <Compass
                    size={14}
                    color={form.locationSource === 'map_center' ? '#20D6E7' : '#A3AEC2'}
                  />
                  <Text
                    style={[
                      styles.coordsBtnText,
                      form.locationSource === 'map_center' && styles.coordsBtnTextActive,
                    ]}
                  >
                    Tâm bản đồ
                  </Text>
                </TouchableOpacity>
              </View>

              {form.latitude && form.longitude && (
                <View style={styles.coordsBadge}>
                  <MapPin size={12} color="#10B981" />
                  <Text style={styles.coordsBadgeText}>
                    Đã chọn: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)} ({form.locationSource === 'gps' ? 'GPS thiết bị' : 'Tâm bản đồ'})
                  </Text>
                </View>
              )}
            </View>

            {/* Field: Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả / Điểm nổi bật</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Giới thiệu không gian, món ăn đặc trưng hoặc góc chụp ảnh đẹp..."
                placeholderTextColor={THEME.colors.textMuted}
                multiline
                numberOfLines={3}
                value={form.description}
                onChangeText={(v) => updateField('description', v)}
              />
            </View>

            {/* Field: Photos Upload */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Hình ảnh địa điểm (Tối đa 5)</Text>
              <View style={styles.photoRow}>
                {form.photos.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrap}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.photoRemoveBtn}
                      onPress={() => removePhoto(idx)}
                    >
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}
                {form.photos.length < 5 && (
                  <TouchableOpacity
                    style={styles.addPhotoBtn}
                    onPress={handleAddPhoto}
                    activeOpacity={0.8}
                  >
                    <Camera size={20} color="#20D6E7" />
                    <Text style={styles.addPhotoText}>Thêm ảnh</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Ghim địa điểm & Nhận +50 XP</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080D18',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    color: '#F4F7FF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#76839A',
    fontSize: 12,
    marginTop: 3,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    padding: 16,
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    color: '#A3AEC2',
    fontSize: 12.5,
    fontWeight: '600',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: '#1B2435',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#F4F7FF',
    fontSize: 13.5,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 2,
  },
  chipRow: {
    gap: 7,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1B2435',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActive: {
    backgroundColor: 'rgba(32, 214, 231, 0.14)',
    borderColor: '#20D6E7',
  },
  chipText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#20D6E7',
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  categoryGridItem: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#1B2435',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryGridItemActive: {
    backgroundColor: '#4F7DFF',
    borderColor: '#4F7DFF',
  },
  categoryGridItemText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGridItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  photoThumbWrap: {
    position: 'relative',
    width: 68,
    height: 68,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 68,
    height: 68,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(32, 214, 231, 0.4)',
    backgroundColor: 'rgba(32, 214, 231, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    color: '#20D6E7',
    fontSize: 10,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F7DFF',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#4F7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    color: '#F4F7FF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  successDesc: {
    color: '#A3AEC2',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  successReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 24,
  },
  successRewardText: {
    color: '#F59E0B',
    fontSize: 12.5,
    fontWeight: '700',
  },
  successActionButtons: {
    width: '100%',
    gap: 10,
  },
  viewOnMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F7DFF',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#4F7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  viewOnMapBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addAnotherBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  addAnotherBtnText: {
    color: '#A3AEC2',
    fontSize: 13.5,
    fontWeight: '600',
  },
  coordsButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  coordsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  coordsBtnActive: {
    borderColor: '#4F7DFF',
    backgroundColor: 'rgba(79, 125, 255, 0.12)',
  },
  coordsBtnText: {
    color: '#A3AEC2',
    fontSize: 12.5,
    fontWeight: '600',
  },
  coordsBtnTextActive: {
    color: '#4F7DFF',
    fontWeight: '700',
  },
  coordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  coordsBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
});
