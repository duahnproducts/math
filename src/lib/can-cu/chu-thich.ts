import { CAN_CU, chuanHoa, type CanCu } from './danh-muc.ts';
import { unified } from 'unified';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import type { Element, Root } from 'hast';

/** Phần cây HTML/MDX cần dùng, không phụ thuộc DOM hay thư viện trình duyệt. */
export interface Nut {
  type: string;
  tagName?: string;
  name?: string;
  value?: string;
  properties?: Record<string, unknown>;
  data?: Record<string, unknown>;
  attributes?: {type:string;name:string;value:string}[];
  children?: Nut[];
}
export interface TuyChonCanCu {
  /** MDX tự nhận diện các vùng; Markdown của một gợi ý/lời giải dùng toàn văn. */
  toanVan?: boolean;
  mon?: string;
  /** Công thức do bài tự tạo khai báo, lấy nguyên phát biểu và điều kiện đã có. */
  congThuc?: { ten: string; bieu_thuc: string; khi_nao_dung: string }[];
  nguCanh?: string;
  dangMdx?: boolean;
}
export interface LanApDung {
  cau: string;
  canCu: CanCu[];
}

const text = (value: string): Nut => ({type:'text',value});
const el = (tagName: string, children: Nut[], properties: Record<string,unknown>={}): Nut => ({type:'element',tagName,properties,children});
function laMath(n: Nut): boolean {
  return n.tagName==='code' && Array.isArray(n.properties?.className) && n.properties.className.includes('language-math');
}
export function vanBanNut(n: Nut): string {
  if(laMath(n))return '$'+(n.children??[]).map(vanBanNut).join('')+'$';
  return n.value??(n.children??[]).map(vanBanNut).join('');
}

