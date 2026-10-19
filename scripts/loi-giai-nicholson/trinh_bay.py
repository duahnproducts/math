"""Tách lập luận ở ranh giới câu, giữ nguyên công thức và nhãn từng ý.

Các ghi chú gắn với số bài bổ sung lý do cho phép biến đổi, không thay thế
phép tính. Những bài tính toán được tạo ma trận trung gian ở chi_tiet.py.
"""
import re

RULES={
 '2.1':r'Hai ma trận bằng nhau khi cùng kích thước và từng ô tương ứng bằng nhau. Cộng và nhân vô hướng thực hiện theo từng ô; một ẩn tự do phải được giữ lại bằng tham số.',
 '2.2':r'Nếu $A=[a_1\ \cdots\ a_n]$, thì $Ax=x_1a_1+\cdots+x_na_n$. Thành phần thứ $i$ cũng bằng tích vô hướng của hàng $i$ với $x$. Vì vậy viết $b$ thành tổ hợp các cột tương đương giải $Ax=b$.',
 '2.3':r'Với $A$ cỡ $m\times n$, $B$ cỡ $n\times p$, tích $AB$ có cỡ $m\times p$ và $(AB)_{ij}=\sum_{k=1}^n a_{ik}b_{kj}$. Khi khai triển, giữ nguyên thứ tự các thừa số.',
 '2.4':r'Theo định nghĩa, $B=A^{-1}$ khi $AB=BA=I$. Muốn khử $A$ ở bên trái thì nhân trái với $A^{-1}$; muốn khử ở bên phải thì nhân phải. Nghịch đảo tích đảo thứ tự: $(AB)^{-1}=B^{-1}A^{-1}$.',
 '2.5':r'Ma trận sơ cấp $E$ nhận từ $I$ bằng một phép hàng. $EA$ làm phép đó lên các hàng của $A$. Trong chuỗi $E_k\cdots E_1A$, phép $E_1$ được thực hiện trước.',
 '2.6':r'Tuyến tính nghĩa là $T(au+bv)=aT(u)+bT(v)$. Với vector cột, ma trận của $T$ là $[T(e_1)\ \cdots\ T(e_n)]$; ma trận của $S\circ T$ là $[S][T]$.',
 '2.7':r'Phân tích $PA=LU$ tách việc giải $Ax=b$ thành $Ly=Pb$ (thế tiến) và $Ux=y$ (thế ngược). Phải giữ đúng quy ước chuẩn hóa $L,U$ của đề.',
 '2.8':r'Cơ cấu giá cân bằng thỏa $Ep=p$, tức $(I-E)p=0$. Với mô hình mở, điều kiện cần kiểm tra là $I-E$ khả nghịch và $(I-E)^{-1}$ có các ô không âm.',
 '2.9':r'Ta dùng vector cột: ô $p_{ij}$ là xác suất từ trạng thái $j$ tới $i$. Sau $k$ bước, $s_k=P^ks_0$. Phân bố dừng phải thỏa đồng thời $Ps=s$, $s_i\ge0$ và $\sum_i s_i=1$.',
 '3.1':r'Cộng bội hàng khác giữ nguyên định thức; đổi hai hàng đổi dấu; rút hệ số $c$ từ một hàng đưa $c$ ra ngoài. Với khai triển, $C_{ij}=(-1)^{i+j}\det M_{ij}$.',
 '3.2':r'Dùng $\det(AB)=\det A\det B$, $\det A^T=\det A$, $\det(cA)=c^n\det A$ ở cấp $n$. Khi $\det A\ne0$, $A^{-1}=\operatorname{adj}A/\det A$; adjugate là bảng phần bù đã chuyển vị.',
 '3.3':r'Trị riêng $\lambda$ cần có vector $v\ne0$ thỏa $Av=\lambda v$. Tương đương $(A-\lambda I)v=0$ có nghiệm khác 0, nên $\det(\lambda I-A)=0$.',
 '3.4':r'Chéo hóa $A=PDP^{-1}$ nghĩa là các cột của $P$ là một cơ sở vector riêng. Trị riêng của cột thứ $j$ phải nằm ở ô $d_{jj}$, và có thể kiểm tra bằng $AP=PD$.',
 '3.5':r'Mô hình tuyến tính có $v_{k+1}=Mv_k$, nên $v_k=M^kv_0$. Nếu $v_0=\sum_i c_iv_i$ theo vector riêng, thì $v_k=\sum_i c_i\lambda_i^kv_i$.',
 '3.6':r'Với truy hồi tuyến tính, thử $x_k=r^k$ để tìm phương trình đặc trưng. Các điều kiện đầu quyết định hệ số; với bài đếm, cần phân loại các trường hợp rời nhau và đếm hết mọi khả năng.',
 '3.7':r'Nếu $Av=\lambda v$ thì $f(x)=e^{\lambda x}v$ thỏa $f\prime=Af$, vì $f\prime=\lambda e^{\lambda x}v=Af$. Điều kiện đầu dùng để xác định các hệ số còn lại.',
 '3.8':r'Đề yêu cầu chứng minh từ định nghĩa: khai triển theo cột đầu, đưa về định thức cấp nhỏ hơn rồi áp dụng giả thiết quy nạp. Không lấy tính chất đang chứng minh làm giả thiết.'
}

