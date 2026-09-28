#!/bin/sh
# Kiểm tra .gitignore: tài liệu gốc bị bỏ qua, bản dịch và bài giảng thì không.
# Dùng --no-index để chỉ kiểm tra quy tắc, chạy được cả khi máy không có file PDF.
# Chạy: sh tests/gitignore.test.sh

cd "$(dirname "$0")/.." || exit 1
loi=0

phai_bo_qua() {
  if ! git check-ignore -q --no-index -- "$1"; then
    echo "SAI: tài liệu gốc chưa bị bỏ qua: $1"
    loi=1
  fi
}

khong_duoc_bo_qua() {
  if git check-ignore -q --no-index -- "$1"; then
    echo "SAI: file của mình bị bỏ qua nhầm: $1"
    loi=1
  fi
}

# Tài liệu gốc
phai_bo_qua "gtich/sach.pdf"
phai_bo_qua "dai so/W. Keith Nicholson - Linear Algebra with Applications (2023).pdf"
phai_bo_qua "micro/Microeconomics3e-Ch03.pdf"
phai_bo_qua "micro/Microeconomics3e-Ch05.pdf"
phai_bo_qua "micro/Microeconomics3e-Ch07.pdf"
phai_bo_qua "micro/Microeconomics3e-Ch08.pdf"
phai_bo_qua "micro/Microeconomics3e-Ch12.pdf"
phai_bo_qua "micro/Lecture slides.zip"

# Bản dịch, bài giảng, lời giải
khong_duoc_bo_qua "micro/Microeconomics3e-Ch03_TiengViet.pdf"
khong_duoc_bo_qua "micro/Vi mô 7.pdf"
khong_duoc_bo_qua "dai so/Chuong1_He_phuong_trinh_tuyen_tinh_TiengViet.pdf"
khong_duoc_bo_qua "gtich/Chuong-1-Loi-giai-bai-tap.pdf"
khong_duoc_bo_qua "gtich/Chuong-6-Trinh-bay-theo-sach.pdf"
khong_duoc_bo_qua "gtich/tutorial/tutorial.pdf"

if [ "$loi" -eq 0 ]; then
  echo "ĐẠT: .gitignore đúng"
fi
exit "$loi"
