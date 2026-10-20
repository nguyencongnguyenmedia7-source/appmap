# Quy Trình Kiểm Thử & Nghiệm Thu (TESTING.md)

Tài liệu này hướng dẫn chạy kiểm thử tự động và danh mục nghiệm thu chức năng (Acceptance Criteria) cho CITYVERSE.

---

## 1. Chạy Kiểm Thử Tự Động (Automated Unit Tests)

Dự án tích hợp bộ kiểm thử tự động bằng **Jest** và **ts-jest**.

### Lệnh Thực Thi:
```bash
# Chạy toàn bộ test suites
npm test

# Chạy test và theo dõi thay đổi (Watch mode)
npx jest --watch

# Chạy test với báo cáo độ bao phủ mã nguồn (Coverage)
npx jest --coverage
```

### Các Kịch Bản Đã Được Kiểm Thử Tự Động (12 Tests Passing):
1. **Toán Học Địa Lý & Ranh Giới Việt Nam (`src/__tests__/geo.test.ts`)**:
   - Kiểm tra định dạng tọa độ WGS84 hợp lệ trong khoảng `[-90, 90]` và `[-180, 180]`.
   - Xác thực tọa độ nằm trong ranh giới lãnh thổ Việt Nam (Hà Nội, TP.HCM, Đà Nẵng, Quảng Ngãi) và loại trừ tọa độ nước ngoài.
   - Kiểm tra công thức Haversine tính khoảng cách vật lý chuẩn xác giữa Hồ Hoàn Kiếm và Nhà Hát Lớn Hà Nội (~710m).
   - Kiểm tra định dạng chuỗi khoảng cách hiển thị người dùng (`85 m`, `2.5 km`).
   - Kiểm tra thuật toán Bounding Box `isPointInBoundingBox`.
   - Kiểm tra bộ lọc khoảng cách check-in: vị trí < 200m được cấp cờ `isVerified = true`; vị trí xa > 1000m trả về `isVerified = false`.
2. **Xử Lý Tiếng Việt & Tìm Kiếm Không Dấu (`src/__tests__/vietnamese.test.ts`)**:
   - Loại bỏ dấu tiếng Việt chuẩn xác (ví dụ: *"Hà Nội"* -> *"ha noi"*, *"Đà Nẵng"* -> *"da nang"*).
   - Tìm kiếm không dấu khớp với tên địa điểm có dấu (ví dụ: gõ *"ho guom"* tìm ra *"Hồ Hoàn Kiếm (Hồ Gươm)"*).
   - Tạo URL Slug an toàn cho địa danh Việt Nam.
3. **Repository Địa Điểm & Sắp Xếp Khoảng Cách (`src/__tests__/places.test.ts`)**:
   - Lọc địa điểm theo bounding box khung nhìn hiện tại.
   - Sắp xếp danh sách địa điểm lân cận theo thứ tự khoảng cách tăng dần.
   - Lọc địa điểm theo danh mục (Cà phê, Ẩm thực, Du lịch, Di sản...).

---

## 2. Tiêu Chí Nghiệm Thu Thực Tế (Acceptance Criteria Checklist)

| Tiêu chí | Trạng thái | Ghi chú kiểm chứng |
| :--- | :--- | :--- |
| **Bản đồ 3D tương tác** | ✅ Đạt | Hỗ trợ xoay, nghiêng pitch 3D, hiển thị khối tòa nhà 3D, đổi giữa 3D/2D/Vệ tinh. |
| **Định vị GPS thực tế** | ✅ Đạt | Lấy tọa độ GPS thiết bị qua `expo-location`, hiển thị chỉ số accuracy, có chế độ dự phòng nếu tắt quyền. |
| **Chuẩn WGS84 [lng, lat]** | ✅ Đạt | Toàn bộ GeoJSON và PostGIS đều tuân thủ kinh độ trước, vĩ độ sau, không nhầm thứ tự. |
| **Dữ liệu thật Việt Nam** | ✅ Đạt | Tọa độ thực tế tại Hà Nội, TP.HCM, Đà Nẵng, Huế, Quảng Ngãi; không dùng tọa độ ngẫu nhiên. |
| **Tìm kiếm tiếng Việt** | ✅ Đạt | Tìm kiếm thông minh hỗ trợ cả tiếng Việt có dấu và không dấu, lịch sử tìm kiếm. |
| **Tải theo Viewport & Debounce**| ✅ Đạt | Kéo bản đồ cập nhật địa điểm theo bounding box với debounce 350ms, không tải toàn quốc về máy. |
| **Check-in & Xác Thực Khoảng Cách** | ✅ Đạt | Tự động đo khoảng cách GPS tới địa điểm, thưởng thêm XP khi có mặt thực tế trong 200m. |
| **Bảo mật RLS & Chống Gian Lận** | ✅ Đạt | 17 bảng đều có RLS; hàm server tính XP tự động, không để mobile client tự ghi điểm. |
| **Không lộ Secret Token** | ✅ Đạt | Chỉ dùng `EXPO_PUBLIC_` an toàn; tài liệu hướng dẫn cấu hình đầy đủ. |
| **Không crash khi thiếu key** | ✅ Đạt | Chế độ Development Preview cho phép khởi động và trải nghiệm đầy đủ ngay lập tức. |
