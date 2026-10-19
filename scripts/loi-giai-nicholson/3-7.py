from common import *
x=S.symbols('x',real=True)
aa=[([[2,4],[3,3]],[0,1]),([[-1,5],[1,3]],[1,-1]),([[0,4,4],[1,1,-2],[-1,1,4]],[1,1,1]),([[2,1,2],[2,2,-2],[3,1,1]],[1,1,1])]
out=[]
for i,(a,b) in enumerate(aa):
 A,b=M(a),M(b);P,D=A.diagonalize();coeff=P.inv()*b
 general='+'.join('c_{'+str(j+1)+r'}e^{('+S.latex(D[j,j])+r')x}'+tex(P[:,j])for j in range(A.rows))
 f=S.simplify(P*S.diag(*[S.exp(D[j,j]*x)for j in range(A.rows)])*coeff);assert S.simplify(f.diff(x)-A*f)==S.zeros(A.rows,1) and f.subs(x,0)==b
 out.append('**'+chr(97+i)+r'.** '+eigen_text(A)+r' Để giải hệ vi phân, chọn cơ sở riêng theo thứ tự $$P='+tex(P)+r',\quad D='+tex(D)+r'.$$ Các cột độc lập vì $\det P\ne0$ và $AP=PD$. Nghiệm tổng quát theo định lý là $$f(x)='+general+r'.$$ Điều kiện đầu cho $c=P^{-1}f(0)='+tex(coeff)+r'$. Cụ thể, từ $f=Pg$ và $AP=PD$, suy ra $Pg\prime=PDg$, nên $g\prime=Dg$. Mỗi tọa độ giải phương trình $g_j\prime=\lambda_j g_j$, cho $g_j=c_je^{\lambda_jx}$. Do đó nghiệm cụ thể là $$f(x)='+tex(f)+r'.$$ Đạo hàm và nhân $A$ cho cùng vector; thế $x=0$ trả đúng điều kiện đầu.')
add('3.7.1','\n\n'.join(out))
add('3.7.2',r'Nghiệm tổng quát của $f\prime=af$ là $Ce^{ax}$. Thay $f(x_0)=k$ cho $C=ke^{-ax_0}$, nên $f(x)=ke^{a(x-x_0)}$. Đạo hàm cho $f\prime=af$, và tại $x=x_0$ được $k$. Công thức bao gồm $a=0$ và $k=0$.')
add('3.7.3',r'Gọi khối lượng $m(t)$. Định luật cho $m\prime=rm$, nên $m(t)=10e^{rt}$. Điều kiện $m(3)=8$ cho $e^{3r}=4/5$, $r=\ln(4/5)/3<0$. **a.** $m(t)=10(4/5)^{t/3}$ gram. **b.** Đặt $m(T)=5$: $(4/5)^{T/3}=1/2$, nên $$T=\frac{3\ln(1/2)}{\ln(4/5)}\approx9.319\text{ giờ}.$$')
add('3.7.4',r'Mô hình $N\prime=rN$, $N(0)=3$ triệu, cho $N(t)=3e^{rt}$ triệu. Gấp đôi sau 5 năm: $e^{5r}=2$, nên $r=\ln2/5$. Vì vậy $$N(t)=3\cdot2^{t/5}\text{ triệu người}.$$ Thế $t=0$ cho 3 triệu, $t=5$ cho 6 triệu.')
add('3.7.5',r'**a.** Đặt $f=g-A^{-1}b$. Vì $b$ không đổi, $f\prime=g\prime=Ag=A(f+A^{-1}b)=Af+b$. **b.** Với nghiệm $f$ bất kỳ, đặt $g=f+A^{-1}b$. Khi đó $g\prime=f\prime=Af+b=A(f+A^{-1}b)=Ag$. Vì vậy mọi nghiệm không thuần nhất nhận được từ nghiệm thuần nhất bằng phép tịnh tiến này. Điều kiện khả nghịch bảo đảm $A^{-1}b$ xác định; chéo hóa dùng để tìm $g$.')
add('3.7.6',r'**a.** Đặt $f_1=f$, $f_2=f\prime-a_1f$. Khi đó $f_1\prime=a_1f_1+f_2$. Mặt khác $f_2\prime=f\prime\prime-a_1f\prime=a_2f=a_2f_1$ theo phương trình đã cho. Vậy thu đúng hệ ma trận đề nêu. **b.** Nếu hệ đúng, đạo hàm $f_1\prime=a_1f_1+f_2$ cho $f_1\prime\prime=a_1f_1\prime+f_2\prime=a_1f_1\prime+a_2f_1$. Chuyển vế cho phương trình bậc hai ban đầu.')
add('3.7.7',r'**Sửa lỗi ký hiệu bản in:** cần đặt $f_3=f\prime\prime-a_1f\prime-a_2f$, thay vì hạng cuối $-a_2f\prime\prime$ được in trong đề. **a.** Với định nghĩa đúng, $f_1\prime=a_1f_1+f_2$; $f_2\prime=f\prime\prime-a_1f\prime=a_2f_1+f_3$; $f_3\prime=f\prime\prime\prime-a_1f\prime\prime-a_2f\prime=a_3f_1$. Đó là ba hàng của hệ. **b.** Từ hai phương trình đầu suy ra $f_1\prime\prime=a_1f_1\prime+a_2f_1+f_3$. Đạo hàm rồi dùng $f_3\prime=a_3f_1$ cho $f_1\prime\prime\prime-a_1f_1\prime\prime-a_2f_1\prime-a_3f_1=0$, là phương trình bậc ba của bài này. Tham chiếu “Equation 3.15” trong câu (b) cũng là lỗi đánh số, vì 3.15 là phương trình bậc hai của bài trước.')
save()
