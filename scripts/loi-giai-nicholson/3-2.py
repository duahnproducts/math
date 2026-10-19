from common import *
a,b,c,p,q,r,x=S.symbols('a b c p q r x',real=True)
aa=[M([[5,1,3],[-1,2,3],[1,4,8]]),M([[1,-1,2],[3,1,0],[0,-1,1]]),M([[1,0,-1],[-1,1,0],[0,-1,1]]),M([[-1,2,2],[2,-1,2],[2,2,-1]])/3]
add('3.2.1','\n\n'.join('**'+chr(97+i)+'.**\n\n'+cofactor_text(A) for i,A in enumerate(aa)))

aa=[M([[1,0,3],[3,-4,c],[2,5,8]]),M([[0,c,-c],[-1,2,1],[c,-c,c]]),M([[c,1,0],[0,2,c],[-1,c,5]]),M([[4,c,3],[c,2,c],[5,c,4]]),M([[1,2,-1],[0,-1,c],[2,c,1]]),M([[1,c,-1],[c,1,1],[0,1,c]])]
add('3.2.2','\n\n'.join('**'+chr(97+i)+'.**\n\n'+determinant_text(A)+r' Ma trận khả nghịch đúng khi định thức khác 0. Giải phương trình định thức bằng 0 cho các giá trị phải loại: $c\in\{'+','.join(S.latex(v) for v in S.solve(A.det(),c))+r'\}$. Mọi số thực khác các giá trị đó đều cho ma trận khả nghịch.' for i,A in enumerate(aa)))
add('3.2.3',r'Dùng định thức của tích bằng tích định thức, $\det C^T=\det C$, $\det B^{-1}=1/\det B$. **a.** $(-1)^3\cdot2\cdot3\cdot(1/2)=-3$. **b.** $2^2\cdot(1/3)\cdot(-1)\cdot(1/2)\cdot3=-2$. Các thừa số định thức là số thực nên được phép rút gọn.')
add('3.2.4',r'**a.** $\det(B^{-1}AB)=(\det B)^{-1}\det A\det B=\det A$. **b.** $\det(A^{-1}B^{-1}AB)=(\det A)^{-1}(\det B)^{-1}\det A\det B=1$. Chỉ rút gọn các định thức vô hướng, không đổi thứ tự tích ma trận.')
add('3.2.5',r'Đặt $d=\det A$, $e=\det B$. Vì cấp 3, $\det(2A^{-1})=8/d=-4$, nên $d=-2$. Tiếp theo $\det(A^3(B^{-1})^T)=d^3/e=-4$, nên $e=(-8)/(-4)=2$. Vậy $\det A=-2$, $\det B=2$.')
add('3.2.6',r'Gọi các hàng của $A$ là $r_1,r_2,r_3$, $\det A=3$. **a.** $B=[4r_3^T\;2r_1^T\;-r_2^T]$. Thứ tự (3,1,2) có dấu dương, nên $\det B=4\cdot2\cdot(-1)\cdot3=-24$. Do đó $\det(2B^{-1})=8/(-24)=-1/3$. **b.** $C=[2r_2^T\;(-r_1+r_3)^T\;3r_3^T]$. Tuyến tính theo cột giữa bỏ hạng có hai cột tỷ lệ, nên $\det C=-6\det[r_2^T,r_1^T,r_3^T]=18$. Vậy $\det(2C^{-1})=8/18=4/9$.')
A=M([[a,b],[c,p]]);m1=M([[2,-2,0],[c+1,-1,2*a],[p-2,2,2*b]]);m2=M([[2*b,0,4*p],[1,2,-2],[a+1,2,2*(c-1)]])
# d is named p in symbolic calculations here.
assert S.expand(m1.det()+4*(a*p-b*c))==0;assert S.expand(m2.det()+8*(a*p-b*c))==0
add('3.2.7',r'**a.** Khai triển hàng đầu: $2(-2b-4a)+2[2b(c+1)-2a(d-2)]$, rút gọn thành $-4(ad-bc)=8$. **b.** Khai triển theo cột 2 hoặc trừ hàng 2 khỏi hàng 3 rồi rút gọn được $-8(ad-bc)=16$. **c.** $\det A=\det\begin{bmatrix}3c&a+c\\3d&b+d\end{bmatrix}=3bc-3ad=-3(ad-bc)=6$. Do cấp 2, $\det(3A^{-1})=9/6=3/2$.')
systems=[([[2,1],[3,7]],[1,-2]),([[3,4],[2,-1]],[9,-1]),([[5,1,-1],[2,-1,-2],[3,0,2]],[-7,6,-7]),([[4,-1,3],[6,2,-1],[3,3,2]],[1,0,-1])]
out=[]
for i,(A,B) in enumerate(systems):
 out.append('**'+chr(97+i)+'.**\n\n'+cramer_text(A,B))
