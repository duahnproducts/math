// Đọc file PDF và cắt riêng khoảng trang của một chương, ngay trong trình duyệt
// (pdf-lib, không cần máy chủ). Chỉ phần cắt ra mới được gửi cho Claude.
import { EncryptedPDFError, PDFDocument } from 'pdf-lib';

export async function moPdf(duLieu: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(duLieu, { updateMetadata: false });
  } catch (e) {
    if (e instanceof EncryptedPDFError) {
      throw new Error('File PDF này có mật khẩu hoặc bị khoá sao chép, nên không cắt trang được.');
    }
    throw new Error('Không đọc được file này. Hãy chắc rằng đó là file PDF còn nguyên vẹn.');
  }
}

/** Cắt trang [dau, cuoi] (đếm từ 1, tính cả hai đầu) thành một file PDF mới. */
export async function catTrang(nguon: PDFDocument, dau: number, cuoi: number): Promise<Uint8Array> {
  const tong = nguon.getPageCount();
  if (dau < 1 || cuoi > tong || cuoi < dau) throw new Error(`Khoảng trang ${dau}–${cuoi} nằm ngoài file (${tong} trang).`);
  const moi = await PDFDocument.create();
  const chiSo = Array.from({ length: cuoi - dau + 1 }, (_, i) => dau - 1 + i);
  for (const trang of await moi.copyPages(nguon, chiSo)) moi.addPage(trang);
  return moi.save();
}

/** Byte → base64, cắt thành từng khúc để không tràn ngăn xếp với file lớn. */
export function sangBase64(byte: Uint8Array): string {
  const KHUC = 0x8000;
  let nhiPhan = '';
  for (let i = 0; i < byte.length; i += KHUC) {
    nhiPhan += String.fromCharCode(...byte.subarray(i, i + KHUC));
  }
  return btoa(nhiPhan);
}
