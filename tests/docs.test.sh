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

# Những file có sẵn mà docs/tech_stack.md dựa vào
for f in product_design.md gtich/translator-ui/DESIGN_SPEC.md .gitignore tests/gitignore.test.sh; do
  if [ ! -f "$f" ]; then
    echo "SAI: docs/tech_stack.md dựa vào file không có: $f"
    loi=1
  fi
done

if [ "$loi" -eq 0 ]; then
  echo "ĐẠT: tài liệu cho agent đúng"
fi
exit "$loi"
