"""Các phép tính trung gian để người học có thể làm lại bằng giấy bút.

Chỉ biến đổi đại số chính xác bằng SymPy; không suy diễn lời giải từ đề bằng API.
"""
import re
import sympy as S


def tex(a):
    a=S.Matrix(a)
    return r'\begin{bmatrix}'+r'\\'.join('&'.join(S.latex(v) for v in row) for row in a.tolist())+r'\end{bmatrix}'


def step(n, title, body):
    return f'**Bước {n}. {title}.**\n\n{body}\n\n'


def product_text(a,b,left='A',right='B'):
    a,b=S.Matrix(a),S.Matrix(b)
    if a.cols!=b.rows:
        return f'${left}$ có {a.cols} cột, ${right}$ có {b.rows} hàng. Hai số này khác nhau nên tích ${left}{right}$ không xác định.'
    result=step(1,'Kiểm tra kích thước',f'${left}$ có kích thước ${a.rows}\\times {a.cols}$, ${right}$ có kích thước ${b.rows}\\times {b.cols}$. Kích thước trong bằng nhau; tích có kích thước ${a.rows}\\times {b.cols}$.')
    result+=step(2,'Lấy từng hàng nhân từng cột',r'Ô $(i,j)$ là tổng các tích của hàng $i$ bên trái với cột $j$ bên phải. Các phép tính cụ thể:')
    for i in range(a.rows):
        for j in range(b.cols):
            terms='+'.join(r'\left('+S.latex(a[i,k])+r'\right)\left('+S.latex(b[k,j])+r'\right)' for k in range(a.cols))
            result+=r'$$('+left+right+r')_{'+str(i+1)+str(j+1)+'}='+terms+'='+S.latex(S.expand((a*b)[i,j]))+r'.$$'+'\n\n'
    result+=step(3,'Ghép các ô đúng vị trí',r'$$'+left+right+'='+tex(a*b)+r'.$$')
    return result


def determinant_text(a):
    """Khai triển hàng đầu, hiện minor và dấu; không giấu phép tính cấp 2."""
    a=S.Matrix(a)
    if a.rows==1:return r'$\det A='+S.latex(a[0,0])+r'$.'
    if a.rows==2:
        return r'Với $A='+tex(a)+r'$, dùng quy tắc tích chéo: $$\det A=('+S.latex(a[0,0])+r')('+S.latex(a[1,1])+r')-('+S.latex(a[0,1])+r')('+S.latex(a[1,0])+r')='+S.latex(S.factor(S.trigsimp(a.det())))+r'.$$'
    result=step(1,'Chọn cách khai triển',r'Với $A='+tex(a)+r'$, khai triển theo hàng 1. Dấu các ô hàng này lần lượt là $+,-,+,-,\ldots$. Ô bằng 0 đóng góp 0 nên được bỏ qua.')
    terms=[]
    for j in range(a.cols):
        if a[0,j]==0:continue
        minor=a.minor_submatrix(0,j);cofactor=(-1)**j*minor.det()
        result+=r'Xóa hàng 1, cột '+str(j+1)+r': $$M_{1'+str(j+1)+'}='+tex(minor)+r',\qquad C_{1'+str(j+1)+r'}=(-1)^{1+'+str(j+1)+r'}\det M_{1'+str(j+1)+'}='+S.latex(S.factor(cofactor))+r'.$$'+'\n\n'
        if minor.rows==2:result+=determinant_text(minor).replace('A','M_{1'+str(j+1)+'}')+'\n\n'
        elif minor.rows==3:
            expansion=[]
            for k in range(3):
                if minor[0,k]!=0:
                    m=minor.minor_submatrix(0,k)
                    expansion.append(r'('+S.latex((-1)**k*minor[0,k])+r')\bigl[('+S.latex(m[0,0])+r')('+S.latex(m[1,1])+r')-('+S.latex(m[0,1])+r')('+S.latex(m[1,0])+r')\bigr]')
            result+=r'Định thức con cấp 3 được tính tiếp theo hàng đầu: $$\det M_{1'+str(j+1)+'}='+'+'.join(expansion)+'='+S.latex(S.factor(minor.det()))+r'.$$'+'\n\n'
        terms.append(r'('+S.latex(a[0,j])+r')('+S.latex(S.factor(cofactor))+r')')
    result+=step(2,'Nhân hệ số với phần bù rồi cộng',r'$$\det A='+'+'.join(terms)+'='+S.latex(S.factor(S.trigsimp(a.det())))+r'.$$')
    return result


