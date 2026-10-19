from common import *

def lu(a):
    a=M(a);l,u,swaps=a.LUdecomposition();p=S.eye(a.rows)
    for i,j in swaps:p.row_swap(i,j)
    d=S.eye(a.rows)
    for i in range(u.rows):
        nonzero=[u[i,j] for j in range(u.cols) if u[i,j]!=0]
        if nonzero:d[i,i]=nonzero[0]
    l=l*d;u=d.inv()*u
    assert p*a==l*u
    return p,l,u

aa=[[[2,6,-2,0,2],[3,9,-3,3,1],[-1,-3,1,-3,1]],[[2,4,2],[1,-1,3],[-1,7,-7]],[[2,6,-2,0,2],[1,5,-1,2,5],[3,7,-3,-2,5],[-1,-1,1,2,3]],[[-1,-3,1,0,-1],[1,4,1,1,1],[1,2,-3,-1,1],[0,-2,-4,-2,0]],[[2,2,4,6,0,2],[1,-1,2,1,3,1],[-2,2,-4,-1,1,6],[0,2,0,3,4,8],[-2,4,-4,1,-2,6]],[[2,2,-2,4,2],[1,-1,0,2,1],[3,1,-2,6,3],[1,3,-2,2,1]]]
out=[]
for i,a in enumerate(aa):
    p,l,u=lu(a);assert p==S.eye(len(a))
    out.append('**'+chr(97+i)+'.**\n\n'+lu_text(a,p,l,u))
add('2.7.1','\n\n'.join(out))
aa=[[[0,0,2],[0,-1,4],[3,5,1]],[[0,-1,2],[0,0,4],[-1,2,1]],[[0,-1,2,1,3],[-1,1,3,1,4],[1,-1,-3,6,2],[2,-2,-4,1,0]],[[-1,-2,3,0],[2,4,-6,5],[1,1,-1,3],[2,5,-10,1]]]
out=[]
for i,a in enumerate(aa):
    p,l,u=lu(a)
    out.append('**'+chr(97+i)+'.**\n\n'+lu_text(a,p,l,u))
add('2.7.2','\n\n'.join(out))
triples=[([[2,0,0],[0,-1,0],[1,1,3]],[[1,0,0,1],[0,0,1,2],[0,0,0,1]],[1,-1,2]),([[2,0,0],[1,3,0],[-1,2,1]],[[1,1,0,-1],[0,1,0,1],[0,0,0,0]],[-2,-1,1]),([[-2,0,0,0],[1,-1,0,0],[-1,0,2,0],[0,1,0,2]],[[1,-1,2,1],[0,1,1,-4],[0,0,1,-S.Rational(1,2)],[0,0,0,1]],[1,-1,2,0]),([[2,0,0,0],[1,-1,0,0],[-1,1,2,0],[3,0,1,-1]],[[1,-1,0,1],[0,1,-2,-1],[0,0,1,1],[0,0,0,0]],[4,-6,4,5])]
out=[]
for i,(l,u,b) in enumerate(triples):
    out.append('**'+chr(97+i)+'.**\n\n'+triangular_text(l,u,b))
