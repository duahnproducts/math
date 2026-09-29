import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { catTrang, moPdf, sangBase64 } from './pdf';

async function taoPdf(soTrang: number): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (let i = 1; i <= soTrang; i++) doc.addPage([200 + i, 300]); // chiều rộng khác nhau để nhận ra trang
  return doc.save();
}

describe('pdf', () => {
  it('đếm trang và cắt đúng khoảng trang', async () => {
    const nguon = await moPdf(await taoPdf(10));
    expect(nguon.getPageCount()).toBe(10);
    const cat = await moPdf(await catTrang(nguon, 3, 5));
    expect(cat.getPageCount()).toBe(3);
    expect(cat.getPages().map((p) => p.getWidth())).toEqual([203, 204, 205]);
  });

  it('khoảng trang ngoài file thì báo lỗi', async () => {
    const nguon = await moPdf(await taoPdf(4));
    await expect(catTrang(nguon, 3, 9)).rejects.toThrow(/ngoài file \(4 trang\)/);
  });

  it('file không phải PDF thì báo lỗi tiếng Việt', async () => {
    await expect(moPdf(new TextEncoder().encode('không phải pdf'))).rejects.toThrow(/Không đọc được file này/);
  });

  it('base64 đúng với cả dữ liệu lớn hơn một khúc', () => {
    const byte = new Uint8Array(100_000).map((_, i) => i % 256);
    expect(sangBase64(byte)).toBe(Buffer.from(byte).toString('base64'));
    expect(sangBase64(new Uint8Array())).toBe('');
  });
});
