// Điện thoại: cuộn xuống để đọc thì thanh trên và thanh dưới lùi ra khỏi màn
// hình, cuộn lên một chút thì hiện lại. Màn hình điện thoại đã bị thanh của
// trình duyệt chiếm hai đầu, nên lúc đọc chỉ để lại chữ.

export interface TrangThaiCuon {
  /** Vị trí cuộn làm mốc để so lần sau */
  y: number;
  /** Hai thanh đang ẩn */
  an: boolean;
}

/** Cuộn ít hơn chừng này thì bỏ qua — ngón tay rung nhẹ không làm thanh nháy. */
export const NGUONG_CUON = 8;

/** Còn ở gần đầu trang thì thanh luôn hiện. */
export const VUNG_DINH = 64;

export const BAT_DAU_CUON: TrangThaiCuon = { y: 0, an: false };

/**
 * Trạng thái mới sau khi trang cuộn tới `y`.
 * `cuoiTrang`: đã chạm đáy — hiện lại thanh để bấm sang bài khác.
 */
export function capNhatCuon(truoc: TrangThaiCuon, y: number, cuoiTrang: boolean): TrangThaiCuon {
  if (y <= VUNG_DINH || cuoiTrang) return { y, an: false };
  const lech = y - truoc.y;
  // Giữ nguyên mốc cũ để nhiều lần cuộn chậm cộng dồn lại vẫn vượt ngưỡng
  if (Math.abs(lech) < NGUONG_CUON) return truoc;
  return { y, an: lech > 0 };
}