def elimination_text(a):
    a=S.Matrix(a);u=a.copy();result=step(1,'Xác định phép biến đổi được phép dùng',r'Bắt đầu từ $A='+tex(a)+r'$. Cộng bội một hàng vào hàng khác giữ nguyên định thức. Đổi hai hàng đổi dấu. Ta không chia hàng để tránh phải bù thêm hệ số.')
    swaps=0;n=2
    for j in range(a.rows):
        candidates=[i for i in range(j,a.rows) if u[i,j]!=0]
        if not candidates:continue
        p=candidates[0]
        if p!=j:
            u.row_swap(p,j);swaps+=1
            result+=step(n,'Đưa phần tử khác 0 lên vị trí trụ',r'$R_'+str(j+1)+r'\leftrightarrow R_'+str(p+1)+r'$ đổi dấu định thức. Ma trận sau phép đổi: $$'+tex(u)+r'.$$');n+=1
        for i in range(j+1,a.rows):
            if u[i,j]==0:continue
            factor=S.cancel(u[i,j]/u[j,j]);before=u[i,j]
            u.row_op(i,lambda v,k:v-factor*u[j,k])
            result+=step(n,f'Khử ô ở hàng {i+1}, cột {j+1}',r'Chọn hệ số $m=\dfrac{'+S.latex(before)+'}{'+S.latex(u[j,j])+'}='+S.latex(factor)+r'$ để phần tử này thành 0. Thực hiện $R_'+str(i+1)+r'\leftarrow R_'+str(i+1)+r'-('+S.latex(factor)+r')R_'+str(j+1)+r'$ trên toàn bộ hàng, được $$'+tex(u)+r'.$$ Phép cộng bội hàng này không đổi định thức.');n+=1
    value=(-1)**swaps*S.prod(u[i,i] for i in range(a.rows));assert S.simplify(value-a.det())==0
    result+=step(n,'Lấy tích đường chéo và theo dõi dấu',r'Ma trận đã là tam giác trên. Có '+str(swaps)+r' lần đổi hàng, nên $$\det A=(-1)^{'+str(swaps)+'}'+'\\cdot'.join('('+S.latex(u[i,i])+')' for i in range(a.rows))+'='+S.latex(a.det())+r'.$$')
    return result


def reduction_trace(a, augmented=False):
    """Trình bày Gauss–Jordan, mỗi phép một ma trận sau biến đổi."""
    a=S.Matrix(a);r=a.copy();row=0;parts=[];index=1
    cols=a.cols-a.rows if augmented else a.cols
    # Với [A|b] hoặc ma trận rộng, chỉ khử các cột hệ số được chỉ định bên ngoài.
    for col in range(cols):
        candidates=[i for i in range(row,r.rows) if r[i,col]!=0]
        if not candidates:continue
        pivot=candidates[0]
        if pivot!=row:
            r.row_swap(row,pivot)
            parts.append(step(index,'Đưa trụ khác 0 lên',r'$R_'+str(row+1)+r'\leftrightarrow R_'+str(pivot+1)+r'$: $$'+tex(r)+r'.$$'));index+=1
        scale=r[row,col]
        if scale!=1:
            r.row_op(row,lambda v,k:S.cancel(v/scale))
            parts.append(step(index,'Chuẩn hóa trụ về 1',r'Chia toàn bộ hàng '+str(row+1)+r' cho $'+S.latex(scale)+r'$, được $$'+tex(r)+r'.$$'));index+=1
        for i in range(r.rows):
            if i==row or r[i,col]==0:continue
            k=-r[i,col]
            r.row_op(i,lambda v,j:S.cancel(v+k*r[row,j]))
            parts.append(step(index,f'Khử ô cùng cột trụ ở hàng {i+1}',r'$R_'+str(i+1)+r'\leftarrow R_'+str(i+1)+r'+('+S.latex(k)+r')R_'+str(row+1)+r'$. Hệ số được chọn để ô ở cột '+str(col+1)+r' bằng 0: $$'+tex(r)+r'.$$'));index+=1
        row+=1
        if row==r.rows:break
    return r,''.join(parts)


