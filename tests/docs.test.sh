#!/bin/sh
# Kiểm tra tài liệu dành cho agent: CLAUDE.md không trỏ tới file không tồn tại,
# và phương án công nghệ (docs/tech_stack.md) được trỏ tới từ đúng chỗ.
# Chạy: sh tests/docs.test.sh

cd "$(dirname "$0")/.." || exit 1
loi=0

# Mọi file .md mà CLAUDE.md nhắc tới phải có thật
for f in $(grep -oE '[A-Za-z0-9_./-]+\.md' CLAUDE.md | sort -u); do
  if [ ! -f "$f" ]; then
    echo "SAI: CLAUDE.md trỏ tới file không có: $f"
    loi=1
  fi
done

# Agent phải tìm thấy phương án công nghệ từ CLAUDE.md và product_design.md
for nguon in CLAUDE.md product_design.md; do
  if ! grep -qF "docs/tech_stack.md" "$nguon"; then
    echo "SAI: $nguon chưa trỏ tới docs/tech_stack.md"
    loi=1
  fi
done

# Những file trong repo mà docs/tech_stack.md dựa vào.
# gtich/translator-ui/DESIGN_SPEC.md chỉ nằm trên máy người soạn (không đưa lên
# repo), nên bộ token của nó được chép vào src/styles/tokens.css và kiểm tra ở đó.
for f in product_design.md .gitignore tests/gitignore.test.sh src/styles/tokens.css; do
  if [ ! -f "$f" ]; then
    echo "SAI: docs/tech_stack.md dựa vào file không có: $f"
    loi=1
  fi
done

# Tài liệu kỹ thuật phải mô tả chế độ màn hình sáng/tối
if ! grep -q "Chế độ màn hình" docs/tech_stack.md; then
  echo "SAI: docs/tech_stack.md chưa có mục Chế độ màn hình sáng/tối"
  loi=1
fi

# Bộ token phải có cả giao diện sáng (mặc định) lẫn tối
for chuoi in ':root' '[data-theme="dark"]'; do
  if ! grep -qF "$chuoi" src/styles/tokens.css; then
    echo "SAI: src/styles/tokens.css thiếu $chuoi"
    loi=1
  fi
done

if [ "$loi" -eq 0 ]; then
  echo "ĐẠT: tài liệu cho agent đúng"
fi
exit "$loi"
