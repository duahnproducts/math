// Schema nội dung (docs/tech_stack.md, mục 5). Khai báo đầu file sai thì build báo lỗi.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const mon = z.enum(['giai-tich', 'dai-so', 'vi-mo']);
const soMuc = z.string().regex(/^\d+\.\d+$/, 'Số hiệu mục phải có dạng "1.3"');
const soBaiTap = z.string().regex(/^\d+\.\d+\.\d+$/, 'Số hiệu bài tập phải có dạng "1.2.5"');
const maKhoi = z
  .string()
  .regex(/^(dinh-nghia|dinh-ly|bo-de|he-qua|tien-de|vi-du)-[a-z0-9.-]+$/, 'can_dung ghi loại kèm số hiệu, ví dụ "dinh-ly-1.4.3"');

/** Thông tin môn học và danh sách chương: content/<mon>/mon.json */
const monHoc = defineCollection({
  loader: glob({ base: './content', pattern: '*/mon.json' }),
  schema: z.object({
    ten: z.string(),
    ten_en: z.string(),
    thu_tu: z.number(),
    mo_ta: z.string(),
    giao_trinh: z.string(),
    giay_phep: z.string(),
    /** Giải tích (sách có bản quyền) → 'theo-sach'; Đại số, Vi mô (CC BY-NC-SA) → 'dich-nguyen-van' */
    loai_sach: z.enum(['dich-nguyen-van', 'theo-sach']),
    chuong: z.array(
      z.object({
        so: z.number().int().positive(),
        ten: z.string(),
        ten_en: z.string(),
        muc: z.array(z.object({ so: soMuc, ten: z.string() })).default([]),
        /** Ghi chú khi chương chưa có trên web, ví dụ "Đã có bản PDF, chưa chuyển lên web" */
        ghi_chu: z.string().optional(),
        /** Tài liệu tự soạn cho tải về — không bao giờ là sách gốc */
        tai_ve: z
          .array(z.object({ ten: z.string(), tep: z.string().regex(/\.pdf$/), mo_ta: z.string() }))
          .default([]),
      }),
    ),
  }),
});

/** Bài giảng 8 mục: content/<mon>/chuong-N/giang-day/bai-K.mdx */
const giangDay = defineCollection({
  loader: glob({ base: './content', pattern: '*/chuong-*/giang-day/*.mdx' }),
  schema: z.object({
    mon,
    chuong: z.number().int().positive(),
    bai: z.number().int().positive(),
    tieu_de: z.string(),
    /** Ý tưởng trong 1 câu — hiện trên thẻ bài ở trang chương */
    y_tuong: z.string(),
    /** Các mục § bài này phủ, ví dụ ["1.3", "1.4"] */
    phu_muc: z.array(soMuc).default([]),
  }),
});

/** Phần bám theo sách: content/<mon>/chuong-N/sach/1-3.mdx */
const sach = defineCollection({
  loader: glob({ base: './content', pattern: '*/chuong-*/sach/*.mdx' }),
  schema: z.object({
    mon,
    chuong: z.number().int().positive(),
    muc: soMuc,
    tieu_de: z.string(),
    tieu_de_en: z.string(),
    loai: z.enum(['dich-nguyen-van', 'theo-sach']),
    /** Ghi công và giấy phép — bắt buộc */
    nguon: z.string().min(10, 'Mục § nào cũng phải ghi nguồn và giấy phép'),
  }),
});

/** Bài tập: content/<mon>/chuong-N/bai-tap/1-2-5.mdx */
const baiTap = defineCollection({
  loader: glob({ base: './content', pattern: '*/chuong-*/bai-tap/*.mdx' }),
  schema: z.object({
    so: soBaiTap,
    muc: soMuc,
    do_kho: z.enum(['de', 'vua', 'kho']),
    nen_lam: z.boolean().default(false),
    tieu_de: z.string().optional(),
    can_dung: z.array(maKhoi).default([]),
  }),
});

/** Bảng thuật ngữ Anh – Việt: content/<mon>/thuat-ngu.json */
const thuatNgu = defineCollection({
  loader: glob({ base: './content', pattern: '*/thuat-ngu.json' }),
  schema: z.object({
    thuat_ngu: z.array(
      z.object({
        id: z.string().regex(/^[a-z0-9-]+$/),
        en: z.string(),
        vi: z.string(),
        giai_thich: z.string().optional(),
      }),
    ),
  }),
});

export const collections = { monHoc, giangDay, sach, baiTap, thuatNgu };
