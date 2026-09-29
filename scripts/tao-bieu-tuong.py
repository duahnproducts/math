"""Vẽ biểu tượng cài lên màn hình chính (PWA) cho Hochanh.

Chữ "H" trắng, font Lora 600 (đúng font của logo trên thanh trên cùng), nền màu
nhấn --accent của giao diện sáng. Ghi vào public/:

- icon-192.png, icon-512.png   biểu tượng thường (góc bo sẵn, nền trong suốt ở góc)
- icon-maskable-512.png        Android tự cắt theo hình của máy: nền phủ kín,
                               chữ nằm gọn trong vùng an toàn (hình tròn 80%)
- apple-touch-icon.png         180×180, phủ kín: iOS tự bo góc

Chạy lại khi đổi màu nhấn hoặc logo:  python scripts/tao-bieu-tuong.py
Cần Pillow và đã `npm ci` (font lấy từ node_modules/@fontsource/lora).
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

GOC = Path(__file__).resolve().parent.parent
RA = GOC / "public"
FONT = GOC / "node_modules/@fontsource/lora/files/lora-latin-600-normal.woff"

MAU_NHAN = (0x4A, 0x51, 0xCC)  # --accent, giao diện sáng (src/styles/tokens.css)
MAU_CHU = (0xFF, 0xFF, 0xFF)  # --accent-ink
PHONG = 4  # vẽ to gấp 4 rồi thu nhỏ cho mép mượt


def ve(co: int, bo_goc: float, ti_le_chu: float) -> Image.Image:
    """co: cạnh ảnh (px). bo_goc: bán kính góc / cạnh (0 = vuông). ti_le_chu: cỡ chữ / cạnh."""
    lon = co * PHONG
    anh = Image.new("RGBA", (lon, lon), (0, 0, 0, 0))
    but = ImageDraw.Draw(anh)
    but.rounded_rectangle((0, 0, lon - 1, lon - 1), radius=int(lon * bo_goc), fill=MAU_NHAN + (255,))

    font = ImageFont.truetype(str(FONT), int(lon * ti_le_chu))
    # Căn giữa theo hình thật của chữ, không theo hộp dòng (Lora có phần dưới dòng sâu)
    trai, tren, phai, duoi = but.textbbox((0, 0), "H", font=font)
    x = (lon - (phai - trai)) / 2 - trai
    y = (lon - (duoi - tren)) / 2 - tren
    but.text((x, y), "H", font=font, fill=MAU_CHU + (255,))
    return anh.resize((co, co), Image.LANCZOS)


def main() -> None:
    RA.mkdir(exist_ok=True)
    # Cùng tỉ lệ với logo 30px, bo góc 10px, chữ 17px trên thanh trên cùng
    ve(192, 10 / 30, 0.62).save(RA / "icon-192.png", optimize=True)
    ve(512, 10 / 30, 0.62).save(RA / "icon-512.png", optimize=True)
    ve(512, 0, 0.46).save(RA / "icon-maskable-512.png", optimize=True)
    ve(180, 0, 0.62).convert("RGB").save(RA / "apple-touch-icon.png", optimize=True)
    for ten in ("icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"):
        print("đã ghi", (RA / ten).relative_to(GOC))


if __name__ == "__main__":
    main()
