from common import *
I=S.eye(2)
checks=[(M([[3,5],[1,2]]),M([[2,-5],[-1,3]])),(M([[3,0],[1,-4]]),M([[4,0],[1,-3]])/12),(M([[1,2,0],[0,2,3],[1,3,1]]),M([[7,2,-6],[-3,-1,3],[2,1,-2]])),(S.diag(3,5),S.diag(S.Rational(1,3),S.Rational(1,5)))]
assert all(A*B==S.eye(A.rows)and B*A==S.eye(A.rows)for A,B in checks)
add('2.4.1',r'**a, c, d.** Nhân hai ma trận theo cả hai thứ tự được ma trận đơn vị tương ứng. Chẳng hạn ở (a), $AB=\begin{bmatrix}6-5&-15+15\\2-2&-5+6\end{bmatrix}=I_2$; nhân $BA$ cũng được $I_2$. **b. Lỗi hệ số trong đề.** Với đúng hệ số $1/2$ của bản in, hai tích đều bằng $6I_2$, nên hai ma trận không phải nghịch đảo của nhau. Hệ số đúng để được nghịch đảo là $1/12$: $\begin{bmatrix}3&0\\1&-4\end{bmatrix}\begin{bmatrix}4&0\\1&-3\end{bmatrix}=12I_2$. Chia ma trận thứ hai cho 12 mới cho tích bằng $I_2$.')
matrices=[[[1,-1],[-1,3]],[[4,1],[3,2]],[[1,0,-1],[3,2,0],[-1,-1,0]],[[1,-1,2],[-5,7,-11],[-2,3,-5]],[[3,5,0],[3,7,1],[1,2,1]],[[3,1,-1],[2,1,0],[1,5,-1]],[[2,4,1],[3,3,2],[4,1,4]],[[3,1,-1],[5,2,0],[1,1,-1]],[[3,1,2],[1,-1,3],[1,2,4]],[[-1,4,5,2],[0,0,0,-1],[1,-2,-2,0],[0,-1,-1,0]],[[1,0,7,5],[0,1,3,6],[1,-1,5,2],[1,-1,5,1]],[[1,2,0,0,0],[0,1,3,0,0],[0,0,1,5,0],[0,0,0,1,7],[0,0,0,0,1]]]
add('2.4.2',inverse_cases(matrices),h1='Dùng khử Gauss–Jordan trên ma trận ghép [A | I].',h2='Biến đổi hàng trên cả hai khối. Khi khối trái bằng I, khối phải chính là nghịch đảo.')
systems=[(M([[3,-1],[2,2]]),M([5,1])),(M([[2,-3],[1,-4]]),M([0,1])),(M([[1,1,2],[1,1,1],[1,2,4]]),M([5,0,-2])),(M([[1,4,2],[2,3,3],[4,1,4]]),M([1,-1,0]))]
ans=[]
for A,b in systems:
    x=A.inv()*b;assert A*x==b
    ans.append(inverse_case(A)+r' Từ $Ax=b$, nhân trái với $A^{-1}$ được $$x=A^{-1}b='+tex(x)+r'.$$ Thế lại vào từng phương trình, thu đúng $b='+tex(b)+'$.')
