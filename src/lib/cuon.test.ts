import { describe, expect, it } from 'vitest';
import { BAT_DAU_CUON, NGUONG_CUON, VUNG_DINH, capNhatCuon, type TrangThaiCuon } from './cuon';

/** Cuộn lần lượt qua các vị trí, trả về trạng thái cuối. */
function cuonQua(cacY: number[], tt: TrangThaiCuon = BAT_DAU_CUON): TrangThaiCuon {
  return cacY.reduce((t, y) => capNhatCuon(t, y, false), tt);
}

describe('ẩn hai thanh khi cuộn', () => {
  it('cuộn xuống quá đầu trang thì ẩn', () => {
    expect(cuonQua([200, 400]).an).toBe(true);
  });

  it('cuộn lên thì hiện lại', () => {
    expect(cuonQua([200, 600, 500]).an).toBe(false);
  });

  it('còn ở gần đầu trang thì luôn hiện', () => {
    expect(cuonQua([VUNG_DINH]).an).toBe(false);
    expect(capNhatCuon({ y: 500, an: true }, 10, false).an).toBe(false);
  });

  it('iOS kéo nảy quá đầu trang (y âm) vẫn hiện', () => {
    expect(capNhatCuon({ y: 300, an: true }, -40, false).an).toBe(false);
  });

  it('chạm đáy trang thì hiện, kể cả đang cuộn xuống', () => {
    expect(capNhatCuon({ y: 1000, an: true }, 1200, true).an).toBe(false);
  });

  it('rung nhẹ dưới ngưỡng thì giữ nguyên, không nháy', () => {
    const an: TrangThaiCuon = { y: 500, an: true };
    expect(capNhatCuon(an, 500 - (NGUONG_CUON - 1), false)).toBe(an);
    const hien: TrangThaiCuon = { y: 500, an: false };
    expect(capNhatCuon(hien, 500 + (NGUONG_CUON - 1), false)).toBe(hien);
  });

  it('nhiều lần cuộn chậm cộng dồn lại vẫn đủ để ẩn', () => {
    const buoc = NGUONG_CUON - 3;
    const cacY = Array.from({ length: 6 }, (_, i) => 300 + (i + 1) * buoc);
    expect(cuonQua(cacY, { y: 300, an: false }).an).toBe(true);
  });
});
