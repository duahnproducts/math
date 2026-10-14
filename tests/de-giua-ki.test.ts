import { describe, expect, it } from 'vitest';
import { DE_GIUA_KI, THOI_GIAN_THI, dinhDangGio, docBaiThi, giayConLai } from '../src/lib/de-giua-ki';
import { dinhThuc, nhanMaTran, nhanVector } from '../src/lib/ma-tran';
import { mdSangHtml } from '../src/lib/tu-tao/hien-thi';
import { taoDuongDan } from '../src/lib/duong-dan';

describe('đề giữa kì Đại số Chương 1–3', () => {
  it('6 câu, đúng 10 điểm, 60 phút; mọi câu có lời giải và thang điểm khớp', () => {
    expect(DE_GIUA_KI).toHaveLength(6);
    expect(DE_GIUA_KI.reduce((s,c) => s+c.diem,0)).toBe(10);
    expect(DE_GIUA_KI.reduce((s,c) => s+c.phut,0)).toBe(60);
    for (const c of DE_GIUA_KI) {
      expect(c.cham.reduce((s,y) => s+y.diem,0)).toBe(c.diem);
      expect(c.loiGiai.length).toBeGreaterThan(400);
      for (const md of [c.de, c.loiGiai]) expect(mdSangHtml(md)).not.toContain('katex-error');
    }
    expect(taoDuongDan('/math/').giuaKi('dai-so')).toBe('/math/dai-so/giua-ki/');
  });
  it('hệ có tham số: công thức nghiệm thỏa cả ba phương trình', () => {
    for (const [a,b] of [[2,9],[-3,11],[.5,-2],[0,5]]) {
      for (const t of a === 0 ? [-4,0,3] : [(b-5)/a]) {
        const got = nhanVector([[1,1,1],[1,2,3],[2,3,a+4]], [1+t,1-2*t,t]);
        got.forEach((v,i) => expect(v).toBeCloseTo([2,3,b][i]));
      }
    }
  });
  it('LU, nghịch đảo, nghiệm và phần bù đại số đúng', () => {
    const B = [[2,1],[4,3]], inverse = [[1.5,-.5],[-2,1]];
    expect(nhanMaTran([[1,0],[2,1]],[[2,1],[0,1]])).toEqual(B);
    expect(nhanMaTran(B,inverse)).toEqual([[1,0],[0,1]]);
    expect(nhanVector(inverse,[5,11])).toEqual([2,1]);
    expect(nhanVector(B,[2,1])).toEqual([5,11]);
    expect(-dinhThuc([[0,1],[2,1]])).toBe(2);
    expect(dinhThuc([[1,2,0],[0,3,1],[2,0,1]])).toBeCloseTo(7);
    expect(dinhThuc([[2,0,1],[0,3,1],[1,2,0]])).toBeCloseTo(-7);
  });
  it('chéo hóa và công thức lũy thừa, động lực đúng nhiều bước', () => {
    const A = [[4,1],[2,3]], P = [[1,1],[1,-2]], D = [[5,0],[0,2]];
    expect(nhanMaTran(A,P)).toEqual(nhanMaTran(P,D));
    const inv = [[2/3,1/3],[1/3,-1/3]];
    nhanMaTran(P,inv).flat().forEach((v,i) => expect(v).toBeCloseTo([1,0,0,1][i]));
    let power = [[1,0],[0,1]], state = [2,-1];
    for (let n=0; n<7; n++) {
      const f=5**n, g=2**n;
      const formula = [[(2*f+g)/3,(f-g)/3],[(2*f-2*g)/3,(f+2*g)/3]];
      power.flat().forEach((v,i) => expect(v).toBeCloseTo(formula.flat()[i]));
      expect(state).toEqual([f+g,f-2*g]);
      power = nhanMaTran(A,power); state = nhanVector(A,state);
    }
  });
  it('truy hồi đúng cả hai điều kiện đầu và chuyển trạng thái', () => {
    const u = (n:number) => 1+2**n;
    expect([u(0),u(1)]).toEqual([2,3]);
    for (let n=0;n<10;n++) {
      expect(3*u(n+1)-2*u(n)).toBe(u(n+2));
      expect(nhanVector([[3,-2],[1,0]],[u(n+1),u(n)])).toEqual([u(n+2),u(n+1)]);
    }
  });
});
describe('đồng hồ và khôi phục bài thi', () => {
  it('tính theo mốc thời gian thật, hết giờ không âm', () => {
    const start=10000;
    expect(giayConLai(start,start)).toBe(3600);
    expect(giayConLai(start,start+61000)).toBe(3539);
    expect(giayConLai(start,start+THOI_GIAN_THI+1)).toBe(0);
    expect(dinhDangGio(3600)).toBe('60:00');
    expect(dinhDangGio(61)).toBe('01:01');
    expect(dinhDangGio(0)).toBe('00:00');
  });
  it('khôi phục hợp lệ, bỏ dữ liệu hỏng hoặc sai kiểu', () => {
    const saved={batDau:12345,ketThuc:false,baiLam:DE_GIUA_KI.map(() => 'x=1')};
    expect(docBaiThi(JSON.stringify(saved))).toEqual(saved);
    for (const raw of [null,'{','null','{}',JSON.stringify({...saved,batDau:'x'}),JSON.stringify({...saved,baiLam:[3]})]) {
      expect(docBaiThi(raw)).toEqual({batDau:null,ketThuc:false,baiLam:DE_GIUA_KI.map(() => '')});
    }
  });
});
