import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compile, createProcessor } from '@mdx-js/mdx';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { expect, test } from 'vitest';
import { CAN_CU } from '../src/lib/can-cu/danh-muc';
import rehypeCanCu, { themCanCu, timLanApDung, tachCau, type Nut } from '../src/lib/can-cu/chu-thich';
import { mdHuongDanSangHtml, mdSangHtml, baiGiangSangHtml } from '../src/lib/tu-tao/hien-thi';
import { baiMau } from './fixtures/tu-tao';
import { LOI_NHAC_GIA_SU } from '../src/lib/gia-su';
import { LOI_NHAC_HE_THONG } from '../src/lib/tu-tao/loi-nhac';
import { YEU_CAU_CAN_CU } from '../src/lib/can-cu/loi-nhac';
import { DE_GIUA_KI } from '../src/lib/de-giua-ki';

const ids=(s:string,mon?:string)=>timLanApDung(s,{mon}).flatMap(u=>u.canCu.map(r=>r.ma));
function visit(n:Nut,fn:(n:Nut)=>void){fn(n);n.children?.forEach(c=>visit(c,fn));}

test('danh mục không trùng mã; công thức và điều kiện đều dựng được',()=>{
  expect(new Set(CAN_CU.map(r=>r.ma)).size).toBe(CAN_CU.length);
  for(const r of CAN_CU){
    expect(r.ten.length,r.ma).toBeGreaterThan(5);
    expect(r.dieuKien.length,r.ma).toBeGreaterThan(20);
    expect(r.mucDich.length,r.ma).toBeGreaterThan(20);
    expect(mdSangHtml(r.phatBieu+'\n\n'+r.dieuKien),r.ma).not.toContain('katex-error');
  }
});

test('nhận căn cứ cụ thể, tránh các từ giống nhau nhưng khác nghĩa',()=>{
  expect(ids('Dùng bất đẳng thức tam giác $|a+b|\\le |a|+|b|$.','giai-tich')).toContain('tam-giac');
  expect(ids('Dùng tiêu chuẩn Cauchy cho đuôi dãy.','giai-tich')).toContain('cauchy');
  expect(ids('Dùng Cauchy–Schwarz cho hai vector.','giai-tich')).toContain('cauchy-schwarz');
  expect(ids('Dùng Cauchy–Schwarz cho hai vector.','giai-tich')).not.toContain('cauchy');
  expect(ids('Cơ sở quy nạp là n=1.','dai-so')).not.toContain('co-so');
  expect(ids('Giải hệ tam giác trên bằng thế ngược.','dai-so')).not.toContain('tam-giac');
  expect(ids('Giải hệ tuyến tính bằng phép khử.','dai-so')).not.toContain('tuyen-tinh');
  expect(ids('Dùng $Ly=b$ rồi $Ux=y$ với L, U đã có, không khử lại A.','dai-so')).not.toContain('phep-hang');
  expect(ids('Dùng $Ly=b$ rồi $Ux=y$ với L, U đã có, không khử lại A.','dai-so')).toContain('lu');
  expect(ids('Dùng định nghĩa sup để chọn $s>M-\\varepsilon$.','giai-tich')).not.toContain('epsilon-n');
  expect(ids('Xuất khẩu và nhập khẩu nối các thị trường.','vi-mo')).not.toContain('gdp');
  expect(ids('Dùng $\\det(A-\\lambda I)=0$ để tìm trị riêng.','dai-so')).toContain('tri-rieng');
  expect(ids('Dùng $\\det(A-\\lambda I)=0$ để tìm trị riêng.','dai-so')).not.toContain('dinh-thuc-khai-trien');
  expect(ids('Không dùng tiêu chuẩn tích phân khi thiếu tính giảm.','giai-tich')).toEqual([]);
});

