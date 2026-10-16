from pathlib import Path
import json,re
import sympy as S

ROOT=Path(__file__).resolve().parents[2]
DB=ROOT/'scripts/data/loi-giai-nicholson.json'
DATA=json.loads(DB.read_text(encoding='utf-8'))if DB.exists()else{}
M=S.Matrix
def tex(a):
    a=M(a)
    return r'\begin{bmatrix}'+r'\\'.join('&'.join(S.latex(v)for v in row)for row in a.tolist())+r'\end{bmatrix}'
def cases(values):
    return '\n\n'.join(f'**{chr(97+i)}.** $'+(tex(v)if isinstance(v,(S.MatrixBase,list))else str(v))+'$.'for i,v in enumerate(values))+'\n\n'
HINTS={
 '2.3':('Kiểm tra kích thước rồi dùng quy tắc hàng–cột cho tích ma trận.','Với đẳng thức tổng quát, so sánh từng ô; giữ nguyên thứ tự các thừa số khi khai triển.','Phép nhân ma trận không giao hoán; không dùng tính khử nếu chưa có điều kiện thích hợp.'),
 '2.4':('Tìm cách biến đổi đẳng thức về một tích bằng ma trận đơn vị.','Khi tìm nghịch đảo bằng khử hàng, làm cùng phép biến đổi trên cả hai khối của [A | I].','Chỉ nhân khử bằng nghịch đảo sau khi đã chứng minh nó tồn tại; phân biệt nhân bên trái và bên phải.'),
 '2.5':('Nhận diện phép hàng và ma trận sơ cấp tương ứng.','Một phép hàng là nhân trái; một phép cột là nhân phải. Ghi thứ tự các phép trước khi lập tích.','Phép thực hiện sau nằm bên trái trong tích ma trận sơ cấp dùng cho khử hàng.'),
 '2.6':('Dùng tính bảo toàn tổ hợp tuyến tính hoặc tìm ảnh của các vector đơn vị.','Cột thứ j của ma trận ánh xạ là ảnh của vector đơn vị thứ j; phép hợp thành đặt ma trận thực hiện sau ở bên trái.','Vector đầu vào, đầu ra có thể khác kích thước. Khi dùng mô tả hình học, kiểm tra cả chiều quay và độ dài.'),
 '2.7':('Khử các phần tử dưới pivot và ghi lại phép khử, hệ số pivot, các lần đổi hàng.','Với PA = LU, giải Ly = Pb trước rồi giải Ux = y; phân biệt L đơn vị và U có pivot bằng 1.','Không áp dụng phân tích LU không đổi hàng khi xuất hiện pivot 0; kiểm tra quy ước chuẩn hóa của đề.'),
 '2.8':('Thiết lập phương trình cân bằng Ep = p hoặc kiểm tra tính không âm của nghịch đảo I − E.','Tổng cột của ma trận stochastic bằng 1. Để tìm giá tương đối, giải hệ thuần nhất rồi chuẩn hóa.','Một vector cân bằng chỉ xác định tỷ lệ giá; phân biệt điều kiện không âm với dương và không mặc nhiên coi I − E khả nghịch.'),
 '2.9':('Xếp rõ thứ tự trạng thái; cột j mô tả xác suất rời trạng thái j.','Sau k lần chuyển dùng lũy thừa thứ k; phân bố dừng thỏa Ps = s và tổng thành phần bằng 1.','Phân bố sau hữu hạn bước khác phân bố dài hạn. Regular đòi một lũy thừa có mọi ô dương.'),
 '3.1':('Chọn hàng hoặc cột nhiều số 0 để khai triển định thức.','Cộng bội một hàng vào hàng khác giữ định thức; đổi hai hàng đổi dấu; nhân một hàng nhân định thức với cùng hệ số.','Dấu phần bù tại ô (i,j) là (−1) mũ i+j. Nhân cả ma trận cấp n với c nhân định thức với c mũ n.'),
 '3.2':('Dùng định thức của tích và công thức nghịch đảo qua adjugate khi thích hợp.','Ô (i,j) của nghịch đảo lấy phần bù tại (j,i), chia định thức; Cramer thay cột bằng vế phải.','Phải chuyển vị bảng phần bù để được adjugate, và chỉ chia cho định thức khi nó khác 0.'),
 '3.3':('Bắt đầu từ Av = λv với v khác 0, hoặc đa thức đặc trưng det(xI − A).','Không gian riêng là hạt nhân của A − λI; đa thức của ma trận tác động lên vector riêng bằng đa thức của trị riêng.','Vector 0 không là vector riêng. Trị riêng của ma trận thực vẫn có thể là số phức.'),
 '3.4':('Tìm các trị riêng và cơ sở từng không gian riêng.','Ghép các vector riêng độc lập thành cột của P, rồi kiểm tra AP = PD. Cần đủ số cột bằng cấp ma trận.','Trị riêng lặp không tự động ngăn chéo hóa; cần so sánh số vector riêng độc lập với cấp ma trận.'),
 '3.5':('Viết vector trạng thái sau k bước dưới dạng A mũ k nhân trạng thái ban đầu.','Khai triển trạng thái ban đầu theo cơ sở vector riêng, rồi so sánh môđun các trị riêng có hệ số khác 0.','Trị riêng trội quyết định tốc độ khi hệ số tương ứng khác 0; giữ cả giả thiết về trạng thái ban đầu.'),
 '3.6':('Lập phương trình đặc trưng hoặc phân loại đối tượng đếm theo bước cuối.','Dùng các điều kiện đầu để xác định hệ số trong nghiệm tổng quát; nghiệm đặc trưng bội cần thêm lũy thừa của chỉ số.','Ghi rõ các giá trị đầu, kể cả cách đếm độ dài 0. Đừng áp dụng công thức cho nghiệm phân biệt vào trường hợp nghiệm bội.'),
 '3.7':('Với hệ f′ = Af, tìm cơ sở vector riêng của A; với phương trình vô hướng, tìm hàm mũ tương ứng.','Mỗi vector riêng v với trị riêng λ cho nghiệm v nhân exp(λx); giải các hệ số bằng điều kiện đầu.','Kiểm tra nghiệm bằng cả đạo hàm và điều kiện đầu. Hệ số hằng ở vế phải cần một nghiệm riêng.'),
 '3.8':('Dùng định nghĩa khai triển định thức và quy nạp theo cấp ma trận.','Tách trường hợp hàng/cột đang xét bị xóa khỏi minor và trường hợp nó còn lại; dùng giả thiết quy nạp cho minor.','Khi đề yêu cầu chứng minh từ định nghĩa, không dùng chính tính chất định thức đang cần chứng minh làm giả thiết.')
}

