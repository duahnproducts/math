from common import *
a,b,c,ap,bp,cp=S.symbols('a b c a_p b_p c_p')
products=[(M([[1,3],[0,-2]]),M([[2,-1],[0,1]])),(M([[1,-1,2],[2,0,4]]),M([[2,3,1],[1,9,7],[-1,0,2]])),(M([[5,0,-7],[1,5,9]]),M([3,1,-1])),(M([[1,3,-3]]),M([[3,0],[-2,1],[0,6]])),(S.eye(3),M([[3,-2],[5,-7],[9,7]])),(M([[1,-1,3]]),M([2,1,-8])),(M([2,1,-7]),M([[1,-1,3]])),(M([[3,1],[5,2]]),M([[2,-1],[-5,3]])),(M([[2,3,1],[5,7,4]]),S.diag(a,b,c)),(S.diag(a,b,c),S.diag(ap,bp,cp))]
add('2.3.1','\n\n'.join('**'+chr(97+i)+'.**\n\n'+product_text(A,B) for i,(A,B) in enumerate(products)))
answer=[]
for A,B,C in [(M([[1,2,3],[-1,0,0]]),M([[1,-2],[S.Rational(1,2),3]]),M([[-1,0],[2,5],[0,3]])),(M([[1,2,4],[0,1,-1]]),M([[-1,6],[1,0]]),M([[2,0],[-1,1],[1,2]]))]:
    vals=[(B,B,'B','B'),(B,A,'B','A'),(C,B,'C','B'),(A,C,'A','C'),(C,A,'C','A')]
    answer.append('\n\n'.join(product_text(X,Y,l,r) for X,Y,l,r in vals)+ ' Các tích còn lại không xác định vì số cột ma trận trái khác số hàng ma trận phải.')
