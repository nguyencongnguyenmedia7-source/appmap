# Chính Sách Bảo Mật & An Toàn Dữ Liệu (SECURITY.md)

Tài liệu này xác định các nguyên tắc bảo mật thông tin, kiểm soát quyền truy cập và bảo vệ quyền riêng tư người dùng trong CITYVERSE.

---

## 1. Nguyên Tắc Bảo Mật Mã Nguồn Di Động (Zero Secret Keys in Client)

1. **Tuyệt Đối Không Nhúng Secret Key**:
   - `SUPABASE_SERVICE_ROLE_KEY` và Mapbox Secret Download Token **chỉ được phép lưu trữ ở server hoặc CI/CD pipeline**.
   - Ứng dụng di động chỉ sử dụng `EXPO_PUBLIC_SUPABASE_ANON_KEY` và `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` (bắt đầu bằng `pk.`).
2. **Kiểm Tra Biến Môi Trường Tự Động**:
   - `src/lib/env.ts` sử dụng **Zod** để kiểm định định dạng token ngay lúc runtime.

---

## 2. Row Level Security (RLS) Trong Cơ Sở Dữ Liệu

Mọi bảng trong cơ sở dữ liệu Supabase đều được bật Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

### Tóm Tắt Chính Sách RLS:

| Bảng | Quyền SELECT | Quyền INSERT / UPDATE / DELETE |
| :--- | :--- | :--- |
| `profiles` | Công khai (`true`) | Người dùng chỉ được sửa `full_name`, `bio`, `avatar_url` của chính mình. **Không thể tự sửa `xp` hay `level`**. |
| `places` | Địa điểm hoạt động (`is_active = true`) | Chỉ Quản trị viên / Service Role mới được thêm/sửa trực tiếp. |
| `place_suggestions` | Người tạo và Quản trị viên | Người dùng đã đăng nhập (`auth.uid() = submitted_by`). |
| `checkins` | Công khai (`true`) | Người dùng chỉ được tạo check-in cho chính tài khoản của mình. |
| `posts` | Công khai | Tác giả bài viết (`auth.uid() = user_id`). |
| `likes` / `comments` | Công khai | Người dùng thao tác với nội dung của chính họ. |
| `friendships` | Chỉ 2 người bạn trong mối quan hệ | Chỉ người gửi tạo yêu cầu; người nhận chấp thuận/từ chối. |
| `user_location_shares` | **Chỉ bạn bè đã được chấp thuận (`accepted`)** | Chủ sở hữu vị trí. |

---

## 3. Chống Gian Lận Điểm Kinh Nghiệm (Server-Side XP Verification)

- **Không tin tưởng số XP do client tự gửi**:
  - Toàn bộ việc tính toán XP được thực thi bởi Stored Procedure PostGIS: `public.perform_verified_checkin`.
  - Hàm kiểm tra:
    1. Người dùng có đăng nhập hợp lệ hay không (`auth.uid()`).
    2. Khoảng cách vật lý giữa tọa độ GPS gửi lên và vị trí thực của địa danh (`ST_Distance`).
    3. Giới hạn tần suất (Rate Limit): Tối thiểu 30 phút giữa 2 lần check-in tại cùng một địa điểm.
    4. Thưởng thêm điểm khi có mặt trong bán kính 200m và có kèm ảnh thực tế.
    5. Cập nhật cấp độ `level = 1 + FLOOR(xp / 500)` tự động trong cơ sở dữ liệu.

---

## 4. Quyền Riêng Tư & Vị Trí Người Dùng (Privacy & GPS)

- **Chỉ xin quyền khi cần thiết**: Ứng dụng chỉ yêu cầu quyền GPS khi người dùng bật bản đồ hoặc thực hiện check-in/tìm địa điểm xung quanh.
- **Không theo dõi vị trí nền bí mật**: Vị trí chỉ được lấy theo nhu cầu (On-demand) qua `getCurrentPositionAsync`.
- **Bảo mật vị trí trực tiếp**: Chia sẻ vị trí trực tiếp (`user_location_shares`) có thời gian hết hạn tự động (mặc định 2 giờ) và có thể tắt tức thì bất kỳ lúc nào.
- **Báo Cáo Nội Dung Vi Phạm**: Bảng `reports` cho phép người dùng báo cáo địa điểm đóng cửa, sự kiện ảo hoặc bài viết không phù hợp.
