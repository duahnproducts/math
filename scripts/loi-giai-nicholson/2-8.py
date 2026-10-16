from common import *
def decimal(a):return M(a).applyfunc(lambda v:S.Rational(str(v)))
aa=[[[.1,.2,.3],[.6,.2,.3],[.3,.6,.4]],[[.5,0,.5],[.1,.9,.2],[.4,.1,.3]],[[.3,.1,.1,.2],[.2,.3,.1,0],[.3,.3,.2,.3],[.2,.3,.6,.5]],[[.5,0,.1,.1],[.2,.7,0,.1],[.1,.2,.8,.2],[.2,.1,.1,.6]]]
out=[]
for i,a in enumerate(aa):
    e=decimal(a);v=(e-S.eye(e.rows)).nullspace()[0];v=S.simplify(v/sum(v));assert e*v==v and all(x>0 for x in v)
    out.append('**'+chr(97+i)+r'.** Cân bằng đòi hỏi $(I-E)p=0$. Khử hệ này, rồi chọn tổng các giá bằng 1 cho $$p_0='+tex(v)+r'.$$ Mọi cơ cấu giá dương là $p=tp_0$, $t>0$; thế trực tiếp cho $Ep_0=p_0$. Nếu cho phép cơ cấu giá không âm bằng 0, thêm $t=0$.')
add('2.8.1','\n\n'.join(out))
add('2.8.2',r'Theo thứ tự $A,B,C$, các cột biểu diễn đầu ra của từng ngành, nên $$E=\begin{bmatrix}0&0&1\\1&0&0\\0&1&0\end{bmatrix}.$$ Hệ $Ep=p$ là $p_C=p_A$, $p_A=p_B$, $p_B=p_C$. Vì vậy $p=t(1,1,1)^T$, $t>0$ (hoặc $t\ge0$ nếu cho phép cơ cấu bằng 0). Ba ngành phải có cùng giá trị sản lượng.')
add('2.8.3',r'Hệ $Ep=p$ cho $p_1=p_1$, $p_3=p_2$, $p_2=p_3$. Do đó $$p=(s,t,t)^T,\quad s,t>0.$$ Có hai tham số vì ngành 1 hoàn toàn tự dùng đầu ra của mình, độc lập với nhóm ngành 2 và 3 trao đổi với nhau. Hệ chỉ buộc giá trị hai ngành sau bằng nhau; không có phương trình ràng buộc tỷ lệ giữa hai nhóm.')
add('2.8.4',r'Với $E=\begin{bmatrix}a&b\\1-a&1-b\end{bmatrix}$, hệ $Ep=p$ rút còn $(1-a)p_1=bp_2$. Nếu $b+1-a>0$, chọn $p=(b,1-a)^T$; vector không âm, khác 0 và $Ep=p$. Chuẩn hóa bằng cách chia cho $b+1-a$. Nếu $b=0,a=1$, thì $E=I$ và mọi vector đều là vector cân bằng, chẳng hạn $(1,1)^T$. Như vậy luôn có vector cân bằng không âm khác 0, đúng định lý.')
add('2.8.5',r'Đổi thứ tự hai tổng hữu hạn: $$\sum_i(Ec)_i=\sum_i\sum_j e_{ij}c_j=\sum_jc_j\left(\sum_i e_{ij}\right)=\sum_jc_j,$$ vì tổng mỗi cột của ma trận stochastic bằng 1. Kết quả đúng cho mọi $c$, không cần các thành phần của $c$ dương.')
add('2.8.6',r'**a.** Ô thứ $j$ của hàng $WE$ bằng $\sum_i e_{ij}$. Vì $E\ge0$ đã được giả thiết, điều kiện $WE=W$ tương đương mọi tổng cột bằng 1, tức $E$ stochastic. **b.** $EF\ge0$ vì mỗi ô là tổng các tích không âm. Đồng thời $W(EF)=(WE)F=WF=W$. Theo (a), $EF$ stochastic.')
add('2.8.7',r'**a.** Chọn $E=\frac12\begin{bmatrix}1&1\\1&1\end{bmatrix}$. Khi đó $(I-E)(1,1)^T=0$ nên không khả nghịch. **b.** Chọn $E=\begin{bmatrix}3/4&1/2\\1/2&3/4\end{bmatrix}$. Ta có $\det(I-E)=-3/16$ và $$(I-E)^{-1}=\begin{bmatrix}-4/3&-8/3\\-8/3&-4/3\end{bmatrix}.$$ Tất cả ô của $E$ đều nằm giữa 0 và 1, nhưng nghịch đảo có các ô âm.')
add('2.8.8',r'Viết $E=\begin{bmatrix}a&b\\c&d\end{bmatrix}$ và $\Delta=\det(I-E)=1-\operatorname{tr}E+\det E$. Với các ô nằm giữa 0 và 1, $$ (I-E)^{-1}=\Delta^{-1}\begin{bmatrix}1-d&b\\c&1-a\end{bmatrix}.$$ Nếu $\operatorname{tr}E<1+\det E$ thì $\Delta>0$, tử số không âm, nên nghịch đảo tồn tại và không âm. Ngược lại, nếu nghịch đảo tồn tại không âm mà $\Delta<0$, mọi ô của tử số phải bằng 0; điều này cho $I-E=0$, mâu thuẫn khả nghịch. Do đó $\Delta>0$, tương đương bất đẳng thức cần chứng minh.')
aa=[[[.6,.5,.1],[.1,.3,.3],[.2,.1,.4]],[[.7,.1,.3],[.2,.5,.2],[.1,.1,.4]],[[.6,.2,.1],[.3,.4,.2],[.2,.5,.1]],[[.8,.1,.1],[.3,.1,.2],[.3,.3,.2]]]
out=[]
for i,a in enumerate(aa):
    e=decimal(a);k=S.eye(3)-e;inv=k.inv();assert all(v>=0 for v in inv)
    out.append('**'+chr(97+i)+r'.** Lập $I-E$, khử Gauss–Jordan trên $[I-E\mid I]$ cho $$\det(I-E)='+S.latex(k.det())+r',\quad (I-E)^{-1}='+tex(inv)+r'.$$ Định thức khác 0 và tất cả ô của ma trận vừa tính không âm. Nhân với $I-E$ cho $I$, xác nhận cả hai yêu cầu.')
