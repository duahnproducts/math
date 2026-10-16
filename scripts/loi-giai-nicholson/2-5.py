from common import *
es=[M([[1,0,3],[0,1,0],[0,0,1]]),M([[0,0,1],[0,1,0],[1,0,0]]),S.diag(1,S.Rational(1,2),1),M([[1,0,0],[-2,1,0],[0,0,1]]),M([[0,1,0],[1,0,0],[0,0,1]]),S.diag(1,1,5)]
labels=[r'$R_1\leftarrow R_1+3R_3$; đảo bằng trừ $3R_3$',r'$R_1\leftrightarrow R_3$; tự đảo',r'$R_2\leftarrow R_2/2$; đảo bằng nhân 2',r'$R_2\leftarrow R_2-2R_1$; đảo bằng cộng $2R_1$',r'$R_1\leftrightarrow R_2$; tự đảo',r'$R_3\leftarrow5R_3$; đảo bằng chia 5']
add('2.5.1','\n\n'.join('**'+chr(97+i)+'.** '+label+'; $$E^{-1}='+tex(e.inv())+'.$$'for i,(e,label)in enumerate(zip(es,labels)))+'Nghịch đảo của mỗi phép hàng là phép hàng hoàn tác nó; nhân hai ma trận kiểm tra được I.')
es=[M([[1,0],[-1,1]]),S.diag(-1,1),M([[0,1],[1,0]]),M([[1,-1],[0,1]]),S.diag(1,-1),M([[0,1],[1,0]])]
add('2.5.2',r'Nhận ra phép biến đổi hàng từ $A$ sang $B$, rồi làm cùng phép đó lên $I_2$. Các phép lần lượt là: (a) trừ hàng 1 khỏi hàng 2; (b) đổi dấu hàng 1; (c) đổi hai hàng; (d) trừ hàng 2 khỏi hàng 1; (e) đổi dấu hàng 2; (f) đổi hai hàng. Kết quả:'+ '\n\n'+cases(es)+r'Nhân từng $E$ với $A$ kiểm tra được đúng $B$.')
add('2.5.3',r'**a.** Đổi hai hàng, rồi trừ hàng 1 mới khỏi hàng 2: $$E_1=\begin{bmatrix}0&1\\1&0\end{bmatrix},\quad E_2=\begin{bmatrix}1&0\\-1&1\end{bmatrix},\quad E_2E_1A=C.$$ **b.** Cả hai hàng của $C$ khác hàng cùng vị trí của $A$, nên phép nhân một hàng / cộng bội hàng không đủ. Phép đổi hai hàng cho hàng dưới $(1,2)$, khác $(2,1)$ của $C$. Ba loại phép hàng đều không thể thực hiện trong một bước.')
add('2.5.4',r'Nhân trái với $E$ thực hiện đúng một phép hàng. Loại đổi hàng chỉ ảnh hưởng hai hàng. Loại nhân một hàng và loại cộng bội hàng chỉ thay đổi một hàng đích. Mọi hàng còn lại giữ nguyên, nên $A$ và $EA$ khác nhau ở nhiều nhất hai hàng.')
add('2.5.5',r'**a.** Có, theo định nghĩa cho phép nhân một hàng với hệ số khác 0: nhân với 1 đưa $I$ về chính nó (cũng có thể cộng 0 lần một hàng khác khi kích thước cho phép). **b.** Không: mỗi phép hàng là khả nghịch, nên mọi ma trận sơ cấp khả nghịch; ma trận không không khả nghịch khi kích thước dương.')
matrices=[[[1,-1,2],[-2,1,0]],[[1,2,1],[5,12,-1]],[[1,2,-1,0],[3,1,1,2],[1,-3,3,2]],[[2,1,-1,0],[3,-1,2,1],[1,-2,3,1]]]
add('2.5.6','\n\n'.join('**'+chr(97+i)+'.** '+reduction_text(a)for i,a in enumerate(matrices)),h1='Ghi lại từng phép hàng đưa A về RREF và làm cùng các phép đó lên I.',h2='Nếu E₁ được dùng trước rồi E₂, tích bên trái là E₂E₁; thứ tự ghi phép và thứ tự tích đảo nhau.')
pairs=[(M([[2,1,3],[-1,1,2]]),M([[1,-1,-2],[3,0,1]])),(M([[2,-1,0],[1,1,1]]),M([[3,0,1],[2,-1,0]]))]
ans=[]
for A,B in pairs:
    U=B[:,:2]*A[:,:2].inv();assert U*A==B and U.det()!=0
    rr,V,ops,es=row_reduce(U);assert rr==S.eye(U.rows)
    ans.append(r'Giải $UA=B$ theo hai cột đầu được $$U='+tex(U)+r'.$$ Nhân với toàn bộ $A$ xác nhận $UA=B$. Để viết $U$ thành tích sơ cấp, đưa $U$ về $I$ bằng: '+'; '.join('$'+s+'$'for s in ops)+r'. Nếu các phép này tương ứng $F_1,\ldots,F_k$, thì $U=F_1^{-1}\cdots F_k^{-1}$; mỗi nghịch đảo cũng sơ cấp.')
