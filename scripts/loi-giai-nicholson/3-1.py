from common import *
a,b,c,d,e,p,q,k,s,t,u,x,y,z,theta=S.symbols('a b c d e p q k s t u x y z theta',real=True)
aa=[[[2,-1],[3,2]],[[6,9],[8,12]],[[a*a,a*b],[a*b,b*b]],[[a+1,a],[a,a-1]],[[S.cos(theta),-S.sin(theta)],[S.sin(theta),S.cos(theta)]],[[2,0,-3],[1,2,5],[0,3,0]],[[1,2,3],[4,5,6],[7,8,9]],[[0,a,0],[b,c,d],[0,e,0]],[[1,b,c],[b,c,1],[c,1,b]],[[0,a,b],[a,0,c],[b,c,0]],[[0,1,-1,0],[3,0,0,2],[0,1,2,1],[5,0,0,7]],[[1,0,3,1],[2,2,6,0],[-1,0,-3,1],[4,1,12,0]],[[3,1,-5,2],[1,3,0,1],[1,0,5,2],[1,1,2,-1]],[[4,-1,3,-1],[3,1,0,2],[0,1,2,2],[1,2,-1,1]],[[1,-1,5,5],[3,1,2,4],[-1,-3,8,0],[1,1,2,-1]],[[0,0,0,a],[0,0,b,p],[0,c,q,k],[d,s,t,u]]]
out=[]
for i,A in enumerate(aa):
    A=M(A);terms=[S.simplify((-1)**j*A[0,j]*A.minor_submatrix(0,j).det())for j in range(A.cols)]
    out.append('**'+chr(97+i)+r'.** Khai triển hàng đầu, các hạng $a_{1j}C_{1j}$ lần lượt là $'+r',\;'.join(S.latex(v)for v in terms)+r'$. Cộng và rút gọn được $$\det A='+S.latex(S.factor(S.trigsimp(A.det())))+r'.$$')
add('3.1.1','\n\n'.join(out))
add('3.1.2',r'Khai triển theo hàng toàn 0: $\det A=\sum_j0\cdot C_{ij}=0$. Nếu là cột toàn 0, khai triển theo cột ấy cũng được tổng các số 0. Không cần tính các phần bù đại số.')
add('3.1.3',r'Ô ở hàng cuối, cột cuối có chỉ số $(n,n)$. Dấu trong khai triển là $(-1)^{n+n}=(-1)^{2n}=1$, vì $2n$ luôn chẵn. Điều này đúng cho mọi cấp $n\ge1$.')
add('3.1.4',r'Khai triển $\det I_n$ theo hàng đầu: chỉ ô (1,1) khác 0, bằng 1 và có dấu dương; ma trận con là $I_{n-1}$. Vì vậy $\det I_n=\det I_{n-1}$. Lặp lại đến $I_1=[1]$, định thức bằng 1.')
aa=[[[1,-1,2],[3,1,1],[2,-1,3]],[[-1,3,1],[2,5,3],[1,-2,1]],[[-1,-1,1,0],[2,1,1,3],[0,1,1,2],[1,3,-1,2]],[[2,3,1,1],[0,2,-1,3],[0,5,1,1],[1,1,2,5]]]
out=[]
for i,A in enumerate(aa):
    A=M(A);l,v,sw=A.LUdecomposition();sgn=(-1)**len(sw);assert A.det()==sgn*S.prod(v[j,j]for j in range(A.rows))
    out.append('**'+chr(97+i)+r'.** Khử bằng cộng bội hàng, đổi hàng khi pivot bằng 0. Thu ma trận tam giác trên $$U='+tex(v)+r'.$$ Số lần đổi hàng là $'+str(len(sw))+r'$, nên $\det A=(-1)^{'+str(len(sw))+r'}\prod_j u_{jj}='+S.latex(A.det())+r'$. Các phép cộng bội hàng không đổi định thức.')