def cofactor_text(a):
    a=S.Matrix(a);result=r'Ta dùng $C_{ij}=(-1)^{i+j}\det M_{ij}$. Mỗi $M_{ij}$ được lập bằng cách xóa hàng $i$ và cột $j$ của $A$.\n\n'
    for i in range(a.rows):
        for j in range(a.cols):
            m=a.minor_submatrix(i,j)
            result+=r'$$C_{'+str(i+1)+str(j+1)+r'}=(-1)^{'+str(i+j+2)+r'}\det'+tex(m)+'='+S.latex(S.factor(a.cofactor(i,j)))+r'.$$'+'\n\n'
    result+=r'Ghép thành bảng phần bù $C$, rồi **chuyển vị** (hàng thành cột): $$C='+tex(a.cofactor_matrix())+r',\qquad\operatorname{adj}A=C^T='+tex(a.adjugate())+r'.$$'
    assert S.simplify(a*a.adjugate()-a.det()*S.eye(a.rows))==S.zeros(a.rows)
    return result.replace(r'\n\n','\n\n')


def inverse_text(a):
    a=S.Matrix(a);det=S.factor(a.det());out=step(1,'Kiểm tra điều kiện tồn tại',determinant_text(a))
    if det==0:
        v=a.nullspace()[0];assert a*v==S.zeros(a.rows,1)
        return out+step(2,'Kết luận không có nghịch đảo',r'$\det A=0$ nên $A$ suy biến. Ta cũng có $v='+tex(v)+r'\ne0$ nhưng $Av='+tex(a*v)+r'$. Nếu tồn tại $A^{-1}$ thì nhân trái vào $Av=0$ sẽ cho $v=0$, mâu thuẫn.')
    inv=S.simplify(a.inv());assert S.simplify(a*inv)==S.eye(a.rows) and S.simplify(inv*a)==S.eye(a.rows)
    if a.free_symbols:
        return out+step(2,'Tính từng phần bù đại số',cofactor_text(a))+step(3,'Chia cho định thức',r'Chỉ với các giá trị làm $\det A\ne0$, ta có $$A^{-1}=\frac{\operatorname{adj}A}{\det A}='+tex(inv)+r'.$$ Điều kiện này phải đi kèm công thức; ở giá trị làm mẫu bằng 0, nghịch đảo không tồn tại.')+step(4,'Kiểm tra hai chiều',r'Nhân theo hàng–cột cho $$AA^{-1}=A^{-1}A='+tex(S.eye(a.rows))+r'.$$')
    aug=a.row_join(S.eye(a.rows));reduced,trace=reduction_trace(aug,augmented=True)
    assert reduced==S.eye(a.rows).row_join(inv)
    return out+r'Lập ma trận ghép. Mọi phép hàng phải làm trên **cả hai khối**: $$[A\mid I]='+tex(aug)+r'.$$'+'\n\n'+trace+step(1+len(re.findall(r'\*\*Bước',trace)),'Đọc khối phải và kiểm tra',r'Khối trái đã thành $I$, nên khối phải là $$A^{-1}='+tex(inv)+r'.$$ Nhân lại cho $$AA^{-1}=A^{-1}A='+tex(S.eye(a.rows))+r'.$$')