add('2.5.7','\n\n'.join('**'+chr(97+i)+'.** '+v for i,v in enumerate(ans)))
ans=[]
for a in [[[1,1],[2,1]],[[2,3],[1,2]],[[1,0,2],[0,1,1],[2,1,6]],[[1,0,-3],[0,1,4],[-2,2,15]]]:
    A=M(a);r,u,ops,es=row_reduce(A);assert r==S.eye(A.rows)
    ans.append('Dùng các phép hàng '+ '; '.join('$'+v+'$'for v in ops)+r' đưa $A$ về $I$. Nếu $E_j$ tương ứng phép thứ $j$, thì $$A=E_1^{-1}\cdots E_k^{-1}.$$ Nghịch đảo đổi dấu hệ số cộng hàng, đảo hệ số nhân hàng, giữ nguyên phép đổi hàng. Đây là phân tích yêu cầu; nhân các thừa số theo thứ tự vừa ghi sẽ khôi phục $A$.')
add('2.5.8','\n\n'.join('**'+chr(97+i)+'.** '+v for i,v in enumerate(ans)))
add('2.5.9',r'**a.** Loại I là ma trận đổi hai hàng của $I$, chuyển vị vẫn chính nó. Loại II là ma trận chéo chỉ thay một ô đường chéo bởi $k\ne0$, cũng bằng chuyển vị. Loại III có dạng $E=I+ke_ie_j^T$ với $i\ne j$; chuyển vị là $I+ke_je_i^T$, vẫn loại III, đổi vai hai chỉ số. **b.** Hai lập luận đầu cho ngay $E^T=E$ ở loại I và II.')
add('2.5.10',r'Khử hàng $A$ về RREF $R$, được $E_k\cdots E_1A=R$. Đặt $U=(E_k\cdots E_1)^{-1}$. Vì mọi $E_j$ khả nghịch nên $U$ khả nghịch, và nhân trái cho $A=UR$. Lập luận áp dụng cả ma trận chữ nhật và ma trận suy biến.')
add('2.5.11',r'Cột thứ hai giữ nguyên, cột thứ nhất của $B$ bằng cột thứ nhất của $A$ cộng 2 lần cột thứ hai. Phép cột này là nhân phải với $$F=\begin{bmatrix}1&0\\2&1\end{bmatrix}.$$ Tính $AF=\begin{bmatrix}5&2\\-5&-3\end{bmatrix}=B$. $F$ sơ cấp vì nhận từ $I$ bằng $R_2\leftarrow R_2+2R_1$.')
ans=[]
for a in [[[1,1,-1],[-2,-2,4]],[[3,2],[2,1]],[[1,-1,2,1],[2,-1,0,3],[0,1,-4,1]],[[1,1,0,-1],[3,2,1,1],[1,0,1,3]]]:
    A=M(a);R,U,ops,es=row_reduce(A);piv=list(R.rref()[1]);free=[j for j in range(A.cols)if j not in piv];P=S.eye(A.cols)[:,piv+free];Q=R*P;r=len(piv);W=S.eye(A.cols)
    for i in range(r):
        for j in range(r,A.cols):W[i,j]=-Q[i,j]
    V=P*W;K=S.zeros(A.rows,A.cols)
    for i in range(r):K[i,i]=1
    assert U*A*V==K and U.det()!=0 and V.det()!=0
    ans.append(r'Khử hàng để các cột trụ tạo thành $I_r$, đổi các cột trụ về trước rồi trừ phần ngoài trụ. Một lựa chọn cụ thể là $$U='+tex(U)+r',\quad V='+tex(V)+r'.$$ Nhân kiểm tra $$UAV='+tex(K)+r',$$ nên $r='+str(r)+r'$. Hai ma trận $U,V$ khả nghịch vì là tích các phép hàng / cột đảo được.')
