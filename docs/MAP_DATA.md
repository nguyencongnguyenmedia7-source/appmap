# Quy Chuẩn Dữ Liệu Bản Đồ & Địa Lý Việt Nam (MAP_DATA.md)

Tài liệu này quy định tiêu chuẩn dữ liệu địa không gian, hệ tọa độ và quy trình nhập/xác minh địa điểm cho hệ thống CITYVERSE.

---

## 1. Chuẩn Hóa Tọa Độ & Không Gian (Geospatial Standards)

### A. Hệ Quy Chiếu Tọa Độ
- **Chuẩn Quốc Tế**: WGS84 (World Geodetic System 1984), mã EPSG: **4326**.
- **PostGIS Cột Dữ Liệu**: `geography(Point, 4326)`.
- **Chỉ Mục Không Gian (Spatial Index)**: GiST (`USING GIST (location)`).

### B. Thứ Tự Kinh Độ & Vĩ Độ
- **GeoJSON & Bản đồ (Mapbox/Map Engine)**: `[longitude, latitude]` (Kinh độ trước, Vĩ độ sau).
- **Giao diện người dùng (UI)**: Hiển thị nhãn rõ ràng: `Vĩ độ (Lat)`, `Kinh độ (Lng)`.
- **Hàm PostGIS**: `ST_MakePoint(longitude, latitude)`.

### C. Khung Tọa Độ Lãnh Thổ Việt Nam (Vietnam Bounding Box)
Mọi địa điểm và check-in được kiểm tra tính hợp lệ dựa trên ranh giới:
```typescript
export const VIETNAM_BOUNDING_BOX = {
  minLng: 102.144411,
  minLat: 8.179066,
  maxLng: 109.464638,
  maxLat: 23.393395,
};
```

---

## 2. Nguồn Dữ Liệu & Bản Quyền (Data Sources & Attribution)

Hệ thống CITYVERSE phân định rõ 3 lớp dữ liệu:

1. **Lớp Bản Đồ Nền & Tòa Nhà 3D (Base Map & 3D Extrusion)**:
   - Nhà cung cấp: **Mapbox Standard Style**.
   - Cung cấp: Vector tiles, mô hình độ cao tòa nhà 3D (`mapbox-streets-v8`), mạng lưới giao thông, sông ngòi và công viên.
   - Bản quyền & Điều khoản: Tuân thủ Mapbox Terms of Service. Không scrape hoặc lưu trữ trái phép vector tile.

2. **Dữ Liệu Mở Bổ Sung (OpenStreetMap - OSM Vietnam)**:
   - Dữ liệu đường phố và POI công cộng từ nguồn Geofabrik / OSM Vietnam ([https://download.geofabrik.de/asia/vietnam.html](https://download.geofabrik.de/asia/vietnam.html)).
   - Giấy phép: **Open Database License (ODbL)**.
   - Ghi công: *"© OpenStreetMap contributors"*.

3. **Cơ Sở Dữ Liệu Độc Quyền CITYVERSE (CITYVERSE POI & Social DB)**:
   - Lưu trữ tại bảng `places`, `checkins`, `events`, `posts`.
   - Phân biệt rõ ràng:
     - `verified`: Địa điểm đã được đội ngũ quản trị hoặc thuật toán xác thực thực địa.
     - `pending`: Địa điểm do cộng đồng đề xuất tại bảng `place_suggestions`.
     - `rejected` / `needs_review`: Bị người dùng báo cáo sai lệch hoặc đóng cửa.

---

## 3. Quy Trình Cập Nhật Địa Điểm Theo Viewport (Debounced Viewport Loading)

Nhằm tối ưu hóa hiệu năng và băng thông mạng, CITYVERSE **tuyệt đối không tải toàn bộ dữ liệu địa điểm toàn quốc về máy người dùng**.

### Thuật Toán Viewport:
1. Khi camera di chuyển (kéo bản đồ, xoay, zoom), lấy 4 đỉnh bounding box `[minLng, minLat, maxLng, maxLat]`.
2. Chờ thao tác kéo kết thúc với thời gian trễ **debounce 350ms**.
3. Gọi RPC `get_places_in_viewport`:
   ```sql
   SELECT * FROM public.places p
   WHERE p.is_active = TRUE
     AND ST_Contains(
           ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326),
           p.location::geometry
     )
   LIMIT 50;
   ```
4. Cập nhật marker trên bản đồ. Giữ cache cục bộ theo từng bounding box để tránh truy vấn lặp lại.

---

## 4. Xử Lý GPS & Độ Chính Xác (Location Accuracy)

- Luôn kiểm tra trường `coords.accuracy` từ thiết bị:
  - Nếu `accuracy <= 30m`: Đánh giá tín hiệu GPS xuất sắc.
  - Nếu `accuracy > 150m`: Cảnh báo tín hiệu GPS yếu, không tự động xác thực check-in thực tế.
- Bán kính kiểm tra check-in hợp lệ:
  - **Khoảng cách <= 200m**: Xác thực có mặt thực tế (+25 XP thưởng).
  - **Khoảng cách > 200m**: Ghi nhận đóng góp từ xa, không cấp huy hiệu thực địa để chống gian lận (Anti-Spoofing).
