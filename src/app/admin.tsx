import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Switch,
  Image,
  Alert,
  Modal,
} from 'react-native';
import {
  Sliders,
  Palette,
  MapPin,
  Globe,
  Layers,
  Box,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Zap,
  Activity,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { THEME } from '@/constants/theme';
import { useAdminStore, ACCENT_PALETTES } from '@/store/adminStore';
import { usePlacesStore } from '@/store/placesStore';
import { useMapStore } from '@/store/mapStore';
import { VIETNAM_CITY_PRESETS } from '@/constants/vietnam';
import { MOCK_VIETNAM_PLACES } from '@/services/places/mockVietnamPlaces';
import { placeRepository } from '@/services/places/placeRepository';
import { MapDisplayMode, Place } from '@/types';
import { triggerHaptic } from '@/utils/haptics';

type AdminTab = 'ui' | 'places' | 'cities' | 'system';

export default function AdminScreen() {
  const { config, updateConfig, resetConfig, approvedPlacesCount, incrementApprovedCount } =
    useAdminStore();
  const { places, addPlace, deletePlace, setPlaces, setSelectedPlace } = usePlacesStore();
  const { setCenter, setZoom, setPitch, selectCity, setDisplayMode } = useMapStore();

  // Ensure full real-world place repository is populated
  useEffect(() => {
    if (places.length === 0) {
      setPlaces(MOCK_VIETNAM_PLACES);
    }
  }, [places.length, setPlaces]);

  const [activeTab, setActiveTab] = useState<AdminTab>('ui');
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  const [announcementText, setAnnouncementText] = useState(config.announcementBanner);

  // New place creation state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('Hà Nội');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState<'coffee' | 'restaurant' | 'tourism' | 'culture'>('coffee');

  const handleDeletePlace = (place: Place) => {
    triggerHaptic('warning');
    Alert.alert('Xóa địa điểm', `Bạn có chắc muốn xóa ghim "${place.name}" khỏi bản đồ?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          placeRepository.deletePlace(place.id);
          deletePlace(place.id);
          triggerHaptic('success');
          Alert.alert('Thành công', `Đã xóa "${place.name}" khỏi hệ thống.`);
        },
      },
    ]);
  };

  const handleAddNewPlace = () => {
    if (!newName.trim() || !newAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên địa điểm và địa chỉ.');
      return;
    }

    const matchedCity = VIETNAM_CITY_PRESETS.find(
      (c) => c.name.toLowerCase() === newCity.toLowerCase()
    );
    const coords = matchedCity ? matchedCity.coordinates : [105.8542, 21.0285];

    const hex = (len: number) =>
      Math.floor(Math.random() * 0xffffffff)
        .toString(16)
        .padStart(8, '0')
        .slice(0, len);
    const validUuid = `${hex(8)}-${hex(4)}-4${hex(3)}-a${hex(3)}-${hex(12)}`;

    const newPlace: Place = {
      id: validUuid,
      name: newName.trim(),
      slug: null,
      description: 'Địa điểm được thêm bởi Quản trị viên CITYVERSE.',
      category: newCategory,
      address: `${newAddress.trim()}, ${newCity}`,
      province_code: matchedCity?.province || 'VN',
      administrative_metadata: null,
      latitude: coords[1],
      longitude: coords[0],
      entrance_latitude: null,
      entrance_longitude: null,
      location_accuracy_meters: 10,
      data_source: 'ADMIN',
      external_source_id: null,
      verification_status: 'verified',
      opening_hours: null,
      phone: null,
      website: null,
      cover_image_url:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      checkin_count: 1,
      post_count: 0,
      rating_average: 5.0,
      created_by: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      is_active: true,
    };

    placeRepository.addCustomPlace(newPlace);
    addPlace(newPlace);
    incrementApprovedCount();
    triggerHaptic('success');

    setNewName('');
    setNewAddress('');
    setIsAddModalOpen(false);
    Alert.alert('Thành công 🎉', `Đã thêm ghim "${newPlace.name}" vào bản đồ!`);
  };

  const handleTabChange = (tab: AdminTab) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const handleSelectAccent = (color: string) => {
    triggerHaptic('medium');
    updateConfig({ primaryAccent: color });
  };

  const handleSelectDefaultMapMode = (mode: MapDisplayMode) => {
    triggerHaptic('selection');
    updateConfig({ defaultMapMode: mode });
    setDisplayMode(mode);
  };

  const handleToggleOption = (key: keyof typeof config, value: boolean) => {
    triggerHaptic('light');
    updateConfig({ [key]: value });
  };

  const handleSaveBanner = () => {
    triggerHaptic('success');
    updateConfig({ announcementBanner: announcementText.trim() });
    Alert.alert('Thành công', 'Đã cập nhật banner thông báo toàn hệ thống!');
  };

  const handleResetUi = () => {
    triggerHaptic('warning');
    Alert.alert('Khôi phục giao diện', 'Bạn có chắc chắn muốn đặt lại tất cả cấu hình UI về mặc định?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Khôi phục',
        style: 'destructive',
        onPress: () => {
          resetConfig();
          setAnnouncementText('Chào mừng bạn đến với CITYVERSE - Bản đồ số khám phá Việt Nam 3D');
        },
      },
    ]);
  };

  // Preview place on map
  const handlePreviewPlace = (place: Place) => {
    triggerHaptic('selection');
    setCenter([place.longitude, place.latitude]);
    setZoom(17);
    setSelectedPlace(place);
    router.replace('/');
  };

  // Quick jump camera to city preset
  const handleTestCityCamera = (cityId: string) => {
    triggerHaptic('selection');
    const city = VIETNAM_CITY_PRESETS.find((c) => c.id === cityId);
    if (city) {
      selectCity(city.id);
      setCenter(city.coordinates);
      setZoom(city.defaultZoom);
      setPitch(city.defaultPitch);
      router.replace('/');
    }
  };

  // Filter places list for admin table
  const filteredPlaces = places.filter((p) => {
    if (!searchPlaceQuery.trim()) return true;
    return (
      p.name.toLowerCase().includes(searchPlaceQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchPlaceQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Admin Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            triggerHaptic('light');
            router.replace('/');
          }}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color="#F4F7FF" />
          <Text style={styles.backBtnText}>Bản đồ người dùng</Text>
        </TouchableOpacity>

        <View style={styles.statusChip}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Admin Master Online</Text>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Overview Banner */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Sliders size={24} color={config.primaryAccent} />
            <Text style={styles.pageTitle}>Trung Tâm Quản Trị CITYVERSE</Text>
          </View>
          <Text style={styles.pageSubtitle}>
            Quản lý tổng thể giao diện app, giao diện bản đồ, kho ghim địa danh và hạ tầng hệ thống.
          </Text>
        </View>

        {/* System Overview 4-Metrics Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconWrap}>
              <MapPin size={16} color="#4F7DFF" />
            </View>
            <Text style={styles.metricVal}>{places.length}</Text>
            <Text style={styles.metricLbl}>Địa điểm ghim</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(32, 214, 231, 0.15)' }]}>
              <CheckCircle2 size={16} color="#20D6E7" />
            </View>
            <Text style={styles.metricVal}>12.4K</Text>
            <Text style={styles.metricLbl}>Lượt Check-in</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Zap size={16} color="#F59E0B" />
            </View>
            <Text style={styles.metricVal}>1,850</Text>
            <Text style={styles.metricLbl}>Explorers</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <ShieldCheck size={16} color="#10B981" />
            </View>
            <Text style={styles.metricVal}>100%</Text>
            <Text style={styles.metricLbl}>Hạ tầng ArcGIS</Text>
          </View>
        </View>

        {/* Tab Controls */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'ui' && styles.tabBtnActive]}
            onPress={() => handleTabChange('ui')}
            activeOpacity={0.8}
          >
            <Palette size={14} color={activeTab === 'ui' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'ui' && styles.tabBtnTextActive]}>
              Giao diện & Theme
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'places' && styles.tabBtnActive]}
            onPress={() => handleTabChange('places')}
            activeOpacity={0.8}
          >
            <MapPin size={14} color={activeTab === 'places' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'places' && styles.tabBtnTextActive]}>
              Ghim ({places.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'cities' && styles.tabBtnActive]}
            onPress={() => handleTabChange('cities')}
            activeOpacity={0.8}
          >
            <Globe size={14} color={activeTab === 'cities' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'cities' && styles.tabBtnTextActive]}>
              Thành phố (5)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'system' && styles.tabBtnActive]}
            onPress={() => handleTabChange('system')}
            activeOpacity={0.8}
          >
            <Server size={14} color={activeTab === 'system' ? '#FFFFFF' : '#A3AEC2'} />
            <Text style={[styles.tabBtnText, activeTab === 'system' && styles.tabBtnTextActive]}>
              Hạ tầng
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= TAB 1: UI & THEME MANAGEMENT ================= */}
        {activeTab === 'ui' && (
          <View style={styles.sectionWrap}>
            {/* Color Accent Picker */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Màu sắc Chủ đạo của App (Primary Accent)</Text>
              <Text style={styles.cardSub}>
                Thay đổi tông màu tương tác cho các nút bấm, tab đang chọn, ghim nổi bật và viền focus.
              </Text>
              <View style={styles.paletteRow}>
                {ACCENT_PALETTES.map((item) => {
                  const isSelected = config.primaryAccent === item.color;
                  return (
                    <TouchableOpacity
                      key={item.color}
                      style={[
                        styles.paletteCircle,
                        { backgroundColor: item.color },
                        isSelected && styles.paletteCircleSelected,
                      ]}
                      onPress={() => handleSelectAccent(item.color)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <CheckCircle2 size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Default Map Tile Mode */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Chế độ Bản đồ Mặc định khi Mở App</Text>
              <Text style={styles.cardSub}>
                Cấu hình lớp bản đồ nền thực tế (Tile Provider) khởi tạo cho người dùng mới.
              </Text>
              <View style={styles.tileModeRow}>
                <TouchableOpacity
                  style={[
                    styles.tileModeBtn,
                    config.defaultMapMode === '3D' && styles.tileModeBtnActive,
                  ]}
                  onPress={() => handleSelectDefaultMapMode('3D')}
                  activeOpacity={0.8}
                >
                  <Box size={18} color={config.defaultMapMode === '3D' ? '#FFFFFF' : '#A3AEC2'} />
                  <Text
                    style={[
                      styles.tileModeText,
                      config.defaultMapMode === '3D' && styles.tileModeTextActive,
                    ]}
                  >
                    Bản đồ Đêm & 3D
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tileModeBtn,
                    config.defaultMapMode === 'satellite' && styles.tileModeBtnActive,
                  ]}
                  onPress={() => handleSelectDefaultMapMode('satellite')}
                  activeOpacity={0.8}
                >
                  <Globe
                    size={18}
                    color={config.defaultMapMode === 'satellite' ? '#FFFFFF' : '#A3AEC2'}
                  />
                  <Text
                    style={[
                      styles.tileModeText,
                      config.defaultMapMode === 'satellite' && styles.tileModeTextActive,
                    ]}
                  >
                    Vệ tinh thực tế
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tileModeBtn,
                    config.defaultMapMode === '2D' && styles.tileModeBtnActive,
                  ]}
                  onPress={() => handleSelectDefaultMapMode('2D')}
                  activeOpacity={0.8}
                >
                  <Layers
                    size={18}
                    color={config.defaultMapMode === '2D' ? '#FFFFFF' : '#A3AEC2'}
                  />
                  <Text
                    style={[
                      styles.tileModeText,
                      config.defaultMapMode === '2D' && styles.tileModeTextActive,
                    ]}
                  >
                    Đường phố 2D
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Interface Component Toggles */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cấu hình Hiển thị Thành phần Giao diện</Text>

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleLabel}>Hai hàng bộ lọc (Danh mục + Thành phố)</Text>
                  <Text style={styles.toggleDesc}>
                    Hiển thị các chip lọc địa điểm ngay dưới thanh tìm kiếm.
                  </Text>
                </View>
                <Switch
                  value={config.showCityQuickSelector}
                  onValueChange={(val) => handleToggleOption('showCityQuickSelector', val)}
                  trackColor={{ false: '#1B2435', true: config.primaryAccent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleDivider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleLabel}>Nhãn chế độ bản đồ (Map Badge)</Text>
                  <Text style={styles.toggleDesc}>
                    Hộp trạng thái 'Bản đồ Đêm & 3D (Esri)' ở góc dưới bên trái.
                  </Text>
                </View>
                <Switch
                  value={config.showMapBadge}
                  onValueChange={(val) => handleToggleOption('showMapBadge', val)}
                  trackColor={{ false: '#1B2435', true: config.primaryAccent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleDivider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleLabel}>Cụm nút điều khiển nổi bên phải</Text>
                  <Text style={styles.toggleDesc}>
                    Các nút Zoom (+/-), định vị GPS và nút xoay la bàn hướng Bắc.
                  </Text>
                </View>
                <Switch
                  value={config.showFloatingControls}
                  onValueChange={(val) => handleToggleOption('showFloatingControls', val)}
                  trackColor={{ false: '#1B2435', true: config.primaryAccent }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.toggleDivider} />

              <View style={styles.toggleRow}>
                <View style={styles.toggleTextWrap}>
                  <Text style={styles.toggleLabel}>Hiệu ứng rung phản hồi (Micro-Haptics)</Text>
                  <Text style={styles.toggleDesc}>
                    Kích hoạt haptic feedback khi chạm nút, chọn tab hoặc gõ gợi ý.
                  </Text>
                </View>
                <Switch
                  value={config.enableHaptics}
                  onValueChange={(val) => handleToggleOption('enableHaptics', val)}
                  trackColor={{ false: '#1B2435', true: config.primaryAccent }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Announcement Banner */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông Báo / Banner Đầu Ứng Dụng</Text>
              <TextInput
                style={styles.inputArea}
                value={announcementText}
                onChangeText={setAnnouncementText}
                multiline
                numberOfLines={2}
                placeholder="Nhập thông báo hiển thị cho người dùng..."
                placeholderTextColor="#76839A"
              />
              <View style={styles.bannerActionRow}>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: config.primaryAccent }]}
                  onPress={handleSaveBanner}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Lưu & Xuất bản Banner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleResetUi}
                  activeOpacity={0.8}
                >
                  <RotateCcw size={14} color="#A3AEC2" />
                  <Text style={styles.resetBtnText}>Mặc định</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 2: MAP PLACES MANAGEMENT ================= */}
        {activeTab === 'places' && (
          <View style={styles.sectionWrap}>
            {/* Search Bar for Places */}
            <View style={styles.searchBox}>
              <Search size={16} color="#76839A" />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm địa điểm, di tích, quán cà phê..."
                placeholderTextColor="#76839A"
                value={searchPlaceQuery}
                onChangeText={setSearchPlaceQuery}
              />
              {searchPlaceQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchPlaceQuery('')}>
                  <Text style={{ color: '#A3AEC2', fontSize: 12 }}>Xóa</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Places Table Card */}
            <View style={styles.card}>
              <View style={styles.tableHeaderRow}>
                <Text style={styles.cardTitle}>
                  Kho Địa Danh Thực Tế ({filteredPlaces.length}/{places.length})
                </Text>
                <TouchableOpacity
                  style={styles.addPlaceBtn}
                  onPress={() => {
                    triggerHaptic('medium');
                    setIsAddModalOpen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Plus size={13} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.addPlaceBtnText}>Thêm ghim</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.placesList}>
                {filteredPlaces.slice(0, 15).map((place) => (
                  <View key={place.id} style={styles.placeItemRow}>
                    <Image
                      source={{
                        uri:
                          place.cover_image_url ||
                          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
                      }}
                      style={styles.placeThumb}
                    />

                    <View style={styles.placeMeta}>
                      <View style={styles.placeNameRow}>
                        <Text style={styles.placeItemName} numberOfLines={1}>
                          {place.name}
                        </Text>
                        <View style={styles.verifiedBadge}>
                          <CheckCircle2 size={11} color="#10B981" />
                          <Text style={styles.verifiedBadgeText}>Đã ghim</Text>
                        </View>
                      </View>
                      <Text style={styles.placeItemAddress} numberOfLines={1}>
                        {place.address}
                      </Text>
                      <Text style={styles.placeItemStats}>
                        ★ {place.rating_average.toFixed(1)} • {place.checkin_count} check-in • {place.category}
                      </Text>
                    </View>

                    <View style={styles.placeActionRow}>
                      <TouchableOpacity
                        style={styles.previewBtn}
                        onPress={() => handlePreviewPlace(place)}
                        activeOpacity={0.7}
                      >
                        <Eye size={13} color="#20D6E7" />
                        <Text style={styles.previewBtnText}>Xem</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeletePlace(place)}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={13} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 3: CITIES & CAMERA REGIONS ================= */}
        {activeTab === 'cities' && (
          <View style={styles.sectionWrap}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cấu Hình 5 Thành Phố Trọng Điểm</Text>
              <Text style={styles.cardSub}>
                Tọa độ tâm, góc nghiêng 3D và camera mặc định khi người dùng chuyển thành phố.
              </Text>

              <View style={styles.citiesList}>
                {VIETNAM_CITY_PRESETS.map((city) => (
                  <View key={city.id} style={styles.cityItemRow}>
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <Text style={styles.cityCoords}>
                        GPS: {city.coordinates[1].toFixed(4)}, {city.coordinates[0].toFixed(4)} • Zoom {city.defaultZoom} • Pitch {city.defaultPitch}°
                      </Text>
                      <Text style={styles.cityDesc} numberOfLines={1}>
                        {city.description}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.flyCameraBtn}
                      onPress={() => handleTestCityCamera(city.id)}
                      activeOpacity={0.8}
                    >
                      <ExternalLink size={13} color="#FFFFFF" />
                      <Text style={styles.flyCameraBtnText}>Bay tới</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 4: SYSTEM & ENGINE HEALTH ================= */}
        {activeTab === 'system' && (
          <View style={styles.sectionWrap}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Trạng Thái Hạ Tầng & Bản Đồ</Text>

              <View style={styles.engineRow}>
                <View style={styles.engineLeft}>
                  <Server size={18} color="#10B981" />
                  <View>
                    <Text style={styles.engineName}>ArcGIS Online Map Engine</Text>
                    <Text style={styles.engineSub}>Esri Dark Canvas / Satellite / Streets</Text>
                  </View>
                </View>
                <View style={styles.healthyBadge}>
                  <Text style={styles.healthyBadgeText}>Hoạt động tốt</Text>
                </View>
              </View>

              <View style={styles.toggleDivider} />

              <View style={styles.engineRow}>
                <View style={styles.engineLeft}>
                  <Activity size={18} color="#20D6E7" />
                  <View>
                    <Text style={styles.engineName}>PostGIS / Supabase Client</Text>
                    <Text style={styles.engineSub}>EPSG:4326 Lat/Lng Spatial queries</Text>
                  </View>
                </View>
                <View style={styles.healthyBadge}>
                  <Text style={styles.healthyBadgeText}>Sẵn sàng</Text>
                </View>
              </View>

              <View style={styles.toggleDivider} />

              <View style={styles.engineRow}>
                <View style={styles.engineLeft}>
                  <Zap size={18} color="#F59E0B" />
                  <View>
                    <Text style={styles.engineName}>Leaflet WebGL Engine</Text>
                    <Text style={styles.engineSub}>Hardware accelerated 60fps tiles</Text>
                  </View>
                </View>
                <View style={styles.healthyBadge}>
                  <Text style={styles.healthyBadgeText}>Khởi tạo OK</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Admin Quick Add Place Modal */}
      <Modal
        visible={isAddModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Địa Điểm Ghim Nhanh</Text>
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AlertCircle size={20} color="#76839A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Tên địa điểm:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="VD: Cà phê Trứng Giảng..."
              placeholderTextColor="#76839A"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.modalLabel}>Thành phố:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              {VIETNAM_CITY_PRESETS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.cityChip, newCity === c.name && styles.cityChipActive]}
                  onPress={() => setNewCity(c.name)}
                >
                  <Text style={[styles.cityChipText, newCity === c.name && styles.cityChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Địa chỉ:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Số nhà, tên đường..."
              placeholderTextColor="#76839A"
              value={newAddress}
              onChangeText={setNewAddress}
            />

            <TouchableOpacity
              style={[styles.modalSubmitBtn, { backgroundColor: config.primaryAccent }]}
              onPress={handleAddNewPlace}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.modalSubmitBtnText}>Xác nhận ghim địa điểm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '600',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  titleSection: {
    paddingTop: 16,
    paddingBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageTitle: {
    color: '#F4F7FF',
    fontSize: 20,
    fontWeight: '800',
  },
  pageSubtitle: {
    color: '#76839A',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(79, 125, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  metricVal: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '800',
  },
  metricLbl: {
    color: '#76839A',
    fontSize: 9.5,
    marginTop: 2,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#4F7DFF',
  },
  tabBtnText: {
    color: '#A3AEC2',
    fontSize: 11,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionWrap: {
    gap: 14,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    padding: 16,
  },
  cardTitle: {
    color: '#F4F7FF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  cardSub: {
    color: '#76839A',
    fontSize: 11.5,
    marginTop: 3,
    marginBottom: 12,
    lineHeight: 16,
  },
  paletteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paletteCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paletteCircleSelected: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  tileModeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tileModeBtn: {
    flex: 1,
    backgroundColor: '#1B2435',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 6,
  },
  tileModeBtnActive: {
    backgroundColor: '#4F7DFF',
    borderColor: '#4F7DFF',
  },
  tileModeText: {
    color: '#A3AEC2',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tileModeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleLabel: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '600',
  },
  toggleDesc: {
    color: '#76839A',
    fontSize: 11,
    marginTop: 2,
  },
  toggleDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
  inputArea: {
    backgroundColor: '#1B2435',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F7FF',
    fontSize: 13,
    height: 60,
    textAlignVertical: 'top',
  },
  bannerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#1B2435',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  resetBtnText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: '#F4F7FF',
    fontSize: 13,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  placesList: {
    gap: 10,
  },
  placeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B2435',
    borderRadius: 14,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  placeThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  placeMeta: {
    flex: 1,
  },
  placeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  placeItemName: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '700',
  },
  placeItemAddress: {
    color: '#A3AEC2',
    fontSize: 11,
    marginTop: 2,
  },
  placeItemStats: {
    color: '#76839A',
    fontSize: 10,
    marginTop: 2,
  },
  addPlaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F7DFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addPlaceBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  placeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    padding: 7,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F4F7FF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalLabel: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: '#1B2435',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F7FF',
    fontSize: 13,
  },
  cityChip: {
    backgroundColor: '#1B2435',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cityChipActive: {
    backgroundColor: '#4F7DFF',
    borderColor: '#4F7DFF',
  },
  cityChipText: {
    color: '#A3AEC2',
    fontSize: 12,
    fontWeight: '600',
  },
  cityChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F7DFF',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 18,
    shadowColor: '#4F7DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32, 214, 231, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 214, 231, 0.25)',
  },
  previewBtnText: {
    color: '#20D6E7',
    fontSize: 11,
    fontWeight: '700',
  },
  citiesList: {
    gap: 10,
  },
  cityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B2435',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    color: '#F4F7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  cityCoords: {
    color: '#20D6E7',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cityDesc: {
    color: '#76839A',
    fontSize: 11,
    marginTop: 2,
  },
  flyCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4F7DFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  flyCameraBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  engineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  engineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  engineName: {
    color: '#F4F7FF',
    fontSize: 13,
    fontWeight: '700',
  },
  engineSub: {
    color: '#76839A',
    fontSize: 11,
    marginTop: 2,
  },
  healthyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  healthyBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
});