def eigen_text(a):
    a=S.Matrix(a);x=S.Symbol('x');cp=a.charpoly(x).as_expr();out=step(1,'Tìm trị riêng',r'Lập $$xI-A='+tex(x*S.eye(a.rows)-a)+r'.$$ Khai triển định thức rồi phân tích nhân tử: $$c_A(x)=\det(xI-A)='+S.latex(S.expand(cp))+'='+S.latex(S.factor(cp))+r'.$$ Các trị riêng là nghiệm của $c_A(x)=0$.')
    cols=[];values=[]
    for val,mult,basis in a.eigenvects():
        shifted=a-val*S.eye(a.rows);rref=shifted.rref()[0]
        out+=r'**Với $\lambda='+S.latex(val)+r'$ (bội đại số '+str(mult)+r').** Giải $(A-\lambda I)v=0$: $$A-\lambda I='+tex(shifted)+r'\;\longrightarrow\;'+tex(rref)+r'.$$'+'\n\n'
        for i in range(rref.rows):
            if any(rref[i,j]!=0 for j in range(rref.cols)):
                eq='+'.join('('+S.latex(rref[i,j])+')v_{'+str(j+1)+'}' for j in range(rref.cols) if rref[i,j]!=0)
                out+=r'Hàng '+str(i+1)+r' cho $'+eq+r'=0$.'+'\n\n'
        out+=r'Cho các ẩn tự do lần lượt bằng 1 và các ẩn tự do khác bằng 0, ta lấy được cơ sở: $$E_{'+S.latex(val)+r'}=\operatorname{span}\{'+','.join(tex(v) for v in basis)+r'\}.$$'+'\n\n'
        for v in basis:assert a*v==val*v
        cols.extend(basis);values.extend([val]*len(basis))
    if len(cols)==a.rows:
        p=S.Matrix.hstack(*cols);d=S.diag(*values);assert p.det()!=0 and a*p==p*d
        out+=step(2,'Ghép cơ sở vector riêng theo đúng thứ tự',r'Có đủ '+str(a.rows)+r' vector độc lập. Đặt các vector ấy làm cột của $P$, và đặt trị riêng tương ứng cùng thứ tự trên đường chéo của $D$: $$P='+tex(p)+r',\quad D='+tex(d)+r'.$$')
        out+=step(3,'Kiểm tra phép chéo hóa',r'$\det P='+S.latex(p.det())+r'\ne0$, nên $P$ khả nghịch. Nhân từng cột cho $$AP=PD='+tex(a*p)+r'.$$ Nhân trái với $P^{-1}$ thu được $P^{-1}AP=D$.')
    else:
        out+=step(2,'Đếm số vector riêng độc lập',f'Tổng số vector trong các cơ sở vừa tìm là {len(cols)}, nhỏ hơn cấp {a.rows}. Vì vậy không thể lập ma trận khả nghịch bằng các vector riêng, nên ma trận không chéo hóa được.')
    out+=r'Vector riêng là các vector **khác 0** trong từng không gian riêng vừa ghi; vector 0 chỉ thuộc không gian riêng.'
    return out


def cramer_text(a,b):
    a,b=S.Matrix(a),S.Matrix(b);d=a.det();assert d!=0
    out=step(1,'Lập ma trận hệ số và kiểm tra điều kiện',r'$A='+tex(a)+r'$, $b='+tex(b)+r'$. '+determinant_text(a)+r' Vì $D=\det A\ne0$, hệ có nghiệm duy nhất và được dùng quy tắc Cramer.')
    ds=[]
    for j in range(a.cols):
        replaced=a.copy();replaced[:,j]=b;ds.append(replaced.det())
        out+=step(j+2,f'Tìm ẩn thứ {j+1}',r'Thay **cột '+str(j+1)+r'** của $A$ bằng $b$, giữ nguyên mọi cột khác: $$A_{'+str(j+1)+'}='+tex(replaced)+r',\quad D_{'+str(j+1)+r'}=\det A_{'+str(j+1)+'}='+S.latex(replaced.det())+r'.$$ Vì vậy $$x_{'+str(j+1)+r'}=\frac{D_{'+str(j+1)+r'}}D=\frac{'+S.latex(replaced.det())+'}{'+S.latex(d)+'}='+S.latex(replaced.det()/d)+r'.$$')
    sol=S.Matrix([v/d for v in ds]);assert a*sol==b
    out+=step(a.cols+2,'Kiểm tra lại toàn bộ hệ',r'Ghép các ẩn thành $x='+tex(sol)+r'$. Thay lại: $$Ax='+tex(a*sol)+'='+tex(b)+r'=b.$$')
    return out