NOTES={
 '2.3.6':r'Vì đẳng thức phải đúng với **mọi** ma trận, ta được chọn riêng $E,F$ để ép từng phần tử của $A$. Sau khi tìm dạng $aI$, vẫn cần kiểm tra dạng ấy giao hoán với một ma trận tùy ý; chỉ thử $E,F$ chưa đủ cho chiều ngược.',
 '2.3.8':r'Với $N$ ở dưới, $N^2=\begin{bmatrix}0&0\\0&0\end{bmatrix}$, $NP=0$ còn $PN=N$. Vì vậy tích bằng 0 không buộc từng thừa số bằng 0. Với $P,Q$, ta có $P^2=P$, $Q^2=Q$ do từng ô đường chéo là 0 hoặc 1.',
 '2.3.14':r'Vector $e_j$ có đúng một ô 1, các ô khác bằng 0. Do đó $(Ae_j)_i=\sum_k a_{ik}(e_j)_k=a_{ij}$: phép chọn vector đơn vị tách riêng từng cột mà không trộn các cột với nhau.',
 '2.3.15':r'Bước nhân thêm $U$ hợp lệ vì $U^2=I$ được kiểm tra từ dữ kiện cụ thể. Với ma trận bất kỳ, $AU=0$ không cho phép bỏ $U$; điều quyết định ở đây chính là có phép nhân hoàn tác.',
 '2.3.17':r'Từ $\begin{bmatrix}1&0\\x&1\end{bmatrix}\begin{bmatrix}y&z\\0&w\end{bmatrix}=\begin{bmatrix}y&z\\xy&xz+w\end{bmatrix}$, giải theo thứ tự: $y=a$, $z=b$, rồi $xa=c$ cho $x=c/a$, cuối cùng $w=d-xb$. Chỉ phép tìm $x$ đòi $a\ne0$.',
 '2.3.19':r'Công thức $(XY)^T=Y^TX^T$ đảo thứ tự hai thừa số. Với $X=A,Y=A^T$, sau khi đảo và dùng $(A^T)^T=A$, ta trở lại đúng tích ban đầu. Kích thước $AA^T$ và $A^TA$ có thể khác nhau, nhưng mỗi tích đều vuông.',
 '2.3.21':r'Tính riêng $A^TA=\begin{bmatrix}a^2+c^2&ab+cd\\ab+cd&b^2+d^2\end{bmatrix}$ và $AA^T=\begin{bmatrix}a^2+b^2&ac+bd\\ac+bd&c^2+d^2\end{bmatrix}$. So ô đường chéo cho $b^2=c^2$; so ô ngoài đường chéo cho $ab+cd-ac-bd=(a-d)(b-c)=0$.',
 '2.3.22':r'Mỗi $a_{ij}^2\ge0$ vì phần tử thực. Một tổng hữu hạn các số không âm chỉ có thể bằng 0 nếu **từng** số hạng bằng 0. Lập luận này dùng cả giả thiết đối xứng (đổi $a_{ji}$ thành $a_{ij}$) và giả thiết số thực.',
 '2.3.23':r'Với ma trận cấp 2, $\operatorname{tr}(AB)=a_{11}b_{11}+a_{12}b_{21}+a_{21}b_{12}+a_{22}b_{22}$. Đổi thứ tự các số thực trong từng tích cho đúng tổng $\operatorname{tr}(BA)$. Vì vậy vết hiệu luôn bằng 0, trong khi vết $I_2$ bằng 2.',
 '2.3.24':r'Ta không khử $B$ từ $AB=0$. Thay vào đó, giả sử có **nghịch đảo phải** $C$ với $BC=I$, rồi dùng tính kết hợp để đưa $BC$ về cùng một cặp. Kết quả trái với giả thiết $A\ne0$, nên giả sử ấy sai.',
 '2.3.28':r'Ô thứ $i$ của $A\mathbf1$ bằng $\sum_j a_{ij}$, chính là tổng hàng $i$. Nhân $AB$ với $\mathbf1$ ở bên phải giúp biến yêu cầu về tổng các hàng thành một đẳng thức vector có thể tính bằng tính kết hợp.',
 '2.3.29':r'Để chứng minh hệ thuần nhất chỉ có nghiệm 0, lấy một nghiệm bất kỳ $x$ rồi chứng minh nó bắt buộc bằng 0. Ta áp dụng giả thiết về $A$ cho vector $y=Bx$ trước, sau đó mới áp dụng giả thiết về $B$ cho $x$.',
 '2.3.31':r'Lấy vết là cộng các ô đường chéo. Từ $\operatorname{tr}(AB)=\operatorname{tr}(BA)$ suy ra vế trái có vết 0 với mọi $A,B$. Vế phải có đúng $n$ ô 1, nên có vết $n>0$; mâu thuẫn này loại mọi cặp $A,B$, không chỉ một ví dụ.',
 '2.3.34':r'Không được tự gộp $AB+BA$ thành $2AB$. Chỉ sau khi chuyển các hạng giống nhau về một phía mới thu được điều kiện $AB-BA=0$. Chia cho 2 là phép chia số thực; đây không phải phép khử một ma trận.',
 '2.4.7':r'Ta cần biểu diễn $x$ theo $z$, nên phải loại biến trung gian $y$. Từ $z=By$ tìm $y$ trước, rồi thay vào $x=Ay$. Thứ tự $AB^{-1}$ được quyết định bởi phép hợp thành này.',
 '2.4.10':r'Giả thiết $AB=I$ và $CA=I$ có thể dùng chung bằng cách xét tích $CAB$: ghép $C(AB)$ được $C$, còn ghép $(CA)B$ được $B$. Do hai cách ghép bằng nhau, nghịch đảo trái và phải phải trùng nhau.',
 '2.4.11':r'Một ma trận chữ nhật có thể có nghịch đảo trái mà không có nghịch đảo phải. Công thức $x=Cb$ chỉ cho **ứng viên duy nhất**; ứng viên thực sự là nghiệm khi và chỉ khi thay lại cho $ACb=b$.',
 '2.4.12':r'Ở đây không chia cho $A$. Ta đưa đa thức về $A(3I-A)=2I$, rồi chia hai vế cho số thực 2. Vì $3I-A$ là đa thức của $A$, nó giao hoán với $A$, nên cùng công thức cũng cho tích theo thứ tự ngược.',
 '2.4.13':r'Bình phương độ dài mỗi hàng bằng $s$. Ví dụ tích vô hướng hàng 1 và hàng 2 có dạng $-ab+ab-cd+cd=0$. Các cặp còn lại triệt tiêu tương tự theo cấu trúc dấu. Do $Q\ne0$ và hệ số thực, ít nhất một bình phương dương nên $s>0$.',
 '2.4.18':r'Phương pháp chung là tìm vector hàng $Y\ne0$ với $YA=0$ hoặc vector cột $x\ne0$ với $Ax=0$. Nếu $A^{-1}$ tồn tại, nhân ở phía phù hợp sẽ buộc vector ấy bằng 0. Đây là mâu thuẫn cần dùng, không cần tính định thức.',
 '2.4.20':r'Nếu $A$ khả nghịch thì $(A^{-1})^kA^k=(A^{-1}A)^k=I$. Nếu đồng thời $A^k=0$, cùng tích ấy lại bằng 0. Vì ma trận đơn vị khác ma trận không ở mọi cấp dương, hai điều kiện không thể cùng đúng.',
 '2.4.24':r'Tách một thừa số $A$ khỏi từng hạng bậc dương; chuyển hạng hằng sang phía kia. Sau đó chia cho hệ số khác 0 của $I$ để có một tích bằng $I$. Thừa số còn lại là đa thức của $A$, nên giao hoán với $A$ và cho cả hai đẳng thức nghịch đảo.',
 '2.4.25':r'Hai cách chứng minh dùng cùng giả thiết $AB$ khả nghịch. Cách tích cho ngay công thức nghịch đảo. Cách hạt nhân dùng tính chất: ma trận **vuông** khả nghịch khi và chỉ khi hệ thuần nhất chỉ có nghiệm 0.',
 '2.4.26':r'Đặt nghịch đảo khối trên là $\begin{bmatrix}X&Y\\0&Z\end{bmatrix}$. Nhân với $\begin{bmatrix}P&Q\\0&R\end{bmatrix}$ cho $PX=I$, $RZ=I$, $PY+QZ=0$. Suy ra $X=P^{-1}$, $Z=R^{-1}$ và $Y=-P^{-1}QR^{-1}$; thứ tự các thừa số đến từ việc nhân trái với $P^{-1}$.',
 '2.4.28':r'Khi khai triển $(I-A)(I+A+\cdots+A^{k-1})$, mỗi hạng $A^j$ xuất hiện một lần dấu cộng và một lần dấu trừ. Chỉ còn $I-A^k$. Nếu $A^k=0$ thì tích bằng $I$, và tích ngược cũng vậy vì tất cả thừa số đều là đa thức của $A$.',
 '2.4.30':r'Để tách ma trận ở giữa tích $ABC$, nhân trái với $A^{-1}$ và nhân phải với $C^{-1}$. Khi đảo tích ba thừa số phải đảo toàn bộ thứ tự: $(XYZ)^{-1}=Z^{-1}Y^{-1}X^{-1}$.',
 '2.4.32':r'Từ $AC=CA$, nhân trái với $A^{-1}$ cho $C=A^{-1}CA$. Tiếp tục nhân phải với $A^{-1}$ cho $CA^{-1}=A^{-1}C$. Không có bước đổi chỗ hai thừa số tùy ý; việc đổi chỗ được chứng minh từ chính giả thiết giao hoán.',
 '2.4.36':r'Một phản ví dụ cho tính khử phải có $AB=AC$ nhưng $B\ne C$. Khi $Ax=0$ với $x\ne0$, đặt $x$ làm một cột của $B$, còn $C=0$. Khi ấy $AB=0=AC$ nhưng cột ấy của $B$ khác cột tương ứng của $C$.',
 '2.4.37':r'Đa thức $I-U^2$ phân tích được thành $(I-U)(I+U)$ vì $U$ giao hoán với $I$. Ta chỉ nhân nghịch đảo của $I+U$ **trong trường hợp đang giả sử nó khả nghịch**. Sau đó phải kiểm tra chiều đảo tại $U=I$.',
 '2.4.38':r'Ma trận $P=XX^T$ thỏa $P^2=P$ do hai thừa số ở giữa là $X^TX=I_m$. Khi bình phương $I-2P$, hạng $-4P$ triệt tiêu với $4P^2$. Bởi vậy ma trận mới tự nghịch đảo; kiểm tra chuyển vị riêng để có cả tính đối xứng.',
 '2.4.41':r'Phân phối $A^{-1}(A+B)B^{-1}=A^{-1}AB^{-1}+A^{-1}BB^{-1}=B^{-1}+A^{-1}$. Chỉ khử các cặp kề nhau $A^{-1}A$ và $BB^{-1}$, nên không cần $A,B$ giao hoán.',
 '2.5.4':r'Ba loại phép hàng chỉ thay một hàng, hoặc đổi đúng hai hàng. Nếu các hàng khác giữ nguyên thì hiệu $EA-A$ có các hàng đó bằng 0. Xét dạng các hàng của hiệu là cách kiểm tra yêu cầu mà không phải nhân toàn bộ ma trận.',
 '2.5.10':r'Từ $EA=R$ với $E=E_k\cdots E_1$, nhân trái với $E^{-1}$ cho $A=E^{-1}R$. $E$ luôn khả nghịch dù $A$ có thể suy biến; tính khả nghịch cần dùng nằm ở các phép hàng, không nằm ở $A$.',
 '2.5.14':r'Một phép hàng tác động cùng lúc lên mọi cột của ma trận ghép. Vì vậy, nếu toàn bộ chuỗi là nhân trái với $U$, khối trái thành $UA$ và khối phải từ $I$ thành $UI=U$. Hai khối không được dùng hai chuỗi phép hàng khác nhau.',
 '2.5.16':r'$U$ khả nghịch nên chuỗi đưa $U$ về $I$ có tích bằng $U^{-1}$. Khi áp dụng chuỗi đó lên cả ma trận ghép, khối $A$ cũng bị nhân trái bởi $U^{-1}$. Mỗi hàng đã có trụ trong khối $I$, nên khối phải không làm thay đổi tính rút gọn.',
 '2.5.20':r'Có $m$ ẩn nhưng chỉ $n<m$ phương trình nên ít nhất một ẩn tự do; vì thế $Bx=0$ có nghiệm $x\ne0$. Dùng chính vector ấy để chứng minh $AB$ có hạt nhân khác 0, thay vì đoán một quan hệ hàng của $AB$.',
 '2.5.22':r'Đổi một hàng của $A$ không có nghĩa đổi cùng hàng của $A^{-1}$. Nghịch đảo của tích $EA$ là $A^{-1}E^{-1}$, tức ma trận sơ cấp chuyển sang **bên phải**; vì vậy nó tác động lên các cột của nghịch đảo.',
 '2.6.1':r'Tuyến tính cho phép tính ảnh của một tổ hợp từ ảnh các vector đã biết. Vì vậy tìm các hệ số biểu diễn vector đầu vào trước; rồi dùng đúng các hệ số ấy cho vector đầu ra. Không áp dụng $T$ lên từng tọa độ bằng một công thức chưa được cho.',
 '2.6.5':r'Một tập con là không gian con nếu chứa 0 và đóng với mọi tổ hợp tuyến tính. Hạt nhân chứa $0$ vì $T(0)=0$; ảnh chứa $0$ vì $0=T(0)$. Các đẳng thức dưới đây kiểm tra phần đóng với tổ hợp tuyến tính.',
 '2.6.7':r'Muốn bác tuyến tính chỉ cần một cặp vector vi phạm tính cộng, hoặc một vector và một hệ số vi phạm tính nhân vô hướng. Sau khi có phản ví dụ, không cần xét tất cả đầu vào còn lại.',
 '2.6.10':r'Giữ nguyên trục quay nghĩa là vector đơn vị trên trục đó giữ nguyên. Hai cột còn lại được đọc từ ảnh của hai vector đơn vị trong mặt phẳng quay; dấu của sin được quyết định bởi chiều quay trong đề.',
 '2.6.11':r'Với vector cột, thao tác thực hiện trước đứng bên phải. Muốn đối xứng qua đường góc $\theta$, ta quay $-\theta$ về trục $x$, đổi dấu tung độ, rồi quay lại $\theta$. Đó là nguồn gốc thứ tự $R_\theta Q_0R_{-\theta}$.',
 '2.6.14':r'Tính cộng áp dụng được cả với vector 0. Đẳng thức $T(0)=T(0)+T(0)$ là đẳng thức vector nên được trừ cùng $T(0)$ ở hai vế. Tính đồng nhất với hệ số $-1$ cho công thức về vector đối.',
 '2.6.22':r'Mọi vector $x$ có biểu diễn $x=\sum_jx_je_j$. Khi $T$ tuyến tính và nhận giá trị vô hướng, $T(x)=\sum_jx_jT(e_j)$ là một tổng các số thực. Chọn $w_j=T(e_j)$ sẽ biến tổng ấy thành tích vô hướng.',
 '2.6.23':r'Tích $yx^T$ có kích thước $m\times n$, đúng kích thước cần cho ánh xạ từ $\mathbb R^n$ sang $\mathbb R^m$. Mẫu $x^Tx=\sum_jx_j^2>0$ do $x\ne0$, nên công thức luôn xác định kể cả khi một số tọa độ của $x$ bằng 0.',
 '2.7.4':r'Một cách chứng minh không tồn tại phân tích là đặt các phần tử tổng quát của $L,U$, nhân hai ma trận rồi tìm hai ô có điều kiện xung đột. Không tìm được bằng một thuật toán cụ thể chưa đủ chứng minh mọi phân tích đều không tồn tại.',
 '2.7.6':r'Một ma trận vừa tam giác dưới vừa tam giác trên phải chéo: các ô trên đường chéo bằng 0 bởi tính tam giác dưới, các ô dưới đường chéo bằng 0 bởi tính tam giác trên. Đây là lý do hai phân tích LU chỉ có thể khác nhau bởi một ma trận chéo.',
 '2.7.7':r'Với tam giác dưới, $a_{ik}=0$ nếu $k>i$, còn $b_{kj}=0$ nếu $k<j$. Khi $i<j$, không có chỉ số $k$ nào tránh được cả hai điều kiện bằng 0. Do đó **mỗi** số hạng của tổng bằng 0, chứ không phải các hạng tình cờ triệt tiêu.',
 '2.7.8':r'Để biết hình dạng $A^{-1}$, xét từng cột bằng hệ $Ax=e_j$. Phía trước hàng $j$, vế phải bằng 0; thế tiến bắt buộc từng ẩn tương ứng bằng 0 vì phần tử đường chéo khác 0.',
 '2.8.4':r'Phương trình thứ hai là đối của phương trình thứ nhất, nên chỉ cần giải $(1-a)p_1=bp_2$. Phải tách trường hợp cả $b$ và $1-a$ bằng 0 trước khi chuẩn hóa; nếu không sẽ chia cho 0.',
 '2.8.6':r'Đẳng thức về tổng cột chỉ kiểm tra tổng bằng 1. Định nghĩa stochastic còn yêu cầu mọi ô không âm; với tích $EF$, tính không âm phải được kiểm tra riêng trước khi dùng đẳng thức $W(EF)=W$.',
 '2.8.8':r'Vì $0\le a,b,c,d\le1$, các tử số $1-d,b,c,1-a$ không âm. Dấu của nghịch đảo do dấu $\Delta$ quyết định. Nếu $\Delta<0$, một ô tử dương sẽ cho ô nghịch đảo âm; nếu mọi tử bằng 0 thì $I-E=0$, cũng không khả nghịch.',
 '2.8.11':r'Không thể chỉ nói nghịch đảo không âm nên $p>0$: điều đó mới trực tiếp cho $p\ge0$. Bước $p=\mathbf1+Ep\ge\mathbf1$ mới chứng minh chặt chẽ mọi thành phần của $p$ dương.',
 '2.8.12':r'Có hữu hạn tỷ số $(Ep)_i/p_i$ và mỗi tỷ số nhỏ hơn 1, nên giá trị lớn nhất $r$ cũng nhỏ hơn 1. Chọn trung điểm của $r$ và 1 bảo đảm một hệ số $\mu$ dùng được cho **tất cả** thành phần.',
 '2.9.1':r'Regular chỉ đòi tồn tại **một** số mũ làm mọi ô dương. Để chứng minh không regular, phải loại **mọi** số mũ; một trạng thái hấp thụ cho cột đơn vị không đổi là chứng cứ cho tất cả các lũy thừa.',
 '2.9.5':r'Từ xác suất hiện tại $q_m$, ta có $q_{m+1}=(1-p)q_m+p(1-q_m)=p+(1-2p)q_m$. Trừ $1/2$ hai vế cho $q_{m+1}-1/2=(1-2p)(q_m-1/2)$, nên sai lệch giảm theo lũy thừa khi $|1-2p|<1$.',
 '2.9.7':r'Tại 0 xu hoặc 4 xu, người chơi dừng lại, nên cột tương ứng là cột đơn vị. Việc dùng trạng thái hấp thụ giữ cả những người đã dừng từ ván trước trong phân bố của các ván sau; không được loại họ khi nhân tiếp.',
 '2.9.9':r'Các ô trong một cột đều không âm. Nếu một ô đã bằng 1 và tổng cột bằng 1, tất cả ô còn lại buộc bằng 0. Cột đơn vị ấy tiếp tục giữ nguyên khi nhân thêm $P$, nên không thể biến thành cột toàn dương.',
 '2.9.11':r'Chuẩn hóa $\mathbf1$ thành $s=\mathbf1/n$ bảo đảm tổng bằng 1. Điều kiện tổng **hàng** bằng 1 cho $Ps=s$; điều kiện tổng **cột** bằng 1 bảo đảm $P$ là ma trận chuyển theo quy ước vector cột.',
 '3.1.2':r'Khai triển theo hàng hoặc cột toàn 0 là chọn đúng nơi có hệ số bằng 0 trước các phần bù. Dù phần bù lớn hay nhỏ, mỗi tích vẫn bằng 0; do đó không cần tính bất kỳ định thức con nào.',
 '3.1.3':r'Dấu chỉ phụ thuộc tổng chỉ số hàng và cột. Ô cuối có chỉ số $(n,n)$, nên tổng luôn chẵn dù $n$ chẵn hay lẻ; đây là lý do dấu ở ô này luôn dương.',
 '3.1.4':r'Trong hàng đầu của $I_n$, ô đầu là 1 và các ô còn lại bằng 0. Xóa hàng đầu và cột đầu còn đúng $I_{n-1}$, không phải một ma trận mới cần tính riêng. Việc lặp phép khai triển kết thúc ở ma trận một ô $[1]$.',
 '3.1.6':r'Các hàng phụ thuộc cho định thức 0: nếu một hàng là tổ hợp của các hàng khác, trừ tổ hợp ấy khỏi nó tạo hàng 0 mà không đổi định thức. Ở ý b, hệ số chia là 2, không phải $b$, nên vẫn hợp lệ khi $b=0$.',
 '3.1.10':r'Với ma trận $\begin{bmatrix}B&C\\0&D\end{bmatrix}$, định thức bằng $\det B\det D$. Khối 0 dưới trái bảo đảm đây là dạng tam giác khối; không yêu cầu khối $C$ bằng 0. Hai khối đường chéo phải vuông.',
 '3.1.12':r'Ba vector thuộc không gian sinh bởi hai vector thì phụ thuộc: hệ hai phương trình với ba hệ số của một tổ hợp bằng 0 có nghiệm hệ số khác 0. Chỉ cần một nhóm cột phụ thuộc thì toàn bộ hệ cột cũng phụ thuộc.',
 '3.1.13':r'$2A$ nhân **cả ba hàng** với 2, nên định thức nhân $2\cdot2\cdot2=8$. Tương tự $-A$ nhân mỗi trong $n$ hàng với $-1$, nên hệ số là $(-1)^n$, không phải luôn bằng $-1$.',
 '3.1.15':r'Khi khai triển theo hàng chứa biến, phần bù của ô biến không chứa chính hàng ấy, nên không chứa biến đó. Vì vậy hệ số của biến chính là phần bù đại số tại ô của nó, bao gồm cả dấu $(-1)^{i+j}$.',
 '3.1.18':r'Phải thực hiện từ phải sang trái để $C_{j-1}$ còn là cột **ban đầu** khi dùng vào phép $C_j\leftarrow C_j-xC_{j-1}$. Nếu làm ngược thứ tự, cột đã thay đổi sẽ cho công thức khác.',
 '3.1.21':r'Phần bù $C_{ij}$ không chứa cột $j$ vì cột đó bị xóa. Do vậy khi thay riêng cột $j$ bằng $v$, các hệ số trong $T(v)=\sum_i v_iC_{ij}$ thật sự cố định, đúng dạng một ánh xạ tuyến tính.',
 '3.1.22':r'Để đảo $n$ cột, cột đầu phải đi qua $n-1$ cột, cột tiếp theo qua $n-2$ cột, rồi tiếp tục đến 1. Tổng số lần đổi kề là $(n-1)+\cdots+1=n(n-1)/2$. Chỉ tính chẵn lẻ của số này mới quyết định dấu.',
 '3.1.24':r'Mỗi cặp cột đổi thứ tự đúng một lần khi đảo toàn bộ danh sách. Có $\binom n2=n(n-1)/2$ cặp như vậy. Do hai lần đổi dấu triệt tiêu, chỉ phần dư chẵn lẻ của số cặp là cần thiết.',
 '3.1.25':r'Khi nhân một hàng với $c$, các phần bù theo hàng đó giữ nguyên vì hàng bị xóa khi lập minor. Bởi vậy mỗi số hạng khai triển có đúng một thừa số $c$, có thể đưa ra ngoài tổng.',
 '3.1.26':r'Định thức bằng 0 tạo phương trình tuyến tính theo $x,y$. Để đây là một đường thẳng thực sự, cần ít nhất một hệ số của $x,y$ khác 0; điều ấy đến từ giả thiết hai điểm phân biệt. Thay hai điểm vào cho hai hàng trùng nhau, xác nhận cả hai điểm nằm trên đường.',
 '3.2.4':r'Các định thức là số thực nên được phép giao hoán khi rút gọn. Trong khi đó các ma trận ở bên trong định thức vẫn giữ thứ tự; công thức không cho phép viết $B^{-1}AB=A$.',
 '3.2.5':r'Cấp ma trận là 3 nên hệ số 2 đưa ra khỏi định thức thành $2^3=8$. Với $(B^{-1})^T$, chuyển vị giữ nguyên định thức còn nghịch đảo đổi thành $1/\det B$.',
 '3.2.11':r'$\delta_{ik}$ bằng 1 khi $i=k$ và bằng 0 trong mọi trường hợp khác, nên tổng $\sum_k u\delta_{ik}a_{kj}$ chỉ còn đúng một hạng $ua_{ij}$. Đây là lý do nhân ma trận $uI$ giống nhân vô hướng $u$.',
 '3.2.12':r'Từ $d=-d$ suy ra $2d=0$, nên $d=0$ trên số thực. Ở đây $d=\det A\det B$. Tích hai số thực bằng 0 thì ít nhất một thừa số bằng 0; chưa thể kết luận cả hai đều bằng 0.',
 '3.2.14':r'Định thức của ma trận không bằng 0 ở cấp dương. Lấy định thức của $A^k$ cho $(\det A)^k$, và một số thực có lũy thừa dương bằng 0 thì chính số đó bằng 0.',
 '3.2.15':r'Với ma trận trực giao, $A^{-1}=A^T$. Do $\det(A^TA)=\det I=1$, ta có $(\det A)^2=1$, nên $\det A=\pm1$. Nhớ phân biệt bảng phần bù $C$ với adjugate $C^T$.',
 '3.2.16':r'Bình phương của một số thực luôn không âm. Vì thế việc thu được $(\det A)^2=-1$ là mâu thuẫn ngay. Ở cấp chẵn, $\det(-I)$ dương nên lập luận này không tạo mâu thuẫn; phải xét một ví dụ cụ thể.',
 '3.2.17':r'Chuyển vị phân phối qua tổng: $(X+Y)^T=X^T+Y^T$. Đồng thời $(B^T)^T=B$. Hai công thức biến $A+B^T$ thành $A^T+B$ trong một phép chuyển vị, rồi tính bất biến của định thức hoàn tất chứng minh.',
 '3.2.18':r'Muốn có $A=UB$, thử giải ra $U$ bằng cách nhân phải với $B^{-1}$. Chỉ làm được vì $\det B\ne0$. Sau đó kiểm tra riêng $\det U=1$, rồi chứng minh chiều ngược từ biểu thức $A=UB$.',
 '3.2.21':r'Nếu chia ngay cho $t$ thì có thể bỏ sót trường hợp $t=0$. Vì cặp $(s,t)$ khác $(0,0)$, khi $t=0$ thì $s\ne0$ và cột thứ nhất bằng 0. Cột 0 vẫn là bội (hệ số 0) của mọi cột khác.',
 '3.2.27':r'Định thức và mọi phần bù của ma trận nguyên đều là số nguyên vì chỉ dùng hữu hạn phép cộng, trừ và nhân số nguyên. Hai số nguyên có tích 1 chỉ có thể cùng là 1 hoặc cùng là $-1$.',
 '3.2.29':r'Giả thiết $\det A=2$ biến công thức adjugate thành $\operatorname{adj}A=2A^{-1}$. Gộp trước khi lấy định thức: $A^{-1}+4(2A^{-1})=9A^{-1}$. Không dùng công thức sai về định thức của tổng.',
 '3.2.30':r'Đưa một nhóm $n$ hàng qua nhóm kia cần mỗi hàng vượt qua $n$ hàng, tổng $n^2$ lần đổi. Vì $n^2-n=n(n-1)$ chẵn, $(-1)^{n^2}=(-1)^n$. Sau khi đổi nhóm, ma trận thành tam giác khối.',
 '3.2.31':r'Đẳng thức $A\operatorname{adj}A=0$ đặt mọi cột adjugate trong hạt nhân của $A$. Nếu hạng $A=n-1$ thì hạt nhân một chiều, nên các cột adjugate chỉ sinh được không gian có chiều nhiều nhất 1. Một minor khác 0 bảo đảm hạng không bằng 0.',
 '3.2.32':r'Ở cấp 3, $\operatorname{adj}A=dA^{-1}$ cho $\det(\operatorname{adj}A)=d^3/d=d^2$. Dấu trừ đặt trước cả ma trận cấp 3 tạo hệ số $(-1)^3=-1$ trong định thức.',
 '3.2.33':r'Mỗi minor cấp $n-1$ có $n-1$ hàng. Nhân $A$ với $u$ nhân từng hàng của minor với $u$, nên tạo hệ số $u^{n-1}$. Dấu phần bù và thao tác chuyển vị không đổi hệ số này.',
 '3.3.1':r'Trong định nghĩa trị riêng, điều kiện $v\ne0$ là bắt buộc. $Av=0$ luôn đúng với $v=0$ cho mọi ma trận, nên chỉ một nghiệm **khác 0** mới chứng minh trị riêng 0 và tính suy biến.',
 '3.3.2':r'Ma trận $\alpha I$ tác động lên mọi vector bằng nhân với $\alpha$. Bởi vậy trừ $\alpha I$ chỉ dịch hệ số của $v$ từ $\lambda$ sang $\lambda-\alpha$; vector $v$ không đổi. Cần viết cả chiều ngược để khẳng định các tập trị riêng đúng bằng nhau sau phép dịch.',
 '3.3.3':r'Với phép quay, $xI-A=\begin{bmatrix}x-\cos\theta&\sin\theta\\-\sin\theta&x-\cos\theta\end{bmatrix}$. Quy tắc cấp 2 cho dấu cộng trước $\sin^2\theta$ vì tích ngoài đường chéo mang dấu âm.',
 '3.3.4':r'Từ $Iv=v=1v$, mọi vector khác 0 thỏa định nghĩa vector riêng của trị riêng 1. Nếu $Iv=\lambda v$ với $v\ne0$, thì $(1-\lambda)v=0$ buộc $\lambda=1$, nên không có trị riêng khác.',
 '3.3.6':r'Chiều đi nhân đẳng thức vector với $r$; chiều về chia cho $r$. Điều kiện $r\ne0$ là cần thiết cho chiều về. Nếu $r=0$ thì ma trận mới bằng 0, mọi vector khác 0 đều là vector riêng, nên kết luận về vector riêng không còn đúng như cũ.',
 '3.3.7':r'Nhân một ma trận với cột toàn 1 tính tổng từng hàng. Muốn dùng giả thiết về tổng cột, áp dụng lập luận ấy cho $A^T$ trước. Sau đó dùng đa thức đặc trưng bằng nhau để chuyển kết quả về $A$.',
 '3.3.9':r'Bước quy nạp là $A^{k+1}v=A(A^kv)=A(\lambda^kv)=\lambda^kAv=\lambda^{k+1}v$. Áp dụng lần lượt cho từng lũy thừa của đa thức rồi cộng, vì nhân ma trận phân phối qua tổng.',
 '3.3.11':r'Mỗi lần nhân thêm một ma trận tam giác trên nghiêm ngặt, vị trí có thể khác 0 phải dịch ít nhất một cột về phải. Sau $n$ lần, khoảng cách cần ít nhất $n$ trong khi lớn nhất chỉ $n-1$, nên không còn ô nào khác 0.',
 '3.4.4':r'Chuyển vị tích ba thừa số đảo toàn bộ thứ tự: $(PDP^{-1})^T=(P^{-1})^TD^TP^T$. Vì $D$ chéo, $D^T=D$. Ta chọn $Q=(P^{-1})^T$ để hai thừa số ngoài đúng dạng $Q,Q^{-1}$.',
 '3.4.5':r'Khi nhân hai biểu thức $PDP^{-1}$, cặp ở giữa $P^{-1}P=I$ triệt tiêu. Vì thế $A^2=PD^2P^{-1}$, rồi quy nạp cho các lũy thừa. Nhân vô hướng và cộng đa thức cũng giữ hai thừa số ngoài $P,P^{-1}$.',
 '3.4.7':r'Mỗi ô đường chéo của $D$ là 1 hoặc $-1$, bình phương đều bằng 1. Vì vậy $D^2=I$, không phải $D$. Sau khi chuyển về $A$, đẳng thức $A^2=I$ chính là $AA=I$, cho nghịch đảo $A$ của chính nó.',
 '3.4.8':r'Mỗi số 0 hoặc 1 thỏa $d^2=d$. Do bình phương ma trận chéo chỉ bình phương từng ô đường chéo, $D^2=D$. Nhân hai phía với $P,P^{-1}$ chuyển đẳng thức về $A^2=A$.',
 '3.4.9':r'Cần tìm một ma trận $B$ thỏa $B^2=A$. Làm việc trong cơ sở vector riêng biến bài toán thành lấy căn từng số không âm trên đường chéo. Sau đó dùng cùng $P$ chuyển ma trận căn về cơ sở ban đầu.',
 '3.4.10':r'Điểm quyết định là **cùng một** cơ sở làm cả $A,B$ thành ma trận chéo. Khi viết tích, hai cặp $P^{-1}P$ triệt tiêu, nên $AB=PDEP^{-1}$. Tính giao hoán của hai ma trận chéo $D,E$ mới cho phép đổi thứ tự ở giữa.',
 '3.4.11':r'$\lambda^mv=0$ với $v\ne0$ buộc $\lambda^m=0$, nên $\lambda=0$. Chỉ có trị riêng 0 chưa đủ để kết luận $A=0$; giả thiết chéo hóa được mới cho ma trận chéo $D=0$ và do đó $A=0$.',
 '3.4.12':r'Trên số thực, $\lambda^m=1$ cho $\lambda=1$ nếu $m$ lẻ, và $\lambda\in\{-1,1\}$ nếu $m$ chẵn. Chuyển điều kiện đó sang từng ô của $D$, rồi chuyển lại bằng $A=PDP^{-1}$.',
 '3.4.15':r'Nếu chéo hóa được mà chỉ có một trị riêng $\lambda$, ma trận chéo bắt buộc là $D=\lambda I$. Do $P(\lambda I)P^{-1}=\lambda I$, ma trận ban đầu cũng phải là ma trận vô hướng. Vì vậy chỉ cần chứng minh ma trận đã cho khác $\lambda I$ để bác chéo hóa.',
 '3.4.16':r'Với $A=PDP^{-1}$, đa thức $p(A)=Pp(D)P^{-1}$. Vì $p(D)$ chéo với các ô $p(\lambda_i)$, đẳng thức $p(A)=0$ tương đương từng $p(\lambda_i)=0$. Ở đây $p(t)=(t-1)(t-2)$.',
 '3.4.17':r'Các khối chéo tác động độc lập lên hai nhóm tọa độ. Chọn ma trận đổi cơ sở dạng khối chéo sẽ không tạo các ô ngoài khối mới; hai phép chéo hóa nhỏ có thể ghép thành một phép chéo hóa cho toàn bộ ma trận.',
 '3.5.3':r'Giải $(a_0,j_0)^T=c_1(1,2)^T+c_2(1,-4)^T$ cho $c_1=(4a_0+j_0)/6$. Hạng thuộc trị riêng $-1/2$ mất dần, còn hạng thuộc trị riêng 1 giữ nguyên. Vì thế giới hạn là $(4a_0+j_0)(1,2)^T/6$.',
 '3.5.4':r'Tại ngưỡng ổn định, thử $\lambda=1$ vào $\lambda^2-\lambda/2-2\rho=0$, được $1/2-2\rho=0$, nên $\rho=1/4$. Công thức nghiệm dương tăng theo $\rho$, nên phía dưới ngưỡng có $\lambda_+<1$, phía trên có $\lambda_+>1$.',
 '3.5.5':r'Thử $\lambda=1$ vào $\lambda^2-\alpha\lambda-4/5=0$ cho $1-\alpha-4/5=0$, nên $\alpha=1/5$. Trị riêng còn lại là $-4/5$, có môđun nhỏ hơn 1, nên phần dao động tắt dần.',
 '3.6.4':r'Hai trường hợp bước đầu dài 1 hoặc 2 bậc không trùng nhau và bao hết mọi cách leo. Sau khi bỏ bước đầu, số bậc còn lại giảm tương ứng 1 hoặc 2. Quy ước có một cách leo 0 bậc (không bước) cho điều kiện $s_0=1$.',
 '3.6.5':r'Hai nhóm từ kết thúc bằng $b$ và bằng $a$ rời nhau. Với nhóm thứ hai và độ dài ít nhất 2, ký tự trước $a$ phải là $b$, nên bỏ **hai** ký tự $ba$. Từ rỗng tính là một từ hợp lệ, và độ dài 1 có hai từ $a,b$.',
 '3.6.6':r'Phép đổi ký hiệu là song ánh: mỗi chuỗi tung xu cho đúng một từ và có thể đổi ngược lại. Điều kiện không có hai mặt $H$ liền nhau chuyển đúng thành không có hai chữ $a$ liền nhau, nên số cách bằng nhau.',
 '3.6.8':r'Từ $x_{k+1}=y_k$, dịch chỉ số cho $x_{k+2}=y_{k+1}=3x_k+2y_k=3x_k+2x_{k+1}$. Phương trình đặc trưng $(r-3)(r+1)=0$ cho $x_k=C3^k+D(-1)^k$. Điều kiện $C+D=1$, $3C-D=0$ cho $C=1/4,D=3/4$.',
 '3.6.9':r'Đặt $x_k=C+D(-1/2)^k$ theo hai nghiệm đặc trưng. Điều kiện đầu cho $C+D=10$, $C-D/2=12$. Lấy phương trình sau trừ phương trình trước được $-3D/2=2$, nên $D=-4/3$, $C=34/3$.',
 '3.6.10':r'Viết các bước đầu: $x_1=rx_0+c$, $x_2=r^2x_0+rc+c$, $x_3=r^3x_0+r^2c+rc+c$. Mỗi bước nhân các hạng cũ với $r$ rồi thêm một $c$, dẫn tới tổng cấp số nhân. Trường hợp $r=1$ phải tách trước khi chia cho $1-r$.',
 '3.6.12':r'Thay $x_k=y_k-p$ phải thay ở **mọi** chỉ số: $y_{k+2}-p=a(y_{k+1}-p)+b(y_k-p)+c$. Gom hằng số về phải cho $c+(1-a-b)p$. Đặt hạng này bằng 0 để thu một truy hồi thuần nhất.',
 '3.6.13':r'Để tìm mọi nghiệm của phương trình có vế phải, trước hết chọn một nghiệm riêng $p$. Hiệu của một nghiệm bất kỳ với $p$ có vế phải triệt tiêu, nên là nghiệm thuần nhất. Ngược lại cộng một nghiệm thuần nhất với $p$ luôn khôi phục đúng vế phải.',
 '3.7.2':r'Thay $x=x_0$ vào $Ce^{ax}$ cho $Ce^{ax_0}=k$. Vì hàm mũ luôn dương, ta chia được cho $e^{ax_0}$: $C=ke^{-ax_0}$. Gộp hai số mũ thành $a(x-x_0)$.',
 '3.7.3':r'Tại $t=0$, $m(0)=10$ quyết định hệ số trước hàm mũ. Sau 3 giờ còn $8/10=4/5$ lượng đầu, nên $e^{3r}=4/5$. Lấy log hai vế cho $3r=\ln(4/5)$; log âm vì $4/5<1$, phù hợp sự phân rã.',
 '3.7.4':r'Đơn vị thời gian là năm và dân số tính bằng triệu. Điều kiện gấp đôi chỉ cho tỷ số $N(5)/N(0)=2$, nên $e^{5r}=2$. Viết $e^{rt}=e^{t\ln2/5}=2^{t/5}$ giúp đọc được ngay chu kỳ 5 năm.',
 '3.7.5':r'Tìm nghiệm riêng hằng $f_p$ bằng cách cho đạo hàm bằng 0: $Af_p+b=0$, nên $f_p=-A^{-1}b$. Khi đặt $f=g+f_p$, đạo hàm của $f_p$ bằng 0 và hạng hằng trong phương trình triệt tiêu.',
 '3.7.6':r'Định nghĩa $f_2=f\prime-a_1f$ được chọn để cô lập đạo hàm đầu: $f\prime=a_1f+f_2$. Đạo hàm $f_2$ rồi dùng phương trình bậc hai sẽ thay $f\prime\prime-a_1f\prime$ bằng $a_2f$, tạo một hệ chỉ có đạo hàm bậc nhất.'
}