/** Không tách tại dấu chấm trong số định lý, số thập phân hoặc công thức LaTeX. */
export function tachCau(s: string): string[] {
  const math: string[]=[];
  const safe=s.replace(/\$\$[\s\S]*?\$\$|\$[^$]*\$/g,m=>`\uE000${math.push(m)-1}\uE001`);
  return safe.split(/(?<=[.!?;])\s+(?=[A-ZÀ-ỸĐ(])/u).map(part=>part.replace(/\uE000(\d+)\uE001/g,(_,i:string)=>math[Number(i)]).trim()).filter(Boolean);
}

function congThucRieng(options:TuyChonCanCu):CanCu[]{
  return (options.congThuc??[]).filter(c=>c.ten.trim()&&c.bieu_thuc.trim()).map((ct,i)=>({
    ma:`bai-tu-tao-${i+1}`,ten:ct.ten,mon:'chung',mau:/$^/,
    phatBieu:`$${ct.bieu_thuc.trim().replace(/^\$+|\$+$/g,'')}$`,
    dieuKien:ct.khi_nao_dung||'Dùng đúng miền xác định và các giả thiết đã ghi trong bài.',
    mucDich:'Áp dụng công thức do chính bài giảng khai báo ở mục Công thức.',
  }));
}

function coPhepTinh(cau:string):boolean{
  // Một số bài biên soạn cũ dùng ký hiệu Unicode, chưa bọc LaTeX.
  if(/[a-zA-Zα-ω₀-₉][^.!?\n]{0,35}[=≤≥]/u.test(cau))return true;
  const formulas=cau.match(/\$[^$]+\$/g)??[];
  if(formulas.some(f=>/[=<>]|\\(?:le|ge|ne|to)\b/.test(f)))return true;
  return formulas.some(f=>/[=<>]|\\(?:le|ge|ne|to|sum|prod|int|det|frac|sqrt)\b/.test(f))
    && /tinh|the\b|duoc|suy ra|cho ket qua|kiem tra|rut gon|bien doi|chia|nhan|cong|tru\b|bang|thu\b|khai trien|tu .*co/.test(chuanHoa(cau));
}

/** Mỗi câu dùng lại một căn cứ được giữ thành một lần riêng, không gộp theo cả bài. */
export function timLanApDung(s:string,options:TuyChonCanCu={}):LanApDung[]{
  const own=congThucRieng(options);
  return tachCau(s).flatMap(cau=>{
    const normalized=chuanHoa(cau);
    // Đây là câu cấm dùng một công thức, không phải một lần áp dụng nó.
    if(/^(?:khong|dung) (?:duoc |the |nen )?(?:dung|ap dung|su dung)/.test(normalized))return [];
    let rules=CAN_CU.filter(r=>(r.mon==='chung'||r.mon===options.mon)&&r.mau.test(normalized));
    const noElimination=normalized.replace(/khong (?:can |nen |duoc )?khu(?: lai)?[^,;.]*[.!?]?/g,'');
    rules=rules.filter(r=>r.ma!=='phep-hang'||r.mau.test(noElimination));
    for(let i=0;i<own.length;i++){
      const name=chuanHoa(own[i].ten),formula=chuanHoa(own[i].phatBieu.replaceAll('$','')).replace(/\s/g,'');
      const lhs=/^([a-zA-Z]{2,})=/.exec(formula)?.[1];
      const context=chuanHoa(options.nguCanh??'');
      const contextual=/\b(?:cong|tru|nhan|chia|tinh|the|ap dung)\b|nhin dau|dau cua/.test(normalized)
        && (context.includes(name)||(lhs&&context.split(/[^a-z0-9]+/).includes(lhs)));
      if(normalized.includes(name)||(formula.length>4&&normalized.replace(/[\s$]/g,'').includes(formula))||contextual)rules.push(own[i]);
    }
    if(rules.some(r=>r.ma==='luat-ma-tran'))rules=rules.filter(r=>r.ma!=='phan-phoi');
    // ε cũng xuất hiện trong cận tối ưu, metric và tiêu chuẩn Cauchy;
    // không gán định nghĩa giới hạn hữu hạn chỉ vì thấy ký hiệu này.
    if(!/dinh nghia.*(?:gioi han|hoi tu)/.test(normalized)
      && rules.some(r=>['sup-inf','metric','cauchy','limsup','gioi-han-vo-cuc'].includes(r.ma))){
      rules=rules.filter(r=>r.ma!=='epsilon-n');
    }
    if(!rules.length&&coPhepTinh(cau))rules=[CAN_CU.find(r=>r.ma==='dai-so-co-ban')!];
    return rules.length?[{cau,canCu:rules}]:[];
  });
}

/** Các định lý lặp lại ở hàng nghìn bước: dựng công thức của chú thích một lần,
 * sao chép cây an toàn, không gọi lại KaTeX cho cùng một công thức tại mọi bước. */
const boCongThuc=unified().use(rehypeKatex,{strict:'ignore',output:'htmlAndMathml'});
const cacheMath=new Map<string,Nut[]>();
function mathDaDung(tex:string):Nut[]{
  let cached=cacheMath.get(tex);
  if(!cached){
    // Số phương trình của sách (\\tag) chỉ hợp lệ trong chế độ riêng dòng.
    const code=el('code',[text(tex)],{className:['language-math',/\\tag\b/.test(tex)?'math-display':'math-inline']});
    const root=boCongThuc.runSync({type:'root',children:[code as Element]}) as Root;
    cached=root.children as Nut[];
    if(cacheMath.size>=512)cacheMath.delete(cacheMath.keys().next().value!);
    cacheMath.set(tex,cached);
  }
  return structuredClone(cached);
}

/** Các nút công thức được KaTeX xử lý ở bước kế tiếp; văn bản không thành HTML thô. */
function vanBanCoMath(s:string):Nut[]{
  const out:Nut[]=[];
  let start=0;
  for(const m of s.matchAll(/\$([^$]+)\$/g)){
    if(m.index!>start)out.push(text(s.slice(start,m.index)));
    out.push(...mathDaDung(m[1]));
    start=m.index!+m[0].length;
  }
  if(start<s.length)out.push(text(s.slice(start)));
  return out;
}
function dong(nhan:string,value:string):Nut {
  return el('p',[el('strong',[text(nhan+' ')]),...vanBanCoMath(value)]);
}
function chuThich(use:LanApDung):Nut{
  return el('details',[
    el('summary',[text('Dùng: '+use.canCu.map(r=>r.ten).join(' · '))]),
    el('div',[
      dong('Tại câu:',use.cau),
      ...use.canCu.map(r=>el('section',[
        el('p',[el('strong',[text(r.ten)])]),
        dong('Phát biểu / công thức:',r.phatBieu),
        dong('Điều kiện:',r.dieuKien),
        dong('Vì sao dùng:',r.mucDich),
      ],{'data-can-cu-ma':r.ma})),
    ],{className:['noi-dung-can-cu']}),
  ],{className:['can-cu-ap-dung'],'data-can-cu':true});
}

const boHtml=unified().use(rehypeStringify);
/** MDX chỉ biên dịch tên căn cứ; Astro dựng phần chi tiết bằng component dùng chung,
 * tránh biên dịch lại hàng nghìn bản sao cây MathML giống nhau. */
export function canCuSangHtml(ma:string,cau:string):string{
  const requested=new Set(ma.split(','));
  const canCu=CAN_CU.filter(r=>requested.has(r.ma));
  if(!canCu.length)return '';
  return boHtml.stringify({type:'root',children:[chuThich({cau,canCu}) as Element]} as Root);
}
function nutChuThich(use:LanApDung,mdx:boolean):Nut{
  return mdx?{
    type:'mdxJsxFlowElement',name:'CanCuApDung',attributes:[
      {type:'mdxJsxAttribute',name:'ma',value:use.canCu.map(r=>r.ma).join(',')},
      {type:'mdxJsxAttribute',name:'cau',value:use.cau},
    ],children:[],
  }:chuThich(use);
}

interface PhamVi { active:boolean; stepData:boolean; }
const VUNG=new Set(['GoiY','GoiYNho','LoiGiai']);

/** Thêm căn cứ sau đúng đoạn sử dụng; không xử lý lại chú thích do chính hàm này tạo. */
export function themCanCu(cay:Nut,options:TuyChonCanCu={}):void{
  function duyet(parent:Nut,scope:PhamVi):void{
    if(!parent.children)return;
    const output:Nut[]=[];
    let state={...scope};
    for(const node of parent.children){
      if(node.properties?.['data-can-cu']||node.name==='CanCuApDung'||node.name==='Slide'||node.name==='De'){
        output.push(node);continue;
      }
      const tag=node.tagName??node.name??'';
      const plain=vanBanNut(node);
      if(tag==='h2')state={active:/^Ví dụ mẫu/.test(plain),stepData:false};
      const step=/^Bước\s+([1-6])[. —-]\s*(.*)/i.exec(plain.trim());
      if(step&&tag==='p')state.stepData=/đọc dữ kiện|đề cho|cho gì|xác định.*(?:yêu cầu|điều cần|điều phải)|đề hỏi|hỏi gì/i.test(step[2]);

      const component=VUNG.has(tag);
      const nativeHint=tag==='details'&&(node.children??[]).some(c=>(c.tagName??c.name)==='summary'&&/^Gợi ý/.test(vanBanNut(c)));
      // Trong <ViDu>, chỉ bắt đầu từ phần lời giải, không động vào đề ví dụ.
      let childState=component||nativeHint?{active:true,stepData:false}:{...state};
      if(tag==='ViDu')childState={active:false,stepData:false};
      if(tag==='p'&&/^Lời giải[.:]/i.test(plain.trim()))state.active=true;
      const inlineIndex=(node.children??[]).findIndex(c=>c.tagName==='strong'&&/^Gợi ý\s*:/.test(vanBanNut(c)));

      // Danh sách Markdown gọn và ô bảng không có nút <p> bọc ngoài.
      const inlineContainer=(tag==='li'||tag==='td')
        && !(node.children??[]).some(n=>['p','pre','ul','ol','table'].includes(n.tagName??''));
      const isBlock=tag==='p'||tag==='pre'||inlineContainer;
      if(isBlock){
        if(node.data?.canCuDaXet){output.push(node);continue;}
        let target=plain;
        const active=(state.active&&!state.stepData)||inlineIndex>=0;
        if(inlineIndex>=0)target=node.children!.slice(inlineIndex+1).map(vanBanNut).join('');
        output.push(node);
        if(active&&!step){
          node.data={...node.data,canCuDaXet:true};
          let uses=timLanApDung(target,options);
          // Một công thức riêng dòng dùng cách làm vừa nêu ở đoạn ngay trước nó.
          if(tag==='pre'&&!uses.length){
            const previous=output.slice(0,-1).reverse().find(n=>n.tagName==='p');
            if(previous)uses=timLanApDung(vanBanNut(previous)+' '+target,options);
          }
          const notes=uses.map(u=>nutChuThich(u,!!options.dangMdx));
          if(inlineContainer)node.children=[...(node.children??[]),...notes];
          else output.push(...notes);
        }
      }else{
        duyet(node,childState);
        // MDX viết trên một dòng (<GoiYNho>…</GoiYNho>) giữ các nút
        // nội tuyến trực tiếp trong component, không tự sinh đoạn <p>.
        const guideInline=component&&!(node.children??[]).some(c=>
          ['p','pre','ul','ol','table','GoiY','GoiYNho','LoiGiai','CanCuApDung'].includes(c.tagName??c.name??''));
        if(guideInline&&!node.data?.canCuDaXet){
          node.data={...node.data,canCuDaXet:true};
          node.children=[...(node.children??[]),...timLanApDung(plain,options).map(u=>nutChuThich(u,!!options.dangMdx))];
        }
        output.push(node);
      }
    }
    parent.children=output;
  }
  duyet(cay,{active:!!options.toanVan,stepData:false});
}

/** Plugin dùng chung cho MDX lúc build và Markdown đã được lọc sạch. */
export default function rehypeCanCu(options:TuyChonCanCu={}){
  return (tree:Nut,file?:{path?:string})=>{
    const mon=options.mon??file?.path?.replaceAll('\\','/').match(/\/content\/(giai-tich|dai-so|vi-mo)\//)?.[1];
    themCanCu(tree,{...options,mon});
  };
}