add('2.4.3','\n\n'.join('**'+chr(97+i)+'.** '+v for i,v in enumerate(ans)))
inv=M([[1,-1,3],[2,0,5],[-1,1,0]])
add('2.4.4',r'Nhân đúng phía với ma trận $A^{-1}$ đã cho. **a.** $x=A^{-1}b='+tex(inv*M([1,-1,3]))+r'$. **b.** Từ $AB=C$ suy ra $B=A^{-1}C='+tex(inv*M([[1,-1,2],[0,1,1],[1,0,0]]))+r'$. **c.** Từ $CA=D$ suy ra $C=DA^{-1}='+tex(M([[1,2,-1],[3,1,1]])*inv)+r'$. Thế lại lần lượt vào $Ax=b$, $AB=C$, $CA=D$; dùng $AA^{-1}=A^{-1}A=I$ để xác nhận.')
K=M([[1,-1],[0,1]]);L=M([[1,-1],[2,3]]);P=M([[2,0],[1,-1]]);Q=M([[2,1],[1,1]]);R=M([[2,3],[1,1]]);T=M([[1,0],[2,2]]);V=M([[1,1],[2,3]]);W=M([[1,1],[1,0]])
values=[K.inv()/3,L.inv().T/2,(P.inv()-I)/3,((I-Q.inv())/2).T,R.inv()*K.inv(),K.inv()*T*I,(2*I+(2*V).inv()).T,(2*I+(-2*W).T).inv()]
equations=[r'$3A=K^{-1}$',r'$2A=(L^{-1})^T$',r'$I+3A=P^{-1}$',r'$I-2A^T=Q^{-1}$',r'$AK=R^{-1}$',r'$\begin{bmatrix}1&0\\2&1\end{bmatrix}A=T^{-1}$',r'$A^T-2I=(2V)^{-1}$',r'$A^{-1}-2I=(-2W)^T$']
# In part f the left factor is [[1,0],[2,1]], not the K of part a.
values[5]=M([[1,0],[2,1]]).inv()*T.inv()
add('2.4.5',r'Đặt $K='+tex(K)+r',L='+tex(L)+r',P='+tex(P)+r',Q='+tex(Q)+r',R='+tex(R)+r',T='+tex(T)+r',V='+tex(V)+r',W='+tex(W)+r'$. Dùng $(XY)^{-1}=Y^{-1}X^{-1}$ và $(X^T)^{-1}=(X^{-1})^T$.\n\n'+'\n\n'.join('**'+chr(97+i)+'.** '+eq+'; suy ra $$A='+tex(value)+'.$$'for i,(eq,value)in enumerate(zip(equations,values))))
add('2.4.6','Gọi $M$ là ma trận ở vế phải của mỗi ý. Vì $A^{-1}=M$, cần tìm $A=M^{-1}$.\n\n'+'\n\n'.join('**'+chr(97+i)+'.** '+inverse_case(m).replace('A','M')for i,m in enumerate([[[1,-1,3],[2,1,1],[0,2,-2]],[[0,1,-1],[1,2,1],[1,0,1]]])))
A=M([[3,-1,2],[1,0,4],[2,1,0]]);B=M([[1,-1,1],[2,-3,0],[1,1,-2]])
add('2.4.7',r'Từ $z=By$ suy ra $y=B^{-1}z$. Thế vào $x=Ay$, được $$x=AB^{-1}z='+tex(A*B.inv())+r'\begin{bmatrix}z_1\\z_2\\z_3\end{bmatrix}.$$ Mỗi hàng của ma trận trên cho lần lượt công thức $x_1,x_2,x_3$. Kiểm tra bằng cách nhân ma trận hệ số này với $B$, thu lại $A$.')
add('2.4.8',r'**a.** Thế $x=-5x^\prime+4y^\prime$, $y=4x^\prime-3y^\prime$ vào hai phương trình: vế trái lần lượt rút gọn thành $x^\prime,y^\prime$. Vậy $x^\prime=7,y^\prime=1$, nên $x=-31,y=25$. Thế lại: $-93+100=7$, $-124+125=1$. **b.** $A=\begin{bmatrix}3&4\\4&5\end{bmatrix}$, $B=\begin{bmatrix}-5&4\\4&-3\end{bmatrix}$; nhân được $AB=BA=I$, tức $B=A^{-1}$. Đổi biến đã biến hệ thành hệ có ma trận đơn vị.')
add('2.4.9',r'**a Sai:** $\operatorname{diag}(1,0)$ khác 0 nhưng suy biến. **b Sai:** $A=I,B=-I$ thì tổng bằng 0. **c Đúng:** $A^{-1}B$ là tích hai ma trận khả nghịch và chuyển vị vẫn khả nghịch; nghịch đảo là $(B^{-1}A)^T$. **d Đúng:** $A^{-1}=A^3/3$. **e Sai:** $P=\operatorname{diag}(1,0)$ lũy đẳng nhưng suy biến. **f Sai:** lấy $A=B=P$. **g Đúng:** $(A^{-1})^T=(A^T)^{-1}=(-A)^{-1}=-A^{-1}$. **h Đúng:** $Ax=0$ kéo theo $A^2x=0$, nên $x=0$; ma trận vuông $A$ khả nghịch. **i Đúng:** ma trận vuông có $AB=I$ thì $B=A^{-1}$, nên $BA=I=AB$.')
add('2.4.10',r'**a.** $C=C(AB)=(CA)B=B$. Từ đó $AB=BA=I$, nên $B=C=A^{-1}$. **b.** $A=C^{-1}$, vì vậy $(C^T)^{-1}=(C^{-1})^T=A^T$. Nhân $C^T$ và $A^T$ theo cả hai phía cho ma trận đơn vị.')
C=M([[0,-5,1],[3,0,-1]]);A=M([[2,-3],[1,-2],[6,-10]])
assert C*A==S.eye(2)
ans=[]
for b in [M([1,0,3]),M([7,4,22])]:
    x=C*b;check=A*x
    ans.append('$Cb='+tex(x)+'$. Thế vào $A(Cb)='+tex(check)+'$'+(', đúng bằng $b$, nên đây là nghiệm duy nhất.'if check==b else ', khác $b$, nên hệ vô nghiệm.'))
