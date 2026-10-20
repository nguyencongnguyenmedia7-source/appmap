# Kế Hoạch Kiểm Soát Chi Phí Bản Đồ & Hạ Tầng (COST_CONTROL.md)

Tài liệu này chi tiết hóa cơ chế kiểm soát chi phí API, tối ưu hóa lưu lượng và cảnh báo chi phí cho CITYVERSE.

---

## 1. Phân Tích Dịch Vụ & Mô Hình Chi Phí

| Dịch Vụ | API Được Sử Dụng | Thao Tác Tính Phí | Hạn Mức Miễn Phí (Free Tier) |
| :--- | :--- | :--- | :--- |
| **Mapbox Maps SDK** | Map Loads / Mobile SDK Sessions | Khởi động MapView hiển thị bản đồ trên thiết bị | 25,000 monthly active users (MAU) |
| **Mapbox Geocoding** | Search / Forward Geocoding | Tìm kiếm địa chỉ ra tọa độ | 100,000 requests / tháng |
| **Supabase PostgreSQL** | Database storage & PostGIS RPC | Truy vấn viewport bounding box, check-in | 500 MB database, 2GB transfer |
| **Supabase Storage** | Image Upload / CDN | Tải ảnh check-in thực tế | 1 GB storage, 2 GB bandwidth |

---

## 2. Các Biện Pháp Tối Ưu Hóa Kỹ Thuật

### A. Giảm Thiểu Tải Bản Đồ Lại (Map Reload Prevention)
- Tách riêng component `CityMap` và các điều khiển overlay (`MapControls`, `MapHeaderSearch`).
- Thay đổi trạng thái marker hoặc chọn địa điểm **không kích hoạt reload lại toàn bộ bản đồ** mà chỉ cập nhật lớp dữ liệu chú thích (PointAnnotation / GeoJSON source).

### B. Viewport Query Debouncing
- Khi người dùng lướt ngón tay kéo bản đồ, vị trí thay đổi liên tục hàng chục lần mỗi giây.
- **Giải pháp**: Sử dụng bộ đệm trễ `debounce 350ms`. Chỉ khi người dùng dừng di chuyển khung nhìn, hệ thống mới gửi duy nhất 1 truy vấn `get_places_in_viewport` với giới hạn tối đa 50 kết quả.

### C. Search Input Debouncing & Vietnamese Normalization
- Khi gõ từ khóa tìm kiếm, áp dụng client-side cache và debounce.
- Không gửi yêu cầu geocoding nếu từ khóa ngắn hơn 2 ký tự.
- Ưu tiên tìm kiếm trong cơ sở dữ liệu POI địa phương đã chuẩn hóa trước khi gọi Geocoding ngoài.

### D. Tối Ưu Hóa Hình Ảnh
- Mọi ảnh check-in được nén chất lượng (`quality: 0.8`) bằng `expo-image-picker` trước khi upload.
- Không tải ảnh kích thước gốc khi chỉ hiển thị avatar hoặc thumbnail nhỏ trên bản đồ.

---

## 3. Ngưỡng Cảnh Báo & Giám Sát (Usage Alerts)

Thiết lập cảnh báo tự động trên Mapbox Dashboard và Supabase Dashboard:

1. **Ngưỡng Cảnh Báo 1 (50% Free Tier)**:
   - Mapbox: 12,500 MAU hoặc 50,000 Geocoding requests.
   - Hành động: Gửi email thông báo cho Tech Lead.
2. **Ngưỡng Cảnh Báo 2 (80% Free Tier)**:
   - Mapbox: 20,000 MAU.
   - Hành động: Bật chế độ cache tăng cường (Aggressive caching), tăng debounce từ 350ms lên 500ms.
3. **Ngưỡng Cảnh Báo 3 (95% Free Tier)**:
   - Tự động chuyển các tác vụ Geocoding sang nguồn dữ liệu mở OpenStreetMap Nominatim.

---

## 4. Kế Hoạch Chuyển Đổi Nhà Cung Cấp (Provider Migration Plan)

Kiến trúc Adapter Pattern (`src/services/map/`) cho phép thay thế nhà cung cấp bản đồ mà không cần sửa đổi logic nghiệp vụ:
- Nếu chi phí Mapbox vượt quá ngân sách phát triển, hệ thống có thể chuyển sang:
  1. **MapLibre Native** (mã nguồn mở hoàn toàn, sử dụng OpenMapTiles / Protomaps vector tiles tự host trên Cloudflare R2).
  2. **Goong Maps** (nhà cung cấp bản đồ số chuyên sâu cho Việt Nam).
- Thời gian ước tính để cắm adapter mới: **dưới 2 ngày làm việc**.