add('3.2.8','\n\n'.join(out))
aa9=[M([[3,2,1],[1,1,2],[-1,2,1]]),M([[1,2,-1],[3,1,1],[0,4,7]])]
add('3.2.9','\n\n'.join('**'+chr(97+i)+r'.** $(A^{-1})_{23}=C_{32}/\det A$. Xóa hàng 3, cột 2 rồi nhân dấu $(-1)^5$ cho $C_{32}='+S.latex(A.cofactor(2,1))+r'$; $\det A='+S.latex(A.det())+r'$. Vậy ô cần tìm là $'+S.latex(A.inv()[1,2])+r'$.'for i,A in enumerate(aa9)))
add('3.2.10',r'Đặt $d=\det A$. **a.** $d^2=d$, nên $d\in\{0,1\}$. **b.** $d^2=1$, nên $d=\pm1$. **c.** $d^3=d$, nên $d\in\{-1,0,1\}$. **d.** Nhân $P^{-1}$ được $A=I$, nên $d=1$. **e.** $d^2=u^nd$, nên $d=0$ hoặc $d=u^n$; nếu $A$ khả nghịch thì $A=uI$. **f.** $d=\det(-A^T)=(-1)^nd$; nếu $n$ lẻ thì $d=0$, nếu $n$ chẵn thì không có ràng buộc từ riêng đẳng thức này (thực tế định thức phản đối xứng thực không âm). **g.** $A^2=-I$ cho $d^2=(-1)^n$. Không có ma trận thực khi $n$ lẻ; khi $n$ chẵn, thực tế $d=1$: các trị riêng phức đi theo cặp $i,-i$, mỗi cặp có tích 1.')
add('3.2.11',r'Với mỗi ô $(i,j)$, $[(uI)A]_{ij}=\sum_k u\delta_{ik}a_{kj}=ua_{ij}$, nên $uA=(uI)A$. Áp dụng định thức của tích: $\det(uA)=\det(uI)\det A=u^n\det A$, vì $uI$ chéo có $n$ ô đường chéo bằng $u$. Công thức đúng cả $u=0$.')
add('3.2.12',r'Lấy định thức hai vế: $\det A\det B=\det(-BA)=(-1)^n\det B\det A=-\det A\det B$ vì $n$ lẻ. Suy ra $2\det A\det B=0$, nên ít nhất một trong hai định thức bằng 0. Do đó ít nhất một ma trận không khả nghịch.')
add('3.2.13',r'$\det(AB)=\det A\det B=\det B\det A=\det(BA)$. Tính giao hoán dùng cho hai số định thức, không suy ra $AB=BA$. Kết quả không cần giả thiết khả nghịch.')
add('3.2.14',r'Từ $A^k=0$, lấy định thức được $(\det A)^k=0$, nên $\det A=0$ và $A$ không khả nghịch. Cách khác: nếu khả nghịch, nhân với $A^{-k}$ sẽ cho $I=0$, vô lý.')
add('3.2.15',r'Gọi $C$ là ma trận phần bù đại số, nên $C^T=\operatorname{adj}A=(\det A)A^{-1}=(\det A)A^T$. Chuyển vị: $$C=(\det A)A.$$ Vì $A^{-1}=A^T$, $\det A=\pm1$, nên $C=A$ nếu định thức 1 và $C=-A$ nếu định thức -1.')
add('3.2.16',r'Nếu ma trận thực cấp 3 thỏa $A^2=-I_3$, thì $(\det A)^2=\det(-I_3)=-1$, không thể với số thực. Cấp 2 có ví dụ $$A=\begin{bmatrix}0&-1\\1&0\end{bmatrix},\quad A^2=-I_2.$$')
add('3.2.17',r'Chuyển vị tổng: $(A+B^T)^T=A^T+B$. Vì định thức không đổi khi chuyển vị, $\det(A+B^T)=\det((A+B^T)^T)=\det(A^T+B)$. Không cần điều kiện nào ngoài cùng cấp vuông.')
add('3.2.18',r'Nếu $\det A=\det B\ne0$, đặt $U=AB^{-1}$. Khi đó $A=UB$ và $\det U=\det A/\det B=1$. Ngược lại, nếu $A=UB$ với $\det U=1$, định thức của tích cho $\det A=\det U\det B=\det B$.')
add('3.2.19','\n\n'.join('**'+chr(97+i)+'.**\n\n'+inverse_case(A) for i,A in enumerate(aa)))
add('3.2.20',r'**a. Sai:** mọi ma trận vuông có adjugate, kể cả $0$. **b. Đúng:** $\operatorname{adj}A=(\det A)A^{-1}=A^{-1}$, nhân $A$ được $(\det A)I=I$. **c. Đúng:** hai vế cùng bằng $\det A\det B$. **d. Đúng:** $\det A\ne0$ nên nhân $A^{-1}$ khử $A$. **e. Sai:** $A=0$ phản đối xứng nhưng định thức 0. **f. Sai:** $A=\operatorname{diag}(1,0,0)$ có mọi minor cấp 2 bằng 0, nên adj bằng 0 nhưng $A\ne0$. **g. Đúng:** adj bằng số khác 0 nhân $A^{-1}$. **h. Sai:** $A=\begin{bmatrix}0&0\\1&1\end{bmatrix}$ có adj $\begin{bmatrix}1&0\\-1&0\end{bmatrix}$, không hàng nào toàn 0. **i. Sai:** $A=0$ cho định thức 0; công thức đúng là $\det(A^TA)=(\det A)^2\ge0$. **j. Sai:** $A=I_2$ cho 4 khác 2. **k. Đúng:** $\det A\det B\ne0$ nên cả hai khác 0. **l. Sai:** $A=\operatorname{diag}(2,1/2)$ có adj $\operatorname{diag}(1/2,2)\ne A$. **m. Đúng:** công thức nghịch đảo qua adjugate nhân với $d$.')
add('3.2.21',r'Gọi hai cột là $u,v$. Định thức bằng 0 nên hệ $A(s,t)^T=0$ có nghiệm $(s,t)\ne(0,0)$, tức $su+tv=0$. Nếu $t\ne0$, $v=-(s/t)u$. Nếu $t=0$, thì $s\ne0$ và $u=0=0v$. Vậy trong mọi trường hợp một cột là bội vô hướng của cột kia, kể cả cột 0.')
def interpolate_text(points):
    pts=[(S.Rational(str(a)),S.Rational(str(b)))for a,b in points];poly=S.interpolate(pts,x)
    assert all(poly.subs(x,a)==b for a,b in pts)
    a=M([[xi**j for j in range(len(pts))] for xi,yi in pts]);b=M([yi for xi,yi in pts]);aug=a.row_join(b);r,trace=reduction_trace(aug)
    return step(1,'Đặt dạng đa thức',r'$p(x)=\sum_{j=0}^{'+str(len(pts)-1)+r'}c_jx^j$. Mỗi điểm $(x_i,y_i)$ cho phương trình $c_0+c_1x_i+\cdots+c_{n-1}x_i^{n-1}=y_i$.')+step(2,'Lập hệ từ từng điểm',r'Ma trận ghép các phương trình là $$'+tex(aug)+r'.$$ Mỗi hàng ứng với một điểm; các cột lần lượt là hệ số của $c_0,c_1,\ldots$.')+trace+step(3,'Đọc hệ số và kiểm tra',r'Khối phải của RREF cho các hệ số theo thứ tự, nên $$p(x)='+S.latex(poly)+r'.$$ Các hoành độ khác nhau nên ma trận Vandermonde khả nghịch; đa thức bậc không quá '+str(len(pts)-1)+r' này là duy nhất. Kiểm tra từng điểm: '+', '.join('$p('+S.latex(xi)+')='+S.latex(poly.subs(x,xi))+'$' for xi,yi in pts)+'.')
