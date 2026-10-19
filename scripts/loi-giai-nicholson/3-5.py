from common import *
rates=[(2,S.Rational(1,2),S.Rational(1,2)),(3,S.Rational(1,4),S.Rational(1,4)),(2,S.Rational(1,4),S.Rational(1,3)),(3,S.Rational(3,5),S.Rational(1,5))]
out=[]
for i,(R,A,J) in enumerate(rates):
    lam=S.simplify((A+S.sqrt(A*A+4*R*J))/2);out.append('**'+chr(97+i)+r'.** Thay các tỷ lệ trong đề vào $M=\begin{bmatrix}A&J\\R&0\end{bmatrix}$, được $$M='+tex([[A,J],[R,0]])+r'.$$ Lập $\det(\lambda I-M)=\lambda^2-A\lambda-RJ=0$. Công thức nghiệm bậc hai cho nghiệm dương (trội) và nghiệm âm còn lại. Trị riêng trội $\lambda_+=(A+\sqrt{A^2+4RJ})/2='+S.latex(lam)+r'$. Vì $A+RJ='+S.latex(A+R*J)+r'$, quần thể '+('tăng không bị chặn'if A+R*J>1 else 'tiến về 0 (tuyệt chủng)'if A+R*J<1 else 'ổn định về một cơ cấu quần thể hữu hạn khác 0')+r', với quần thể ban đầu không âm khác 0. Tiêu chuẩn tương ứng là $\lambda_+>1$, $<1$ hoặc $=1$.')
add('3.5.1','\n\n'.join(out))
aa=[([[2,1],[4,-1]],[1,2]),([[3,-2],[2,-2]],[3,-1]),([[1,0,0],[1,2,3],[1,4,1]],[1,1,1]),([[1,3,2],[-1,2,1],[4,-1,-1]],[2,0,1])]
out=[]
for i,(A,v) in enumerate(aa):
 A,v=M(A),M(v);P,D=A.diagonalize();coeff=P.inv()*v;idx=max(range(A.rows),key=lambda j:abs(D[j,j]));lam=D[idx,idx];dominant=S.simplify(coeff[idx]*P[:,idx]);assert A*P==P*D
 terms=[r'('+S.latex(coeff[j])+r')('+S.latex(D[j,j])+r')^k'+tex(P[:,j])for j in range(A.rows)if coeff[j]!=0]
 out.append('**'+chr(97+i)+r'.** '+eigen_text(A)+r' Viết $v_0=Pc$, tức giải $$'+tex(P)+r'c='+tex(v)+r'.$$ Nhân với $P^{-1}$ cho $$c='+tex(coeff)+r'.$$ Mỗi thành phần riêng được nhân thêm trị riêng sau từng bước, nên $$v_k='+ '+'.join(terms)+r'.$$ Trị riêng có môđun lớn nhất là $'+S.latex(lam)+r'$, nên với $k$ lớn $$v_k\approx('+S.latex(lam)+r')^k'+tex(dominant)+r'.$$ Sai số là tổng các hạng còn lại vừa ghi, có tốc độ nhỏ hơn theo môđun.')
add('3.5.2','\n\n'.join(out))
add('3.5.3',r'Với các tỷ lệ trong ví dụ, ma trận là $\begin{bmatrix}1/2&1/4\\2&0\end{bmatrix}$, trị riêng là $1,-1/2$. Vector riêng dương cho trị riêng 1 là $(1,2)^T$. Nếu ban đầu $(a_0,j_0)^T\ge0$, không đồng thời bằng 0, hệ số của vector riêng này bằng $(4a_0+j_0)/6>0$. Hạng chứa $(-1/2)^k$ tiến về 0, nên quần thể luôn ổn định, không phụ thuộc cơ cấu ban đầu về loại kết cục. Tuy nhiên mức quần thể giới hạn bằng $[(4a_0+j_0)/6](1,2)^T$, có phụ thuộc số lượng ban đầu. Nếu ban đầu bằng 0 thì luôn bằng 0.')
add('3.5.4',r'Ma trận là $M=\begin{bmatrix}1/2&\rho\\2&0\end{bmatrix}$, trị riêng dương $\lambda_+=(1/2+\sqrt{1/4+8\rho})/2$. Với $0\le\rho\le1$, so sánh $1/2+2\rho$ với 1: $\rho<1/4$ gây tuyệt chủng; $\rho=1/4$ quần thể ổn định; $\rho>1/4$ quần thể tăng không bị chặn, với quần thể ban đầu không âm khác 0 và $\rho>0$. Ở biên $\rho=0$, con non không sống thành con trưởng thành nên toàn bộ quần thể vẫn tiến về 0. Nếu ban đầu bằng 0 thì luôn bằng 0.')
add('3.5.5',r'Ma trận là $M=\begin{bmatrix}\alpha&2/5\\2&0\end{bmatrix}$. Muốn ổn định với ban đầu không âm khác 0, trị riêng trội phải bằng 1. Thay $\lambda=1$ vào $\lambda^2-\alpha\lambda-4/5=0$ cho $\alpha=1/5$. Trị riêng còn lại là $-4/5$, có môđun nhỏ hơn 1 nên hạng đó tắt dần. Vì vậy tỷ lệ sống trưởng thành cần là $\alpha=1/5=20\%$.')
save()