def system_text(a,b):
    a,b=S.Matrix(a),S.Matrix(b);aug=a.row_join(b)
    out=r'Đưa về $Ax=b$, rồi ghép vế phải thành cột cuối: $$[A\mid b]='+tex(aug)+r'.$$'+'\n\n'
    reduced,trace=reduction_trace(aug);out+=trace
    if a.rank()!=aug.rank():
        bad=next(i for i in range(a.rows) if all(reduced[i,j]==0 for j in range(a.cols)) and reduced[i,-1]!=0)
        return out+step(1,'Đọc hàng mâu thuẫn',r'Hàng '+str(bad+1)+r' cho $0='+S.latex(reduced[bad,-1])+r'$, vô lý. Vì mọi phép hàng giữ nguyên tập nghiệm, hệ ban đầu vô nghiệm. Do đó $b$ không là tổ hợp tuyến tính của các cột của $A$.')
    sol,params=a.gauss_jordan_solve(b);part=sol.subs({v:0 for v in params});basis=a.nullspace()
    assert a*sol==b and a*part==b
    for v in basis:assert a*v==S.zeros(a.rows,1)
    out+=step(1,'Đọc ẩn trụ và ẩn tự do',r'Đọc từng hàng khác 0 của RREF để biểu diễn ẩn trụ theo các ẩn tự do. Đặt các ẩn tự do bằng tham số thực, được $$x='+tex(sol)+r'.$$ Các ký hiệu $\tau_i$ là tham số tự do, không phải các hằng số đã được xác định.') if params.rows else step(1,'Đọc nghiệm duy nhất',r'Mỗi cột ẩn đều có trụ nên không có ẩn tự do: $$x='+tex(sol)+r'.$$')
    out+=step(2,'Tách phần hằng và phần thuần nhất',r'Cho các tham số bằng 0 để lấy $x_p='+tex(part)+r'$. Nghiệm tổng quát là $$x=x_p'+''.join('+t_{'+str(i+1)+'}'+tex(v) for i,v in enumerate(basis))+r',$$ với các $t_i$ tùy ý. Các vector đứng sau tham số tạo cơ sở của hệ thuần nhất.') if basis else ''
    out+=step(3,'Thay lại để kiểm tra',r'$Ax_p='+tex(a*part)+r'=b$; '+(r'với mỗi vector cơ sở $v_i$ vừa ghi, $Av_i=0$, nên $A(x_p+\sum_i t_iv_i)=b$.' if basis else r'như vậy nghiệm thỏa toàn bộ hệ.'))
    return out


def lu_text(a,p,l,u):
    a,p,l,u=map(S.Matrix,(a,p,l,u));work=p*a;lower=S.eye(a.rows);out=step(1,'Sắp xếp hàng và bắt đầu khử',r'Với $$A='+tex(a)+r',\qquad P='+tex(p)+r',$$ ta có $$PA='+tex(work)+r'.$$ Các hàng của $P$ chỉ rõ hàng cũ nào được đưa lên trước.');row=0;index=2
    for col in range(work.cols):
        if row==work.rows:break
        if work[row,col]==0:
            assert all(work[i,col]==0 for i in range(row,work.rows))
            continue
        for i in range(row+1,work.rows):
            if work[i,col]==0:continue
            factor=S.cancel(work[i,col]/work[row,col]);lower[i,row]=factor
            work.row_op(i,lambda v,j:S.cancel(v-factor*work[row,j]))
            out+=step(index,f'Khử phần tử dưới trụ ở hàng {i+1}',r'Lấy hệ số $m='+S.latex(factor)+r'$ bằng ô cần khử chia cho trụ. Làm $R_'+str(i+1)+r'\leftarrow R_'+str(i+1)+r'-('+S.latex(factor)+r')R_'+str(row+1)+r'$: $$'+tex(work)+r'.$$ Ghi $m$ vào ô $('+str(i+1)+','+str(row+1)+r')$ của ma trận tam giác dưới đơn vị $L_0$.');index+=1
        row+=1
    assert lower*work==p*a
    diag=S.eye(a.rows)
    for i in range(work.rows):
        nonzero=[work[i,j] for j in range(work.cols) if work[i,j]!=0]
        if nonzero:diag[i,i]=nonzero[0]
    assert S.simplify(lower*diag-l)==S.zeros(*l.shape) and S.simplify(diag.inv()*work-u)==S.zeros(*u.shape)
    out+=step(index,'Chuẩn hóa đúng quy ước của đề',r'Đến đây $PA=L_0U_0$ với $$L_0='+tex(lower)+r',\quad U_0='+tex(work)+r'.$$ Đặt $D='+tex(diag)+r'$, gồm trụ đầu của từng hàng khác 0 (hàng 0 dùng hệ số 1). Chia hàng $i$ của $U_0$ cho $d_{ii}$ để trụ thành 1. Khi đó $$L=L_0D='+tex(l)+r',\quad U=D^{-1}U_0='+tex(u)+r'.$$')
    assert p*a==l*u
    out+=step(index+1,'Nhân lại để kiểm tra',r'$$LU='+tex(l*u)+r'=PA.$$ $L$ tam giác dưới, khả nghịch, còn $U$ bậc thang có trụ 1; đây là đúng phân tích yêu cầu.')
    return out


