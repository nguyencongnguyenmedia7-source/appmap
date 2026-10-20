# 🗺️ CITYVERSE — Bản Đồ Khám Phá & Check-in Xã Hội Việt Nam

[![Expo](https://img.shields.io/badge/Expo-SDK%2058-blue.svg)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**CITYVERSE** là ứng dụng bản đồ tương tác xã hội di động & web thế hệ mới dành riêng cho cộng đồng du lịch, ẩm thực và khám phá tại Việt Nam (Hà Nội, TP.HCM, Đà Nẵng, Phú Quốc, Đà Lạt, Sa Pa,...). Ứng dụng tích hợp công nghệ bản đồ hybrid (Mapbox 3D vector trên mobile và Leaflet/OSM trên web), hệ thống định vị GPS xác thực check-in chống gian lận, bảng xếp hạng Explorer và cơ sở dữ liệu PostGIS.

---

## ✨ Tính Năng Nổi Bật

- 📍 **Bản đồ tương tác đa nền tảng (Hybrid Map Architecture)**:
  - **Native (iOS / Android)**: Tích hợp `@rnmapbox/maps` 3D vector map, xoay 3D (pitch/bearing), hiển thị POI mượt mà 60 FPS.
  - **Web (SPA)**: Leaflet.js tương thích cao, hỗ trợ 4 chế độ bản đồ: *Chuẩn (Standard)*, *Vệ tinh (Satellite)*, *Giao thông (Traffic)*, *Bản đồ tối (Dark/Cyber)*.
- 🎯 **Tìm kiếm địa điểm thông minh & Bộ lọc danh mục**:
  - Hỗ trợ tiếng Việt không dấu (accent-insensitive search: `ca phe` -> `cà phê`).
  - Lọc theo bán kính GPS (500m, 1km, 2km, 5km, toàn thành phố) và danh mục (*Cà phê, Ẩm thực, Di tích & Văn hóa, Giải trí, Mua sắm, Check-in sống ảo*).
- 📸 **Check-in GPS & Chống Gian Lận (Anti-Spoofing Check-in)**:
  - Tính khoảng cách Haversine chính xác theo mét giữa toạ độ GPS của thiết bị và địa điểm.
  - Tự động gắn nhãn huy hiệu `Đã xác thực GPS tại điểm` (bán kính hợp lệ ≤ 100m) hoặc cảnh báo nếu đang ở xa.
  - Tải ảnh check-in trực tiếp từ camera hoặc thư viện máy.
- 🏆 **Bảng Xếp Hạng & Gamification (Explorer Leaderboard)**:
  - Vinh danh Top nhà thám hiểm năng động theo tuần, tháng và mọi thời đại.
  - Tích luỹ điểm kinh nghiệm (XP), cấp độ (Level) và danh hiệu độc quyền.
- 👥 **Bạn Bè & Radar Xung Quanh**:
  - Chia sẻ vị trí thời gian thực giữa bạn bè với chế độ ẩn danh / tàng hình (Ghost mode).
- 🛡️ **Bảng Quản Trị Hệ Thống (Admin Dashboard)**:
  - Quản lý danh sách địa điểm, duyệt đóng góp địa điểm mới từ cộng đồng.
  - Giám sát trạng thái dịch vụ GPS, bộ nhớ đệm Offline và kết nối PostGIS.

---

## 🏗️ Kiến Trúc Công Nghệ

| Thành phần | Công nghệ sử dụng |
|---|---|
| **Framework** | Expo SDK 58 (Expo Router v58, Typed Routes) |
| **Giao diện & Nền tảng** | React Native 0.88, React 19, `react-native-reanimated`, Safe Area Context |
| **Map Native** | `@rnmapbox/maps` v10 |
| **Map Web** | `leaflet` + OpenStreetMap tiles |
| **Quản lý State** | Zustand 5 |
| **Backend & Database** | Supabase (PostgreSQL + PostGIS extension) |
| **Kiểm thử** | Jest, ts-jest (100% Passed) |
| **Code Quality** | ESLint 9 (Flat Config), TypeScript 6 Strict Mode |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### Yêu cầu tiên quyết
- **Node.js**: >= 18.x
- **npm** hoặc **bun**
- Ứng dụng **Expo Go** trên điện thoại thoại hoặc Emulator/Simulator

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường (Tuỳ chọn)
Sao chép file mẫu `.env.example` thành `.env`:
```bash
cp .env.example .env
```
Điền các giá trị khoá API:
- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`: Token Mapbox Public
- `EXPO_PUBLIC_SUPABASE_URL`: Đường dẫn Supabase Project
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Public Key

*(Nếu chưa cấu hình Supabase hoặc Mapbox, ứng dụng sẽ tự động kích hoạt chế độ Demo Mock Data & Leaflet OSM miễn phí để trải nghiệm ngay lập tức).*

### 3. Khởi chạy ứng dụng

- **Chạy nền tảng Web**:
  ```bash
  npm run web
  ```
- **Chạy ứng dụng Expo (iOS/Android/Web)**:
  ```bash
  npx expo start
  ```
- **Chạy trên máy ảo Android**:
  ```bash
  npm run android
  ```
- **Chạy trên máy ảo iOS (macOS)**:
  ```bash
  npm run ios
  ```

---

## 🧪 Kiểm Thử & Kiểm Tra Chất Lượng Mã Nguồn

```bash
# Kiểm tra TypeScript
npx tsc --noEmit

# Kiểm tra Linter
npm run lint

# Chạy Unit Tests
npm test
```

---

## 📂 Cấu Trúc Dự Án

```
├── assets/                  # Ảnh biểu tượng, splash screen
├── docs/                    # Tài liệu kỹ thuật chi tiết
│   ├── COST_CONTROL.md      # Kiểm soát chi phí hạ tầng bản đồ
│   ├── MAP_DATA.md          # Nguồn dữ liệu & giấy phép bản đồ
│   ├── SECURITY.md          # Bảo mật API key & GPS anti-spoof
│   ├── SETUP.md             # Hướng dẫn triển khai Supabase PostGIS
│   └── TESTING.md           # Hướng dẫn kiểm thử & kịch bản test
├── src/
│   ├── app/                 # Expo Router (Các màn hình chính, tab bar, modal)
│   ├── components/          # Reusable UI components (Modals, Headers, Cards)
│   ├── data/                # Dữ liệu mẫu Việt Nam (Hà Nội, Sài Gòn, Đà Nẵng,...)
│   ├── hooks/               # Custom React Hooks
│   ├── lib/                 # Tiện ích môi trường, Supabase client
│   ├── services/
│   │   ├── location/        # Dịch vụ GPS định vị
│   │   ├── map/             # Map provider abstractions (Native vs Web)
│   │   └── places/          # Repository truy vấn dữ liệu địa điểm
│   ├── store/               # Zustand global state (map, filter, auth, friends)
│   └── types/               # TypeScript interfaces & Database schema
├── supabase/                # Migration SQL scripts khởi tạo PostGIS
└── package.json
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án được phân phối theo giấy phép [MIT License](./LICENSE).
