from common import *
from importlib import import_module
def dec(a):return M(a).applyfunc(lambda v:S.Rational(str(v)))
def steady(p):
    vs=(p-S.eye(p.rows)).nullspace();assert len(vs)==1
    v=vs[0]/sum(vs[0]);assert p*v==v;return v
half=S.Rational(1,2);quarter=S.Rational(1,4);third=S.Rational(1,3)
p=M([[0,0,half],[1,0,half],[0,1,0]]);q=M([[half,0,third],[quarter,1,third],[quarter,0,third]])
assert all(v>0 for v in p**5)
add('2.9.1',r'**a.** Lũy thừa thứ 5 là $$P^5='+tex(p**5)+r',$$ mọi ô đều dương, nên ma trận regular. **b.** Cột thứ 2 là $e_2$, tức trạng thái 2 hấp thụ. Vì $P^me_2=e_2$ với mọi $m$, cột này luôn có hai ô bằng 0; không lũy thừa nào toàn dương. Vì vậy ma trận không regular.')
aa=[dec([[.5,.3],[.5,.7]]),M([[half,1],[half,0]]),M([[0,half,quarter],[1,0,quarter],[0,half,half]]),dec([[.4,.1,.5],[.2,.6,.2],[.4,.3,.3]]),dec([[.8,0,.2],[.1,.6,.1],[.1,.4,.7]]),dec([[.1,.3,.3],[.3,.1,.6],[.6,.6,.1]])]
out=[]
for i,p in enumerate(aa):
    v=steady(p);p3=p**3
    out.append('**'+chr(97+i)+r'.** Giải $(P-I)s=0$ cùng $\sum_i s_i=1$ được $$s='+tex(v)+r'.$$ Bắt đầu trạng thái 1 có $s_0=e_1$; sau ba lần chuyển, $s_3=P^3e_1$. Cụ thể $$s_3='+tex(p3[:,0])+r',$$ nên xác suất ở trạng thái 2 là $'+S.latex(p3[1,0])+r'$. Kiểm tra $Ps=s$ và tổng các thành phần bằng 1.')