add('3.1.5','\n\n'.join(out))
add('3.1.6',r'**a.** Hàng 2 cộng hàng 3 bằng hai lần hàng 1. Các hàng phụ thuộc nên định thức bằng 0. **b.** Hàng 2 trừ hàng 1 bằng $(b,b,b)$, là $b/2$ lần hàng 3. Trừ bội hàng ấy làm xuất hiện hàng 0, nên định thức bằng 0, kể cả khi $b=0$.')
base=M([[a,b,c],[p,q,s],[x,y,z]])
add('3.1.7',r'Gọi ba hàng gốc là $r_1,r_2,r_3$, $D=-1$. Dùng tính tuyến tính theo từng hàng và định thức bằng 0 nếu hai hàng tỷ lệ. **a.** $\det[-r_3;3r_2+r_1;2r_2]=-2\det[r_3;r_1;r_2]=-2D=2$ (phép xoay vòng ba hàng có dấu dương). **b.** $\det[-2r_1;2r_2+r_3;3r_3]=-12D=12$.')
add('3.1.8',r'Viết ma trận mới là $CB$ với $B$ chứa ba hàng gốc. **a.** $C=\begin{bmatrix}0&1&1\\1&0&1\\1&1&0\end{bmatrix}$ có định thức 2. Do đó $\det(CB)=2\det B$. Có thể khai triển tuyến tính từng hàng để không dùng định lý tích. **b.** $C=\begin{bmatrix}2&1&0\\0&2&1\\1&0&2\end{bmatrix}$ có định thức $8+1=9$, nên $\det(CB)=9\det B$.')
add('3.1.9',r'**a. Sai:** $A=B=I_2$, $\det(A+B)=4\ne2$. **b. Sai:** $\operatorname{diag}(1,0)$ suy biến nhưng hai hàng khác nhau. **c. Đúng:** với $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$, cả hai định thức đều $ad-bc$. **d. Sai:** $A=2I_2$ có định thức 4, RREF là $I_2$ có định thức 1. **e. Đúng:** nhân cả hai hàng với 7 nhân định thức với $7^2=49$. **f. Sai:** lấy $A=I$ thì $1\ne-1$. **g. Sai trong cấp chẵn:** $A=I_2$ cho 1 thay vì -1; công thức đúng là $\det(-A)=(-1)^n\det A$. **h. Sai:** $I_2$ và $\operatorname{diag}(2,1/2)$ có cùng định thức 1 nhưng khác nhau.')
aa=[[[1,-1,2,0,-2],[0,1,0,4,1],[1,1,5,0,0],[0,0,0,3,-1],[0,0,0,1,1]],[[1,2,0,3,0],[-1,3,1,4,0],[0,0,2,1,1],[0,0,-1,0,2],[0,0,3,0,1]]]
add('3.1.10','\n\n'.join('**'+chr(97+i)+r'.** Ma trận có khối 0 ở góc dưới trái. Tách khối $'+str(3 if i==0 else 2)+r'\times'+str(3 if i==0 else 2)+r'$ ở góc trên trái; định thức bằng tích định thức hai khối đường chéo: $'+S.latex(M(A)[:(3 if i==0 else 2),:(3 if i==0 else 2)].det())+r'\cdot('+S.latex(M(A)[(3 if i==0 else 2):,(3 if i==0 else 2):].det())+r')='+S.latex(M(A).det())+r'$.'for i,A in enumerate(aa)))
add('3.1.11',r'Cả bốn ma trận đều tính được bằng cách tách các khối tam giác liên tiếp. **a.** Tam giác khối trên: $\det A\det B\det C=-6$. **b.** Tam giác khối dưới: cũng bằng $-6$. **c.** Tách khối đầu $A$ và khối dưới phải $\begin{bmatrix}B&0\\Z&C\end{bmatrix}$, được $-6$. **d.** Tách khối dưới phải $C$ và khối trên trái $\begin{bmatrix}A&X\\0&B\end{bmatrix}$, cũng được $-6$. Các khối ngoài đường chéo không ảnh hưởng trong các dạng tam giác khối này.')
add('3.1.12',r'Ba cột ấy đều thuộc không gian sinh bởi $e_1,e_2$, nên phụ thuộc tuyến tính. Do đó toàn bộ các cột của $A$ phụ thuộc và $\det A=0$. Cũng có thể cộng bội ba cột để tạo cột 0 rồi khai triển theo cột ấy.')
add('3.1.13',r'**a.** $\det(2A)=2^3\det A=6$, nên $\det A=3/4$. **b.** $\det(-A)=(-1)^n\det A$. Vì vậy bằng $\det A$ khi $n$ chẵn hoặc $\det A=0$. Nếu $n$ lẻ và $A$ khả nghịch thì hai định thức đối dấu, không bằng nhau.')
aa=[[[x-1,2,3],[2,-3,x-2],[-2,x,-2]],[[x-1,-3,1],[2,-1,x-1],[-3,x+2,-2]]]
add('3.1.14','\n\n'.join('**'+chr(97+i)+r'.** Cộng hai hàng dưới vào hàng đầu được $'+tex(M([list(sum((M(A)[j,:]for j in range(3)),S.zeros(1,3)))]))+r'$. Rút nhân tử chung của hàng này, rồi khai triển định thức theo hàng/cột thuận tiện, thu $$\det A='+S.latex(S.factor(M(A).det()))+r'.$$'for i,A in enumerate(aa)))
add('3.1.15',r'**a.** Hệ số của $y$ là phần bù đại số $C_{23}=-\det\begin{bmatrix}5&-1\\-5&4\end{bmatrix}=-(20-5)=-15$, nên $b=-15$. **b.** Hệ số của $z$ là $C_{32}=-\det\begin{bmatrix}2&-1\\1&3\end{bmatrix}=-(6+1)=-7$, nên $c=-7$. Phần bù không chứa biến ở ô đang khai triển.')
aa=[[[0,x,y],[y,0,x],[x,y,0]],[[1,x,x],[-x,-2,x],[-x,-x,-3]],[[1,x,x*x,x**3],[x,x*x,x**3,1],[x*x,x**3,1,x],[x**3,1,x,x*x]],[[x,y,0,0],[0,x,y,0],[0,0,x,y],[y,0,0,x]]]
dets=[S.factor(M(A).det())for A in aa]
add('3.1.16',r'Tính định thức rồi phân tích nhân tử: '+ '\n\n'+cases([S.latex(v)for v in dets])+r'Vì $x,y$ thực: **a.** $x^3+y^3=0\Leftrightarrow y=-x$. **b.** $6-4x^2=0\Leftrightarrow x=\pm\sqrt6/2$. **c.** Các nghiệm thực là $x=\pm1$. **d.** $x^4-y^4=0\Leftrightarrow y=x$ hoặc $y=-x$; các thừa số tổng bình phương không thêm nghiệm ngoài gốc tọa độ đã có.')
add('3.1.17',r'Trừ hàng 2 khỏi hàng 3 và 4: hai hàng cuối trở thành $(0,x,-x,0)$, $(0,x,0,-x)$. Rút $x$ từ mỗi hàng được nhân tử $x^2$. Định thức còn lại, khai triển theo cột đầu rồi tính hai định thức cấp 3, bằng $-3$. Vậy định thức ban đầu bằng $-3x^2$. Lập luận không chia cho $x$, nên đúng cả $x=0$.')
add('3.1.18',r'Thực hiện các phép cột theo thứ tự từ phải sang trái: $C_4\leftarrow C_4-xC_3$, $C_3\leftarrow C_3-xC_2$, $C_2\leftarrow C_2-xC_1$. Hàng đầu trở thành $(1,0,0,0)$; ba hàng dưới trong ba cột cuối tạo ma trận tam giác dưới với đường chéo $1-ax,1-bx,1-cx$. Khai triển hàng đầu rồi lấy tích đường chéo cho $(1-ax)(1-bx)(1-cx)$.')
add('3.1.19',r'Lập $$xI-C=\begin{bmatrix}x&-1&0&0\\0&x&-1&0\\0&0&x&-1\\a&b&c&x+d\end{bmatrix}.$$ Khai triển theo hàng cuối: các phần bù lần lượt cho $a$, $bx$, $cx^2$, $(x+d)x^3$. Cộng được $a+bx+cx^2+dx^3+x^4=p(x)$. Dấu âm trên siêu đường chéo đã được tính cùng dấu phần bù.')
add('3.1.20',r'Cộng hàng 2 và 3 vào hàng đầu: hàng mới có ba ô cùng bằng $a+b+c+3x$. Rút nhân tử ấy ra, hàng đầu còn $(1,1,1)$. Trừ cột đầu khỏi cột 2 và cột 3 rồi khai triển theo hàng đầu. Định thức cấp 2 còn lại rút gọn thành $ab+ac+bc-a^2-b^2-c^2$. Nhân lại được đúng biểu thức cần chứng minh; do không chia cho nhân tử nên đúng cả khi nó bằng 0.')
add('3.1.21',r'Khai triển theo cột $j$: $T(v)=\sum_i v_iC_{ij}$. Khi thay đổi riêng cột $j$, các phần bù $C_{ij}$ không đổi vì chúng được tính bằng cách xóa cột này. Do đó $T(x+y)=\sum_i(x_i+y_i)C_{ij}=T(x)+T(y)$ và $T(ax)=\sum_i ax_iC_{ij}=aT(x)$. Đây chính là tính tuyến tính theo một cột cố định.')
add('3.1.22',r'Đảo ngược thứ tự $n$ cột để biến ma trận thành tam giác dưới, đường chéo $a_1,\ldots,a_n$. Hoán vị đảo cần $n(n-1)/2$ lần đổi chỗ, nên định thức ban đầu là $(-1)^{n(n-1)/2}\prod_i a_i$. Khi $n=2k$ hoặc $2k+1$, số $n(n-1)/2$ có cùng tính chẵn lẻ với $k$, cho công thức $(-1)^ka_1\cdots a_n$.')
add('3.1.23',r'Cột đầu chỉ có hai ô 1: ở hàng 1 và hàng $n$. Xóa hàng 1, cột 1 cho ma trận tam giác trên đường chéo toàn 1, định thức 1. Xóa hàng $n$, cột 1 cho ma trận tam giác dưới đường chéo toàn 1, cũng định thức 1. Dấu hai phần bù là $+1$ và $(-1)^{n+1}$, nên tổng bằng $1+(-1)^{n+1}$. Với $n=2$ hai hàng trùng nhau, công thức cũng cho 0.')
add('3.1.24',r'Đảo thứ tự các cột là hoán vị có $n(n-1)/2$ nghịch thế. Mỗi đổi hai cột đổi dấu định thức, nên $$\det B=(-1)^{n(n-1)/2}\det A.$$ Hệ số dương khi $n\equiv0,1\pmod4$, âm khi $n\equiv2,3\pmod4$.')
add('3.1.25',r'Khai triển theo hàng được nhân với $c$. Các phần bù đại số không đổi vì hàng ấy bị xóa khi lập ma trận con. Do đó $\det B=\sum_j(ca_{ij})C_{ij}=c\det A$. Lập luận theo cột hoàn toàn tương tự. Nhân cả ma trận với $c$ tức nhân cả $n$ hàng, cho hệ quả $\det(cA)=c^n\det A$.')
add('3.1.26',r'Khai triển hàng đầu được $x(y_1-y_2)-y(x_1-x_2)+x_1y_2-y_1x_2=0$. Đây là phương trình bậc nhất theo $x,y$; hai hệ số của $x,y$ không đồng thời bằng 0 vì hai điểm khác nhau. Thay mỗi điểm vào cho 0 (hai hàng của định thức trùng nhau). Vậy đây chính là đường thẳng qua hai điểm, kể cả trường hợp đường thẳng đứng.')
aa=[M([[3,2],[1,-1]]),M([[1,-1,1],[0,1,0],[8,2,2]])];out=[]
for i,A in enumerate(aa):
    cp=A.charpoly();poly=cp.as_expr().subs(cp.gen,x);val=S.zeros(A.rows)
    for (degree,),coeff in S.Poly(poly,x).terms():val+=coeff*A**degree
    assert val==S.zeros(A.rows)
    out.append('**a.'+str(i+1)+r'.** $c_A(x)='+S.latex(poly)+r'$. Thay $x$ bởi $A$ (hệ số hằng nhân với $I$), tính các lũy thừa rồi cộng được $c_A(A)='+tex(val)+r'$, xác nhận định lý.')
add('3.1.27','\n\n'.join(out)+r' **b.** Với $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$, $c_A(x)=x^2-(a+d)x+(ad-bc)$. Nhân $A^2$ cho các ô $a^2+bc$, $b(a+d)$, $c(a+d)$, $d^2+bc$. Trừ $(a+d)A$ rồi cộng $(ad-bc)I$, cả bốn ô đều bằng 0. Vì vậy $c_A(A)=0$.')
save()