def sentences(text):
    """Không cắt ở dấu chấm trong $...$, $$...$$ hay số thập phân."""
    protected=[]
    def keep(m):
        protected.append(m[0]);return f'@@M{len(protected)-1}@@'
    masked=re.sub(r'\$\$.*?\$\$|\$[^$]*\$',keep,text,flags=re.S)
    chunks=re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-ỸĐ$(@])|\n\s*\n',masked)
    def restore(s):
        return re.sub(r'@@M(\d+)@@',lambda m:protected[int(m[1])],s).strip()
    return [restore(s) for s in chunks if s.strip()]


def title(text):
    if re.match(r'(Nếu|Giả sử)',text):return 'Xét giả thiết'
    if re.match(r'(Ngược lại|Chiều ngược)',text):return 'Kiểm tra chiều ngược'
    if re.match(r'(Vậy|Do đó|Suy ra|Kết luận)',text):return 'Rút ra kết luận'
    if re.match(r'(Kiểm tra|Thế|Thay)',text):return 'Thay vào để tính và kiểm tra'
    if re.match(r'(Đặt|Gọi|Viết|Lấy|Chọn)',text):return 'Thiết lập biểu thức'
    if re.match(r'(Vì|Do |Bởi)',text):return 'Giải thích điều kiện sử dụng'
    if re.match(r'(Nhân|Chuyển|Trừ|Cộng|Chia|Khai triển|Tính)',text):return 'Thực hiện phép biến đổi'
    return 'Lập luận và tính toán'