add('2.9.2','\n\n'.join(out))
p=M([[0,2*third,2*third],[0,0,third],[1,third,0]])
add('2.9.3',r'Theo thứ tự $A,B,C$, cột là lãnh thổ hôm trước: $$P='+tex(p)+r'.$$ **a.** Giải $Ps=s$, tổng bằng 1, được $s='+tex(steady(p))+r'$. Đó là tỷ lệ thời gian ở từng lãnh thổ. **b.** Thứ Hai tới thứ Năm có ba lần chuyển. Xác suất ở $B$ lần lượt là $(P^3)_{BA}='+S.latex((p**3)[1,0])+r'$ nếu xuất phát ở $A$, và $(P^3)_{BC}='+S.latex((p**3)[1,2])+r'$ nếu xuất phát ở $C$.')
p=dec([[.7,.1,.1],[.1,.8,.3],[.2,.1,.6]])
add('2.9.4',r'Theo thứ tự thượng lưu, trung lưu, hạ lưu, $$P='+tex(p)+r'.$$ **a.** Ô $(1,3)$ của $P^2$ bằng $'+S.latex((p**2)[0,2])+r'$: xác suất cháu thuộc thượng lưu khi ông bà thuộc hạ lưu. Có thể tính trực tiếp $0.7(0.1)+0.1(0.3)+0.1(0.6)=0.16$. **b.** Giải $Ps=s$, tổng bằng 1, cho $$s='+tex(steady(p))+r'.$$ Vì tất cả ô của $P$ dương, đây là phân bố dài hạn từ mọi phân bố ban đầu.')
add('2.9.5',r'Hai trạng thái là “có bầu cử” và “không bầu cử”. Ma trận chuyển là $P=\begin{bmatrix}1-p&p\\p&1-p\end{bmatrix}$. Với $0<p<1$, $P$ toàn dương; giải $Ps=s$ cho $s=(1/2,1/2)^T$. Do đó xác suất dài hạn nghe “có bầu cử” là $1/2$. Có thể thấy rõ từ xác suất sau $m$ người: $[1+(1-2p)^m]/2\to1/2$. Nếu cho phép $p=1$ (đề chỉ ghi $p\ne0$), tin bị đảo ở mọi bước, xác suất luân phiên 0 và 1 nên không có giới hạn; cần nêu ngoại lệ này.')
p=M([[half,S.Rational(2,3)],[half,third]]);v=p**2*M([quarter,3*quarter])
add('2.9.6',r'Xếp trạng thái “đúng giờ, trễ”. Khi đó $$P='+tex(p)+r',\quad s_{\text{Hai}}=\begin{bmatrix}1/4\\3/4\end{bmatrix}.$$ Từ thứ Hai đến thứ Tư có hai lần chuyển, nên $$s_{\text{Tư}}=P^2s_{\text{Hai}}='+tex(v)+r'.$$ Xác suất trễ là $'+S.latex(v[1])+r'$, đúng giờ là $'+S.latex(v[0])+r'$. Không dùng phân bố dừng vì chỉ hỏi sau hai ngày.')
p=S.zeros(5);p[0,0]=p[4,4]=1
for j in [1,2,3]:p[j-1,j]=p[j+1,j]=half
add('2.9.7',r'Theo thứ tự số tiền $0,1,2,3,4$, $$P='+tex(p)+r'.$$ Trạng thái 0 và 4 hấp thụ; chẳng hạn $P^me_0=e_0$, nên không regular. Bắt đầu với 1 xu: $s_0=e_1$ (cột thứ hai trong thứ tự này). Sau ba ván $$s_3=P^3s_0='+tex((p**3)[:,1])+r'.$$ Xác suất đã phá sản là ô đầu, $5/8$. Bao gồm cả trường hợp đã phá sản từ ván đầu, vì người chơi dừng lại ở trạng thái 0.')
edges=[(0,2),(0,1),(0,4),(1,3),(2,3),(2,4)];a=S.zeros(5)
for i,j in edges:a[i,j]=a[j,i]=1
degree=[sum(a[:,j])for j in range(5)];p=a*S.diag(*[1/d for d in degree])
add('2.9.8',r'Từ sơ đồ, các đường hầm là $1\! -\!2$, $1\! -\!3$, $1\! -\!5$, $2\! -\!4$, $3\! -\!4$, $3\! -\!5$. Chia mỗi cột của ma trận kề cho số đường ra khỏi ngăn tương ứng, được $$P='+tex(p)+r'.$$ **a.** Xác suất quay lại 1 sau ba bước là $(P^3)_{11}='+S.latex((p**3)[0,0])+r'$. **b.** Giải $Ps=s$ và chuẩn hóa cho $$s='+tex(steady(p))+r'.$$ Hai ngăn 1 và 3 có xác suất lớn nhất bằng $1/4$ mỗi ngăn. Cũng có thể dùng tính chất bước đi đều trên đồ thị vô hướng: xác suất dừng tỷ lệ với bậc, ở đây các bậc là $(3,2,3,2,2)$.')
add('2.9.9',r'Giả sử $p_{jj}=1$. Do mọi ô không âm và tổng cột $j$ bằng 1, các ô còn lại của cột ấy bằng 0; do đó $Pe_j=e_j$. Quy nạp cho $P^me_j=e_j$ với mọi $m\ge1$. Vì kích thước lớn hơn 1, cột ấy luôn chứa ít nhất một số 0, nên $P^m$ không thể toàn dương. Vậy $P$ không regular.')
add('2.9.10',r'Từ định nghĩa $s_{r+1}=Ps_r$, với $k=1$ công thức đúng. Nếu $s_{m+k}=P^ks_m$, thì $s_{m+k+1}=Ps_{m+k}=P(P^ks_m)=P^{k+1}s_m$. Quy nạp theo $k$ chứng minh $s_{m+k}=P^ks_m$ cho mọi chỉ số được nêu. Tính chất chỉ phụ thuộc trạng thái hiện tại bảo đảm dùng cùng một $P$ ở mỗi bước.')
add('2.9.11',r'Đặt $s=\frac1n(1,\ldots,1)^T$. Vì tổng mỗi hàng bằng 1, $(Ps)_i=\frac1n\sum_jp_{ij}=1/n=s_i$; tổng các thành phần của $s$ bằng 1. Vậy vector đều là vector dừng. Nếu ma trận regular thì đó là vector dừng duy nhất và là giới hạn từ mọi phân bố ban đầu. Nếu không regular, không nhất thiết duy nhất; chẳng hạn $P=I$ giữ nguyên mọi phân bố.')
add('2.9.12',r'**a.** Nhân trực tiếp với $s=(q,p)^T/(p+q)$ cho $Ps=s$; cả hai thành phần dương và tổng bằng 1. **b.** Đặt $J=\frac1{p+q}\begin{bmatrix}q&q\\p&p\end{bmatrix}$, $K=I-J=\frac1{p+q}\begin{bmatrix}p&-q\\-p&q\end{bmatrix}$. Ta có $J^2=J$, $K^2=K$, $JK=KJ=0$ và $P=J+(1-p-q)K$. Nhân hoặc quy nạp suy ra $P^m=J+(1-p-q)^mK$. Do $0<p,q<1$, $|1-p-q|<1$, nên hạng thứ hai tiến về 0 và $P^m\to J$. Các cột của giới hạn đều bằng $s$.')
save()