test('ghi lại từng lần, tách câu mà không phá công thức, thập phân hoặc số định lý',()=>{
  const md='Dùng tam giác lần đầu: $|x+y|\\le|x|+|y|$.\n\nSau đó dùng tam giác lần nữa để chặn sai số.';
  const html=mdHuongDanSangHtml(md,{mon:'giai-tich'});
  expect(html.match(/data-can-cu-ma="tam-giac"/g)).toHaveLength(2);
  expect(html).toContain('Phát biểu / công thức:');
  expect(html).toContain('Điều kiện:');
  expect(html).toContain('Vì sao dùng:');
  expect(html).not.toContain('katex-error');
  expect(tachCau('Theo Định lý 2.3.2, dùng $x=3.5$. Sau đó thay $x$ vào.')).toHaveLength(2);
  expect(mdHuongDanSangHtml('Dùng phép thế:\n\n$$\nx=3\\tag{2.7}\n$$')).not.toContain('katex-error');
});

test('đề, dữ kiện và bản dịch không bị gắn căn cứ; gợi ý và lời giải có căn cứ tại chỗ',async()=>{
  const source=`<De>\n\nDùng quy nạp để chứng minh $S_n=n^2$.\n\n</De>\n\n<Slide>\n\nDùng quy nạp trong sách gốc.\n\n</Slide>\n\n<GoiY so={1}>\n\nDùng quy nạp: kiểm tra bước đầu và bước chuyển.\n\n</GoiY>\n\n<LoiGiai>\n\n**Bước 1. Đọc dữ kiện.**\n\nCho $a_n=n^2$.\n\n**Bước 3. Chọn kiến thức.**\n\nDùng quy nạp.\n\n</LoiGiai>`;
  let tree:Nut|undefined;
  await compile(source,{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeCanCu,{mon:'giai-tich'}],()=>t=>{tree=t as Nut;} ]});
  let count=0;
  visit(tree!,n=>{if(n.properties?.['data-can-cu'])count++;if(n.name==='De'||n.name==='Slide')expect(JSON.stringify(n)).not.toContain('data-can-cu');});
  expect(count).toBe(2);
  const once=JSON.stringify(tree);
  themCanCu(tree!,{mon:'giai-tich'});
  expect(JSON.stringify(tree)).toBe(once);
});

test('gợi ý ngắn nằm cùng đoạn với đề chỉ nhận căn cứ của phần sau nhãn Gợi ý',async()=>{
  let tree:Nut|undefined;
  await compile('Đề yêu cầu quy nạp. **Gợi ý:** dùng tam giác để chặn khoảng cách.',{rehypePlugins:[rehypeCanCu,()=>t=>{tree=t as Nut;} ]});
  const json=JSON.stringify(tree);
  expect(json).toContain('tam-giac');
  expect(json).not.toContain('"quy-nap"');
});

test('lời giải dạng danh sách và bảng giữ HTML hợp lệ và có căn cứ ngay trong từng mục',()=>{
  const html=mdHuongDanSangHtml('- Dùng quy nạp để chuyển từ n sang n+1.\n- Dùng tam giác để chặn tổng.\n\n| Bước | Cách làm |\n|---|---|\n| 1 | Dùng phản chứng. |');
  expect(html).toMatch(/<li>Dùng quy nạp[^]*?<details[^]*?<\/details><\/li>/);
  expect(html).toMatch(/<td>Dùng phản chứng\.<details[^]*?<\/details><\/td>/);
  expect(html.match(/data-can-cu[ >]/g)).toHaveLength(3);
});

test('MDX gợi ý viết trên một dòng vẫn có căn cứ cho công thức nội tuyến',async()=>{
  let tree:Nut|undefined;
  await compile('<GoiYNho>Dùng tam giác để chặn $|a+b|$.</GoiYNho>',{remarkPlugins:[remarkMath],rehypePlugins:[[rehypeCanCu,{dangMdx:true}],()=>t=>{tree=t as Nut;} ]});
  expect(JSON.stringify(tree)).toContain('CanCuApDung');
  expect(JSON.stringify(tree)).toContain('tam-giac');
});

test('mọi đáp án giữa kỳ dùng căn cứ; đề và thang điểm vẫn tách riêng',()=>{
  for(const question of DE_GIUA_KI){
    const html=mdHuongDanSangHtml(question.loiGiai,{mon:'dai-so'});
    expect(html,question.ten).toContain('data-can-cu');
    expect(html,question.ten).not.toContain('katex-error');
    expect(mdSangHtml(question.de)).not.toContain('data-can-cu');
  }
});