def add(number,solution,h1=None,h2=None,error=None):
    section='.'.join(number.split('.')[:2]) if number.count('.')==2 else 'supplement'
    defaults=HINTS.get(section,('Đọc rõ giả thiết và xác định mệnh đề hoặc đại lượng cần tìm.','Với đẳng thức tổng quát, khai triển có giữ thứ tự; với mệnh đề sai, tìm một phản ví dụ thỏa giả thiết.','Kiểm tra các trường hợp suy biến và dữ kiện chưa được định nghĩa trước khi chia hoặc khử.'))
    h1,h2,error=h1 or defaults[0],h2 or defaults[1],error or defaults[2]
    DATA[number]={'loi_giai':solution.replace(r'\n\n','\n\n'),'goi_y_1':h1,'goi_y_2':h2,'loi_hay_mac':error}
def save():
    DB.parent.mkdir(exist_ok=True)
    DB.write_text(json.dumps(DATA,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('Solutions:',len(DATA))

def inverse_case(a):
    a=M(a);det=S.factor(a.det())
    if det==0:
        v=a.nullspace()[0]
        assert a*v==S.zeros(a.rows,1)
        return r'$\det A=0$. Cụ thể $v='+tex(v)+r'\ne0$ nhưng $Av=0$, nên $A$ không có nghịch đảo.'
    inv=S.simplify(a.inv());assert S.simplify(a*inv)==S.eye(a.rows)and S.simplify(inv*a)==S.eye(a.rows)
    if any(v.free_symbols for v in a):return r'$\det A='+S.latex(det)+r'$. Khi định thức khác 0, dùng $A^{-1}=\operatorname{adj}(A)/\det A$ được $$A^{-1}='+tex(inv)+r'.$$ Nhân hai chiều cho $AA^{-1}=A^{-1}A=I$, xác nhận công thức và điều kiện tồn tại.'
    aug=a.row_join(S.eye(a.rows));steps=[]
    for j in range(a.rows):
        pivot=next(i for i in range(j,a.rows)if aug[i,j]!=0)
        if pivot!=j:
            aug.row_swap(pivot,j);steps.append(f'$R_{j+1}\\leftrightarrow R_{pivot+1}$')
        scale=aug[j,j]
        if scale!=1:
            aug.row_op(j,lambda v,k:v/scale);steps.append(f'$R_{j+1}\\leftarrow({S.latex(1/scale)})R_{j+1}$')
        for i in range(a.rows):
            if i==j or aug[i,j]==0:continue
            coefficient=-aug[i,j]
            aug.row_op(i,lambda v,k:v+coefficient*aug[j,k]);steps.append(f'$R_{i+1}\\leftarrow R_{i+1}+({S.latex(coefficient)})R_{j+1}$')
    assert aug==S.eye(a.rows).row_join(inv)
    return r'Lập $[A\mid I]$, thực hiện lần lượt: '+ '; '.join(steps)+r'. Khối trái trở thành $I$, nên khối phải là $$A^{-1}='+tex(inv)+r'.$$ Kiểm tra bằng nhân hai chiều: $AA^{-1}=A^{-1}A=I$.'

def inverse_cases(matrices):
    return '\n\n'.join('**'+chr(97+i)+'.** '+inverse_case(A)for i,A in enumerate(matrices))

def row_reduce(a):
    a=M(a);r=a.copy();u=S.eye(a.rows);ops=[];es=[];row=0
    def apply(e,label):
        nonlocal r,u
        r=e*r;u=e*u;ops.append(label);es.append(e)
    for col in range(a.cols):
        candidates=[i for i in range(row,a.rows)if r[i,col]!=0]
        if not candidates:continue
        pivot=candidates[0]
        if pivot!=row:
            e=S.eye(a.rows);e.row_swap(row,pivot);apply(e,f'R_{row+1}\\leftrightarrow R_{pivot+1}')
        scale=r[row,col]
        if scale!=1:
            e=S.eye(a.rows);e[row,row]=1/scale;apply(e,f'R_{row+1}\\leftarrow({S.latex(1/scale)})R_{row+1}')
        for i in range(a.rows):
            if i==row or r[i,col]==0:continue
            k=-r[i,col];e=S.eye(a.rows);e[i,row]=k;apply(e,f'R_{i+1}\\leftarrow R_{i+1}+({S.latex(k)})R_{row+1}')
        row+=1
        if row==a.rows:break
    assert u*a==r and r==a.rref()[0]and u.det()!=0
    return r,u,ops,es

def reduction_text(a):
    r,u,ops,es=row_reduce(a)
    return ('Các phép hàng theo thứ tự: '+ '; '.join('$'+v+'$'for v in ops)+r'. Nếu $E_j$ là ma trận nhận từ $I$ bằng phép hàng thứ $j$ vừa ghi, thì $U=E_k\cdots E_1$. Tính được $$U='+tex(u)+r',\qquad UA=R='+tex(r)+r'.$$ Mỗi $E_j$ khả nghịch nên $U$ khả nghịch; nhân $UA$ xác nhận đúng RREF.' )
