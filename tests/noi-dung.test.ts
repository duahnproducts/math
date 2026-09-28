// Test dữ liệu nội dung (docs/tech_stack.md, mục 8): đọc thẳng file trong content/,
// không phụ thuộc runtime Astro. Mọi quy tắc nằm ở src/lib/noi-dung.ts.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as docYaml } from 'yaml';
import { describe, expect, it } from 'vitest';
import { soSangSlug } from '../src/lib/duong-dan';
import {
  CAC_MON,
  kiemTraChuong,
  trichThuatNgu,
  type DuLieuChuong,
  type MucTrongChuong,
  type ThongTinBaiGiang,
  type ThongTinBaiTap,
  type ThongTinMucSach,
} from '../src/lib/noi-dung';

const GOC = fileURLToPath(new URL('..', import.meta.url));
const NOI_DUNG = join(GOC, 'content');

function tachFrontmatter(vanBan: string): { du: Record<string, unknown>; than: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(vanBan);
  if (!m) throw new Error('Thiếu khai báo đầu file (frontmatter)');
  return { du: docYaml(m[1]) as Record<string, unknown>, than: m[2] };
}

function docMdx(thuMuc: string) {
  if (!existsSync(thuMuc)) return [];
  return readdirSync(thuMuc)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const tep = join(thuMuc, f);
      const { du, than } = tachFrontmatter(readFileSync(tep, 'utf8'));
      return { tep: relative(GOC, tep).replaceAll('\\', '/'), ten: basename(f, '.mdx'), du, noiDung: than };
    });
}

interface ChuongJson {
  so: number;
  ten: string;
  muc?: MucTrongChuong[];
  tai_ve?: { tep: string }[];
}

const cacMon = readdirSync(NOI_DUNG).filter((d) => statSync(join(NOI_DUNG, d)).isDirectory());
const monJson = Object.fromEntries(
  cacMon.map((mon) => [mon, JSON.parse(readFileSync(join(NOI_DUNG, mon, 'mon.json'), 'utf8'))]),
) as Record<string, { giao_trinh: string; giay_phep: string; loai_sach: string; chuong: ChuongJson[] }>;

describe('thư mục môn học', () => {
  it('chỉ có các môn đã khai báo', () => {
    for (const mon of cacMon) expect(CAC_MON).toContain(mon);
  });

  it.each(cacMon)('%s: có giáo trình và giấy phép (ghi công)', (mon) => {
    expect(monJson[mon].giao_trinh.length).toBeGreaterThan(10);
    expect(monJson[mon].giay_phep.length).toBeGreaterThan(10);
  });

  it.each(cacMon)('%s: thư mục chương nào cũng được khai báo trong mon.json', (mon) => {
    const soKhaiBao = new Set(monJson[mon].chuong.map((c) => `chuong-${c.so}`));
    const thuMuc = readdirSync(join(NOI_DUNG, mon)).filter((d) => d.startsWith('chuong-'));
    for (const d of thuMuc) expect(soKhaiBao, `${mon}/${d}`).toContain(d);
  });

  it.each(cacMon)('%s: file tải về có thật và không phải sách gốc', (mon) => {
    for (const c of monJson[mon].chuong) {
      for (const t of c.tai_ve ?? []) {
        expect(existsSync(join(GOC, 'public', 'tai-ve', t.tep)), t.tep).toBe(true);
        expect(t.tep).not.toMatch(/sach|nicholson|microeconomics3e-ch\d+\.pdf/i);
      }
    }
  });
});

// Dữ liệu từng chương có nội dung
type CoTep<T> = T & { tep: string; noiDung: string; ten: string };
interface ChuongKiemTra extends DuLieuChuong {
  thuMuc: string;
  baiGiang: CoTep<ThongTinBaiGiang>[];
  sach: CoTep<ThongTinMucSach>[];
  baiTap: CoTep<ThongTinBaiTap>[];
}

function kemTep<T>(f: ReturnType<typeof docMdx>[number], du: T): CoTep<T> {
  return { ...du, tep: f.tep, noiDung: f.noiDung, ten: f.ten };
}