add('2.7.3','\n\n'.join(out))
add('2.7.4',r'Giả sử $A=LU$ với $L=\begin{bmatrix}a&0\\b&c\end{bmatrix}$, $U=\begin{bmatrix}d&e\\0&f\end{bmatrix}$. Ô (1,2) cho $ae=1$, nên $a\ne0$. Ô (1,1) cho $ad=0$, suy ra $d=0$. Nhưng ô (2,1) là $bd=0$, trái với $A_{21}=1$. Vì vậy không có phân tích như vậy nếu không hoán vị hàng.')
add('2.7.5',r'Gọi hai hàng ban đầu là $u,v$. Thực hiện theo thứ tự $R_i\leftarrow R_i+R_j$, $R_j\leftarrow-R_j$, $R_j\leftarrow R_j+R_i$, $R_i\leftarrow R_i-R_j$. Hai hàng lần lượt thành $(u+v,v)$, $(u+v,-v)$, $(u+v,u)$, $(v,u)$. Chỉ dùng cộng bội hàng và nhân hàng với số khác 0, nên đã biểu diễn phép đổi hàng bằng hai loại còn lại.')
add('2.7.6',r'**a.** Từ $LU=L_1U_1$ suy ra $L^{-1}L_1=UU_1^{-1}$. Vế trái tam giác dưới, vế phải tam giác trên; do đó ma trận chung là ma trận chéo khả nghịch $D$. Suy ra $L_1=LD$, $U_1=D^{-1}U$. Chiều đảo: $(LD)(D^{-1}U)=LU$. **b.** Nếu $U,U_1$ đều có các phần tử dẫn đầu bằng 1 và $A$ khả nghịch, chúng là tam giác trên với đường chéo toàn 1. Từ $U_1=D^{-1}U$ suy ra từng phần tử đường chéo của $D$ bằng 1. Vậy $D=I$, $L_1=L$, $U_1=U$.')
add('2.7.7',r'Với $A,B$ tam giác dưới, xét ô $(i,j)$ của tích khi $i<j$: $(AB)_{ij}=\sum_k a_{ik}b_{kj}$. Một số hạng khác 0 đòi hỏi đồng thời $k\le i$ và $k\ge j$, điều không thể xảy ra. Vậy mọi ô trên đường chéo bằng 0, tức $AB$ tam giác dưới. Với tam giác trên, đổi hai bất đẳng thức: khi $i>j$ cần $k\ge i$ và $k\le j$, cũng vô lý. Quy nạp theo số thừa số chứng minh kết quả cho tích hữu hạn.')
add('2.7.8',r'Ma trận tam giác có định thức bằng tích các phần tử đường chéo, nên khả nghịch khi và chỉ khi tất cả các phần tử ấy khác 0. Để chứng minh nghịch đảo vẫn tam giác dưới, giải $Ax=e_j$ bằng thế tiến: các phương trình hàng $1,\ldots,j-1$ lần lượt cho $x_1=\cdots=x_{j-1}=0$. Vì nghiệm này là cột $j$ của $A^{-1}$, mọi ô phía trên đường chéo của nghịch đảo bằng 0. Trường hợp tam giác trên dùng thế ngược, hoặc chuyển vị kết quả vừa chứng minh.')
add('2.7.9',r'**a.** Các phép khử không đổi hàng có dạng $R_i\leftarrow R_i-m_{ij}R_j$, $i>j$. Ma trận sơ cấp tương ứng $E_k$ là tam giác dưới có đường chéo toàn 1. Nếu $E_s\cdots E_1A=U$, đặt $L=E_1^{-1}\cdots E_s^{-1}$; khi đó $A=LU$, $L$ tam giác dưới đơn vị và $U$ tam giác trên. **b.** Cần giả thiết $A$ khả nghịch để khẳng định duy nhất như cách phát biểu thông thường. Khi ấy $L^{-1}L_1=UU_1^{-1}$ vừa tam giác dưới đơn vị vừa tam giác trên, nên bằng $I$. Suy ra $L=L_1,U=U_1$. Nếu không có giả thiết khả nghịch thì câu (b) như bản in là sai: $A=0_{2\times2}$ có $U=0$ và mọi $L=\begin{bmatrix}1&0\\t&1\end{bmatrix}$, $t\in\mathbb R$, đều cho $A=LU$.')
add('2.7.10',r'Chứng minh bằng quy nạp theo số cột đã thay. Sau $j-1$ thừa số, tích có các cột $c_1,\ldots,c_{j-1}$ đã cài vào phần dưới đường chéo, còn các cột $j,\ldots,m$ là cột đơn vị. Thừa số tiếp theo chỉ khác $I$ ở cột $j$: vector ấy bằng tổ hợp của $e_j,\ldots,e_m$, nên nhân bên trái bởi tích trước đó giữ nguyên nó. Mọi cột khác không đổi. Do đó tích mới chính là $L^{(m)}[c_1,\ldots,c_j]$. Bắt đầu $j=1$ hiển nhiên, kết thúc $j=r$ cho đẳng thức cần chứng minh.')
add('2.7.11',r'Gọi $P$ là ma trận đổi hàng $k$ với một hàng phía dưới, $j<k$. Khi đó $P^2=I$ và $Pe_i=e_i$ với $i\le j$. Viết ma trận cần xét là $L=I+ve_j^T$, trong đó $v$ chỉ có thể khác 0 từ vị trí $j$ trở xuống (lấy cột đã thay trừ $e_j$). Ta có $$PLP=I+(Pv)e_j^T=L_1.$$ $Pv$ chỉ hoán vị hai thành phần của phần đuôi, nên $L_1$ đúng dạng thay một cột như trong bổ đề. Nhân bên phải với $P$ cho $PL=L_1P$, là điều phải chứng minh.')
save()
