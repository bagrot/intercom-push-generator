"""Generate the square ЭД desktop icon in PNG and Windows ICO formats.

Run locally with Pillow installed: python scripts/generate-desktop-icon.py
The generated assets are committed so release builds do not need Python.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SIZE = 1024
NAVY = (32, 40, 56, 255)
ORANGE = (255, 101, 74, 255)
WHITE = (255, 255, 255, 255)
FONT = Path("C:/Windows/Fonts/arialbd.ttf")

canvas = Image.new("RGBA", (SIZE, SIZE), NAVY)
draw = ImageDraw.Draw(canvas)
draw.rectangle((44, 44, SIZE - 45, SIZE - 45), outline=ORANGE, width=29)

font_size = 400
while True:
    font = ImageFont.truetype(str(FONT), font_size)
    box = draw.textbbox((0, 0), "ЭД", font=font)
    if box[2] - box[0] >= 485:
        break
    font_size += 1

x = (SIZE - (box[2] - box[0])) / 2 - box[0]
y = (SIZE - (box[3] - box[1])) / 2 - box[1]
draw.text((round(x), round(y)), "ЭД", font=font, fill=WHITE)

image = canvas.resize((256, 256), Image.Resampling.LANCZOS)
png_path = ROOT / "desktop-runtime" / "icon.png"
ico_path = ROOT / "build" / "icon.ico"
mac_png_path = ROOT / "build" / "icon.png"
png_path.parent.mkdir(parents=True, exist_ok=True)
ico_path.parent.mkdir(parents=True, exist_ok=True)
image.save(png_path)
image.save(ico_path, format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
canvas.save(mac_png_path)
print(png_path)
print(ico_path)
print(mac_png_path)
