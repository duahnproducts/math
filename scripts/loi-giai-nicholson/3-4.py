from common import *
x,n=S.symbols('x n',real=True)
def diagonal_text(A):
    A=M(A);cp=A.charpoly();poly=cp.as_expr().subs(cp.gen,x);groups=A.eigenvects();cols=[];terms=[];vals=[]
    for value,mult,basis in groups:
        terms.append(r'$\lambda='+S.latex(value)+r'$ (bội đại số '+str(mult)+r'), $E_\lambda=\operatorname{span}\{'+','.join(tex(v)for v in basis)+r'\}$')
        cols.extend(basis);vals.extend([value]*len(basis))
    result=r'$c_A(x)='+S.latex(S.factor(poly))+r'$. Giải $(A-\lambda I)v=0$ cho từng nghiệm: '+'; '.join(terms)+'. Vector riêng là mọi vector khác 0 trong các không gian vừa ghi. '
    if len(cols)==A.rows:
        P=M.hstack(*cols);D=S.diag(*vals);assert P.det()!=0 and A*P==P*D
        result+=r'Ghép các vector cơ sở theo thứ tự trên: $$P='+tex(P)+r',\qquad P^{-1}AP=D='+tex(D)+r'.$$ Kiểm tra $AP=PD$ và $\det P\ne0$.'
    else:result+=r'Tổng số vector cơ sở độc lập chỉ là '+str(len(cols))+r', nhỏ hơn cấp '+str(A.rows)+r', nên không chéo hóa được.'
    return result
aa=[[[1,2],[3,2]],[[2,-4],[-1,-1]],[[7,0,-4],[0,5,0],[5,0,-2]],[[1,1,-3],[2,0,6],[1,-1,5]],[[1,-2,3],[2,6,-6],[1,2,-1]],[[0,1,0],[3,0,1],[2,0,0]],[[3,1,1],[-4,-2,-5],[2,2,5]],[[2,1,1],[0,1,0],[1,-1,2]]]
add('3.4.1','\n\n'.join('**'+chr(97+i)+'.** '+diagonal_text(A)for i,A in enumerate(aa))+r' **i.** Với $A=\operatorname{diag}(\lambda,\lambda,\mu)$, $\lambda\ne\mu$, đa thức đặc trưng là $(x-\lambda)^2(x-\mu)$. $E_\lambda=\operatorname{span}\{e_1,e_2\}$, $E_\mu=\operatorname{span}\{e_3\}$. Chọn $P=I$, ma trận đã chéo; vector riêng là mọi vector khác 0 thuộc một trong hai không gian này.')
out=[]
for i,(A,P) in enumerate([([[6,-5],[2,-1]],[[1,5],[1,2]]),([[-7,-12],[6,-10]],[[-3,4],[2,-3]])]):
 A,P=M(A),M(P);D=P.inv()*A*P
 if not D.is_diagonal():
  out.append(r'**b. Lỗi dữ kiện bản in.** Với đúng $A,P$ được in, phép nhân cho $$P^{-1}AP='+tex(D)+r',$$ không phải ma trận chéo. Đa thức đặc trưng là $x^2+17x+142$, có nghiệm phức $(-17\pm i\sqrt{279})/2$. Để vẫn tính được lũy thừa, đặt $B=A+17I/2$; nhân cho $B^2=-279I/4$. Chọn $\theta$ với $\cos\theta=-17/(2\sqrt{142})$, $\sin\theta=\sqrt{279}/(2\sqrt{142})$. Khi đó $$A^n=(\sqrt{142})^n\left[\cos(n\theta)I+\frac{2\sin(n\theta)}{\sqrt{279}}B\right].$$ Công thức theo khai triển nhị thức hoặc đồng nhất thức lượng giác, đúng cả $n=0$. Không áp dụng gợi ý về $D^n$ cho ma trận $P^{-1}AP$ này như thể nó là ma trận chéo.')
  continue
 An=S.simplify(P*S.diag(*[v**n for v in D.diagonal()])*P.inv())
 out.append('**'+chr(97+i)+r'.** Nhân trực tiếp được $$P^{-1}AP='+tex(D)+r'.$$ Vì $A=PDP^{-1}$, các thừa số giữa triệt tiêu khi nhân lặp, nên $$A^n=PD^nP^{-1}='+tex(An)+r'.$$ Thế $n=0$ cho $I$ và $n=1$ cho $A$.')
