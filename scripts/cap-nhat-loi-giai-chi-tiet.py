"""Cập nhật bài tự soạn và các lời giải đã có, giữ nguyên đề, gợi ý và tiến độ.

Không gọi mạng. Có thể chạy lại: khối lời giải bổ sung được thay tại chỗ.
"""
from pathlib import Path
import importlib.util,json,re,sys
import sympy as S
from sympy.parsing.sympy_parser import parse_expr,standard_transformations,implicit_multiplication_application
from loi_giai_bien_soan import CALCULUS,ALGEBRA_INLINE,MICRO,four,goi_y_thao_luan

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts/loi-giai-nicholson'))
from trinh_bay import present,RULES,renumber_steps
from chi_tiet import tex,system_text,reduction_trace,step
spec=importlib.util.spec_from_file_location('import_questions',ROOT/'scripts/nhap-bai-tap-nicholson.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
format_math=module.format_math

RULES.update({
 '1.1':r'Mỗi phương trình giữ nguyên ý nghĩa khi cộng bội một phương trình khác hoặc nhân với một số khác 0. Mọi phép khử phải áp dụng cho cả hệ số và vế phải.',
 '1.2':r'Trụ là phần tử đầu tiên khác 0 của một hàng sau khi khử. Theo quy ước sách, trụ trong dạng bậc thang được chuẩn hóa bằng 1. Hàng $0=c\ne0$ cho vô nghiệm; nếu không có mâu thuẫn, cột ẩn không có trụ cho ẩn tự do.',
 '1.3':r'Hệ thuần nhất $Ax=0$ luôn có nghiệm 0. Nếu hạng là $r$ và có $n$ ẩn thì có $n-r$ ẩn tự do. Tổ hợp tuyến tính các nghiệm thuần nhất vẫn là nghiệm.',
 '1.4':r'Tại mỗi nút: tổng dòng vào bằng tổng dòng ra. Chiều mũi tên quyết định dấu và dòng một chiều phải không âm. Giải hệ rồi mới đặt điều kiện lên các tham số.',
 '1.5':r'Định luật nút: tổng dòng điện vào bằng tổng dòng ra. Định luật vòng: tổng biến thiên điện thế bằng 0. Trên điện trở, sụt áp theo chiều dòng điện là $RI$; dòng âm nghĩa là chiều thật ngược mũi tên đã chọn.',
 '1.6':r'Mỗi nguyên tố cho một phương trình bảo toàn số nguyên tử. Chỉ thay hệ số trước chất, không thay chỉ số trong công thức hóa học. Nghiệm phù hợp cần có các hệ số dương, sau đó khử mẫu và chia ước chung để được bộ nguyên nhỏ nhất.'
})


def latex_value(text):
    text=text.strip().replace(r'\tfrac',r'\frac').replace(r'\dfrac',r'\frac')
    while re.search(r'\frac\{([^{}]+)\}\{([^{}]+)\}',text):
        text=re.sub(r'\frac\{([^{}]+)\}\{([^{}]+)\}',r'((\1)/(\2))',text)
    text=re.sub(r'x_\{?(\d+)\}?',r'x\1',text)
    text=text.replace(r'\,','').replace(r'\ ','').replace('{','(').replace('}',')').replace('^','**')
    if '\\' in text:raise ValueError(text)
    names=['x','y','z']+[f'x{i}' for i in range(1,20)]
    return S.expand(parse_expr(text,local_dict={name:S.Symbol(name) for name in names},transformations=standard_transformations+(implicit_multiplication_application,),evaluate=True))


def numeric_work(question,number):
    """Khử chi tiết các hệ/ma trận số của chương 1; không chia tham số có thể bằng 0."""
    if not number.startswith('1.'):return ''
    out=[]
    for match in re.finditer(r'\\begin\{aligned\}(.*?)\\end\{aligned\}',question,re.S):
        rows=match[1].split(r'\\');equations=[]
        try:
            for row in rows:
                left,right=row.replace('&','').split('=')
                equations.append(latex_value(left)-latex_value(right))
            variables=sorted(set().union(*(v.free_symbols for v in equations)),key=str)
            if not variables or any(not re.fullmatch(r'[xyz]\d*',str(v)) for v in variables):continue
            a,b=S.linear_eq_to_matrix(equations,variables)
            if a.free_symbols or b.free_symbols:continue
            out.append(r'Theo thứ tự ẩn $('+','.join(map(S.latex,variables))+r')$, các phép khử cụ thể là:'+'\n\n'+system_text(a,b))
        except (ValueError,TypeError,S.PolynomialError,SyntaxError):continue
    if not out and number in ['1.2.2','1.2.11','1.3.5']:
        pattern=r'\\begin\{(?:array|bmatrix)\}(?:\{[rlc|]+\})?(.*?)\\end\{(?:array|bmatrix)\}'
        for m in re.finditer(pattern,question,re.S):
            try:
                a=S.Matrix([[latex_value(c) for c in row.split('&')] for row in m[1].split(r'\\')])
                if a.free_symbols:continue
                reduced,trace=reduction_trace(a)
                out.append(r'Với ma trận $'+tex(a)+r'$, khử lần lượt như sau:'+'\n\n'+trace+r'Đếm hàng khác 0 trong kết quả cho hạng $r='+str(a.rank())+r'$.')
            except (ValueError,TypeError,SyntaxError):continue
    if not out:return ''
    return '\n\n**Chi tiết phép khử để làm lại.**\n\n'+'\n\n'.join(out)


def scalar_case(terms):
    mats=[(S.Rational(c),S.Matrix(a)) for c,a in terms]
    result=S.zeros(*mats[0][1].shape)
    for c,a in mats:result+=c*a
    expanded=r'\begin{bmatrix}'+r'\\'.join('&'.join('+'.join('('+S.latex(c)+')('+S.latex(a[i,j])+')' for c,a in mats) for j in range(result.cols)) for i in range(result.rows))+r'\end{bmatrix}'
    return four('Thực hiện nhân vô hướng trước, rồi cộng các ô cùng vị trí.',r'Các phép tính theo từng ô là $$'+expanded+'='+tex(result)+r'.$$',f'Kết quả có kích thước ${result.rows}\\times {result.cols}$, giống các ma trận ban đầu; dấu trừ được nhân vào từng ô.', 'Mỗi ô kết quả dùng đúng các ô cùng chỉ số của các ma trận đầu vào.')


OVERRIDES={
 '2.1.1':r'''**a.** Từ đẳng thức ma trận: $a=c-3d$, $b=-d$, $c=2a+d$, $d=a+b$. Đặt $d=t$, suy ra $b=-t$. Từ phương trình cuối $a=d-b=2t$, rồi $c=2a+d=5t$. Thay vào phương trình đầu: $c-3d=5t-3t=2t=a$, nên không có ràng buộc thêm. Vậy $(a,b,c,d)=(2t,-t,5t,t)$.

**b.** Nhân 2 vào mọi ô vế phải, so từng ô cho $a-b=2$, $b-c=2$, $c-d=-6$, $d-a=2$. Đặt $d=t$. Phương trình cuối cho $a=t-2$; sau đó $b=a-2=t-4$, $c=b-2=t-6$. Kiểm tra $c-d=-6$; tham số $t$ tùy ý.

**c.** So hai tọa độ được $3a+2b=1$, $2a+3b=2$. Nhân phương trình đầu với 3 và phương trình sau với 2: $9a+6b=3$, $4a+6b=4$. Trừ cho $5a=-1$, nên $a=-1/5$. Thế lại $-3/5+2b=1$, suy ra $b=4/5$. Kiểm tra $2(-1/5)+3(4/5)=2$.

**d.** So từng ô được $a=b$, $b=c$, $c=d$, $d=a$. Chỉ cần chọn một giá trị $t$, tất cả đều bằng $t$. Ngược lại, mọi bộ bằng nhau đều làm hai ma trận bằng nhau.''',
 '2.2.4':'\n\n'.join('**'+chr(97+i)+'.**\n\n'+system_text([[1,3,2,0],[1,0,-1,-3],[-1,2,3,5]],b) for i,b in enumerate([[0,3,5],[4,1,1]])),
 '2.2.5':'\n\n'.join('**'+chr(97+i)+'.**\n\n'+system_text(a,b) for i,(a,b) in enumerate([
  ([[1,1,1],[2,1,0],[1,-1,-3]],[2,3,0]),([[1,-1,-4],[1,2,5],[1,1,2]],[-4,2,0]),
  ([[1,1,-1,0,-5],[0,1,1,0,-4],[0,1,1,1,-1],[2,0,-4,1,1]],[2,-1,-1,6]),
  ([[2,1,-1,-1],[3,1,1,-2],[-1,-1,2,1],[-2,-1,0,2]],[-1,-2,2,3])])),
 '2.2.8':'\n\n'.join('**'+chr(97+i)+'.**\n\n'+system_text(a,b) for i,(a,b) in enumerate([
  ([[1,-2,1,4,-1],[-2,4,1,-2,-4],[3,-6,8,4,-13],[8,-16,7,12,-6]],[8,-1,1,11]),
  ([[1,-2,1,2,3],[-3,6,-2,-3,-11],[-2,4,-1,1,-8],[-1,2,0,3,-5]],[-4,11,7,3])]))
}

first=[[(1,[[3,2,1],[5,1,0]]),(-5,[[3,0,-2],[1,-1,2]])],[(3,[[3],[-1]]),(-5,[[6],[2]]),(7,[[1],[-1]])],[(1,[[-2,1],[3,2]]),(-4,[[1,-2],[0,-1]]),(3,[[2,-3],[-1,-2]])],[(1,[[3,-1,2]]),(-2,[[9,3,4]]),(3,[[11,-6,3]])]]
old=[]
for i,terms in enumerate(first):old.append('**'+chr(97+i)+'.**\n\n'+scalar_case(terms))
for label,a in [('e',[[1,-5,4,0],[2,1,0,6]]),('f',[[0,-1,2],[1,0,-4],[-2,4,0]])]:
    a=S.Matrix(a);old.append('**'+label+r'.** Chuyển từng hàng thành cột: $$'+tex(a)+'^T='+tex(a.T)+r'.$$ Hàng thứ nhất của đầu vào trở thành cột thứ nhất của đầu ra; làm tương tự cho từng hàng. Chuyển vị lần nữa cho lại ma trận ban đầu.')
old.append('**g.**\n\n'+scalar_case([(1,[[3,2],[-1,1]]),(-2,[[1,-2],[1,1]])])+'\n\nTrước phép trừ, đã chuyển vị ma trận đầu thành $\\begin{bmatrix}3&2\\\\-1&1\\end{bmatrix}$.')
old.append('**h.**\n\n'+scalar_case([(3,[[2,-1],[1,0]]),(-2,[[1,-1],[2,3]])])+'\n\nMa trận đầu sau chuyển vị là $\\begin{bmatrix}2&-1\\\\1&0\\end{bmatrix}$.')
OVERRIDES['2.1.2']='\n\n'.join(old)

a=S.Matrix([[2,1],[0,-1]]);b=S.Matrix([[3,-1,2],[0,1,4]]);c=S.Matrix([[3,-1],[2,0]]);e=S.Matrix([[1,0,1],[0,1,0]])
OVERRIDES['2.1.3']='\n\n'.join([
 r'**a.** $3A$ cỡ $2\times2$ và $2B$ cỡ $2\times3$, nên không trừ được.',
 r'**b.**\n\n'+scalar_case([(5,c)]),
 r'**c.** Chuyển vị $E$ thành $E^T='+tex(e.T)+r'$, rồi nhân từng ô với 3:\n\n'+scalar_case([(3,e.T)]),
 r'**d.** $B$ cỡ $2\times3$, $D$ cỡ $3\times2$, nên không cộng được.',
 r'**e.** Chuyển vị $A$ thành $A^T='+tex(a.T)+r'$, rồi tính:\n\n'+scalar_case([(4,a.T),(-3,c)]),
 r'**f.** Cộng trước: $A+C='+tex(a+c)+r'$. Sau đó đổi hàng thành cột: $(A+C)^T='+tex((a+c).T)+r'$. Kiểm tra $(A+C)^T=A^T+C^T$.',
 r'**g.**\n\n'+scalar_case([(2,b),(-3,e)]),
 r'**h.** $A$ cỡ $2\times2$, $D$ cỡ $3\times2$, nên không trừ được.',
 r'**i.** Tính $B-2E='+tex(b-2*e)+r'$, rồi chuyển vị: $(B-2E)^T='+tex((b-2*e).T)+r'$. Kích thước đổi từ $2\times3$ sang $3\times2$.'
])


def replace_solution(text,body):
    return re.sub(r'<LoiGiai>.*?</LoiGiai>',lambda m:'<LoiGiai>\n\n'+format_math(body).strip()+'\n\n</LoiGiai>',text,flags=re.S)


def main():
    count=0
    existing=json.loads((ROOT/'scripts/data/loi-giai-dai-so-co-san.json').read_text(encoding='utf-8'))
    def write(p,text):
        text='\n'.join(line.rstrip() for line in text.splitlines()).rstrip()+'\n'
        p.write_text(re.sub(r'\n{3,}','\n\n',text),encoding='utf-8')
    for p in sorted((ROOT/'content/dai-so').glob('*/bai-tap/*.mdx')):
        text=p.read_text(encoding='utf-8')
        if 'de_goc_tieng_anh: true' in text:continue
        number=re.search(r'^so: "([^"]+)"',text,re.M)[1]
        found=re.search(r'<LoiGiai>(.*?)</LoiGiai>',text,re.S)
        if not found:raise ValueError(f'Missing solution: {p}')
        body=OVERRIDES.get(number,existing[number])
        if '**Cách làm.**' not in body:
            question=re.search(r'<De>(.*?)</De>',text,re.S)[1]
            body=present(number,body+numeric_work(question,number))
        text=replace_solution(text,renumber_steps(body))
        write(p,text);count+=1
    for key,answers in CALCULUS.items():
        chapter,lesson=key.split('/');p=ROOT/f'content/giai-tich/chuong-{chapter}/giang-day/bai-{lesson}.mdx'
        text=p.read_text(encoding='utf-8');start=text.index('## Bài tập');head=text[:start];tail=text[start:];index=0
        def insert_calc(m):
            nonlocal index
            body=m[0];body=re.sub(r'\n*<LoiGiai>.*?</LoiGiai>\n*','\n\n',body,flags=re.S).rstrip()
            body+='\n\n<LoiGiai>\n\n'+format_math(answers[index]).strip()+'\n\n</LoiGiai>\n\n';index+=1
            return body
        tail=re.sub(r'### (?:DỄ|VỪA|KHÓ)\b.*?(?=\n### |\nNguồn kiến thức:|\Z)',insert_calc,tail,flags=re.S)
        assert index==3,(p,index)
        write(p,head+tail);count+=3
    for key,answers in ALGEBRA_INLINE.items():
        chapter,lesson=key.split('/');p=ROOT/f'content/dai-so/chuong-{chapter}/giang-day/bai-{lesson}.mdx';text=p.read_text(encoding='utf-8');index=0
        def insert_algebra(m):
            nonlocal index
            body=re.sub(r'\n*<LoiGiai>.*?</LoiGiai>\n*','\n\n',m[1],flags=re.S).rstrip()
            body+='\n\n<LoiGiai>\n\n'+format_math(answers[index]).strip()+'\n\n</LoiGiai>\n';index+=1
            return m[0][:m[0].index('>')+1]+body+'</BaiLuyen>'
        text=re.sub(r'<BaiLuyen\b[^>]*>(.*?)</BaiLuyen>',insert_algebra,text,flags=re.S)
        assert index==3,(p,index)
        write(p,text);count+=3
    for key,slides in MICRO.items():
        chapter,file=key.split('/');p=ROOT/f'content/vi-mo/chuong-{chapter}/sach/{file}.mdx';text=p.read_text(encoding='utf-8')
        for slide,answer in slides.items():
            pattern=r'(<Slide so=\{'+str(slide)+r'\}[^>]*>.*?</Slide>)(?:\n\n(?:<!-- loi-giai-thao-luan-\d+ -->.*?<!-- /loi-giai-thao-luan -->|<div data-loi-giai-thao-luan="\d+">.*?</div>))?'
            def micro_body(m):
                assert 'Câu hỏi thảo luận' in m[1],(p,slide)
                return m[1]+f'\n\n<div data-loi-giai-thao-luan="{slide}">\n\n'+r'**Hướng dẫn thảo luận do người biên soạn bổ sung.**'+'\n\n'+goi_y_thao_luan(f'{key}/{slide}')+'\n\n<LoiGiai>\n\n'+format_math(answer).strip()+'\n\n</LoiGiai>\n\n</div>'
            text,n=re.subn(pattern,micro_body,text,flags=re.S);assert n==1,(p,slide,n);count+=1
        write(p,text)
    print(f'Updated {count} existing/authored exercise solutions, including 30 calculus, 42 inline algebra and 6 microeconomics discussions.')


if __name__=='__main__':main()