const cacChuong: ChuongKiemTra[] = [];
for (const mon of cacMon) {
  for (const c of monJson[mon].chuong) {
    const thuMuc = join(NOI_DUNG, mon, `chuong-${c.so}`);
    if (!existsSync(thuMuc)) continue;
    cacChuong.push({
      thuMuc: `${mon}/chuong-${c.so}`,
      mon,
      chuong: c.so,
      cacMuc: c.muc ?? [],
      baiGiang: docMdx(join(thuMuc, 'giang-day')).map((f) => kemTep(f, f.du as unknown as ThongTinBaiGiang)),
      sach: docMdx(join(thuMuc, 'sach')).map((f) => kemTep(f, f.du as unknown as ThongTinMucSach)),
      baiTap: docMdx(join(thuMuc, 'bai-tap')).map((f) =>
        kemTep(f, {
          ...(f.du as unknown as ThongTinBaiTap),
          can_dung: (f.du.can_dung as string[] | undefined) ?? [],
        }),
      ),
    });
  }
}

describe('nội dung các chương', () => {
  it('có ít nhất một chương có nội dung', () => {
    expect(cacChuong.length).toBeGreaterThan(0);
  });

  describe.each(cacChuong.map((c) => [c.thuMuc, c] as const))('%s', (_ten, du) => {
    it('liên kết chéo trỏ tới mục có thật, không trùng số hiệu, có ghi công, bài giảng đủ 8 mục', () => {
      expect(kiemTraChuong(du)).toEqual([]);
    });

    it('tên file khớp số hiệu khai báo', () => {
      for (const b of du.baiGiang) expect(b.ten, b.tep).toBe(`bai-${b.bai}`);
      for (const s of du.sach) expect(s.ten, s.tep).toBe(soSangSlug(s.muc));
      for (const b of du.baiTap) expect(b.ten, b.tep).toBe(soSangSlug(b.so));
    });

    it('bài giảng đánh số liền nhau từ 1', () => {
      const so = du.baiGiang.map((b) => b.bai).sort((a, b) => a - b);
      expect(so).toEqual(so.map((_, i) => i + 1));
    });

    it('mục § đúng loại theo giấy phép của môn', () => {
      const loai = monJson[du.mon].loai_sach;
      for (const s of du.sach) expect(s.loai, s.tep).toBe(loai);
    });
  });
});

describe('thuật ngữ', () => {
  const bang = new Map<string, Set<string>>();
  for (const mon of cacMon) {
    const tep = join(NOI_DUNG, mon, 'thuat-ngu.json');
    if (!existsSync(tep)) continue;
    const ds = JSON.parse(readFileSync(tep, 'utf8')).thuat_ngu as { id: string; en: string; vi: string }[];
    bang.set(mon, new Set(ds.map((t) => t.id)));
    it(`${mon}: mã thuật ngữ không trùng, đủ hai thứ tiếng`, () => {
      expect(new Set(ds.map((t) => t.id)).size).toBe(ds.length);
      for (const t of ds) {
        expect(t.en.length, t.id).toBeGreaterThan(0);
        expect(t.vi.length, t.id).toBeGreaterThan(0);
      }
    });
  }

  it('mọi <ThuatNgu id> trong nội dung đều có trong bảng thuật ngữ', () => {
    const tatCa = new Set([...bang.values()].flatMap((s) => [...s]));
    for (const c of cacChuong) {
      for (const tep of [...c.baiGiang, ...c.sach, ...c.baiTap]) {
        for (const id of trichThuatNgu(tep.noiDung)) expect(tatCa, `${tep.tep}: ${id}`).toContain(id);
      }
    }
  });
});

describe('bản quyền', () => {
  it('không có file PDF sách gốc trong public/', () => {
    const tatCa: string[] = [];
    const duyet = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) duyet(p);
        else tatCa.push(f);
      }
    };
    duyet(join(GOC, 'public'));
    for (const f of tatCa) {
      expect(f).not.toMatch(/^sach\.pdf$|Nicholson|Microeconomics3e-Ch\d\d\.pdf$/i);
    }
  });

  it('Giải tích (sách có bản quyền) không có mục "dịch nguyên văn"', () => {
    for (const c of cacChuong.filter((x) => x.mon === 'giai-tich')) {
      for (const s of c.sach) expect(s.loai).toBe('theo-sach');
    }
  });
});