add('2.4.11',r'**a.** Nếu $Ax=b$ có nghiệm, nhân trái với $C$ cho $x=CAx=Cb$: nghiệm buộc duy nhất. Chiều ngược phải kiểm tra $A(Cb)=b$, vì $CA=I$ không kéo theo $AC=I$ khi ma trận không vuông. **b(i).** '+ans[0]+' **b(ii).** '+ans[1])
add('2.4.12',r'Nhân trực tiếp được $A^2=\begin{bmatrix}1&-3\\0&4\end{bmatrix}$, nên $A^2-3A+2I=0$. Chuyển vế: $A(3I-A)=2I=(3I-A)A$. Chia cho 2 được $$A^{-1}=\tfrac12(3I-A)=\begin{bmatrix}1&1/2\\0&1/2\end{bmatrix}.$$')
add('2.4.13',r'Đặt $s=a^2+b^2+c^2+d^2$. Mỗi hàng của $Q$ có bình phương độ dài $s$, còn tích vô hướng giữa hai hàng khác nhau triệt tiêu từng cặp; do đó $QQ^T=sI_4$. Nếu $Q\ne0$ và các hệ số thực thì $s>0$. Vậy $$Q^{-1}=\frac1sQ^T.$$ Tương tự $Q^TQ=sI_4$, kiểm tra được cả hai phía.')
add('2.4.14',r'Tính trực tiếp $U^2=I_2$, $(-U)^2=I_2$, $(-I_2)^2=I_2$: ba ma trận đều tự nghịch đảo. Các tích giữa hai ma trận khác nhau là $U(-U)=-I_2$, $U(-I_2)=-U$, $(-U)(-I_2)=U$; đổi thứ tự vẫn có cùng kết quả vì chúng là các bội vô hướng của $U$ hoặc $I_2$.')
A=M([[1,1],[-1,0]]);B=M([[0,-1],[1,0]]);C=M([[0,1,0],[0,0,1],[5,0,0]])
assert A**6==S.eye(2)and B**4==S.eye(2)and C**3==5*S.eye(3)
add('2.4.15',r'**a.** $A^3=-I_2$, nên $A^6=I_2$ và $A^{-1}=A^5='+tex(A**5)+r'$. **b.** $B^2=-I_2$, nên $B^4=I_2$, $B^{-1}=B^3='+tex(B**3)+r'$. **c.** $C^3=5I_3$, nên $C^{-1}=C^2/5='+tex(C**2/5)+r'$. Các biểu thức đều là đa thức của ma trận nên nhân trái hay phải cho cùng ma trận đơn vị.')
c=S.symbols('c')
add('2.4.16',inverse_case(M([[1,0,1],[c,1,c],[3,c,2]]))+r'Ở đây $\det A=-1$ với mọi $c$, nên công thức tồn tại với mọi số thực $c$.')
add('2.4.17',inverse_case(M([[1,-1,1],[2,-1,2],[0,2,c]]))+r'Định thức bằng $c$, nên giả thiết $c\ne0$ chính là điều kiện đủ và cần.')
add('2.4.18',r'**a.** Nếu hàng $i$ bằng 0 thì $e_i^TA=0$; nhân phải với nghịch đảo giả định cho $e_i^T=0$, mâu thuẫn. **b.** Nếu cột $j$ bằng 0 thì $Ae_j=0$ với $e_j\ne0$. **c.** Nếu tổng mỗi hàng bằng 0, $A\mathbf1=0$ với $\mathbf1\ne0$. **d.** Nếu tổng mỗi cột bằng 0, $\mathbf1^TA=0$; nhân với nghịch đảo giả định cho $\mathbf1^T=0$. Cả bốn trường hợp đều loại khả nghịch.')
add('2.4.19',r'**a.** Nếu $A^{-1}$ tồn tại thì $Y=YAA^{-1}=0$, trái $Y\ne0$. **b(i).** Hàng 3 bằng hàng 1 cộng hàng 2; chọn $Y=(1,1,-1)$ thì $YA=0$. **b(ii).** Hàng 3 bằng hàng 1 trừ hàng 2; chọn $Y=(1,-1,-1)$. Hai vector $Y$ đều khác 0, nên áp dụng (a) kết luận cả hai ma trận không khả nghịch.')
add('2.4.20',r'Nếu $A^k=0$ với $k\ge1$, nhân trái với $(A^{-1})^k$ cho $I=0$, mâu thuẫn. Do đó mọi lũy thừa dương của ma trận khả nghịch đều khác 0; (a) là trường hợp riêng $k=2$, (b) là lập luận tổng quát.')
add('2.4.21',r'**a.** Nếu $A$ khả nghịch, $B=A^{-1}(AB)=0$. Nếu $B$ khả nghịch, $A=(AB)B^{-1}=0$. **b.** Nếu cả hai khả nghịch thì $AB$ khả nghịch, trong khi $AB=0$; mâu thuẫn. **c.** $(BA)^2=B(AB)A=B0A=0$. Kết luận này không cần giả thiết khả nghịch.')
add('2.4.22',r'Phép giãn theo trục $x$ có ma trận $E_k=\operatorname{diag}(k,1)$ với $k\ne0$. Đảo phép giãn bằng cách chia hoành độ cho $k$, giữ tung độ: $$E_k^{-1}=\operatorname{diag}(1/k,1).$$ Vì $E_kE_{1/k}=I$, đây là phép co / giãn theo trục $x$ với hệ số nghịch đảo. Nếu hệ số bằng 0, hình bị ép xuống trục $y$ và không đảo được.')
add('2.4.23',r'Với phép trượt ngang $T(x,y)=(x+ky,y)$ trong ví dụ, ma trận là $S_k=\begin{bmatrix}1&k\\0&1\end{bmatrix}$. Từ $u=x+ky,v=y$ suy ra $x=u-kv,y=v$, nên $$S_k^{-1}=\begin{bmatrix}1&-k\\0&1\end{bmatrix}.$$ Hình học: trượt ngang cùng độ lớn theo chiều ngược lại; $S_kS_{-k}=I$ kiểm tra kết quả.')
add('2.4.24',r'**a.** Từ $A^3-3A=-2I$ suy ra $A(3I-A^2)/2=I$ và chiều nhân ngược cũng vậy; do đó $A^{-1}=(3I-A^2)/2$. **b.** $A^4+2A^3-A=4I$, nên $$A^{-1}=\tfrac14(A^3+2A^2-I).$$ Trong mỗi ý, biểu thức là đa thức của $A$ và giao hoán với $A$, nên đã có nghịch đảo hai phía.')
add('2.4.25',r'**a.** $B=A^{-1}(AB)$ là tích các ma trận khả nghịch, nên $B$ khả nghịch và $B^{-1}=(AB)^{-1}A$. **b.** Nếu $Bx=0$ thì $ABx=0$, nên $x=0$. Do $B$ vuông, $B$ khả nghịch. Suy ra $A=(AB)B^{-1}$ cũng khả nghịch. Đây dùng tiêu chuẩn hệ thuần nhất chỉ có nghiệm không.')
blocks=[M([[-1,1,2],[0,2,-1],[0,1,-1]]),M([[3,1,0],[5,2,0],[1,3,-1]]),M([[3,4,0,0],[2,3,0,0],[1,-1,1,3],[3,1,1,4]]),M([[2,1,5,2],[1,1,-1,0],[0,0,1,-1],[0,0,1,-2]])]
add('2.4.26',r'Với khối tam giác, dùng $\begin{bmatrix}P&Q\\0&R\end{bmatrix}^{-1}=\begin{bmatrix}P^{-1}&-P^{-1}QR^{-1}\\0&R^{-1}\end{bmatrix}$; dạng tam giác dưới tương tự. Các bước khử dưới đây cũng kiểm chứng độc lập từng kết quả.\n\n'+inverse_cases(blocks))
add('2.4.27',r'Chuyển vị nghịch đảo cho $(A^{-1})^T=(A^T)^{-1}=A^{-1}$; tương tự với $B^{-1}$. Từ $AB=BA$, nhân thích hợp với các nghịch đảo suy ra $A,B,A^{-1},B^{-1}$ giao hoán từng cặp cần dùng. Do đó $(AB)^T=BA=AB$, $(AB^{-1})^T=B^{-1}A=AB^{-1}$, $(A^{-1}B^{-1})^T=B^{-1}A^{-1}=A^{-1}B^{-1}$. Mỗi tích đều khả nghịch vì là tích các ma trận khả nghịch.')
add('2.4.28',r'**a.** $(I-A)(I+A)=I-A^2=I$ và tích ngược cũng bằng $I$. **b.** $(I-A)(I+A+A^2)=I-A^3=I$. **c.** Đặt ma trận đề là $I-N$; khi đó $N^3=0$. Vậy nghịch đảo là $I+N+N^2=\begin{bmatrix}1&-2&7\\0&1&-3\\0&0&1\end{bmatrix}$. **d.** Tổng hình học hữu hạn cho $$ (I-A)^{-1}=I+A+\cdots+A^{n-1}\quad\text{khi }A^n=0.$$ Nhân hai phía rút gọn thành $I-A^n=I$.')
add('2.4.29',r'Đặt $B=(1/a)A^{-1}$. Khi $a\ne0$, $(aA)B=a(1/a)AA^{-1}=I$ và $B(aA)=I$. Theo định nghĩa, $aA$ khả nghịch và $(aA)^{-1}=(1/a)A^{-1}$.')
add('2.4.30',r'**a.** $B=A^{-1}(ABC)C^{-1}$ là tích ba ma trận khả nghịch. Đảo thứ tự cho $B^{-1}=C(ABC)^{-1}A$. **b.** Đặt $L=(BA)^{-1}B$, $R=B(AB)^{-1}$. Khi đó $LA=I$, $AR=I$; suy ra $L=L(AR)=(LA)R=R$. Vậy $A$ có nghịch đảo hai phía. Đổi vai $A,B$ chứng minh tương tự cho $B$.')
add('2.4.31',r'**a.** Có: lấy nghịch đảo hai vế $A^{-1}=B^{-1}$ được $A=B$, vì $(A^{-1})^{-1}=A$. **b.** Nếu $A=B$, $A^{-1}B=I$. Ngược lại, nhân trái $A^{-1}B=I$ với $A$ được $B=A$.')
add('2.4.32',r'**a.** Từ $AC=CA$, nhân trái rồi phải với $A^{-1}$ cho $CA^{-1}=A^{-1}C$. **b.** Áp dụng (a) suy ra $A^{-1}B=BA^{-1}$. Lại áp dụng tính chất ấy cho $B$ và $A^{-1}$, được $B^{-1}A^{-1}=A^{-1}B^{-1}$.')
add('2.4.33',r'**a.** $(AB)^2=ABAB=AABB=A^2B^2$ khi $BA=AB$. **b.** Từ $ABAB=AABB$, nhân trái với $A^{-1}$ và phải với $B^{-1}$ được $BA=AB$. **c.** Với hai ma trận đề, $AB=B$, $BA=A$, $A^2=A$, $B^2=B$; nên $(AB)^2=B=A^2B^2$, nhưng $A\ne B$ cho $AB\ne BA$. Giả thiết khả nghịch trong (b) là thiết yếu.')
add('2.4.34',r'Gọi $D=(AB)^{-1}$. Nếu $Bx=0$, $ABx=0$ nên $x=0$: $B$ vuông có hạt nhân không, do đó khả nghịch. Từ $A=(AB)B^{-1}$ suy ra $A$ khả nghịch. Công thức nghịch đảo là $A^{-1}=BD$, $B^{-1}=DA$; kiểm tra bằng nhân và tính duy nhất nghịch đảo.')
add('2.4.35',r'**a.** Hàng 3 bằng 2 lần hàng 2 trừ 3 lần hàng 1. Do đó $Y=(3,-2,1)\ne0$ thỏa $YA=0$, loại khả nghịch. **b.** Cột 3 bằng 3 lần cột 2 trừ cột 1. Vì vậy $B(1,-3,1)^T=0$ với vector khác 0, nên $B$ không khả nghịch. Đây là kiểm tra phụ thuộc hàng / cột, không cần khử toàn ma trận.')
add('2.4.36',r'Nếu $A$ khả nghịch, nhân trái $AB=AC$ với $A^{-1}$ được $B=C$. Ngược lại, nếu $A$ suy biến thì tồn tại $x\ne0$ sao cho $Ax=0$. Lập $B$ có cột đầu là $x$, các cột còn lại 0, và $C=0$. Khi đó $AB=AC$ nhưng $B\ne C$, trái tính khử trái. Vậy tính khử trái tương đương khả nghịch.')
add('2.4.37',r'$U^2=I$ cho $(I-U)(I+U)=0$. Nếu $I+U$ khả nghịch, nhân phải với nghịch đảo cho $I-U=0$, tức $U=I$. Ngược lại khi $U=I$, $I+U=2I$ khả nghịch trên số thực. Vì thế điều kiện chính xác là $U=I$.')
add('2.4.38',r'**a.** $J^2=4J$, $J^T=J$. Suy ra $(I-J/2)^2=I-J+J^2/4=I$ và $(I-J/2)^T=I-J/2$. **b.** Đặt $P=XX^T$. Từ $X^TX=I_m$, $P^2=X(X^TX)X^T=P$, $P^T=P$. Vậy $(I_n-2P)^2=I_n$ và chuyển vị giữ nguyên. Cả hai ma trận đều đối xứng và tự nghịch đảo.')
add('2.4.39',r'**a.** $P^2=P$ và $P$ khả nghịch cho $P=I$ sau khi nhân với $P^{-1}$; $I$ hiển nhiên lũy đẳng. **b.** $(I-2P)^2=I+4(P^2-P)$ bằng $I$ khi và chỉ khi $P^2=P$. **c.** Nếu $U^2=I$, đặt $P=(I-U)/2$ thì $P^2=P$; chiều ngược dùng (b). **d.** Với $a\ne1$, khai triển và dùng $P^2=P$ xác nhận $$ (I-aP)\left(I+\frac{a}{1-a}P\right)=I.$$ Tích theo thứ tự ngược cũng bằng $I$, nên đây là công thức nghịch đảo.')
add('2.4.40',r'Nếu $A$ khả nghịch và $A^2=kA$, nhân trái với $A^{-1}$ được $A=kI$. Ngược lại, $A=kI$ với $k\ne0$ có nghịch đảo $(1/k)I$. Do đó hai điều kiện tương đương, và điều kiện $k\ne0$ không được bỏ.')
add('2.4.41',r'**a.** Phân phối: $A^{-1}(A+B)B^{-1}=B^{-1}+A^{-1}$. **b.** Khi $A+B$ khả nghịch, vế phải là tích ba ma trận khả nghịch. Đảo thứ tự thừa số: $$ (A^{-1}+B^{-1})^{-1}=B(A+B)^{-1}A.$$ Nhân với tổng nghịch đảo theo cả hai phía rút về $I$.')
add('2.4.42',r'**a.** Hai vế đầu đều bằng $A+ABA$; hai vế sau đều bằng $B+BAB$. **b.** Đặt $D=(I+AB)^{-1}$, $C=I-BDA$. Vì $D+ABD=I$ và $D+DAB=I$, khai triển được $(I+BA)C=I+B(A-DA-ABDA)=I$ và $C(I+BA)=I+B(A-DA-DABA)=I$. Vậy $I+BA$ khả nghịch với $$ (I+BA)^{-1}=I-B(I+AB)^{-1}A.$$')
save()