add('2.8.9','\n\n'.join(out))
add('2.8.10',r'Nếu tổng mỗi cột của $E$ nhỏ hơn 1, thì tổng mỗi hàng của $E^T$ nhỏ hơn 1. Áp dụng (1) cho $E^T$: $I-E^T$ khả nghịch và $(I-E^T)^{-1}\ge0$. Chuyển vị cho $(I-E)^{-1}=((I-E^T)^{-1})^T\ge0$; tính khả nghịch cũng được bảo toàn khi chuyển vị. Đây chính là (2).')
add('2.8.11',r'Đặt $\mathbf1=(1,\ldots,1)^T$ và $p=(I-E)^{-1}\mathbf1$. Khi $E\ge0$ và nghịch đảo không âm, có $p\ge0$ và $(I-E)p=\mathbf1$. Suy ra $p=\mathbf1+Ep\ge\mathbf1>0$, đồng thời $p-Ep=\mathbf1>0$. Vậy vector xây dựng được thỏa cả $p>0$ và $p>Ep$.')
add('2.8.12',r'Đặt $r=\max_i (Ep)_i/p_i$. Vì $p_i>0$, $E\ge0$ và $Ep<p$, ta có $0\le r<1$. Chọn $\mu=(1+r)/2$, khi đó $0<\mu<1$ và $(Ep)_i/p_i\le r<\mu$ với mọi $i$. Nhân với $p_i>0$ cho $Ep<\mu p$, đúng yêu cầu.')
save()