add('2.3.2','\n\n'.join('**'+chr(97+i)+'.** '+v for i,v in enumerate(answer)))
X=M([[1,-1],[2,0]])*M([[3,-5],[-1,2]]).inv();Y=M([[2,1],[-1,2]]).inv()*M([[7,2],[-1,4]])
add('2.3.3',r'Gọi $X=\begin{bmatrix}a&b\\a_1&b_1\end{bmatrix}$. **a.** $X=C B^{-1}='+tex(X)+r'$, nên $(a,b,a_1,b_1)=(1,2,4,10)$. **b.** $X=B^{-1}C='+tex(Y)+r'$, nên $(a,b,a_1,b_1)=(3,0,1,2)$. Thế các ma trận vào đẳng thức ban đầu để kiểm tra. Có thể giải tương đương bằng cách đồng nhất từng ô của tích.')
v=[M([[3,-1],[0,-2]]),M([[2,2],[2,-1]])]
assert all(A*A-A-6*S.eye(2)==S.zeros(2)for A in v)
add('2.3.4','Tính $A^2$ bằng nhân ma trận, rồi trừ từng phần tử.\n\n'+cases([tex(A*A)+'-'+tex(A)+'-6I=0'for A in v])+r'Ở mỗi ý, kết quả là ma trận không $2\times2$; đây là phép kiểm tra trực tiếp đa thức ma trận.')
A=M([[1,-1],[0,1]]);B=M([[1,0,-2],[3,1,0]]);C=M([[1,0],[2,1],[5,8]]);D=M([[3,-1,2],[1,0,5]])
assert A*(B-D)==A*B-A*D and A*(B*C)==(A*B)*C and(C*D).T==D.T*C.T
add('2.3.5','Tính hai vế riêng biệt theo quy tắc hàng–cột.\n\n'+cases([r'A(B-D)=AB-AD='+tex(A*(B-D)),r'A(BC)=(AB)C='+tex(A*B*C),r'(CD)^T=D^TC^T='+tex((C*D).T)])+'Các kết quả bằng nhau xác nhận từng tính chất; ở (c) thứ tự thừa số sau chuyển vị phải đảo lại.')
add('2.3.6',r'Đặt $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$. **a.** Với $E=\begin{bmatrix}0&1\\0&0\end{bmatrix}$, $AE=\begin{bmatrix}0&a\\0&c\end{bmatrix}$, $EA=\begin{bmatrix}c&d\\0&0\end{bmatrix}$. Đồng nhất cho $c=0,d=a$. **b.** Với $F=E^T$, so sánh $AF=\begin{bmatrix}b&0\\d&0\end{bmatrix}$ và $FA=\begin{bmatrix}0&0\\a&b\end{bmatrix}$ cho $b=0,d=a$. **c.** Nếu giao hoán với mọi ma trận thì giao hoán với cả $E,F$, nên $A=aI$. Chiều ngược lại: $(aI)X=aX=X(aI)$ với mọi $X$.')
add('2.3.7',r'**a.** Nếu $A$ cỡ $m\times n$ thì $A^2$ xác định khi và chỉ khi $n=m$: $A$ vuông. **b.** Nếu $A$ cỡ $m\times n$ thì $AB$ yêu cầu $B$ có $n$ hàng; $BA$ yêu cầu $B$ có $m$ cột. Vậy $B$ cỡ $n\times m$. **c.** Từ $A$ cỡ $3\times3$ và $C$ cỡ $5\times5$, $B$ phải có 3 hàng và 5 cột.')
add('2.3.8',r'Đặt $N=\begin{bmatrix}0&1\\0&0\end{bmatrix}$, $P=\operatorname{diag}(1,0)$, $Q=\operatorname{diag}(0,1)$. **a.** Chọn $N,N^T$: bình phương đều bằng 0. **b(i).** Chọn $I,-I,\begin{bmatrix}0&1\\1&0\end{bmatrix}$: bình phương đều bằng $I$. **b(ii).** Chọn $0,I,P$: bình phương bằng chính nó. **c.** Chọn $A=N,B=P$; nhân trực tiếp được $AB=0$ nhưng $BA=N\ne0$.')
add('2.3.9',r'$P$ thu được từ $I_3$ bằng đổi hàng 2 và 3. **a.** $(PA)_{1*}=A_{1*}$, $(PA)_{2*}=A_{3*}$, $(PA)_{3*}=A_{2*}$: đổi hàng 2,3 của $A$. **b.** $(BP)_{*1}=B_{*1}$, $(BP)_{*2}=B_{*3}$, $(BP)_{*3}=B_{*2}$: đổi cột 2,3 của $B$.')
add('2.3.10',r'Chỉ cần hàng 3 của $CA$ và cột 1 của $B$. Hàng 3 của $C$ là $(5,8)$, nên $(5,8)A=(5\cdot1+8\cdot0,5\cdot(-1)+8\cdot1)=(5,3)$: 4 phép nhân. Nhân vô hướng với cột $(1,3)^T$ của $B$ được $5\cdot1+3\cdot3=14$: thêm 2 phép nhân. Tổng đúng 6 phép nhân.')
A=M([[2,-1,3,1],[1,0,1,2],[0,0,1,0],[0,0,0,1]]);B=M([[1,2,0],[-1,0,0],[0,5,1],[1,-1,0]])
add('2.3.11',r'Viết $A=\begin{bmatrix}A_{11}&A_{12}\\0&I\end{bmatrix}$ và $B=\begin{bmatrix}B_{11}&0\\B_{21}&B_{22}\end{bmatrix}$. Khi đó $AB=\begin{bmatrix}A_{11}B_{11}+A_{12}B_{21}&A_{12}B_{22}\\B_{21}&B_{22}\end{bmatrix}$. Thay các khối trong đề, được $$AB='+tex(A*B)+'.$$')
n=S.symbols('n',integer=True,positive=True);A=M([[1,-1,2,-1],[0,1,0,0],[0,0,-1,1],[0,0,0,1]])
add('2.3.12',r'**a.** Khối dưới phải $H=\begin{bmatrix}1&-1\\-1&1\end{bmatrix}$ thỏa $H^2=2H$, còn $H(1,1)^T=0$. Do đó, với $n\ge1$, $$A^n=\begin{bmatrix}1&0&0\\1&2^{n-1}&-2^{n-1}\\1&-2^{n-1}&2^{n-1}\end{bmatrix}.$$ **b.** Dùng quy nạp theo phép nhân khối (hoặc nhân $A^nA$) cho $$A^n='+tex(S.simplify(A**n))+r'.$$ Kiểm tra $n=1$ khôi phục đúng ma trận đề; nhân thêm $A$ kiểm tra bước chuyển từ $n$ sang $n+1$.')
add('2.3.13',r'Nhân theo hàng–cột khối, giữ thứ tự của $X,Y$. **a.** $\begin{bmatrix}I+XY&X\\0&I\end{bmatrix}$. **b.** $I_{2k}$. **c.** $I+XX^T$. **d.** $-X^T+X^T=0$. **e.** Bình phương ma trận đã cho bằng $I_{2k}$; lũy thừa chẵn là $I_{2k}$, lẻ là ma trận ban đầu. **f.** Nếu $F=\begin{bmatrix}0&X\\I&0\end{bmatrix}$ thì $F^2=\operatorname{diag}(X,X)$; do đó $F^{2r}=\operatorname{diag}(X^r,X^r)$ và $F^{2r+1}=\begin{bmatrix}0&X^{r+1}\\X^r&0\end{bmatrix}$.')
add('2.3.14',r'**a.** Lần lượt chọn $X=e_j$, vector cột đơn vị thứ $j$. Khi ấy $Ae_j$ là cột thứ $j$ của $A$, nên mọi cột đều bằng 0. **b.** Chọn $Y=e_i^T$: $e_i^TA$ là hàng thứ $i$ của $A$, nên mọi hàng bằng 0. Trong cả hai trường hợp suy ra $A=0$.')
add('2.3.15',r'**a.** Nhân trực tiếp thấy $U^2=I$. Từ $AU=0$, nhân phải với $U$ được $A=AU^2=0$. **b.** $PU=QU$ suy ra $(P-Q)U=0$. Áp dụng đúng giả thiết về $U$ cho ma trận $P-Q$, được $P-Q=0$, tức $P=Q$.')
add('2.3.16',r'''Khai triển từng ngoặc bằng tính phân phối. Không đổi $BA$ thành $AB$.

**a.** $A(3B-C)=3AB-AC$; $(A-2B)C=AC-2BC$; $2B(C+2A)=2BC+4BA$.
Cộng lại: $3AB-AC+AC-2BC+2BC+4BA=3AB+4BA$. Các cặp $-AC,+AC$ và $-2BC,+2BC$ triệt tiêu.

**b.** Bốn phần lần lượt là $AB+AC-AD$, $BC-BA+BD$, $-AC-BC$, $AD-BD$.
Cộng rồi ghép các hạng giống nhau: $AC-AC=0$, $-AD+AD=0$, $BC-BC=0$, $BD-BD=0$. Còn $AB-BA$.

**c.** $AB(BC-CB)=AB^2C-ABCB$; $(CA-AB)BC=CABC-AB^2C$; $CA(A-B)C=CA^2C-CABC$.
Hai hạng $AB^2C$ triệt tiêu, hai hạng $CABC$ cũng triệt tiêu. Kết quả $CA^2C-ABCB$.

**d.** Hai tích đầu là $AC-A^2-BC+BA$ và $CA-C^2-BA+BC$.
Ngoặc cuối cho $(C-A)^2=C^2-CA-AC+A^2$. Khi cộng cả ba, mỗi tích xuất hiện đúng một lần dấu cộng và một lần dấu trừ, nên tổng bằng ma trận 0.
''')
add('2.3.17',r'Nhân hai khối trong đề được $\begin{bmatrix}y&z\\xy&xz+w\end{bmatrix}$. So sánh với $A$ cho $y=a,z=b,x=c/a,w=d-cb/a$. Điều kiện $a\ne0$ bảo đảm phép chia xác định. Thay lại cho hàng dưới $(c,d)$, nên phân tích đúng.')
add('2.3.18',r'Giả thiết $AC=CA$ và $BC=CB$. **a.** $(A+B)C=AC+BC=CA+CB=C(A+B)$. **b.** $(kA)C=k(AC)=k(CA)=C(kA)$. Các đẳng thức dùng tính phân phối, kết hợp và tính chất nhân vô hướng.')
add('2.3.19',r'$(AA^T)^T=(A^T)^TA^T=AA^T$, và $(A^TA)^T=A^T(A^T)^T=A^TA$. Mỗi tích là ma trận vuông và bằng chuyển vị của chính nó, nên đều đối xứng.')
add('2.3.20',r'Vì $A^T=A,B^T=B$, ta có $(AB)^T=B^TA^T=BA$. Do đó $(AB)^T=AB$ tương đương $BA=AB$. Điều này chứng minh cả hai chiều; tích hai ma trận đối xứng không tự động đối xứng nếu chúng không giao hoán.')
add('2.3.21',r'Đặt $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$. Đồng nhất $A^TA=AA^T$ cho $b^2=c^2$ và $(a-d)(b-c)=0$. Nếu $b=c$, $A$ đối xứng. Nếu $b\ne c$, từ $b^2=c^2$ suy ra $c=-b$, rồi $a=d$, nên $A=\begin{bmatrix}a&b\\-b&a\end{bmatrix}$. Ngược lại, ma trận đối xứng hoặc ma trận dạng sau đều thỏa hai đẳng thức, nên thỏa điều kiện ban đầu.')
add('2.3.22',r'Cả (a), (b), (c) chỉ có nghiệm $A=0$. Thật vậy, vì $A$ đối xứng thực, ô $(i,i)$ của $A^2$ là $\sum_j a_{ij}a_{ji}=\sum_j a_{ij}^2$. Nếu $A^2=0$ thì mỗi tổng bình phương bằng 0, nên mọi $a_{ij}=0$. Ma trận không hiển nhiên thỏa đề ở mọi kích thước.')
add('2.3.23',r'Giả sử $AB-BA=I_2$. Tổng hai ô đường chéo của $AB-BA$ bằng 0: các tích vô hướng $a_{ij}b_{ji}$ triệt tiêu từng cặp với $b_{ji}a_{ij}$. Nhưng tổng hai ô đường chéo của $I_2$ bằng 2. Mâu thuẫn $0=2$, nên không có cặp ma trận như vậy.')
add('2.3.24',r'Giả sử tồn tại $C$ sao cho $BC=I_n$. Khi đó $A=AI_n=A(BC)=(AB)C=0C=0$, mâu thuẫn $A\ne0$. Vậy $B$ không có nghịch đảo phải như trong đề.')
A=M([[12,2],[21,3],[10,2]]);B=M([[21,18,20],[14,10,13]])
add('2.3.25',r'Tích $AB$ lấy số giờ từng công đoạn nhân đơn giá tại từng nhà máy: $$AB='+tex(A*B)+r'.$$ Ô $(3,2)=10\cdot18+2\cdot10=200$ là chi phí làm một nắp ca-pô tại nhà máy 2. Cột 2 nhỏ nhất trên cả ba hàng (236, 408, 200), nên nhà máy 2 rẻ nhất cho từng loại sản phẩm và cho mọi hỗn hợp sản lượng không âm.')
A=M([[1,0,1,0],[1,0,0,1],[0,0,0,1],[1,1,0,0]])
add('2.3.26',r'Dùng quy ước $a_{ij}$ đếm mũi tên từ $v_j$ tới $v_i$. Cạnh chéo giữa $v_2$ và $v_4$ có mũi tên ở cả hai đầu, nên có cả hai hướng. Đọc các cạnh còn lại và vòng tại $v_1$ được $$A='+tex(A)+r',\qquad A^3='+tex(A**3)+r'.$$ Vì vậy số đường độ dài 3 từ $v_1$ tới $v_4$ là $(A^3)_{41}='+str((A**3)[3,0])+r'$, và từ $v_2$ tới $v_3$ là $(A^3)_{32}='+str((A**3)[2,1])+r'$. Lũy thừa ma trận đếm đường vì mỗi bước nhân ghép thêm một cạnh qua một đỉnh trung gian.')
add('2.3.27',r'''Với mệnh đề đúng, chứng minh từ giả thiết. Với mệnh đề sai, kiểm tra phản ví dụ vừa thỏa giả thiết vừa vi phạm kết luận.

**a. Sai.** Lấy $A=-I_2$. Khi đó $A^2=(-I_2)(-I_2)=I_2$, nhưng $A\ne I_2$.

**b. Sai.** Lấy $A=0$, $J=0$ cùng cỡ $2\times2$. Có $AJ=0=A$ nhưng $J\ne I_2$.

**c. Đúng.** $(A^3)^T=(AAA)^T=A^TA^TA^T=(A^T)^3$. Công thức chuyển vị đảo thứ tự; ở đây ba thừa số giống nhau nên tích sau khi đảo vẫn là ba bản $A^T$.

**d. Đúng.** Từ $A^T=A$, suy ra $(I+A)^T=I^T+A^T=I+A$. Đó là định nghĩa đối xứng.

**e. Sai.** Chọn $A=\operatorname{diag}(1,0)\ne0$, $B=0$, $C=\operatorname{diag}(0,1)$. Nhân trực tiếp được $AB=0=AC$, nhưng $B\ne C$. Giả thiết $A\ne0$ không đủ để khử $A$.

**f. Sai.** Lấy $N=\begin{bmatrix}0&1\\0&0\end{bmatrix}\ne0$. Cả bốn ô của $N^2$ đều bằng 0 theo quy tắc hàng–cột, nên $N^2=0$.

**g. Sai.** Lấy $A=\begin{bmatrix}0&0\\0&1\end{bmatrix}$, $B=\begin{bmatrix}1&1\\1&1\end{bmatrix}$. $A$ có hàng đầu toàn 0, nhưng $$BA=\begin{bmatrix}0&1\\0&1\end{bmatrix}$$ không có hàng nào toàn 0. Cần kiểm tra **mọi** hàng của tích để có đúng phản ví dụ.

**h. Đúng.** Khai triển giả thiết $A(A+B)=(A+B)A$: $A^2+AB=A^2+BA$. Trừ $A^2$ ở hai vế được $AB=BA$.

**i. Đúng.** Nếu cột $j$ của $B$ bằng 0, thì $Be_j=0$. Cột $j$ của $AB$ là $ABe_j=A0=0$.

**j. Sai.** Chọn $A=0$, $B=I_2$. Tích $AB=0$ có các cột toàn 0, nhưng không cột nào của $B$ toàn 0.

**k. Đúng.** Nếu hàng $i$ của $A$ toàn 0, thì với mọi cột $j$, $(AB)_{ij}=\sum_k0\cdot b_{kj}=0$. Vậy hàng $i$ của tích cũng toàn 0.

**l. Sai.** Chọn $A=I_2$, $B=0$. Tích $AB=0$ có hàng toàn 0 nhưng không hàng nào của $A$ toàn 0.
''')
add('2.3.28',r'**a và b.** Gọi $\mathbf1$ là cột toàn số 1. Tổng từng hàng bằng 1 tương đương $A\mathbf1=\mathbf1$, $B\mathbf1=\mathbf1$. Khi đó $(AB)\mathbf1=A(B\mathbf1)=A\mathbf1=\mathbf1$. Lập luận áp dụng cho cả $2\times2$ và $n\times n$.')
add('2.3.29',r'Giả sử $(AB)x=0$. Đặt $y=Bx$ thì $Ay=0$. Vì hệ $Ay=0$ chỉ có nghiệm không nên $Bx=y=0$. Giả thiết tương tự với $B$ cho $x=0$. Do đó hệ $(AB)x=0$ chỉ có nghiệm tầm thường.')
add('2.3.30',r'**a.** $\operatorname{tr}(A+B)=\sum_i(a_{ii}+b_{ii})=\operatorname{tr}A+\operatorname{tr}B$. **b.** $\operatorname{tr}(kA)=\sum_i ka_{ii}=k\operatorname{tr}A$. **c.** Chuyển vị giữ các ô đường chéo. **d.** $\operatorname{tr}(AB)=\sum_{i,j}a_{ij}b_{ji}=\sum_{j,i}b_{ji}a_{ij}=\operatorname{tr}(BA)$. **e.** Ô $(i,i)$ của $AA^T$ là $\sum_j a_{ij}^2$; cộng theo $i$ cho tổng bình phương tất cả phần tử.')
add('2.3.31',r'Nếu $A,B$ cỡ $n\times n$ và $AB-BA=I_n$, lấy vết hai vế cho $0=\operatorname{tr}(AB)-\operatorname{tr}(BA)=\operatorname{tr}I_n=n$. Vì $n\ge1$ trên trường số thực, đây là mâu thuẫn. Đẳng thức không thể xảy ra.')
add('2.3.32',r'**a.** $0^2=0,I^2=I$. **b.** Nhân trực tiếp từng ma trận. Với $J$ là ma trận $2\times2$ toàn 1, $J^2=2J$, nên $(J/2)^2=J/2$; hai ma trận còn lại bình phương cũng giữ nguyên từng hàng. **c.** $(I-P)^2=I-2P+P^2=I-P$ và $P(I-P)=P-P^2=0$. **d.** $(P^T)^2=(P^2)^T=P^T$. **e.** Đặt $Z=(I-P)AP$. Khi đó $PZ=0,ZP=Z,Z^2=0$. Vì $Q=P+Z$, $Q^2=P+Z=Q$. **f.** $(BA)^2=B(AB)A=BI_nA=BA$.')
add('2.3.33',r'Viết $A=\operatorname{diag}(a_1,\ldots,a_n)$, $B=\operatorname{diag}(b_1,\ldots,b_n)$. **a.** $(AB)_{ij}=0$ khi $i\ne j$, còn $(AB)_{ii}=a_ib_i=b_ia_i$, nên $AB=BA$ và tích vẫn chéo. **b.** Cột $j$ của $XA$ là $a_j$ lần cột $j$ của $X$. **c.** Hàng $i$ của $AY$ là $a_i$ lần hàng $i$ của $Y$. Hai kết luận cuối theo công thức tổng phần tử của tích.')
add('2.3.34',r'**a.** Khai triển $(A+B)^2=A^2+AB+BA+B^2$. Bằng $A^2+2AB+B^2$ khi và chỉ khi $BA=AB$. **b.** Hai vế lần lượt là $A^2-AB+BA-B^2$ và $A^2+AB-BA-B^2$; bằng nhau khi và chỉ khi $2(BA-AB)=0$, tức $AB=BA$ trên số thực. Mỗi phép rút gọn đều đảo ngược được nên đã chứng minh hai chiều.')
add('2.3.35',r'**a.** Ô $(i,j)$ của $A(B+C)$ là $\sum_k a_{ik}(b_{kj}+c_{kj})=\sum_k a_{ik}b_{kj}+\sum_k a_{ik}c_{kj}$, chính là ô $(i,j)$ của $AB+AC$. **b.** Ô $(i,j)$ của $r(AB)$ là $r\sum_k a_{ik}b_{kj}=\sum_k(ra_{ik})b_{kj}=\sum_k a_{ik}(rb_{kj})$. Do đó $r(AB)=(rA)B=A(rB)$.')
save()