add('3.2.22','**a.** '+interpolate_text([(0,2),(1,3),(3,8)])+'\n\n**b.** '+interpolate_text([(0,5),(1,3),(2,5)]))
add('3.2.23','**a.** '+interpolate_text([(0,1),(1,1),(-1,4),(2,-5)])+'\n\n**b.** '+interpolate_text([(0,1),(1,1),(-1,2),(-2,-3)]))
points=[[(0,1),(1,2),(2,5),(3,10)],[(0,1),(1,1.49),(2,-.42),(3,-11.33)],[(0,2),(1,2.03),(2,-.40),(-1,.89)]]
add('3.2.24','\n\n'.join('**'+chr(97+i)+'.** '+interpolate_text(pts)+r' Tại $x=1.5$, $y\approx p(1.5)='+S.latex(S.interpolate([(S.Rational(str(a)),S.Rational(str(b)))for a,b in pts],x).subs(x,S.Rational(3,2)))+r'$.'for i,pts in enumerate(points)))
A=M([[1,a,b],[-a,1,c],[-b,-c,1]])
add('3.2.25',r'Khai triển hàng đầu: $\det A=(1+c^2)-a(-a+bc)+b(ac+b)=1+a^2+b^2+c^2>0$. Vì vậy luôn khả nghịch với mọi $a,b,c$ thực. Tính bảng phần bù rồi chuyển vị cho $$A^{-1}=\frac1{1+a^2+b^2+c^2}'+tex(A.adjugate())+r'.$$ Nhân hai chiều xác nhận bằng $I$.')
A=M([[a,p,q],[0,b,r],[0,0,c]])
add('3.2.26',r'**a.** Ma trận tam giác có $\det A=abc$, nên khả nghịch đúng khi $abc\ne0$. Giải $AX=I$ bằng thế ngược được $$A^{-1}='+tex(A.inv())+r'.$$ **b.** Cột $j$ của $A^{-1}$ là nghiệm $Ax=e_j$. Thế ngược từ hàng $n$ về hàng $j+1$ cho các thành phần $x_n,\ldots,x_{j+1}$ đều bằng 0. Do đó các ô dưới đường chéo của nghịch đảo bằng 0; nghịch đảo tam giác trên.')
add('3.2.27',r'**(1) ⇒ (2).** Định thức của ma trận nguyên là số nguyên. Vì $A,A^{-1}$ đều nguyên, $\det A$ và $\det A^{-1}$ là hai số nguyên có tích 1, nên $\det A=\pm1$. **(2) ⇒ (1).** Định thức khác 0 nên $A$ khả nghịch; mọi ô của adjugate là định thức con có dấu, đều nguyên. Công thức $A^{-1}=\operatorname{adj}A/\det A=\pm\operatorname{adj}A$ cho nghịch đảo nguyên.')
B=M([[3,0,1],[0,2,3],[3,1,-1]])
add('3.2.28',r'$\det(A^{-1})='+S.latex(B.det())+r'$, nên $\det A='+S.latex(1/B.det())+r'$. Do đó $$\operatorname{adj}A=(\det A)A^{-1}='+tex(B/B.det())+r'.$$ Không cần tìm riêng $A$.')
add('3.2.29',r'Vì $\operatorname{adj}A=2A^{-1}$, có $A^{-1}+4\operatorname{adj}A=9A^{-1}$. Cấp 3 cho $\det(9A^{-1})=9^3/\det A=729/2$.')
add('3.2.30',r'Đổi chỗ hai nhóm $n$ hàng, mỗi nhóm $n$ hàng, để được $\begin{bmatrix}B&X\\0&A\end{bmatrix}$. Có $n^2$ lần đổi hai hàng, nên định thức gốc là $(-1)^{n^2}\det B\det A=(-1)^n\det A\det B$. Với $n=2$ dấu dương như đề; với $n=3$ dấu âm. Công thức không phụ thuộc $X$.')
add('3.2.31',r'Cột 0 khiến $\det A=0$, nên $A\operatorname{adj}A=0$. Nếu $\operatorname{rank}A\le n-2$, mọi minor cấp $n-1$ bằng 0, do đó adj bằng 0, hạng 0. Nếu $\operatorname{rank}A=n-1$, có ít nhất một minor cấp $n-1$ khác 0 nên adj khác 0. Mọi cột của adj thuộc $\ker A$, không gian một chiều; vậy hạng adj bằng 1. Cả hai khả năng xảy ra: $A=0$ và $A=\operatorname{diag}(1,\ldots,1,0)$.')
add('3.2.32',r'Đặt $d=\det A\ne0$. Vì cấp 3, $\det(\operatorname{adj}A)=d^2$. Do đó $$\det(-A^2(\operatorname{adj}A)^{-1})=(-1)^3\frac{d^2}{d^2}=-1.$$')
add('3.2.33',r'Mỗi ô của adjugate là phần bù đại số chuyển vị, được tính bằng định thức của ma trận con cấp $n-1$. Nhân $A$ với $u$ nhân cả $n-1$ hàng của ma trận con với $u$, nên nhân mỗi phần bù với $u^{n-1}$. Do đó $\operatorname{adj}(uA)=u^{n-1}\operatorname{adj}A$, đúng cả khi $u=0$ (cấp 1 dùng quy ước adj bằng $[1]$).')
add('3.2.34',r'Đặt $d=\det A\ne0$, dùng $\operatorname{adj}A=dA^{-1}$ và $\det(\operatorname{adj}A)=d^{n-1}$. **a.** $\operatorname{adj}(\operatorname{adj}A)=d^{n-1}(dA^{-1})^{-1}=d^{n-2}A$. **b.** $\operatorname{adj}(A^{-1})=d^{-1}A=(dA^{-1})^{-1}=(\operatorname{adj}A)^{-1}$. **c.** $\operatorname{adj}(A^T)=d(A^{-1})^T=(\operatorname{adj}A)^T$. **d.** $\operatorname{adj}(AB)=\det A\det B\,(AB)^{-1}=(\det B)B^{-1}(\det A)A^{-1}=(\operatorname{adj}B)(\operatorname{adj}A)$. Thứ tự ở (d) bị đảo theo công thức nghịch đảo tích.')
save()