add('3.4.2','\n\n'.join(out))
add('3.4.3',r'**a.** $A$ có hai trị riêng phân biệt 1,2, nên chéo hóa được; $B$ đã chéo. Nhưng $AB=\begin{bmatrix}2&3\\0&2\end{bmatrix}$ chỉ có trị riêng 2, không phải $2I$, nên không chéo hóa được (không gian riêng chỉ một chiều). **b.** Chọn $A=\begin{bmatrix}0&1\\0&2\end{bmatrix}$, có hai trị riêng phân biệt 0,2. Khi đó $D+A=\begin{bmatrix}1&1\\0&1\end{bmatrix}$ chỉ có trị riêng 1 và một vector riêng độc lập, nên không chéo hóa được.')
add('3.4.4',r'Nếu $A=PDP^{-1}$ với $D$ chéo, chuyển vị cho $A^T=(P^{-1})^TDP^T$. Đặt $Q=(P^{-1})^T$, thì $Q^{-1}=P^T$ và $A^T=QDQ^{-1}$, nên chéo hóa được. Chiều ngược áp dụng kết quả cho $A^T$, vì $(A^T)^T=A$.')
add('3.4.5',r'Viết $A=PDP^{-1}$ với $D$ chéo. **a.** $A^n=PD^nP^{-1}$, $D^n$ chéo. **b.** $kA=P(kD)P^{-1}$. **c.** $p(A)=Pp(D)P^{-1}$, $p(D)$ chéo. **d.** $U^{-1}AU=(U^{-1}P)D(U^{-1}P)^{-1}$. **e.** $kI+A=P(kI+D)P^{-1}$. Mỗi biểu thức cho trực tiếp một ma trận đổi cơ sở khả nghịch và ma trận chéo tương ứng.')
add('3.4.6',r'Chọn $A=\begin{bmatrix}1&0\\0&-1\end{bmatrix}$, $B=\begin{bmatrix}0&1\\0&2\end{bmatrix}$. $A$ đã chéo, $B$ có hai trị riêng phân biệt 0,2 nên chéo hóa được. Tổng $A+B=\begin{bmatrix}1&1\\0&1\end{bmatrix}$ có đa thức $(x-1)^2$ nhưng $\ker(A+B-I)=\operatorname{span}\{(1,0)^T\}$, chỉ một chiều. Vì vậy tổng không chéo hóa được.')
add('3.4.7',r'Viết $A=PDP^{-1}$, đường chéo của $D$ chỉ chứa 1 hoặc -1. Khi đó $D^2=I$, nên $A^2=PD^2P^{-1}=I$. Do đó $A$ khả nghịch và $A^{-1}=A$.')
add('3.4.8',r'Với $A=PDP^{-1}$, các ô đường chéo của $D$ là 0 hoặc 1, nên $D^2=D$. Suy ra $A^2=PD^2P^{-1}=PDP^{-1}=A$, tức $A$ lũy đẳng.')
add('3.4.9',r'Viết $D=\operatorname{diag}(\lambda_1,\ldots,\lambda_n)$ với $\lambda_i\ge0$. Đặt $C=\operatorname{diag}(\sqrt{\lambda_1},\ldots,\sqrt{\lambda_n})$, nên $C^2=D$. Chọn $B=PCP^{-1}$. Khi đó $B^2=PC^2P^{-1}=PDP^{-1}=A$. Căn chọn thực vì các trị riêng không âm, và được phép có trị riêng 0.')
add('3.4.10',r'Đặt $D=P^{-1}AP$, $E=P^{-1}BP$, đều chéo. Ma trận chéo giao hoán nên $DE=ED$. Nhân $P$ bên trái và $P^{-1}$ bên phải: $AB=PDEP^{-1}=PEDP^{-1}=BA$. Cần cùng một ma trận $P$ cho cả hai phép chéo hóa.')
add('3.4.11',r'Nếu $A^m=0$ và $Av=\lambda v$, thì $0=A^mv=\lambda^mv$, nên $\lambda=0$. Nếu thêm chéo hóa được, $A=P\operatorname{diag}(0,\ldots,0)P^{-1}=0$. Ngược lại ma trận 0 vừa nilpotent vừa đã chéo. Vậy ma trận duy nhất là ma trận 0 ở mỗi cấp.')
add('3.4.12',r'Viết $A=PDP^{-1}$. Điều kiện $A^m=I$ cho từng trị riêng thực $\lambda_i^m=1$. **a.** Nghiệm thực của phương trình này chỉ có 1 (và -1 khi $m$ chẵn), nên $\lambda_i^2=1$; suy ra $A^2=I$. **b.** Nếu $m$ lẻ, chỉ có $\lambda_i=1$, nên $D=I$ và $A=I$. Giả thiết trị riêng thực loại các nghiệm đơn vị phức khác.')
add('3.4.13',r'**a.** Từ $Av=\lambda v$, $A^2v=v$ cho $\lambda^2=1$, nên chỉ có thể là $\pm1$. Hai trị riêng đều thực sự xuất hiện: nếu $A-I\ne0$, một cột khác 0 của nó thỏa $A(A-I)=-(A-I)$; tương tự $A+I\ne0$ cho vector riêng 1. **b.** Mọi $v$ tách được $v=(v+Av)/2+(v-Av)/2$. Hai thành phần lần lượt thuộc $E_1,E_{-1}$. Giao hai không gian chỉ là 0, nên tổng trực tiếp bằng toàn không gian; ghép hai cơ sở cho cơ sở vector riêng. **c.** Đối xứng hai lần là đồng nhất, ma trận $Q_m^2=I$, nên dùng (b) chéo hóa được. **d.** Vector $(1,m)$ trên trục đối xứng có trị riêng 1; vector $(-m,1)$ vuông góc có trị riêng -1. Chọn $P=\begin{bmatrix}1&-m\\m&1\end{bmatrix}$, $\det P=1+m^2>0$, thì $P^{-1}Q_mP=\operatorname{diag}(1,-1)$.')
aa=[[[2,3,-3],[1,0,-1],[1,1,-2]],[[1,0,0],[3,0,1],[2,0,0]]]
add('3.4.14','**A.** '+diagonal_text(aa[0])+'\n\n**B.** '+diagonal_text(aa[1])+r' **Chú ý dữ kiện:** với đúng $B$ được in trong đề, đa thức đặc trưng là $x^2(x-1)$, không phải $(x+1)^2(x-2)$. Khẳng định hai đa thức bằng nhau là lỗi bản in; kết luận $B$ không chéo hóa được vẫn đúng vì không gian riêng 0 chỉ một chiều.')
add('3.4.15',r'**a.** Nếu chỉ có một trị riêng $\lambda$ và chéo hóa được, mọi ô đường chéo của $D$ bằng $\lambda$, nên $A=P(\lambda I)P^{-1}=\lambda I$. Chiều ngược hiển nhiên. **b.** Ma trận có vết 2, định thức 1, nên đa thức $(x-1)^2$. Nó không bằng $I$, do (a) không chéo hóa được; cụ thể $A-I=\begin{bmatrix}2&-2\\2&-2\end{bmatrix}$ có hạt nhân một chiều.')
add('3.4.16',r'Với $A=PDP^{-1}$, $A^2-3A+2I=0$ tương đương $D^2-3D+2I=0$. Trên từng ô đường chéo: $(\lambda-1)(\lambda-2)=0$, tức mọi trị riêng thuộc $\{1,2\}$. Ngược lại nếu ma trận chéo hóa được có các trị riêng chỉ là 1 hoặc 2, đa thức ấy triệt tiêu từng ô của $D$, nên triệt tiêu $A$. Không bắt buộc cả hai giá trị đều xuất hiện.')
Q=M([[1,1],[1,-1]]);P=S.diag(Q,Q);A=S.diag(M([[5,3],[3,5]]),M([[7,-1],[-1,7]]));D=P.inv()*A*P;assert D.is_diagonal()
add('3.4.17',r'**a.** Đặt $P=\operatorname{diag}(Q,R)$, khi đó $P^{-1}=\operatorname{diag}(Q^{-1},R^{-1})$. Nhân khối cho $P^{-1}AP=\operatorname{diag}(Q^{-1}BQ,R^{-1}CR)$, là ma trận chéo. **b.** Cả hai khối có vector riêng $(1,1)^T,(1,-1)^T$. Chọn $$P='+tex(P)+r',\qquad P^{-1}AP='+tex(D)+r'.$$ Các trị riêng tương ứng là 8,2 cho $B$ và 6,8 cho $C$.')
save()