def triangular_text(l,u,b):
    l,u,b=map(S.Matrix,(l,u,b));y=l.inv()*b
    out=step(1,'Tách thành hai hệ tam giác',r'Đặt $y=Ux$, cần giải $Ly=b$ trước rồi $Ux=y$. Không cần tính lại $A=LU$.')
    for i in range(l.rows):
        known=sum(l[i,j]*y[j] for j in range(i));assert l[i,i]!=0
        out+=r'Ở hàng '+str(i+1)+r' của $Ly=b$: $$y_{'+str(i+1)+r'}=\frac{b_{'+str(i+1)+r'}-\sum_{j<'+str(i+1)+r'}l_{'+str(i+1)+r'j}y_j}{l_{'+str(i+1)+str(i+1)+r'}}=\frac{'+S.latex(b[i])+'-('+S.latex(known)+')}{'+S.latex(l[i,i])+'}='+S.latex(y[i])+r'.$$'+'\n\n'
    out+=r'Vì vậy $y='+tex(y)+r'$.'+'\n\n'
    if u.rank()!=u.row_join(y).rank():
        return out+step(2,'Đọc hàng mâu thuẫn',r'Hệ $Ux=y$ có hàng vế trái bằng 0 nhưng vế phải khác 0, nên vô nghiệm.')
    x,params=u.gauss_jordan_solve(y);assert l*u*x==b
    pivots=u.rref()[1];free=[j for j in range(u.cols) if j not in pivots]
    out+=step(2,'Chọn ẩn tự do rồi thế ngược','Các cột không có trụ là '+(', '.join(str(j+1) for j in free) if free else 'không có')+'. '+('Đặt các ẩn ở cột này bằng tham số thực trước khi giải các ẩn trụ.' if free else 'Mọi ẩn được xác định duy nhất.'))
    for j in free:out+=r'$x_{'+str(j+1)+'}='+S.latex(x[j])+r'$ là tham số tự do.'+'\n\n'
    for i in reversed(range(u.rows)):
        indices=[j for j in range(u.cols) if u[i,j]!=0]
        if not indices:
            assert y[i]==0;out+=r'Hàng '+str(i+1)+r' cho $0=0$, không thêm ràng buộc.'+'\n\n';continue
        j=indices[0];known=sum(u[i,k]*x[k] for k in range(j+1,u.cols))
        out+=r'Hàng '+str(i+1)+r': $$x_{'+str(j+1)+r'}=\frac{'+S.latex(y[i])+'-('+S.latex(known)+')}{'+S.latex(u[i,j])+'}='+S.latex(x[j])+r'.$$'+'\n\n'
    out+=step(3,'Ghép nghiệm và kiểm tra',r'$$x='+tex(x)+r',\qquad LUx='+tex(l*u*x)+'='+tex(b)+r'.$$ Mọi tham số còn lại đều được phép vì phép thế lại đúng với mọi giá trị thực của chúng.')
    return out


def steady_text(p):
    p=S.Matrix(p);a=(p-S.eye(p.rows)).col_join(S.ones(1,p.rows));b=S.zeros(p.rows,1).col_join(S.ones(1,1));aug=a.row_join(b)
    out=step(1,'Viết đủ điều kiện phân bố dừng',r'Giải $Ps=s$, tức $(P-I)s=0$, kèm phương trình $s_1+\cdots+s_n=1$. Ma trận ghép của **cả hai** điều kiện: $$'+tex(aug)+r'.$$')
    reduced,trace=reduction_trace(aug);out+=trace
    v=(p-S.eye(p.rows)).nullspace()[0];v=S.simplify(v/sum(v));assert p*v==v and sum(v)==1 and all(t>=0 for t in v)
    out+=step(2,'Đọc và kiểm tra phân bố',r'$$s='+tex(v)+r'.$$ Mọi thành phần không âm, tổng bằng 1; nhân trực tiếp cho $$Ps='+tex(p*v)+r'=s.$$')
    return out


def evolution_text(p,start,n):
    p=S.Matrix(p);state=S.Matrix(start);out=r'Bắt đầu từ $s_0='+tex(state)+r'$. Mỗi lần chuyển nhân thêm $P$ bên trái.'+'\n\n'
    for i in range(1,n+1):
        expanded=r'\begin{bmatrix}'+r'\\'.join('+'.join('('+S.latex(p[row,j])+')('+S.latex(state[j])+')' for j in range(p.cols)) for row in range(p.rows))+r'\end{bmatrix}'
        state=p*state;assert sum(state)==1
        out+=r'$$s_'+str(i)+r'=Ps_'+str(i-1)+'='+expanded+'='+tex(state)+r'.$$'+'\n\n'
    return out