add('2.5.12','\n\n'.join('**'+chr(97+i)+'.** '+v for i,v in enumerate(ans)))
add('2.5.13',r'**a, loại I.** Hàng $i$ của ma trận hoán vị $E$ là hàng $j$ của $I$, hàng $j$ là hàng $i$ của $I$, các hàng khác là hàng đơn vị tương ứng. Vì $e_k^TA$ là hàng $k$ của $A$, tích $EA$ đúng là đổi hai hàng $i,j$. **b, loại II.** Thay hàng $i$ của $I$ bởi $ke_i^T$ cho hàng $i$ của $EA$ là $ke_i^TA$, tức $k$ lần hàng $i$ của $A$; mọi hàng khác giữ nguyên. Đây chính là nội dung bổ đề cho hai loại.')
add('2.5.14',r'Gọi $U$ là tích các ma trận sơ cấp dùng trong quá trình. Toàn bộ ma trận ghép biến thành $[UA\mid U]$. So sánh với $[P\mid Q]$ được $P=UA$, $Q=U$; vì vậy $P=QA$. Phải thực hiện cùng phép hàng trên cả hai khối.')
add('2.5.15',r'$AB$ là tích sơ cấp nên khả nghịch. Vì $A,B$ đều vuông, tiêu chuẩn nghịch đảo tích cho $A$ khả nghịch. Khử hàng $A$ về $I$ được $E_k\cdots E_1A=I$, nên $A=E_1^{-1}\cdots E_k^{-1}$; mỗi thừa số là ma trận sơ cấp. Vậy $A$ cũng là tích sơ cấp.')
add('2.5.16',r'Khử hàng đưa $U$ về $I$ tương đương nhân trái toàn bộ ma trận ghép với $U^{-1}$. Vì vậy $[U\mid A]$ đưa về $[I\mid U^{-1}A]$. Khối trái $I$ đã cung cấp một trụ đầu hàng cho mọi hàng; các ô còn lại không ảnh hưởng điều kiện RREF. Do tính duy nhất RREF, đây chính là dạng rút gọn yêu cầu.')
A=M([[1,-1,3,2],[0,1,4,1],[1,0,8,6]]);B=M([[1,-1,4,5],[-2,1,-11,-8],[-1,2,2,2]])
assert A.rref()[0]==B.rref()[0]
add('2.5.17',r'**a.** Chuỗi phép hàng từ $B$ tới $A$ cho $A=UB$ với $U$ là tích sơ cấp, khả nghịch. Ngược lại, mọi ma trận khả nghịch $U$ là tích sơ cấp, nên $A=UB$ cho một chuỗi phép hàng. **b(i).** Dùng $I$. **b(ii).** Nếu $A=UB$, thì $B=U^{-1}A$. **b(iii).** Nếu $A=UB,B=VC$, thì $A=(UV)C$. **c.** Nếu cả $A,B$ tương đương hàng với $C$, dùng tính đối xứng rồi bắc cầu. **d.** Khử từng ma trận trong đề cho cùng RREF $$'+tex(A.rref()[0])+r',$$ nên chúng tương đương hàng theo (c).')
add('2.5.18',r'Vì $U,V$ khả nghịch, $VU^{-1}$ khả nghịch và là tích các ma trận sơ cấp. Đẳng thức $V=(VU^{-1})U$ cho một chuỗi phép hàng từ $U$ tới $V$. Do đó $U$ và $V$ tương đương hàng; cũng có thể nhận ra cả hai có RREF là $I_n$.')
add('2.5.19',r'Nhân trái bởi một ma trận $2\times2$ khả nghịch mô tả mọi ma trận tương đương hàng. **a.** Chỉ có ma trận không. **b.** Các ma trận $\begin{bmatrix}0&0&a\\0&0&b\end{bmatrix}$ với $(a,b)\ne(0,0)$. **c.** Các ma trận $\begin{bmatrix}a&b&0\\c&d&0\end{bmatrix}$ với $ad-bc\ne0$. **d.** Các ma trận $\begin{bmatrix}a&2a&b\\c&2c&d\end{bmatrix}$ với $ad-bc\ne0$. Ở (b), bất kỳ vector cột khác 0 đều có thể được mở rộng thành một ma trận khả nghịch; ở (c,d), điều kiện định thức bảo đảm hạng bằng 2 và không gian hàng đúng như đề.')
add('2.5.20',r'$B$ có $n$ phương trình và $m>n$ ẩn nên hệ thuần nhất $Bx=0$ có nghiệm $x\ne0$. Khi đó $(AB)x=A(Bx)=0$, nên ma trận vuông $AB$ có hạt nhân khác không và không khả nghịch. Không cần biết cụ thể các phần tử của $A,B$.')
add('2.5.21',r'**a.** Chuyển vị một phép cột biến nó thành phép hàng trên $A^T$: nếu kết quả chuyển vị là $EA^T$, thì kết quả ban đầu là $AE^T$. Vì $E^T$ sơ cấp, lấy $F=E^T$. **b.** Khử hàng về RREF, đưa các cột trụ về trước bằng hoán vị cột, rồi dùng các cột đơn vị ấy khử mọi ô ngoài khối trụ. Kết quả là $\begin{bmatrix}I_r&0\\0&0\end{bmatrix}$, $r=\operatorname{rank}A$. Mỗi bước là một phép hàng hoặc cột sơ cấp nên cho đúng tích $E_k\cdots E_1AF_1\cdots F_p$ trong đề.')
add('2.5.22',r'Viết $B=EA$, suy ra $B^{-1}=A^{-1}E^{-1}$, tức làm phép cột tương ứng với nghịch đảo của phép hàng. **a.** Đổi cột $i,j$ của $A^{-1}$. **b.** Nhân cột $i$ với $1/k$. **c.** Với $R_j\leftarrow R_j+kR_i$, $E^{-1}=I-ke_je_i^T$, nên cột $i$ của $A^{-1}$ được thay bằng cột $i$ trừ $k$ lần cột $j$; các cột khác giữ nguyên. Chú ý cột đích là $i$, không phải $j$.')
add('2.5.23',r'**a(i).** $A=IAI$. **a(ii).** Nếu $A=UBV$, thì $B=U^{-1}AV^{-1}$. **a(iii).** Nếu $A=UBV$, $B=XCY$, thì $A=(UX)C(YV)$; các tích vẫn khả nghịch. **b.** Nếu $A,B$ cùng hạng $r$, đưa chúng về cùng khối chuẩn $K=\begin{bmatrix}I_r&0\\0&0\end{bmatrix}$: $U_AAV_A=K=U_BBV_B$. Suy ra $A=U_A^{-1}U_BB V_BV_A^{-1}$, nên tương đương. Ngược lại, nhân bởi ma trận khả nghịch giữ hạng, nên tương đương cũng kéo theo cùng hạng.')
save()
