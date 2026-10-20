import {
  normalizeVietnamese,
  matchesVietnameseSearch,
  slugifyVietnamese,
} from '../utils/vietnamese';

describe('Vietnamese Text Processing & Search', () => {
  test('normalizeVietnamese removes diacritics and tones correctly', () => {
    expect(normalizeVietnamese('Hà Nội')).toBe('ha noi');
    expect(normalizeVietnamese('TP. Hồ Chí Minh')).toBe('tp. ho chi minh');
    expect(normalizeVietnamese('Đà Nẵng')).toBe('da nang');
    expect(normalizeVietnamese('Quảng Ngãi')).toBe('quang ngai');
    expect(normalizeVietnamese('Cà phê trứng Bát Đàn')).toBe('ca phe trung bat dan');
  });

  test('matchesVietnameseSearch supports non-accent search queries', () => {
    expect(matchesVietnameseSearch('Hồ Hoàn Kiếm (Hồ Gươm)', 'ho guom')).toBe(true);
    expect(matchesVietnameseSearch('Café Giảng (Cà Phê Trứng)', 'ca phe')).toBe(true);
    expect(matchesVietnameseSearch('Phố Đi Bộ Nguyễn Huệ', 'nguyen hue')).toBe(true);
    expect(matchesVietnameseSearch('Cầu Rồng Đà Nẵng', 'cau rong')).toBe(true);
    expect(matchesVietnameseSearch('Núi Thiên Ấn', 'thien an')).toBe(true);
    expect(matchesVietnameseSearch('Đại Nội Huế', 'saigon')).toBe(false);
  });

  test('slugifyVietnamese generates clean URL slugs', () => {
    expect(slugifyVietnamese('Hồ Hoàn Kiếm')).toBe('ho-hoan-kiem');
    expect(slugifyVietnamese('Landmark 81 TP.HCM')).toBe('landmark-81-tphcm');
    expect(slugifyVietnamese('Cầu Rồng Đà Nẵng')).toBe('cau-rong-da-nang');
  });
});
