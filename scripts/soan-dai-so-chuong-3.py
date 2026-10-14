"""Nguồn biên soạn chương 3: sinh MDX bài giảng và bài luyện tự soạn.

Chạy python scripts/soan-dai-so-chuong-3.py ở bất kỳ thư mục nào.
Không ghi vào bài tập chương 1-2 hay phần dịch Nicholson.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'content/dai-so/chuong-3'
LESSONS = []

def safe_mdx(text):
    """Giữ LaTeX/component, escape dấu so sánh và tập hợp trong văn xuôi."""
    parts = re.split(r'(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|</?[A-Z][^>]*>)', text)
    return ''.join(part if i % 2 else part.replace('<', '&lt;').replace('{', '&#123;').replace('}', '&#125;')
                   for i, part in enumerate(parts))

def lesson(title, idea, visual, need, formula, given, ask, method, solve, check, recap, errors, summary, anchor, tasks):
    LESSONS.append(locals())

# Mỗi bài luyện: tiêu đề, đề, gợi ý 1, gợi ý 2, lời giải, lỗi hay mắc.
lesson(
 'Định thức: diện tích và khai triển phần bù',
 'Định thức đo hệ số thay đổi diện tích có hướng; khai triển phần bù giúp tính nó bằng các ma trận nhỏ hơn.',
 r'''Một tấm lưới ô vuông có hai cạnh đơn vị. Ma trận có hai cột $u=(2,0)$ và $v=(1,3)$ đưa ô vuông thành hình bình hành đáy 2, cao 3. Diện tích mới bằng 6 lần diện tích cũ. Đổi thứ tự hai cột giữ diện tích nhưng đảo hướng: định thức đổi dấu.

<HinhDinhThuc />

Nếu hai cột cùng nằm trên một đường, hình bị ép phẳng; diện tích bằng 0. Đây là trực giác của ma trận không khả nghịch, không phải quy tắc đếm nghiệm cho mọi hệ bất kỳ.''',
 r'''Ôn ma trận vuông, phép khử hàng và định thức $2\times2$: $ad-bc$. Đường chéo chính chạy từ góc trên trái xuống góc dưới phải. $A_{ij}$ là ma trận thu được bằng cách bỏ hàng $i$ và cột $j$; nó nhỏ hơn $A$ một cấp. Phân biệt ma trận con với số định thức của nó.''',
 r'''**Phần bù đại số:** $C_{ij}=(-1)^{i+j}\det A_{ij}$. Dấu tạo bàn cờ: hàng đầu $+,-,+$, hàng sau $-,+,-$.

**Khai triển theo hàng $i$:** $\det A=\sum_{j=1}^n a_{ij}C_{ij}$. Theo cột $j$: $\det A=\sum_{i=1}^n a_{ij}C_{ij}$. $a_{ij}$ là phần tử tại vị trí $(i,j)$; $C_{ij}$ là số phần bù tại đúng vị trí ấy; $\sum$ là cộng các số hạng. Chọn hàng/cột có nhiều số 0 để ít tính.

| Phép làm trên hàng | Tác động tới định thức |
| --- | --- |
| Đổi hai hàng | Đổi dấu |
| Nhân một hàng với $c$ | Nhân định thức với $c$ |
| Cộng bội một hàng vào hàng khác | Không đổi |

Ma trận tam giác có định thức bằng tích các phần tử đường chéo. Một hàng 0 hoặc hai hàng bằng nhau cho định thức 0. Các quy tắc cột tương tự. Với $A$ cỡ $n\times n$, $\det(cA)=c^n\det A$ vì cả $n$ hàng đều bị nhân $c$.''',
 r'$A=\begin{bmatrix}2&0&1\\1&3&0\\0&2&4\end{bmatrix}$.',
 'Tính định thức bằng khai triển và kiểm tra bằng khử hàng.',
 'Hàng đầu có một số 0, nên khai triển chỉ có hai số hạng khác 0.',
 r'''$\det A=2\det\begin{bmatrix}3&0\\2&4\end{bmatrix}+1\det\begin{bmatrix}1&3\\0&2\end{bmatrix}=2(12)+2=26$.

Phần tử $(1,3)$ có dấu $(-1)^4=+$; vì vậy số hạng thứ hai là cộng 2.''',
 r'''Dùng $R_2\leftarrow R_2-\frac12R_1$, rồi $R_3\leftarrow R_3-\frac23R_2$ được ma trận tam giác với đường chéo $2,3,13/3$. Không phép nào đổi định thức; tích bằng 26.''',
 'Chọn hàng/cột thưa → tính ma trận con → gắn dấu bàn cờ → cộng; khi khử phải theo dõi từng phép đổi định thức.',
 [('Quên dấu phần bù','Phần tử ở vị trí (1,2) có dấu trừ dù chính số ấy đang dương.'),('Nhân một hàng như nhân cả ma trận',r'Nhân một hàng với 2 cho hệ số 2, còn nhân cả ma trận $3\times3$ với 2 cho hệ số $2^3$.'),('Dùng quy tắc đường chéo cho mọi cỡ','Quy tắc Sarrus chỉ dành cho 3×3; khai triển hoặc khử dùng được tổng quát.')],
 ('Định thức bằng 0 khi diện tích/thể tích bị ép mất một chiều.','Khai triển theo mọi hàng/cột cho cùng kết quả; khử hàng có ba quy tắc riêng.','Chọn cách ít phép tính rồi kiểm tra bằng cách thứ hai.'),
 'dinh-ly-3.1.1',
 [
 ('Định thức hai chiều',r'Tính $\det\begin{bmatrix}2&1\\3&4\end{bmatrix}$ và định thức sau khi đổi hai hàng.', 'Dùng ad−bc.', 'Định thức mới là số đối của định thức cũ.', r'Đề cho ma trận 2×2; cần hai định thức. Dùng ad−bc: $2\cdot4-1\cdot3=5$. Đổi hàng được $3\cdot1-4\cdot2=-5$. Hai giá trị đối nhau, kiểm tra đúng quy tắc đổi hàng. Lần sau tính một lần rồi đổi dấu.', 'Đổi hàng không giữ nguyên dấu.'),
 ('Khai triển hàng nhiều số 0',r'Tính $\det\begin{bmatrix}1&0&2\\0&3&0\\4&0&5\end{bmatrix}$.','Chọn hàng 2 hoặc cột 2.', 'Phần bù tại (2,2) có dấu cộng.',r'Đề cho ma trận 3×3, cần định thức. Khai triển hàng 2 chỉ còn $3C_{22}$. Ta có $C_{22}=\det\begin{bmatrix}1&2\\4&5\end{bmatrix}=5-8=-3$. Do đó định thức $3(-3)=-9$. Khử hàng 3 bằng hàng 1 cũng cho đường chéo 1,3,−3, tích −9. Chọn hàng thưa trước khi khai triển.', 'Không bỏ nhầm cột khi lập ma trận con.'),
 ('Theo dõi hai phép khử',r'Biết $\det A=5$ với $A$ cỡ $3\times3$. Từ A, đổi hàng 1 và 2, nhân hàng 3 với 2, rồi cộng 4 lần hàng 1 vào hàng 2 để được B. Tính det B và det(2A).','Theo dõi hệ số của từng phép.', 'Cộng bội hàng không đổi; nhân cả A tác động lên ba hàng.',r'Cần phân biệt B với 2A. Từ det A=5, đổi hàng cho −5; nhân một hàng với 2 cho −10; cộng bội hàng giữ −10. Vậy det B=−10. Còn det(2A)=2³·5=40. Hai phép nhân khác phạm vi nên không được dùng cùng hệ số.', 'Quên lũy thừa n khi nhân toàn ma trận.')
 ])

lesson(
 'Hệ động lực: dự báo bằng các hướng riêng',
 'Hệ x ở bước kế tiếp bằng A nhân x ở bước hiện tại sẽ tách thành các thành phần λ mũ k khi đủ hướng riêng.',
 r'''Hai khu vực trao đổi người qua lại mỗi năm. Nếu mỗi năm 1/4 người ở mỗi khu chuyển sang khu kia, tổng không đổi còn độ chênh lệch giảm dần. “Tổng” và “chênh lệch” chính là hai cách nhìn trạng thái đơn giản hơn.

<HinhQuyDao ten="bai-giang-co-ve-goc" A={[[0.6, 0.2], [0.2, 0.6]]} diemDau={[[1, 0], [0, 1], [-0.6, 0.8]]} soBuoc={8} moTa="Các quỹ đạo của ma trận có giá trị riêng 0,8 và 0,4 co về gốc" chuThich="Ví dụ hình: A = [0,6 0,2; 0,2 0,6], mọi hướng riêng đều co nên quỹ đạo tiến về gốc. Ví dụ mẫu bên dưới có một hướng giữ nguyên." />''',
 r'''k=0 là trạng thái ban đầu, k=1 là sau một bước. Từ $x_{k+1}=Ax_k$ suy ra $x_k=A^kx_0$. Ôn chéo hoá: viết $x_0$ thành tổ hợp các cột riêng bằng cách giải Pc=x₀.''',
 r'''Nếu $Av_i=\lambda_iv_i$ và các vᵢ độc lập tạo đủ cơ sở, thì:
$$x_0=\sum_i c_iv_i\quad\Longrightarrow\quad x_k=\sum_i c_i\lambda_i^kv_i.$$

| Giá trị riêng thực | Diễn biến thành phần khi k tăng |
| --- | --- |
| $\lvert\lambda\rvert<1$ | Co về 0 |
| $\lambda=1$ | Giữ nguyên |
| $\lambda=-1$ | Đổi dấu luân phiên |
| $\lvert\lambda\rvert>1$ | Lớn dần nếu hệ số c khác 0 |

Giá trị riêng **trội** λ₁ có bội 1 và $|\lambda_1|>|\lambda_i|$ cho mọi i khác 1. Nếu λ₁≠0, $x_k/\lambda_1^k\to c_1v_1$. Muốn nói trạng thái xₖ bị chi phối bởi hướng v₁ cần c₁≠0; trạng thái đầu có thể không chứa hướng trội.

Với ma trận chéo hoá được, mọi |λᵢ|<1 cho mọi trạng thái về gốc. Nếu có |λ|>1, có những trạng thái tăng không bị chặn, nhưng không phải mọi trạng thái đều tăng. Có cặp phức thì quỹ đạo có thể quay; phần đồ thị của sách minh họa hút, đẩy, yên ngựa và xoắn. PageRank cũng tìm một trạng thái dừng Ax=x, rồi chuẩn hóa tổng tọa độ; hướng λ=1 giữ trạng thái ấy.''',
 r'$A=\begin{bmatrix}3/4&1/4\\1/4&3/4\end{bmatrix}$ và $x_0=(80,20)^T$.',
 'Tìm xₖ và trạng thái lâu dài.',
 'Chọn hướng tổng v₁=(1,1) và hướng chênh v₂=(1,−1), có λ=1 và 1/2.',
 r'''Giải $x_0=c_1v_1+c_2v_2$ cho $c_1+c_2=80$, $c_1-c_2=20$, nên c₁=50,c₂=30.

$$x_k=50(1,1)^T+30(1/2)^k(1,-1)^T.$$

Hai tọa độ là $50+30(1/2)^k$ và $50-30(1/2)^k$. Chúng đều tiến tới 50.''',
 r'k=0 được (80,20), k=1 được (65,35), đúng nhân A; tổng luôn bằng 100.',
 'Viết trạng thái đầu theo hướng riêng → nâng từng λ lên k → đọc giới hạn của từng thành phần.',
 [('Chỉ nhìn giá trị riêng lớn nhất theo số','Độ lớn tuyệt đối mới quyết định tăng/co trong thời gian rời rạc.'),('Bỏ trạng thái ban đầu','Một hướng trội có thể có hệ số 0 và không xuất hiện trong nghiệm cụ thể.'),('Dùng cùng tiêu chuẩn cho vi phân','Thời gian liên tục dùng e^(λt); Bài 7 sẽ xét dấu phần thực, không xét |λ| so 1.')],
 ('Hai hướng riêng tiến triển riêng biệt.','xₖ=Aᵏx₀; thành phần riêng nhân λᵏ; hệ số do x₀ quyết định.','Tính c=P⁻¹x₀ rồi phân loại từng thành phần.'),
 'dinh-ly-3.5.1',
 [
 ('Hai hướng co',r'$A=\operatorname{diag}(1/2,1/4)$, $x_0=(4,8)^T$. Tìm x₂ và giới hạn xₖ.','Ma trận đã chéo.', 'xₖ=(4·2⁻ᵏ,8·4⁻ᵏ).',r'Đề cho A chéo, cần bước 2 và đích. Dùng xₖ=Aᵏx₀=(4(1/2)ᵏ,8(1/4)ᵏ). k=2 cho (1,1/2). Hai lũy thừa đều về 0 nên đích là (0,0). Nhân hai lần cho cùng kết quả. Khi A chéo chỉ nâng từng hệ số.', 'Không nâng cả tọa độ ban đầu lên lũy thừa k.'),
 ('Trạng thái dừng nhưng không hội tụ',r'Cho $A=\begin{bmatrix}0&1\\1&0\end{bmatrix}$, $x_0=(1,0)^T$. Tính x₁,x₂,x₃ và giải Ax=x với tổng tọa độ 1.','A đổi hai tọa độ; A²=I.', 'Trạng thái dừng là (1/2,1/2), nhưng trạng thái đầu không phải nó.',r'x₁=(0,1),x₂=(1,0),x₃=(0,1), nên không hội tụ. Ax=x cho hai tọa độ bằng nhau; tổng 1 cho (1/2,1/2). Giá trị riêng −1 tạo dao động trong thành phần chênh. Trạng thái dừng tồn tại không bảo đảm mọi trạng thái hội tụ về đó.', 'Không suy hội tụ chỉ từ việc tìm được Ax=x.'),
 ('Hướng trội không có trong trạng thái đầu',r'Với $A=\begin{bmatrix}3&1\\1&3\end{bmatrix}$ và $x_0=(1,-1)^T$, chứng minh xₖ=2ᵏx₀, dù 4 là giá trị riêng trội.','Kiểm tra Ax₀.', 'Hệ số của (1,1) trong x₀ bằng 0.',r'Ax₀=(2,−2)=2x₀. Quy nạp hoặc công thức hướng riêng cho xₖ=2ᵏx₀. Hướng trội (1,1) có hệ số 0 nên không xuất hiện. Kiểm tra k=1 trực tiếp. Phải xét phép phân tích x₀, không chỉ phổ của A.', 'Đừng coi hướng trội luôn xuất hiện với mọi trạng thái đầu.')
 ])

lesson(
 'Truy hồi tuyến tính: gom nhiều bước vào một vector',
 'Một truy hồi bậc hai trở thành hệ ma trận bậc nhất khi ta lưu hai số hạng liên tiếp trong cùng một vector.',
 r'''Để tính số xe cần cho ngày mai, ta có thể cần số liệu hôm nay và hôm qua. Lưu cả hai vào một trạng thái thì quy tắc chuyển sang trạng thái kế tiếp chỉ cần một phép nhân ma trận.

$$\begin{bmatrix}u_k\\u_{k+1}\end{bmatrix}\ \longmapsto\ \begin{bmatrix}u_{k+1}\\u_{k+2}\end{bmatrix}.$$

Trong bài toán bãi đỗ xe của sách, xe con chiếm một chỗ, xe tải hai chỗ. Cách lấp k+2 chỗ kết thúc bằng xe con hoặc xe tải cho truy hồi Fibonacci. Hai trường hợp cuối không chồng nhau, nên cộng số cách.''',
 r'''Ôn dãy, điều kiện ban đầu và chéo hoá. Truy hồi bậc hai cần hai số đầu u₀,u₁. Quy tắc phải tuyến tính và có hệ số cố định để dùng đúng ma trận dưới đây; quy tắc chia trường hợp theo chẵn/lẻ của giá trị không tự có dạng ấy.''',
 r'''Với $u_{k+2}=a u_{k+1}+b u_k$, đặt $z_k=(u_k,u_{k+1})^T$:
$$z_{k+1}=\begin{bmatrix}0&1\\b&a\end{bmatrix}z_k.$$

a,b là hệ số truy hồi; z₀=(u₀,u₁). Đa thức đặc trưng là $r^2-ar-b$. Nếu có hai nghiệm phân biệt r₁,r₂, mỗi nghiệm cho vector riêng (1,rᵢ), nên $u_k=c_1r_1^k+c_2r_2^k$. Giải c₁+c₂=u₀, c₁r₁+c₂r₂=u₁. Không lấy riêng một nghiệm rồi bỏ điều kiện đầu.

Khi nghiệm lặp r, hai biểu thức rᵏ giống nhau và không cho đủ tham số. Có thể phải dùng thêm krᵏ; cần chứng minh hoặc dùng công cụ cho trường hợp không chéo hoá được, không áp dụng máy móc công thức hai nghiệm phân biệt.

**Fibonacci:** F₀=0,F₁=1,Fₖ₊₂=Fₖ₊₁+Fₖ có r₁=φ=(1+√5)/2, r₂=ψ=(1−√5)/2. Công thức Binet là $(\varphi^k-\psi^k)/\sqrt5$. Dù có căn vô tỉ, các số hạng vẫn nguyên vì cùng thỏa truy hồi nguyên và hai giá trị đầu. Tính lũy thừa ma trận bằng bình phương liên tiếp cũng cho cách tính nhanh với phép toán nguyên.''',
 r'$u_0=2$, $u_1=4$, $u_{k+2}=4u_{k+1}-3u_k$.',
 'Tìm công thức uₖ và kiểm tra vài số đầu.',
 'Đa thức r²−4r+3 có hai nghiệm phân biệt nên dùng hai hướng riêng.',
 r'''$(r-3)(r-1)=0$ cho r=3,1. Vậy $u_k=c_1 3^k+c_2$. Điều kiện đầu: c₁+c₂=2,3c₁+c₂=4, nên c₁=1,c₂=1. Kết luận $u_k=3^k+1$.''',
 r'u₂=10,u₃=28. Từ truy hồi: 4·4−3·2=10 và 4·10−3·4=28. Thế công thức vào truy hồi cũng đúng mọi k.',
 'Lập vector trạng thái → tìm nghiệm đặc trưng → giải hệ số từ điều kiện đầu → kiểm tra truy hồi và hai số đầu.',
 [('Đảo vị trí trong vector','Nếu dùng (uₖ,uₖ₊₁) thì hàng đầu A phải là (0,1); đổi thứ tự vector phải đổi ma trận.'),('Sai dấu hệ số b','r²−ar−b=0; b âm làm số hạng tự do dương.'),('Hai nghiệm bằng nhau vẫn dùng hai bội rᵏ','Hai biểu thức trùng nhau không tạo hai tham số độc lập.')],
 ('Lưu hai giá trị liên tiếp biến nhớ hai bước thành nhớ một trạng thái.','Ma trận [[0,1],[b,a]], đa thức r²−ar−b.','Tìm đủ tham số rồi dùng cả u₀,u₁.'),
 'vi-du-3.6.2',
 [
 ('Lập ma trận truy hồi',r'Với $u_{k+2}=5u_{k+1}-6u_k$, $u_0=1,u_1=2$, lập A cho zₖ=(uₖ,uₖ₊₁) và tính z₁.','Hàng đầu lấy tọa độ thứ hai.', 'Hàng sau có hệ số (−6,5).',r'A=[[0,1],[−6,5]],z₀=(1,2). Nhân cho z₁=(2,4). Kiểm tra u₂=5·2−6·1=4. Cách lập ma trận là đọc lần lượt công thức của từng tọa độ mới.', 'Không đổi chỗ 5 và −6.'),
 ('Công thức của truy hồi',r'Giải $u_{k+2}=5u_{k+1}-6u_k$, $u_0=2,u_1=5$.','Phương trình đặc trưng là (r−2)(r−3)=0.', 'c₁+c₂=2 và 2c₁+3c₂=5.',r'Hai nghiệm 2,3 cho uₖ=c₁2ᵏ+c₂3ᵏ. Hệ đầu cho c₁=c₂=1. Vậy uₖ=2ᵏ+3ᵏ. k=2 cho 13, đúng 5·5−6·2. Thế hai lũy thừa vào truy hồi kiểm tra đúng mọi k.', 'Cần giải hệ số, không lấy luôn 1 nếu điều kiện đầu khác.'),
 ('Nghiệm lặp cần thêm một dạng',r'Cho $u_{k+2}=4u_{k+1}-4u_k$, $u_0=1,u_1=4$. Đặt vₖ=uₖ/2ᵏ và tìm uₖ.','Chia truy hồi cho 2^(k+2).', 'vₖ₊₂=2vₖ₊₁−vₖ nên các hiệu vₖ₊₁−vₖ bằng nhau.',r'v₀=1,v₁=2 và vₖ₊₂−vₖ₊₁=vₖ₊₁−vₖ. Các hiệu đều 1, nên vₖ=1+k; uₖ=(1+k)2ᵏ. Kiểm tra k=0,1 cho 1,4 và thế biểu thức vào truy hồi. Nghiệm đặc trưng 2 lặp làm cần dạng k2ᵏ, không phải hai bội cùng 2ᵏ.', 'Không áp dụng giả thiết hai nghiệm phân biệt vào nghiệm kép.')
 ])

lesson(
 'Hệ vi phân: từ lũy thừa sang hàm mũ',
 'Chéo hoá cũng tách hệ đạo hàm thành các phương trình riêng, với nghiệm e mũ λt thay cho λ mũ k.',
 r'''Hai bình chứa chất trao đổi với nhau liên tục. Lượng chất thay đổi từng khoảnh khắc thay vì mỗi ngày. Đạo hàm mô tả tốc độ thay đổi; các hướng riêng vẫn giúp tách sự pha trộn thành các chuyển động đơn giản.

So hai dòng: rời rạc $x_{k+1}=Ax_k$ cho thành phần λᵏ; liên tục $x'(t)=Ax(t)$ cho thành phần $e^{\lambda t}$. Không dùng cùng một tiêu chuẩn ổn định cho hai dòng.''',
 r'''Bài ứng dụng này cần biết đạo hàm tổng/tích và $(e^{at})'=ae^{at}$. x'(t) là vector gồm đạo hàm từng tọa độ. Điều kiện x(0)=b là **điều kiện ban đầu**; nó chọn các hằng số. Nếu chưa học đạo hàm, trước mắt hiểu bước đổi tọa độ, rồi quay lại kiểm tra nghiệm khi đã học giải tích.''',
 r'''Phương trình y'=λy có mọi nghiệm y(t)=ce^(λt). Thật vậy, đạo hàm của y(t)e^(−λt) bằng 0 nên tích này hằng trên khoảng đang xét.

Nếu $A=PDP^{-1}$ và $x=Py$ với P hằng, thì $x'=Py'$; thế vào x'=Ax cho $y'=Dy$. Do đó:
$$x(t)=\sum_{i=1}^n c_i e^{\lambda_i t}v_i,\qquad Pc=x(0).$$

| Ký hiệu | Nghĩa |
| --- | --- |
| t | Thời gian liên tục |
| vᵢ,λᵢ | Vector riêng và giá trị riêng tương ứng |
| cᵢ | Hệ số từ điều kiện đầu, không phải hàm của t |
| x'(t) | Tốc độ đổi từng thành phần |

Trong trường hợp chéo hoá được, các λ thực âm cho thành phần co về 0; λ dương cho tăng nếu hệ số khác 0; λ=0 cho thành phần hằng. Với λ phức xét phần thực: Re(λ)<0 làm biên độ suy giảm. Re(λ)=0 cần xét cấu trúc thêm, không tự kết luận hút về gốc. Ma trận không chéo hoá được cần phương pháp khác, nên đừng dùng tổng trên khi thiếu n hướng riêng.''',
 r'$A=\begin{bmatrix}-2&1\\1&-2\end{bmatrix}$, $x(0)=(2,0)^T$.',
 'Giải x′=Ax và quyết định diễn biến khi t→+∞.',
 'Dùng hai hướng (1,1) và (1,−1) ứng với λ=−1,−3.',
 r'''x(0)=(1,1)+(1,−1), nên c₁=c₂=1. Vì thế
$$x(t)=e^{-t}(1,1)^T+e^{-3t}(1,-1)^T.$$

Tọa độ là $x_1=e^{-t}+e^{-3t}$, $x_2=e^{-t}-e^{-3t}$. Cả hai →0 vì hai số mũ có hệ số âm.''',
 r'''Tại 0 được (2,0). Đạo hàm là $(-e^{-t}-3e^{-3t},-e^{-t}+3e^{-3t})^T$; nhân Ax cho cùng vector. Đã kiểm tra cả phương trình lẫn điều kiện đầu.''',
 'Tìm hướng riêng → thay λᵏ bằng e^(λt) → giải c từ đầu → đạo hàm và thế lại.',
 [('Dùng λᵏ cho thời gian liên tục','Đạo hàm của e^(λt) tạo λ; λᵏ thuộc truy hồi rời rạc.'),('Âm nghĩa là luôn ổn định theo mọi kiểu thời gian','λ=−3 làm e^(−3t) co nhưng (−3)ᵏ tăng độ lớn.'),('Chỉ kiểm tra tại t=0','Đúng điều kiện đầu chưa đủ; phải thỏa x′=Ax trên toàn khoảng.')],
 ('Cùng phép đổi trục, khác quy luật tiến triển theo thời gian.','Nghiệm e^(λt)v; Pc=x(0); dấu phần thực kiểm soát biên độ.','Tính đạo hàm và so với Ax trước khi kết luận.'),
 'dinh-ly-3.7.2',
 [
 ('Một phương trình mũ',r'Giải y′=−2y, y(0)=3.','Nghiệm tổng quát ce^(−2t).', 'Tại 0, e⁰=1.',r'Từ phương trình tuyến tính vô hướng, y=ce^(−2t). Điều kiện đầu cho c=3. Đạo hàm y′=−6e^(−2t)=−2y và y(0)=3; vậy nghiệm là 3e^(−2t). Nó về 0 khi t tăng. Kiểm tra đạo hàm và đầu là hai việc riêng.', 'Không quên hệ số −2 khi lấy đạo hàm.'),
 ('Hệ đã đường chéo',r'Giải x′=diag(−1,2)x với x(0)=(4,0). Nghiệm có tăng vô hạn vì có λ=2 không?','Giải từng tọa độ.', 'Hệ số của hướng thứ hai bằng 0.',r'x₁(t)=4e^(−t),x₂(t)=0e^(2t)=0. Nghiệm cụ thể tiến về gốc. Có λ dương nghĩa có trạng thái đầu tăng, không phải mọi trạng thái đầu đều tăng. Kiểm tra đầu (4,0) và đạo hàm trực tiếp.', 'Phải xem hệ số của hướng có λ dương.'),
 ('So hai kiểu thời gian',r'Xét A=diag(−2,−1/2). So diễn biến mọi nghiệm x′=Ax với dãy zₖ₊₁=Azₖ; lấy z₀=(1,1).','Vi phân dùng e^(λt); truy hồi dùng λᵏ.', 'e^(−2t) co, nhưng (−2)ᵏ không co.',r'Mọi nghiệm vi phân có dạng (c₁e^(−2t),c₂e^(−t/2)) nên đều về gốc. Dãy từ z₀=(1,1) là ((−2)ᵏ,(−1/2)ᵏ): tọa độ đầu dao động với độ lớn tăng; tọa độ sau về 0. Kiểm tra k=1 là (−2,−1/2). Hai tiêu chuẩn khác nhau vì cùng λ đi vào hai hàm khác nhau.', 'Không dùng |λ|<1 để xét vi phân.')
 ])

lesson(
 'Vì sao khai triển theo mọi hàng hoặc cột đều đúng?',
 'Định nghĩa định thức bằng một cột rồi dùng quy nạp và quy tắc đổi hàng để chứng minh mọi cách khai triển cho cùng kết quả.',
 r'''Một phép đo chỉ đáng tin khi đổi cách thao tác vẫn cho cùng đáp số. Ở Bài 1 ta đã được phép chọn hàng/cột tiện nhất. Bây giờ cần giải thích vì sao quyền lựa chọn ấy hợp lệ.

Hình dung một cây tính toán: ma trận 3×3 tách thành ba ma trận 2×2, rồi thành các số 1×1. Quy nạp đi từ cỡ nhỏ sang lớn, không bắt đầu bằng chính điều phải chứng minh.''',
 r'''Ôn quy nạp: đúng ở cỡ 1, giả sử đúng ở cỡ n−1 rồi suy ra cỡ n. $A_{ij}$ bỏ hàng i/cột j. Tính tuyến tính theo **một hàng khi các hàng khác cố định** khác với tính tuyến tính theo cả ma trận.''',
 r'''**Định nghĩa ban đầu:** det[a]=a. Với cỡ n, định nghĩa bằng **cột 1**:
$$\det A=\sum_{i=1}^n(-1)^{i+1}a_{i1}\det A_{i1}.$$

Chưa được dùng khai triển cột khác trước khi chứng minh. Dàn đường chứng minh của §3.8:

1. **Bổ đề cộng một hàng:** hàng p của A bằng hàng p của B cộng hàng p của C, còn các hàng khác giống nhau, thì det A=det B+det C. Trong tổng cột 1, nếu i=p thì hệ số aₚ₁ tách tổng; nếu i≠p thì ma trận con còn hàng p và dùng quy nạp để tách.
2. Tương tự, nhân một hàng với c nhân định thức với c. Từ đó có hàng 0 ⇒ định thức 0.
3. Đổi hai hàng kề làm đổi dấu. Với ma trận con không xóa hai hàng ấy, dùng quy nạp; hai số hạng xóa một trong hai hàng hoán đổi vị trí và khác dấu. Đổi hai hàng xa thực hiện bằng số lẻ lần đổi hàng kề.
4. Hai hàng bằng nhau ⇒ đổi chúng vừa giữ ma trận vừa đổi dấu định thức, nên det=0. Cộng c lần một hàng vào hàng khác: tách theo bước 1; số hạng thêm có hai hàng tỉ lệ nên bằng 0. Vì thế phép cộng bội giữ định thức.
5. Dùng các quy tắc hàng để thiết lập det Aᵀ=det A như §3.2, rồi chuyển quy tắc đổi hàng sang đổi cột.
6. Đưa cột j về cột 1 cần j−1 lần đổi cột kề. Kết hợp dấu ấy với dấu i+1 trong định nghĩa cho $(-1)^{j-1+i+1}=(-1)^{i+j}$, đúng công thức khai triển cột j. Chuyển vị một lần nữa cho khai triển theo mọi hàng.

Chi tiết đủ từng trường hợp ở <XemMuc muc="3.8" />. Bài này giải thích cấu trúc chứng minh để bạn biết mỗi bước đang dựa vào điều gì, không dùng kết luận cuối làm giả thiết.

**Tuyến tính từng hàng không cho det(A+B)=det A+det B.** Nếu cộng cả ma trận, nhiều hàng cùng thay đổi; khi tách sẽ có các số hạng chéo. Ví dụ A=B=I₂: det(A+B)=4 còn det A+det B=2.''',
 r'$A=\begin{bmatrix}1&2&0\\0&3&4\\5&0&6\end{bmatrix}$.',
 'Tính theo hàng 1 và cột 3; giải thích vì sao hai kết quả phải trùng.',
 'Định lý khai triển cho phép chọn hai đường; theo dõi dấu và ma trận con để kiểm tra.',
 r'''Theo hàng 1: $1(3\cdot6-4\cdot0)-2(0\cdot6-4\cdot5)=18+40=58$.

Theo cột 3: phần tử 4 ở (2,3) có dấu trừ, minor bằng $1\cdot0-2\cdot5=-10$; phần tử 6 ở (3,3) có minor $1\cdot3-2\cdot0=3$. Vậy det=−4(−10)+6(3)=58.''',
 'Cùng 58. Hai phép tính minh họa định lý; thử một ma trận không thay thế chứng minh cho mọi cỡ n.',
 'Phân biệt định nghĩa và định lý → hiểu bước quy nạp → dùng dấu do đổi cột → kiểm tra bằng hai đường.',
 [('Dùng định lý để chứng minh chính nó','Bắt đầu bằng định nghĩa cột 1, rồi các bổ đề hàng; không viện khai triển tùy ý quá sớm.'),('Nhầm tuyến tính từng hàng với cả ma trận','Các hàng khác phải giữ cố định trong bổ đề cộng.'),('Thử nhiều ví dụ rồi gọi là chứng minh','Ví dụ kiểm lỗi tính; quy nạp và các bổ đề mới bao quát mọi ma trận.')],
 ('Các quy tắc hàng là cầu nối từ một định nghĩa đến nhiều cách tính.','Dấu i+j đến từ dấu cột 1 cộng số lần chuyển cột.','Theo dõi đúng giả thiết của mỗi bổ đề, tránh suy luận vòng.'),
 'bo-de-3.8.1',
 [
 ('Bác bỏ một công thức sai',r'Cho A=B=I₂. Tính det(A+B) và det A+det B. Có đẳng thức tổng quát không?','A+B=2I₂.', 'det(2I₂)=2².',r'A+B=diag(2,2) nên det(A+B)=4. Hai định thức riêng đều 1 nên tổng bằng 2. 4≠2 bác bỏ công thức tổng quát. Một phản ví dụ đủ phủ định “mọi A,B”. Không nhầm với bổ đề chỉ cộng một hàng.', 'det không tuyến tính theo toàn ma trận.'),
 ('Cộng đúng một hàng',r'Cho B có các hàng (1,2),(3,4); C có các hàng (5,6),(3,4). Đặt A có các hàng (6,8),(3,4). Kiểm tra bổ đề cộng hàng 1.','Hàng 2 giữ nguyên.', 'det B=−2, det C=2.',r'det B=4−6=−2; det C=20−18=2. det A=24−24=0 bằng −2+2. Đã kiểm tra đúng giả thiết: chỉ hàng 1 được cộng, hàng 2 giống nhau. Cách dùng bổ đề là so từng hàng trước khi tách định thức.', 'Nếu hàng 2 cũng bị cộng thì không còn đúng giả thiết.'),
 ('Suy quy tắc cộng bội hàng',r'Dùng tính cộng/tỉ lệ theo một hàng và “hai hàng bằng nhau thì det=0” để chứng minh Rₚ←Rₚ+cR_q, p≠q, giữ định thức.','Tách định thức theo tổng ở hàng p.', 'Số hạng thêm có hàng p bằng c lần hàng q.',r'Gọi B là kết quả phép cộng hàng. Tuyến tính theo hàng p cho det B=det A+c det C, trong đó C thay hàng p của A bằng chính hàng q, còn các hàng khác giữ nguyên. Vì p≠q, C có hai hàng bằng nhau nên det C=0. Vậy det B=det A. Đã dùng đúng từng giả thiết, không dùng quy tắc cần chứng minh làm bước giữa.', 'C phải chỉ thay hàng p, giữ nguyên hàng q để nhận hai hàng bằng nhau.')
 ])

def main():
    # Các khối được thêm theo thứ tự biên soạn; sắp theo mục sách để số bài ổn định.
    order = {'Định thức:':1, 'Định thức,':2, 'Giá trị riêng:':3, 'Chéo hoá:':4,
             'Hệ động lực:':5, 'Truy hồi tuyến tính:':6, 'Hệ vi phân:':7, 'Vì sao':8}
    topics = sorted(LESSONS, key=lambda x: next(v for k,v in order.items() if x['title'].startswith(k)))
    assert len(topics)==8
    for i, d in enumerate(topics,1):
        directory=OUT/'giang-day';directory.mkdir(exist_ok=True)
        front=f'---\nmon: dai-so\nchuong: 3\nbai: {i}\ntieu_de: {json.dumps(d["title"],ensure_ascii=False)}\ny_tuong: {json.dumps(d["idea"],ensure_ascii=False)}\nphu_muc: ["3.{i}"]\n---\n'
        body='''\nimport HinhDinhThuc from '../../../../src/figures/HinhDinhThuc.astro';
import HinhCheoHoa from '../../../../src/figures/HinhCheoHoa.astro';
'''
        body+=f'\n## Ý tưởng trong 1 câu\n\n<YTuong>\n{d["idea"]}\n</YTuong>\n\n## Hình dung trực quan\n\n{d["visual"]}\n\n## Kiến thức cần biết\n\n{d["need"]}\n\n## Công thức\n\n{d["formula"]}\n\n## Ví dụ mẫu\n'
        for step,(heading,key) in enumerate([('Đề cho gì','given'),('Hỏi gì','ask'),('Dùng kiến thức nào và vì sao','method'),('Giải từng bước','solve'),('Kiểm tra','check'),('Tóm tắt cách làm','recap')],1):
            body+=f'\n### Bước {step} — {heading}\n\n{d[key]}\n'
        body+='\n## Lỗi dễ mắc\n'
        for title,text in d['errors']:body+=f'\n<Loi tieuDe="{title}">\n{text}\n</Loi>\n'
        body+='\n## Tóm tắt 30 giây\n\n<BaGoc>\n'
        for name,text in zip(['Hiểu','Nhớ','Làm'],d['summary']):body+=f'<Goc ten="{name}">{text}</Goc>\n'
        body+='</BaGoc>\n\n## Bài tập\n\nCác bài dưới đây là **bài luyện tự soạn**, dùng số riêng của bộ luyện trên web; không phải số bài trong sách Nicholson. Mỗi liên kết mở đề, hai tầng gợi ý và lời giải để bạn tự làm trước.\n'
        exdir=OUT/'bai-tap';exdir.mkdir(exist_ok=True)
        for j,(title,prompt,h1,h2,answer,mistake) in enumerate(d['tasks'],1):
            number=f'3.{i}.{j}';level=['de','vua','kho'][j-1]
            body+=f'\n<BaiLuyen do_kho="{level}" so="{number}">\n{prompt}\n\n<GoiYNho>{h1}</GoiYNho>\n\n<XemMuc bai-tap="{number}" />\n</BaiLuyen>\n'
            ex=f'''---
so: "{number}"
muc: "3.{i}"
do_kho: {level}
nen_lam: true
tu_soan: true
tieu_de: {json.dumps(title,ensure_ascii=False)}
can_dung: ["{d['anchor']}"]
---

<De>
{prompt}
</De>

<GoiY so={{1}}>
{h1}
</GoiY>

<GoiY so={{2}}>
{h2}
</GoiY>

<LoiGiai>
{answer}
</LoiGiai>

<LoiHayMac>
{mistake}
</LoiHayMac>
'''
            (exdir/f'3-{i}-{j}.mdx').write_text(safe_mdx(ex),encoding='utf-8')
        body+=f'\nĐọc đối chiếu: <XemMuc muc="3.{i}" />.\n'
        (directory/f'bai-{i}.mdx').write_text(front+safe_mdx(body),encoding='utf-8')
    print('Đã sinh 8 bài giảng và 24 bài luyện tự soạn, phủ đủ §3.1-§3.8.')


lesson(
 'Định thức, nghịch đảo, Cramer và nội suy',
 'Định thức khác 0 báo ma trận vuông khả nghịch; phần bù đại số còn cho công thức nghịch đảo và nghiệm của hệ.',
 r'''Một phép biến đổi có thể kéo giãn và xô lệch tấm lưới nhưng vẫn gỡ lại được, miễn không ép phẳng nó. Định thức khác 0 kiểm tra điều ấy. Có nghịch đảo nghĩa là mỗi đầu ra có đúng một đầu vào.

Nội suy là một ứng dụng khác: qua ba điểm có hoành độ khác nhau, tìm một đa thức bậc không quá hai khớp đúng dữ liệu. Mỗi điểm cho một phương trình về các hệ số.''',
 r'''Ôn $AA^{-1}=I$, giải hệ vuông, phần bù $C_{ij}$. **Phụ hợp** adj(A) là chuyển vị của ma trận các phần bù: phần tử (i,j) là $C_{ji}$, không phải $C_{ij}$. Khả nghịch đòi ma trận vuông.''',
 r'''Với ma trận vuông cùng cỡ: $\det(AB)=\det A\det B$, $\det A^T=\det A$. Ma trận A khả nghịch khi và chỉ khi det A khác 0; khi đó $\det A^{-1}=1/\det A$.

$$A\operatorname{adj}(A)=\det(A)I,\qquad A^{-1}=\frac{\operatorname{adj}(A)}{\det A}.$$

Với $A=\begin{bmatrix}a&b\\c&d\end{bmatrix}$, nghịch đảo là $\frac1{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}$ nếu $ad-bc\ne0$.

**Cramer:** với $Ax=b$, det A≠0, nghiệm thứ j là $x_j=\det A_j/\det A$. $A_j$ thay **cột j** của A bằng b. Nếu det A=0 thì công thức không áp dụng; hệ có thể vô nghiệm hoặc vô số nghiệm.

**Nội suy:** $p(x)=c_0+\cdots+c_{n-1}x^{n-1}$ khớp n điểm $(t_i,y_i)$ cho hệ Vandermonde. Định thức hệ số là $\prod_{j<i}(t_i-t_j)$, khác 0 khi mọi hoành độ khác nhau, nên có duy nhất đa thức bậc không quá n−1. Công thức phụ hợp/Cramer hữu ích về lý thuyết; khử Gauss/LU thường gọn hơn cho hệ lớn.''',
 r'$A=\begin{bmatrix}2&1\\1&1\end{bmatrix}$, $b=(5,3)^T$.',
 'Tính nghịch đảo và giải Ax=b theo hai cách.',
 'det A=1 khác 0; dùng nghịch đảo 2×2 rồi đối chiếu với Cramer.',
 r'''$A^{-1}=\begin{bmatrix}1&-1\\-1&2\end{bmatrix}$, nên $x=A^{-1}b=(2,1)^T$.

Cramer: $A_1=\begin{bmatrix}5&1\\3&1\end{bmatrix}$ có det=2; $A_2=\begin{bmatrix}2&5\\1&3\end{bmatrix}$ có det=1. Chia cho det A=1 cho cùng nghiệm.''',
 r'$2(2)+1=5$, $2+1=3$; nhân $AA^{-1}$ được I.',
 'Kiểm tra det trước → chọn nghịch đảo/khử/Cramer → thế nghiệm về hệ ban đầu.',
 [('Chia cho det A khi bằng 0','Kết luận cần quay lại xét hạng và hệ; không gọi một thương 0/0 là nghiệm.'),('Thay hàng trong Cramer','A_j thay cột j vì ẩn x_j đi với cột j của A.'),('Quên chuyển vị ma trận phần bù','Phụ hợp là chuyển vị; với 2×2 phải đổi chỗ a,d và đổi dấu b,c.')],
 ('det≠0 bảo đảm gỡ lại phép biến đổi và giải duy nhất.','det(AB), phụ hợp, điều kiện Cramer; nội suy cần hoành độ phân biệt.','Tính định thức rồi kiểm tra nghiệm bằng thế lại.'),
 'dinh-ly-3.2.5',
 [
 ('Có nghịch đảo không?',r'Xét $A=\begin{bmatrix}1&2\\2&4\end{bmatrix}$ và $B=\begin{bmatrix}1&2\\3&5\end{bmatrix}$. Ma trận nào khả nghịch?','Tính hai định thức.', 'det A=0; det B=−1.',r'Cần xét khả nghịch hai ma trận vuông. det A=4−4=0 nên A không khả nghịch. det B=5−6=−1 khác 0 nên B khả nghịch. Hàng phụ thuộc ở A là kiểm tra trực quan độc lập. Luôn xét det khác 0, không chỉ det dương.', 'Định thức âm vẫn cho ma trận khả nghịch.'),
 ('Giải bằng Cramer',r'Giải $2x+y=7$, $x-y=2$ bằng Cramer.','Lập A và b đúng thứ tự phương trình.', 'det A=−3; thay cột 1 cho det=−9.',r'A có hai hàng (2,1),(1,−1), b=(7,2). det A=−3. A₁ có hai hàng (7,1),(2,−1), det=−9; A₂ có hai hàng (2,7),(1,2), det=−3. Vậy x=3,y=1. Thế lại: 6+1=7 và 3−1=2. Phương pháp là thay từng cột, chia cùng định thức gốc.', 'Mẫu của cả hai ẩn đều là det A, không đổi theo cột.'),
 ('Nội suy ba điểm',r'Tìm đa thức bậc không quá hai qua (0,1), (1,3), (2,7). Giải thích tính duy nhất.','Viết p(x)=c₀+c₁x+c₂x².', 'c₀=1, c₁+c₂=2, 2c₁+4c₂=6.',r'Từ dữ liệu được c₀=1; trừ phương trình cuối với hai lần phương trình giữa cho 2c₂=2, nên c₂=1,c₁=1. Vậy p(x)=1+x+x². Thế 0,1,2 được 1,3,7. Hoành độ khác nhau, định thức Vandermonde (1−0)(2−0)(2−1)=2 khác 0 nên duy nhất trong lớp bậc không quá hai.', 'Không khẳng định duy nhất nếu cho phép đa thức có bậc tùy ý.')
 ])

lesson(
 'Giá trị riêng: những hướng không đổi đường',
 'Vector riêng là hướng mà ma trận chỉ kéo giãn hoặc đảo chiều; giá trị riêng là hệ số nhân trên hướng ấy.',
 r'''Một vector thường có thể đổi cả hướng và độ dài sau phép nhân A. Một vector riêng vẫn nằm trên cùng đường thẳng qua gốc; nếu hệ số âm, mũi tên quay sang phía ngược trên đường ấy.

<HinhVectorRieng />

Hình dùng ma trận $\begin{bmatrix}3&5\\1&-1\end{bmatrix}$: vector $(-1,1)$ có ảnh $(2,-2)=-2(-1,1)$. Ví dụ mẫu dưới dùng ma trận khác để tính trọn quy trình.''',
 r'''Ôn nhân ma trận–vector, hệ thuần nhất và định thức. $I$ là ma trận đơn vị. Hệ $(A-\lambda I)v=0$ luôn có nghiệm 0, nhưng ta cần nghiệm **khác 0**; điều đó chỉ xảy ra khi hệ số không khả nghịch.''',
 r'''$$Av=\lambda v,\qquad v\ne0.$$

| Ký hiệu | Ý nghĩa |
| --- | --- |
| A | Ma trận vuông n×n |
| v | Vector riêng khác 0 |
| λ | Giá trị riêng, có thể bằng 0 |
| $c_A(t)=\det(tI-A)$ | Đa thức đặc trưng |

Các giá trị riêng là nghiệm của $c_A(t)=0$. Với mỗi λ, giải $(A-\lambda I)v=0$ bằng Gauss; bỏ vector 0 khỏi kết quả khi nói vector riêng. Mọi bội khác 0 của vector riêng vẫn là vector riêng cùng λ. Các nghiệm kể cả 0 tạo **không gian riêng**.

Trên hướng v, $A^kv=\lambda^kv$. Nếu $P^{-1}AP=D$ thì $A^k=PD^kP^{-1}$; nhưng tìm đủ cột cho P là việc của Bài 4. Đường thẳng {tv} được A giữ trong chính nó, gọi là bất biến. λ=0 nghĩa là hướng ấy bị ép về gốc; λ âm nghĩa đảo chiều, không có nghĩa vector riêng bị cấm.

Với ma trận thực có thể có nghiệm phức của đa thức đặc trưng. Phép quay 90° có đa thức t²+1, không có giá trị riêng thực; đừng tự giả sử mọi ma trận thực đều có đủ hướng riêng thực.''',
 r'$A=\begin{bmatrix}3&1\\1&3\end{bmatrix}$.',
 'Tìm mọi giá trị riêng và mô tả vector riêng tương ứng.',
 'Giải phương trình định thức để tìm λ, rồi giải hệ thuần nhất cho từng λ.',
 r'''$c_A(t)=(t-3)^2-1=(t-4)(t-2)$ nên λ=4 hoặc 2.

λ=4: $(A-4I)v=0$ cho $-x+y=0$, nên $v=s(1,1)^T$, s≠0.

λ=2: $(A-2I)v=0$ cho $x+y=0$, nên $v=s(1,-1)^T$, s≠0.''',
 r'$A(1,1)^T=(4,4)^T$ và $A(1,-1)^T=(2,-2)^T$. Hai hướng đều qua gốc và không đổi đường.',
 'Đa thức đặc trưng → nghiệm λ → khử từng hệ → bỏ vector 0 → nhân A để kiểm tra.',
 [('Nhận vector 0 làm vector riêng','0 thỏa Av=λv với mọi λ nên không đặc trưng cho một hướng; định nghĩa loại nó.'),('Tìm λ rồi dừng','Bài thường còn hỏi vector riêng: phải giải hệ thuần nhất cho từng λ.'),('Trừ λ ở mọi ô','λI chỉ có λ trên đường chéo; các ô ngoài đường chéo giữ nguyên.')],
 ('Một số hướng vẫn nằm trên chính đường ấy sau biến đổi.','Av=λv với v≠0; det(tI−A)=0.','Tìm λ rồi giải hệ cho v, kiểm tra bằng phép nhân trực tiếp.'),
 'dinh-ly-3.3.2',
 [
 ('Kiểm tra một cặp riêng',r'Cho $A=\begin{bmatrix}2&1\\0&3\end{bmatrix}$. Kiểm tra v=(1,0) và w=(1,1) là vector riêng; tìm λ tương ứng.','Nhân A với từng vector.', 'Av=(2,0), Aw=(3,3).',r'Đề cho hai vector khác 0, cần kiểm tra ảnh có là bội. Av=(2,0)=2v nên λ=2. Aw=(3,3)=3w nên λ=3. So hai tọa độ kiểm tra cùng hệ số. Cách nhanh là nhân trước, không cần định thức nếu đã biết vector.', 'Không dùng hai hệ số khác nhau cho hai tọa độ.'),
 ('Tìm toàn bộ hướng riêng',r'Tìm giá trị riêng và vector riêng của $A=\begin{bmatrix}4&1\\0&2\end{bmatrix}$.','Ma trận tam giác có đa thức (t−4)(t−2).','Với λ=2, phương trình là 2x+y=0.',r'Giá trị riêng 4,2. λ=4 cho y=0, nên v=s(1,0), s≠0. λ=2 cho y=−2x, nên v=s(1,−2), s≠0. Nhân A cho lần lượt (4,0) và (2,−4), đúng các bội 4 và 2. Liệt kê mỗi họ và điều kiện tham số khác 0.', 'Vector riêng không chỉ là một đại diện; có mọi bội khác 0.'),
 ('Giá trị riêng bằng 0',r'Cho $A=\begin{bmatrix}1&2\\2&4\end{bmatrix}$. Chứng minh 0 là giá trị riêng và tìm mọi vector riêng ứng với nó.','Giải Av=0 với v khác 0.', 'x+2y=0; chọn y tự do.',r'Hệ Av=0 rút về x+2y=0. Nghiệm v=t(−2,1), t≠0; chúng khác 0 và Av=0=0v nên λ=0 hợp lệ. det A=0 là kiểm tra độc lập. Tổng quát ma trận vuông suy biến có 0 là giá trị riêng.', 'Chỉ v bị cấm bằng 0; λ vẫn có thể bằng 0.')
 ])

lesson(
 'Chéo hoá: đổi trục để tính lũy thừa',
 'Chéo hoá đổi sang hệ tọa độ gồm các vector riêng để ma trận chỉ còn nhân từng tọa độ với một số.',
 r'''Một chuyển động phức tạp theo hai trục ngang/dọc có thể đơn giản theo hai đường chéo. Nếu chọn các trục mới là những hướng riêng, hai thành phần không trộn vào nhau nữa.

<HinhCheoHoa />

Đọc $A=PDP^{-1}$ từ phải sang trái: đổi tọa độ bằng P⁻¹, kéo giãn bằng D, rồi đổi về bằng P. P không nhất thiết là phép quay; các vector riêng không bắt buộc vuông góc.''',
 r'''Ôn vector riêng, ma trận khả nghịch và nhân theo thứ tự. Các cột của P phải **độc lập tuyến tính**: không cột nào là tổ hợp của các cột còn lại. Với ma trận vuông, điều này tương đương det P≠0.''',
 r'''A chéo hoá được nếu có P khả nghịch sao cho $P^{-1}AP=D$ đường chéo. Tương đương $AP=PD$, nên cột thứ j của P phải là vector riêng ứng với ô thứ j của D.

$$P=[v_1\ \cdots\ v_n],\quad D=\operatorname{diag}(\lambda_1,\ldots,\lambda_n),\quad A^k=PD^kP^{-1}.$$

$D^k$ chỉ cần nâng từng ô đường chéo lên lũy thừa k. Trong công thức k=0, dùng D⁰=I kể cả khi có λ=0.

**Điều kiện:** có n vector riêng độc lập. n giá trị riêng phân biệt là điều kiện đủ. Nếu λ lặp m lần trong đa thức đặc trưng (bội đại số), phải có m vector riêng cơ bản độc lập cho λ ấy; tổng cộng đủ n. Khi làm trên R, còn cần đa thức đặc trưng tách hết thành nghiệm thực; không bỏ sót điều kiện trường số.

Ví dụ $I$ có một giá trị riêng lặp nhưng vẫn chéo hoá được. Ngược lại $J=\begin{bmatrix}1&1\\0&1\end{bmatrix}$ chỉ có vector riêng dạng (s,0), nên không thể chọn hai cột độc lập. Biết λ lặp chưa đủ kết luận thành công hay thất bại.

Với đa thức p, nếu A=PDP⁻¹ thì p(A)=Pp(D)P⁻¹; hệ số hằng c của p trở thành cI. Nếu p bằng 0 tại mọi λ của ma trận chéo hoá được, thì p(A)=0. Định lý Cayley–Hamilton còn nói c_A(A)=0 cho mọi ma trận vuông; chứng minh tổng quát vượt khỏi phép chéo hoá này.''',
 r'$A=\begin{bmatrix}3&1\\1&3\end{bmatrix}$; Bài 3 cho v₁=(1,1), v₂=(1,−1), λ₁=4, λ₂=2.',
 'Chéo hoá và viết công thức Aᵏ.',
 'Ghép hai vector riêng làm cột, giữ đúng thứ tự λ trên D.',
 r'''$P=\begin{bmatrix}1&1\\1&-1\end{bmatrix}$ có det P=−2 nên khả nghịch; $P^{-1}=\frac12\begin{bmatrix}1&1\\1&-1\end{bmatrix}$, $D=\operatorname{diag}(4,2)$.

Nhân ba ma trận cho
$$A^k=\frac12\begin{bmatrix}4^k+2^k&4^k-2^k\\4^k-2^k&4^k+2^k\end{bmatrix}.$$

Không cần nhân A với chính nó k lần.''',
 r'k=0 cho I; k=1 cho A; k=2 cho $\begin{bmatrix}10&6\\6&10\end{bmatrix}$, đúng nhân trực tiếp.',
 'Tìm riêng → đủ vector độc lập → ghép P,D cùng thứ tự → kiểm tra AP=PD → tính hàm của D.',
 [('Đảo thứ tự giá trị riêng','Đổi hai cột P thì phải đổi hai ô tương ứng trong D.'),('Đủ n vector nhưng phụ thuộc','Hai bội của cùng một hướng không tạo hai trục.'),('Giá trị riêng lặp là thất bại','I có giá trị riêng lặp vẫn đủ mọi hướng; J ở trên mới thiếu hướng.')],
 ('Chéo hoá là thay hệ tọa độ, không làm đổi phép biến đổi gốc.','P khả nghịch, AP=PD, Aᵏ=PDᵏP⁻¹.','Kiểm tra đủ hướng và thứ tự trước khi nâng lũy thừa.'),
 'dinh-ly-3.4.1',
 [
 ('Kiểm tra thứ tự P và D',r'Với A trong ví dụ mẫu, chọn $Q=\begin{bmatrix}1&1\\-1&1\end{bmatrix}$. D tương ứng là diag(4,2) hay diag(2,4)?','Xem cột đầu Q thuộc hướng riêng nào.', 'Cột đầu là (1,−1), ứng với 2.',r'Cột đầu Q là v₂ nên ứng với λ=2; cột sau là v₁ ứng với 4. Do det Q=2 khác 0, Q chéo hoá A với D=diag(2,4). Nhân AQ=QD để kiểm tra. Thứ tự giá trị riêng phải theo thứ tự cột chứ không theo lớn bé.', 'Không giữ D cũ khi đã đổi cột.'),
 ('Tính A mũ ba',r'Dùng công thức bài giảng để tính A³ cho $A=\begin{bmatrix}3&1\\1&3\end{bmatrix}$.','Thay k=3.', '4³=64,2³=8.',r'A³ có ô đường chéo (64+8)/2=36, hai ô còn lại (64−8)/2=28. Vậy A³=[[36,28],[28,36]]. Nhân A²=[[10,6],[6,10]] với A cho cùng kết quả. Chéo hoá giúp thay phép nhân dài bằng hai lũy thừa số.', 'Ngoài đường chéo là hiệu, không phải tổng.'),
 ('Một ma trận không chéo hoá được',r'Chứng minh $J=\begin{bmatrix}2&1\\0&2\end{bmatrix}$ không chéo hoá được trên R.','Giá trị riêng duy nhất là 2 với bội 2.', 'Giải (J−2I)v=0, được y=0.',r'c_J(t)=(t−2)². Không gian riêng là {(x,0)}, chỉ có một vector cơ bản độc lập. Ma trận 2×2 cần hai cột độc lập; mọi hai vector riêng ở đây cùng đường nên P suy biến. Do đó không chéo hoá được. Kiểm tra thêm: nếu chéo hoá được với D=2I thì J=P(2I)P⁻¹=2I, trái ô (1,2)=1.', 'Không nhầm bội 2 với hai vector riêng độc lập.')
 ])

if __name__=='__main__':main()