def normalize_math(text):
    def replace(m):
        value=m[0];display=value.startswith('$$');inner=value[2:-2] if display else value[1:-1]
        if display or r'\begin{array}' in inner or len(inner)>180:
            return '\n\n$$\n'+inner.strip()+'\n$$\n\n'
        return value
    return re.sub(r'\n{3,}','\n\n',re.sub(r'\$\$.*?\$\$|\$[^$]*\$',replace,text,flags=re.S)).strip()


def renumber_steps(text):
    parts=re.split(r'(?=\*\*[a-pA-B](?:\.\d+|\([iv]+\))?\.(?:\*\*|\s+(?:Sai|Đúng)))',text)
    for i,part in enumerate(parts):
        number=0
        def change(m):
            nonlocal number
            number+=1;return f'**Bước {number}.'
        parts[i]=re.sub(r'\*\*Bước \d+\.',change,part)
    return ''.join(parts)


def present(number,text):
    text=text.replace(r'\n\n','\n\n').strip()
    if '**Cách làm.**' in text:return text
    section='.'.join(number.split('.')[:2])
    intro=RULES.get(section,'') if number.count('.')==2 else ''
    # Bài bổ sung không có mục lý thuyết riêng; giữ cách làm riêng trong bài.
    if '**Bước ' in text:
        body=text
    else:
        # Nhãn ý đứng riêng, không nhầm phần nhấn mạnh trong một câu.
        pattern=r'(\*\*(?:[a-pA-B](?:\.\d+|\([iv]+\))?(?:[.,:]|\s+(?:và|Sai|Đúng|loại|Lỗi))[^*]*?|\([12]\)\s*⇒\s*\([12]\)\.)\*\*)'
        parts=re.split(pattern,text)
        output=[]
        for i,part in enumerate(parts):
            if not part.strip():continue
            if i%2:output.append(part.strip());continue
            chunks=sentences(part)
            for j,chunk in enumerate(chunks,1):
                output.append(f'**Bước {j}. {title(chunk)}.**\n\n'+chunk)
        body='\n\n'.join(output)
    if number in NOTES:intro+='\n\n'+NOTES[number]
    return normalize_math(renumber_steps(('**Cách làm.** '+intro+'\n\n'+body).strip() if intro else body))
