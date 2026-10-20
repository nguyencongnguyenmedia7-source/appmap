-- ==============================================================================
-- CITYVERSE REAL VIETNAM POI SEED DATA
-- Verified Real-World Coordinates for Hanoi, HCMC, Da Nang, Hue, Quang Ngai
-- ==============================================================================

INSERT INTO public.places (
    id, name, slug, description, category, address, province_code,
    location, data_source, verification_status, cover_image_url,
    checkin_count, rating_average, is_active
) VALUES
-- ------------------------------------------------------------------------------
-- HÀ NỘI
-- ------------------------------------------------------------------------------
(
    'a1111111-1111-1111-1111-111111111101',
    'Hồ Hoàn Kiếm (Hồ Gươm)',
    'ho-hoan-kiem',
    'Trái tim của thủ đô Hà Nội, gắn liền với truyền thuyết vua Lê Lợi trả gươm báu. Địa điểm tản bộ và check-in biểu tượng bậc nhất.',
    'tourism',
    'Hàng Trống, Quận Hoàn Kiếm, Hà Nội',
    'HN',
    ST_SetSRID(ST_MakePoint(105.8524, 21.0287), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    1240,
    4.9,
    TRUE
),
(
    'a1111111-1111-1111-1111-111111111102',
    'Café Giảng (Cà Phê Trứng)',
    'cafe-giang',
    'Nơi khai sinh món cà phê trứng trứ danh nức tiếng Hà Nội từ năm 1946.',
    'coffee',
    '39 Nguyễn Hữu Huân, Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    'HN',
    ST_SetSRID(ST_MakePoint(105.8548, 21.0336), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    890,
    4.8,
    TRUE
),
(
    'a1111111-1111-1111-1111-111111111103',
    'Nhà Hát Lớn Hà Nội',
    'nha-hat-lon-ha-noi',
    'Công trình kiến trúc kiểu Pháp cổ kính, trung tâm văn hóa nghệ thuật của thủ đô.',
    'culture',
    '1 Tràng Tiền, Phan Chu Trinh, Hoàn Kiếm, Hà Nội',
    'HN',
    ST_SetSRID(ST_MakePoint(105.8576, 21.0245), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    670,
    4.9,
    TRUE
),
(
    'a1111111-1111-1111-1111-111111111104',
    'Phở Gia Truyền Bát Đàn',
    'pho-bat-dan',
    'Thương hiệu phở bò gia truyền lâu đời, hương vị nước dùng thanh tao đậm đà chất Hà Thành.',
    'restaurant',
    '49 Bát Đàn, Cửa Đông, Hoàn Kiếm, Hà Nội',
    'HN',
    ST_SetSRID(ST_MakePoint(105.8471, 21.0345), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    950,
    4.7,
    TRUE
),

-- ------------------------------------------------------------------------------
-- TP. HỒ CHÍ MINH
-- ------------------------------------------------------------------------------
(
    'b2222222-2222-2222-2222-222222222201',
    'Landmark 81',
    'landmark-81',
    'Tòa nhà chọc trời cao nhất Việt Nam, biểu tượng hiện đại và phồn hoa của Sài Gòn bên sông Sài Gòn.',
    'tourism',
    '720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. Hồ Chí Minh',
    'HCM',
    ST_SetSRID(ST_MakePoint(106.7218, 10.7951), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
    2150,
    4.9,
    TRUE
),
(
    'b2222222-2222-2222-2222-222222222202',
    'Phố Đi Bộ Nguyễn Huệ',
    'pho-di-bo-nguyen-hue',
    'Tuyến phố đi bộ trung tâm nhộn nhịp về đêm, điểm hẹn check-in của giới trẻ Sài Gòn.',
    'entertainment',
    'Đường Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'HCM',
    ST_SetSRID(ST_MakePoint(106.7029, 10.7745), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1570783492751-4c4c23573c73?auto=format&fit=crop&w=800&q=80',
    1820,
    4.8,
    TRUE
),
(
    'b2222222-2222-2222-2222-222222222203',
    'The Workshop Coffee',
    'the-workshop-coffee',
    'Quán cà phê specialty đầu tiên tại Sài Gòn với không gian loft công nghiệp thoáng đãng.',
    'coffee',
    '27 Ngô Đức Kế, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    'HCM',
    ST_SetSRID(ST_MakePoint(106.7050, 10.7725), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    780,
    4.7,
    TRUE
),

-- ------------------------------------------------------------------------------
-- ĐÀ NẴNG
-- ------------------------------------------------------------------------------
(
    'c3333333-3333-3333-3333-333333333301',
    'Cầu Rồng Đà Nẵng',
    'cau-rong-da-nang',
    'Biểu tượng của thành phố Đà Nẵng với kiến trúc rồng vàng vươn ra biển, phun lửa và nước vào cuối tuần.',
    'tourism',
    'Đường Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng',
    'DNA',
    ST_SetSRID(ST_MakePoint(108.2272, 16.0610), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    1680,
    4.9,
    TRUE
),
(
    'c3333333-3333-3333-3333-333333333302',
    'Bãi Biển Mỹ Khê',
    'bai-bien-my-khe',
    'Một trong sáu bãi biển đẹp nhất hành tinh do tạp chí Forbes bình chọn.',
    'park',
    'Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
    'DNA',
    ST_SetSRID(ST_MakePoint(108.2471, 16.0592), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    1430,
    4.9,
    TRUE
),

-- ------------------------------------------------------------------------------
-- HUẾ
-- ------------------------------------------------------------------------------
(
    'd4444444-4444-4444-4444-444444444401',
    'Đại Nội Huế (Hoàng Thành)',
    'dai-noi-hue',
    'Quần thể di tích Cố đô Huế được UNESCO công nhận là Di sản Văn hóa Thế giới.',
    'culture',
    'Đường 23 Tháng 8, Thuận Hòa, TP. Huế, Thừa Thiên Huế',
    'TTH',
    ST_SetSRID(ST_MakePoint(107.5786, 16.4673), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1584448141569-69f342da535c?auto=format&fit=crop&w=800&q=80',
    1320,
    4.9,
    TRUE
),
(
    'd4444444-4444-4444-4444-444444444402',
    'Cà Phê Muối Đặng Thái Thân',
    'ca-phe-muoi-hue',
    'Địa điểm tiên phong với món cà phê muối béo ngậy đặc sản cố đô.',
    'coffee',
    '10 Đặng Thái Thân, Thuận Hòa, TP. Huế, Thừa Thiên Huế',
    'TTH',
    ST_SetSRID(ST_MakePoint(107.5755, 16.4715), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    640,
    4.8,
    TRUE
),

-- ------------------------------------------------------------------------------
-- QUẢNG NGÃI
-- ------------------------------------------------------------------------------
(
    'e5555555-5555-5555-5555-555555555501',
    'Núi Thiên Ấn & Chùa Thiên Ấn',
    'nui-thien-an-quang-ngai',
    'Thắng cảnh đệ nhất của vùng đất Quảng Ngãi, ngắm toàn cảnh dòng sông Trà Khúc hiền hòa.',
    'tourism',
    'Xã Tịnh Ấn Đông, TP. Quảng Ngãi, Tỉnh Quảng Ngãi',
    'QNG',
    ST_SetSRID(ST_MakePoint(108.8250, 15.1380), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    510,
    4.8,
    TRUE
),
(
    'e5555555-5555-5555-5555-555555555502',
    'Cổng Tò Vò (Đảo Lý Sơn)',
    'cong-to-vo-ly-son',
    'Kiệt tác vòm đá nham thạch tự nhiên tuyệt đẹp đón hoàng hôn trên đảo ngọc Lý Sơn, Quảng Ngãi.',
    'tourism',
    'Thôn Tây, Huyện Lý Sơn, Tỉnh Quảng Ngãi',
    'QNG',
    ST_SetSRID(ST_MakePoint(109.1120, 15.3780), 4326)::geography,
    'CITYVERSE',
    'verified',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80',
    980,
    4.9,
    TRUE
)
ON CONFLICT (id) DO NOTHING;