test('bài tự tạo dùng công thức đã khai báo và điều kiện của chính bài',()=>{
  const b=baiMau(1),html=baiGiangSangHtml(b,'Kinh tế vĩ mô');
  expect(html).toContain('data-can-cu-ma="bai-tu-tao-1"');
  const start=html.indexOf('Bài 1.1'),end=html.indexOf('Bài 1.2');
  expect(html.slice(start,end)).toContain('data-can-cu');
  expect(html).not.toContain('katex-error');
});

test('dữ liệu không tin cậy vẫn được lọc trước khi thêm chú thích; công thức/tên không trở thành HTML',()=>{
  const html=mdHuongDanSangHtml('Dùng tam giác $|a+b|\\le|a|+|b|$. <script>alert(1)</script> ![x](https://example.com/a.png)',{
    mon:'giai-tich',congThuc:[{ten:'<img onerror=alert(1)>',bieu_thuc:'S=a^2',khi_nao_dung:'<script>bad()</script>'}],
  });
  for(const bad of ['<script','<img','onerror=','javascript:'])expect(html).not.toContain(bad);
  expect(html).toContain('data-can-cu');
});

test('cùng yêu cầu cho gia sư và bài tự tạo: từng lần, phát biểu, điều kiện và không bịa số hiệu',()=>{
  expect(LOI_NHAC_GIA_SU).toContain(YEU_CAU_CAN_CU);
  expect(LOI_NHAC_HE_THONG).toContain(YEU_CAU_CAN_CU);
});

test('máy chủ gia sư nạp được lời nhắc bằng Node trực tiếp như lệnh chat:serve',()=>{
  const result=spawnSync(process.execPath,['--experimental-strip-types','--input-type=module','-e',
    "import('./src/lib/gia-su.ts').then(m=>{if(!m.LOI_NHAC_GIA_SU.includes('NGAY TẠI BƯỚC ĐÓ'))process.exit(1);})"],
    {encoding:'utf8',windowsHide:true});
  expect(result.status,result.stderr||result.error?.message).toBe(0);
});

test('bốn trang thảo luận có đủ hai tầng gợi ý cho cả sáu câu, ngoài bản dịch Slide',()=>{
  const files=['1/sach/1-1','1/sach/1-4','2/sach/2-1','3/sach/3-3'];
  let count=0;
  for(const file of files){
    const source=readFileSync(`content/vi-mo/chuong-${file}.mdx`,'utf8');
    for(const m of source.matchAll(/<div data-loi-giai-thao-luan="\d+">([\s\S]*?)<\/div>/g)){
      expect(m[1]).toContain('<GoiY so={1}>');expect(m[1]).toContain('<GoiY so={2}>');count++;
    }
    expect(source).not.toMatch(/<Slide[^>]*>(?:(?!<\/Slide>)[\s\S])*<GoiY/);
  }
  expect(count).toBe(6);
});

function allMdx(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?allMdx(join(dir,d.name)):d.name.endsWith('.mdx')?[join(dir,d.name)]:[]);}

test('quét toàn bộ nội dung: mọi trang bài tập có chú thích, đủ các dạng và cả ba môn',async()=>{
  const statistics:Record<string,number>={};
  const parser=createProcessor({remarkPlugins:[remarkMath]});
  const processor=unified().use(remarkRehype,{passThrough:['mdxJsxFlowElement','mdxJsxTextElement','mdxjsEsm','mdxFlowExpression','mdxTextExpression']}).use(rehypeCanCu,{dangMdx:true});
  for(const file of allMdx('content')){
    const source=readFileSync(file,'utf8');
    if(!/<(?:GoiY|GoiYNho|LoiGiai)\b|\*\*Gợi ý/.test(source))continue;
    let count=0;
    const vfile={value:source.replace(/^---[\s\S]*?---\s*/,''),path:join(process.cwd(),file)};
    const tree=processor.runSync(parser.parse(vfile),vfile);
    visit(tree as Nut,n=>{if(n.name==='CanCuApDung')count++;});
    const mon=file.split(/[\\/]/)[1];
    statistics[mon]=(statistics[mon]??0)+count;
    if(file.includes('bai-tap'))expect(count,file).toBeGreaterThan(0);
  }
  for(const mon of ['giai-tich','dai-so','vi-mo'])expect(statistics[mon],mon).toBeGreaterThan(0);
},120000);
