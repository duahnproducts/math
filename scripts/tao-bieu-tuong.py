"""Tạo biểu tượng của Hochanh (ảnh đại diện của app) từ ảnh chụp.

Nguồn: scripts/anh-bieu-tuong.jpg — ảnh vuông 760×760, đã cắt sẵn quanh khuôn
mặt từ ảnh gốc (không lưu ảnh gốc vào repo). Ghi vào public/:

- icon-192.png, icon-512.png   biểu tượng thường: cắt sát mặt, góc bo sẵn
                               (nền trong suốt ở góc)
- icon-maskable-512.png        Android tự cắt theo hình của máy: lấy cả ảnh nguồn
                               cho khuôn mặt nằm gọn trong vùng an toàn (hình tròn 80%)
- apple-touch-icon.png         180×180, phủ kín: iOS tự bo góc
- favicon.png                  64×64, biểu tượng trên tab trình duyệt

Chạy lại khi đổi ảnh:  python scripts/tao-bieu-tuong.py   (cần Pillow)
Đổi ảnh khác thì thay anh-bieu-tuong.jpg và chỉnh VUNG_MAT cho khớp khuôn mặt.
Không cần đổi tên file: lúc build, đường dẫn tự kèm ?v= theo nội dung ảnh
(src/lib/bieu-tuong.ts), nên điện thoại tải ảnh mới thay vì dùng ảnh cũ đã lưu.
"""

from pathlib import Path

from PIL import Image, ImageDraw

GOC = Path(__file__).resolve().parent.parent
RA = GOC / "public"
NGUON = GOC / "scripts/anh-bieu-tuong.jpg"

# Vùng vuông quanh khuôn mặt trong ảnh nguồn (trái, trên, phải, dưới), dùng cho
# biểu tượng thường. Bản maskable lấy cả ảnh nguồn.
VUNG_MAT = (90, 80, 670, 660)
PHONG = 4  # vẽ mặt nạ bo góc to gấp 4 rồi thu nhỏ cho mép mượt


def ve(anh: Image.Image, co: int, bo_goc: float) -> Image.Image:
    """co: cạnh ảnh (px). bo_goc: bán kính góc / cạnh (0 = vuông, phủ kín)."""
    ra = anh.convert("RGB").resize((co, co), Image.LANCZOS).convert("RGBA")
    if bo_goc:
        lon = co * PHONG
        mat_na = Image.new("L", (lon, lon), 0)
        ImageDraw.Draw(mat_na).rounded_rectangle((0, 0, lon - 1, lon - 1), radius=int(lon * bo_goc), fill=255)
        ra.putalpha(mat_na.resize((co, co), Image.LANCZOS))
    return ra


def main() -> None:
    RA.mkdir(exist_ok=True)
    nguon = Image.open(NGUON)
    mat = nguon.crop(VUNG_MAT)
    # Bo góc cùng tỉ lệ với logo 30px, bo góc 10px trên thanh trên cùng
    ve(mat, 192, 10 / 30).save(RA / "icon-192.png", optimize=True)
    ve(mat, 512, 10 / 30).save(RA / "icon-512.png", optimize=True)
    ve(nguon, 512, 0).convert("RGB").save(RA / "icon-maskable-512.png", optimize=True)
    ve(mat, 180, 0).convert("RGB").save(RA / "apple-touch-icon.png", optimize=True)
    ve(mat, 64, 8 / 32).save(RA / "favicon.png", optimize=True)
    for ten in ("icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png", "favicon.png"):
        print("đã ghi", (RA / ten).relative_to(GOC))


if __name__ == "__main__":
    main()
