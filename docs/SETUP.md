# Hướng Dẫn Cài Đặt & Triển Khai CITYVERSE

CITYVERSE là ứng dụng mạng xã hội bản đồ 3D tương tác tại Việt Nam, phát triển bằng **React Native (Expo Router)** kết hợp **Mapbox Maps SDK** và **Supabase (PostgreSQL + PostGIS)**.

---

## 1. Yêu Cầu Môi Trường

- **Node.js**: >= 18.x (khuyến nghị 20.x hoặc mới nhất)
- **npm** hoặc **yarn** / **pnpm**
- **Git**
- **Môi trường di động (để build native iOS/Android)**:
  - **Android**: Android Studio & Android SDK (API 34+), NDK, Java 17.
  - **iOS**: macOS, Xcode 15+, CocoaPods.
- **Expo CLI** (tích hợp sẵn qua `npx expo`).

---

## 2. Cài Đặt Nhanh

### Bước 1: Cài đặt Dependencies
```bash
npm install
```

### Bước 2: Thiết Lập Biến Môi Trường
Sao chép `.env.example` thành `.env`:
```bash
cp .env.example .env
```

Điền các giá trị thực tế:
```ini
# Mapbox Public Access Token (bắt đầu bằng "pk.")
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VyIiwiYSI6InlvdXItdG9rZW4ifQ...

# Mapbox 3D Standard Style
EXPO_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/mapbox/standard

# Supabase Backend
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Chế độ chạy: 'development' hoặc 'production'
EXPO_PUBLIC_APP_ENV=development
```

> **Lưu ý Quan Trọng**:
> - Khi chưa có tài khoản Mapbox hoặc Supabase, ứng dụng sẽ chạy ở chế độ **Development Preview** với bộ nhớ đệm POI thực tế đã được chuẩn hóa (Hà Nội, TP.HCM, Đà Nẵng, Huế, Quảng Ngãi) mà **không bị crash hay giả lập tọa độ ảo**.

---

## 3. Khởi Tạo Cơ Sở Dữ Liệu Supabase + PostGIS

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com).
2. Tạo một Project mới.
3. Mở tab **SQL Editor** trong dự án Supabase của bạn.
4. Chạy toàn bộ file migration:
   ```
   supabase/migrations/20261020000000_init_postgis_and_cityverse_schema.sql
   ```
   *(File này tự động kích hoạt `postgis`, tạo 17 bảng, spatial GiST index, 3 RPC functions tính toán không gian và toàn bộ RLS policies).*
5. Chạy file seed dữ liệu địa điểm thực tế tại Việt Nam:
   ```
   supabase/seed/vietnam_places_seed.sql
   ```

---

## 4. Chạy Ứng Dụng

### A. Chạy Giao Diện Web / Browser Dev Preview
```bash
npm run web
```
Mở trình duyệt tại `http://localhost:8081` để kiểm tra trải nghiệm 3D Social Map, chuyển thành phố, tìm kiếm không dấu và check-in.

### B. Chạy Trên Thiết Bị Di Động (iOS / Android)
Do Mapbox SDK sử dụng native C++/Metal/Vulkan rendering, hãy sử dụng **Expo Prebuild** hoặc **Expo Development Build**:

```bash
# Tạo mã nguồn native (Android & iOS)
npx expo prebuild

# Chạy trên Android Emulator hoặc thiết bị thật
npm run android

# Chạy trên iOS Simulator (yêu cầu macOS)
npm run ios
```

---

## 5. Cấu Trúc Mã Nguồn

```
src/
├── app/                  # Expo Router Screens (Bản đồ 3D, Cộng đồng feed)
├── components/           # UI Header Search, City selector, Map controls, Bottom sheet, Check-in modal
├── constants/            # Design tokens (THEME), Vietnam presets (Hà Nội, TP.HCM, Đà Nẵng, Huế, Quảng Ngãi)
├── hooks/                # Custom React hooks (location, viewport)
├── lib/                  # Zod Env Validator, Supabase client
├── services/
│   ├── map/              # Map provider adapter pattern (Mapbox native + Interactive fallback engine)
│   ├── location/         # Expo Location service & accuracy reader
│   └── places/           # Viewport loader, nearby distance query, anti-cheat checkin
├── store/                # Zustand stores (mapStore, placesStore, authStore)
├── types/                # WGS84 Geo types & Supabase database types
└── utils/                # Haversine distance, boundary validator, Vietnamese diacritic normalizer
```
