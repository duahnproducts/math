// Đề tự soạn, bám các bài giảng Đại số Chương 1–3 trên Hochanh.
export const THOI_GIAN_THI = 60 * 60 * 1000;
export const KHOA_BAI_THI = 'hochanh:dai-so:giua-ki-1-3:v1';
export interface CauThi {
  ten: string;
  diem: number;
  phut: number;
  muc: string[];
  de: string;
  loiGiai: string;
  cham: { ten: string; diem: number }[];
}

export const DE_GIUA_KI: CauThi[] = [
  {
    ten: 'Hiểu đúng các khái niệm', diem: 1, phut: 6, muc: ['1.3', '2.3', '3.3', '3.4'],
    de: String.raw`Với mỗi nhận định sau, ghi **đúng hoặc sai và giải thích ngắn**. Các ma trận đều trên $\mathbb R$.

a) Hệ thuần nhất có nhiều ẩn hơn số phương trình luôn có nghiệm khác không.

b) Hai ma trận vuông cùng cấp luôn thỏa $AB=BA$.

c) Nếu $\det A=0$ thì $0$ là một giá trị riêng của $A$.

d) Mọi ma trận $2\times2$ có giá trị riêng lặp đều chéo hóa được.`,
    loiGiai: String.raw`**a) Đúng.** Số pivot không vượt số phương trình, nên nhỏ hơn số ẩn. Có ít nhất một biến tự do. Hệ thuần nhất luôn tương thích; chọn một biến tự do khác $0$ cho nghiệm khác không.

**b) Sai.** Lấy $A=\begin{bmatrix}1&0\\0&0\end{bmatrix}$ và $B=\begin{bmatrix}0&1\\0&0\end{bmatrix}$. Khi đó $AB=B\ne0$ nhưng $BA=0$.

**c) Đúng.** $\det A=0$ nên $A$ không khả nghịch. Hệ $Av=0$ có nghiệm $v\ne0$, tức $Av=0v$; vì vậy $0$ là giá trị riêng.

**d) Sai.** $J=\begin{bmatrix}1&1\\0&1\end{bmatrix}$ có đa thức đặc trưng $(1-\lambda)^2$. Từ $(J-I)v=0$ suy ra $v_2=0$, nên các vector riêng đều là bội của $(1,0)^T$. Không có hai vector riêng độc lập nên không chéo hóa được. Ma trận $I_2$ cho thấy giá trị riêng lặp cũng không đồng nghĩa với không chéo hóa được.`,
    cham: [
      { ten: 'a) Đúng, có biến tự do và nghiệm khác không', diem: .25 },
      { ten: 'b) Sai, có phản ví dụ hợp lệ', diem: .25 },
      { ten: 'c) Đúng, nối định thức với nghiệm Av = 0', diem: .25 },
      { ten: 'd) Sai, phản ví dụ và giải thích thiếu vector riêng độc lập', diem: .25 },
    ],
  },
  {
    ten: 'Khử Gauss và biện luận hệ', diem: 2, phut: 12, muc: ['1.1', '1.2', '1.3'],
    de: String.raw`Cho $a,b\in\mathbb R$ và hệ
$$\begin{cases}x+y+z=2,\\x+2y+3z=3,\\2x+3y+(a+4)z=b.\end{cases}$$
a) Dùng phép biến đổi hàng đưa ma trận bổ sung về dạng bậc thang.

b) Biện luận theo $a,b$: khi nào hệ có nghiệm duy nhất, vô nghiệm, vô số nghiệm? Viết toàn bộ nghiệm trong các trường hợp có nghiệm.`,
    loiGiai: String.raw`**Bước 1 — Khử cột đầu.** Từ ma trận bổ sung, thực hiện $R_2\leftarrow R_2-R_1$ và $R_3\leftarrow R_3-2R_1$:
$$\left[\begin{array}{ccc|c}1&1&1&2\\0&1&2&1\\0&1&a+2&b-4\end{array}\right].$$
**Bước 2 — Khử cột hai.** $R_3\leftarrow R_3-R_2$ cho
$$\left[\begin{array}{ccc|c}1&1&1&2\\0&1&2&1\\0&0&a&b-5\end{array}\right].$$
**Bước 3 — Đọc hàng cuối $az=b-5$.**

- Nếu $a\ne0$: đặt $t=(b-5)/a$. Thế ngược: $z=t$, $y=1-2t$, $x=1+t$. Hệ có **nghiệm duy nhất** $(x,y,z)=(1+t,1-2t,t)$.
- Nếu $a=0$, $b\ne5$: hàng cuối là $0=b-5\ne0$, hệ **vô nghiệm**.
- Nếu $a=0$, $b=5$: hàng cuối là $0=0$. Đặt $z=t\in\mathbb R$; hệ có **vô số nghiệm** $(x,y,z)=(1,1,0)+t(1,-2,1)$.

**Kiểm tra:** thay nghiệm vào vế trái phương trình ba được $5+at$, đúng bằng $b$ trong từng trường hợp có nghiệm.`,
    cham: [
      { ten: 'Khử đúng hai hàng đầu và hàng cuối az = b − 5', diem: .5 },
      { ten: 'a ≠ 0: điều kiện và nghiệm duy nhất đầy đủ', diem: .5 },
      { ten: 'a = 0, b ≠ 5: vô nghiệm, có lý do', diem: .5 },
      { ten: 'a = 0, b = 5: toàn bộ nghiệm theo tham số thực', diem: .5 },
    ],
  },
  {
    ten: 'LU, nghịch đảo và giải phương trình ma trận', diem: 2, phut: 12, muc: ['2.3', '2.4', '2.7'],
    de: String.raw`Cho $B=\begin{bmatrix}2&1\\4&3\end{bmatrix}$ và $c=\begin{bmatrix}5\\11\end{bmatrix}$.

a) Tìm $B=LU$, trong đó $L$ tam giác dưới có đường chéo bằng $1$, $U$ tam giác trên.

b) Dùng $LU$ để giải $Bx=c$ (qua hai hệ $Ly=c$, $Ux=y$).

c) Tìm $B^{-1}$ rồi kiểm tra nghiệm ở câu b) bằng phép nhân $B^{-1}c$.`,
    loiGiai: String.raw`**a)** Khử $R_2\leftarrow R_2-2R_1$. Hệ số khử là $2$, nên
$$L=\begin{bmatrix}1&0\\2&1\end{bmatrix},\qquad U=\begin{bmatrix}2&1\\0&1\end{bmatrix}.$$
Nhân lại: $LU=\begin{bmatrix}2&1\\4&3\end{bmatrix}=B$.

**b)** Thế xuôi trong $Ly=c$: $y_1=5$, $2y_1+y_2=11$, nên $y_2=1$.

Thế ngược trong $Ux=y$: $x_2=1$, $2x_1+x_2=5$, nên $x_1=2$. Vậy $x=(2,1)^T$.

**c)** $\det B=2\cdot3-1\cdot4=2\ne0$. Công thức nghịch đảo cấp hai cho
$$B^{-1}=\frac12\begin{bmatrix}3&-1\\-4&2\end{bmatrix}.$$
Do đó
$$B^{-1}c=\frac12\begin{bmatrix}15-11\\-20+22\end{bmatrix}=\begin{bmatrix}2\\1\end{bmatrix}.$$
Kiểm tra trực tiếp: $B(2,1)^T=(5,11)^T=c$.`,
    cham: [
      { ten: 'Tìm đúng L và U', diem: .5 },
      { ten: 'Giải Ly = c bằng thế xuôi', diem: .25 },
      { ten: 'Giải Ux = y bằng thế ngược', diem: .5 },
      { ten: 'Nghịch đảo đúng, nêu điều kiện định thức khác 0', diem: .5 },
      { ten: 'Nhân B⁻¹c kiểm tra nghiệm', diem: .25 },
    ],
  },
  {
    ten: 'Định thức và phép biến đổi hàng', diem: 1, phut: 6, muc: ['3.1', '3.2'],
    de: String.raw`Cho $C=\begin{bmatrix}1&2&0\\0&3&1\\2&0&1\end{bmatrix}$.

a) Tính phần bù đại số $C_{12}$ rồi khai triển theo hàng đầu để tính $\det C$.

b) Không tính lại từ đầu: định thức thay đổi thế nào nếu **đổi chỗ hàng 1 và hàng 3**? Nếu chỉ thực hiện $R_3\leftarrow R_3-2R_1$ trên $C$ ban đầu thì định thức bằng bao nhiêu?`,
    loiGiai: String.raw`**a)** Bỏ hàng 1, cột 2:
$$C_{12}=(-1)^{1+2}\det\begin{bmatrix}0&1\\2&1\end{bmatrix}=-(-2)=2.$$
Cũng có $C_{11}=\det\begin{bmatrix}3&1\\0&1\end{bmatrix}=3$. Khai triển theo hàng 1:
$$\det C=1\cdot3+2\cdot2+0\cdot C_{13}=7.$$
**b)** Đổi chỗ hai hàng làm định thức đổi dấu, nên được $-7$.

Cộng một bội của hàng khác vào một hàng giữ nguyên định thức, nên phép $R_3\leftarrow R_3-2R_1$ cho định thức $7$. Hai thao tác này được xét **riêng rẽ từ ma trận ban đầu**.`,
    cham: [
      { ten: 'C₁₂ = 2, đúng dấu phần bù đại số', diem: .25 },
      { ten: 'Khai triển đúng và det C = 7', diem: .25 },
      { ten: 'Đổi hàng: −7, nêu quy tắc', diem: .25 },
      { ten: 'Cộng bội hàng: 7, nêu quy tắc', diem: .25 },
    ],
  },
  {
    ten: 'Giá trị riêng, chéo hóa và hệ động lực', diem: 2.5, phut: 16, muc: ['3.3', '3.4', '3.5'],
    de: String.raw`Cho $A=\begin{bmatrix}4&1\\2&3\end{bmatrix}$.

a) Tìm các giá trị riêng và toàn bộ vector riêng tương ứng.

b) Tìm $P,D,P^{-1}$ sao cho $A=PDP^{-1}$.

c) Suy ra công thức $A^n$ với mọi số nguyên $n\ge0$.

d) Với $v_{n+1}=Av_n$, $v_0=(2,-1)^T$, tìm công thức $v_n$ và kiểm tra tại $n=1$.`,
    loiGiai: String.raw`**a) Phương trình đặc trưng.**
$$\det(A-\lambda I)=(4-\lambda)(3-\lambda)-2=\lambda^2-7\lambda+10=(\lambda-5)(\lambda-2).$$
Vậy $\lambda_1=5$, $\lambda_2=2$.

- Với $\lambda=5$: $-x+y=0$, nên vector riêng là $t(1,1)^T$, $t\ne0$.
- Với $\lambda=2$: $2x+y=0$, nên vector riêng là $s(1,-2)^T$, $s\ne0$.

**b) Ghép đúng thứ tự cột của $P$ và đường chéo của $D$.**
$$P=\begin{bmatrix}1&1\\1&-2\end{bmatrix},\quad D=\begin{bmatrix}5&0\\0&2\end{bmatrix},\quad P^{-1}=\frac13\begin{bmatrix}2&1\\1&-1\end{bmatrix}.$$
$\det P=-3\ne0$, hai vector riêng độc lập. Kiểm tra $AP=PD=\begin{bmatrix}5&2\\5&-4\end{bmatrix}$, nên $A=PDP^{-1}$.

**c)** Vì các thừa số $P^{-1}P$ triệt tiêu,
$$A^n=PD^nP^{-1}=\frac13\begin{bmatrix}2\cdot5^n+2^n&5^n-2^n\\2\cdot5^n-2\cdot2^n&5^n+2\cdot2^n\end{bmatrix}.$$
Với $n=0$, công thức cho $I$; với $n=1$, cho đúng $A$.

**d)** Phân tích điều kiện đầu: $v_0=(1,1)^T+(1,-2)^T$. Mỗi lần nhân $A$, hai hướng này được nhân lần lượt với $5$ và $2$. Do đó
$$v_n=5^n\begin{bmatrix}1\\1\end{bmatrix}+2^n\begin{bmatrix}1\\-2\end{bmatrix}=\begin{bmatrix}5^n+2^n\\5^n-2\cdot2^n\end{bmatrix}.$$
Tại $n=1$: $v_1=(7,1)^T$; tính trực tiếp $Av_0=(8-1,4-3)^T=(7,1)^T$.`,
    cham: [
      { ten: 'Đa thức đặc trưng và hai giá trị riêng', diem: .5 },
      { ten: 'Hai họ vector riêng, loại vector không', diem: .5 },
      { ten: 'P, D, P⁻¹ đúng thứ tự và khả nghịch', diem: .5 },
      { ten: 'Công thức Aⁿ đầy đủ', diem: .5 },
      { ten: 'Công thức vₙ và kiểm tra n = 1', diem: .5 },
    ],
  },
  {
    ten: 'Ứng dụng: hệ thức truy hồi', diem: 1.5, phut: 8, muc: ['3.6'],
    de: String.raw`Dãy $(u_n)$ thỏa
$$u_{n+2}=3u_{n+1}-2u_n,\qquad u_0=2,\quad u_1=3.$$
a) Đặt $w_n=(u_{n+1},u_n)^T$. Viết ma trận $M$ sao cho $w_{n+1}=Mw_n$ và xác định $w_0$.

b) Tìm công thức $u_n$ với $n\ge0$. Kiểm tra cả hai điều kiện đầu và hệ thức truy hồi.`,
    loiGiai: String.raw`**a)** Từ định nghĩa của $w_n$,
$$w_{n+1}=\begin{bmatrix}u_{n+2}\\u_{n+1}\end{bmatrix}=\begin{bmatrix}3&-2\\1&0\end{bmatrix}\begin{bmatrix}u_{n+1}\\u_n\end{bmatrix}.$$
Vậy $M=\begin{bmatrix}3&-2\\1&0\end{bmatrix}$ và $w_0=(3,2)^T$. Cẩn thận thứ tự hai thành phần.

**b)** Phương trình đặc trưng là $r^2-3r+2=(r-1)(r-2)=0$, nên nghiệm có dạng $u_n=\alpha+\beta2^n$.

Điều kiện đầu cho $\alpha+\beta=2$, $\alpha+2\beta=3$, suy ra $\alpha=\beta=1$. Vậy
$$\boxed{u_n=1+2^n}.$$
**Kiểm tra:** $u_0=1+1=2$; $u_1=1+2=3$. Với mọi $n\ge0$,
$$3u_{n+1}-2u_n=3(1+2^{n+1})-2(1+2^n)=1+2^{n+2}=u_{n+2}.$$
Hai giá trị đầu cùng quy tắc truy hồi xác định duy nhất cả dãy, nên đây là nghiệm cần tìm.`,
    cham: [
      { ten: 'Ma trận chuyển M và w₀ đúng thứ tự', diem: .5 },
      { ten: 'Phương trình đặc trưng và dạng nghiệm', diem: .25 },
      { ten: 'Dùng điều kiện đầu tìm uₙ = 1 + 2ⁿ', diem: .5 },
      { ten: 'Kiểm tra hai điều kiện đầu và quy tắc truy hồi', diem: .25 },
    ],
  },
];

export interface BaiThiDaLuu { batDau: number | null; ketThuc: boolean; baiLam: string[] }
export function docBaiThi(raw: string | null): BaiThiDaLuu {
  const rong = { batDau: null, ketThuc: false, baiLam: DE_GIUA_KI.map(() => '') };
  try {
    const v = JSON.parse(raw ?? 'null');
    if (!v || !(v.batDau === null || (Number.isFinite(v.batDau) && v.batDau > 0)) ||
        typeof v.ketThuc !== 'boolean' || !Array.isArray(v.baiLam) ||
        v.baiLam.length !== DE_GIUA_KI.length || v.baiLam.some((x: unknown) => typeof x !== 'string')) return rong;
    return v;
  } catch { return rong; }
}
export function giayConLai(batDau: number, bayGio: number): number {
  return Math.max(0, Math.min(3600, Math.ceil((batDau + THOI_GIAN_THI - bayGio) / 1000)));
}
export function dinhDangGio(giay: number): string {
  return `${String(Math.floor(giay / 60)).padStart(2, '0')}:${String(giay % 60).padStart(2, '0')}`;
}
