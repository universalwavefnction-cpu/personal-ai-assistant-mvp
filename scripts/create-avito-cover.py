from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
VIDEO = ASSETS / "telegram-demo.mp4"
FRAME = Path("/tmp/personal-ai-assistant-avito-phone-frame.png")
OUT = ASSETS / "avito-cover.png"

FONT_REG = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")

W, H = 1280, 960


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def text(draw: ImageDraw.ImageDraw, xy, value, size, fill, bold=False):
    draw.text(
        xy,
        value,
        font=font(FONT_BOLD if bold else FONT_REG, size),
        fill=fill,
    )


def rounded_shadow(base: Image.Image, box, radius, fill, shadow=(0, 0, 0, 70)):
    x0, y0, x1, y1 = box
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    layer_draw = ImageDraw.Draw(layer)
    layer_draw.rounded_rectangle((x0 + 12, y0 + 18, x1 + 12, y1 + 18), radius, fill=shadow)
    layer = layer.filter(ImageFilter.GaussianBlur(18))
    base.alpha_composite(layer)
    ImageDraw.Draw(base).rounded_rectangle(box, radius, fill=fill)


def extract_frame():
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-ss",
            "6",
            "-i",
            str(VIDEO),
            "-frames:v",
            "1",
            "-update",
            "1",
            str(FRAME),
        ],
        check=True,
    )


def cover():
    extract_frame()

    bg = Image.new("RGBA", (W, H), "#071923")
    draw = ImageDraw.Draw(bg)

    for x in range(0, W, 80):
        draw.line((x, 0, x, H), fill=(142, 198, 232, 18), width=1)
    for y in range(0, H, 80):
        draw.line((0, y, W, y), fill=(142, 198, 232, 18), width=1)

    draw.rounded_rectangle((72, 72, 360, 126), 27, fill="#C7A86B")
    text(draw, (96, 87), "AI-БОТ В TELEGRAM", 24, "#071923", bold=True)

    text(draw, (72, 202), "Личный AI-бот", 82, "#F6F8F7", bold=True)
    text(draw, (72, 298), "в Telegram", 82, "#F6F8F7", bold=True)
    text(draw, (72, 394), "за 24 часа", 82, "#8EC6E8", bold=True)

    text(draw, (76, 522), "Голосовые  файлы  тексты  код  сайты", 34, "#C9D5DA")
    text(draw, (76, 575), "Готовая ссылка без VPN серверов и настроек", 28, "#95A6AE")

    draw.rounded_rectangle((70, 690, 370, 804), 26, fill=(246, 248, 247, 22), outline=(142, 198, 232, 38), width=1)
    draw.rounded_rectangle((392, 690, 752, 804), 26, fill=(246, 248, 247, 22), outline=(142, 198, 232, 38), width=1)
    text(draw, (96, 714), "от 4 000 ₽", 44, "#F6F8F7", bold=True)
    text(draw, (96, 765), "тестовая версия", 24, "#C9D5DA")
    text(draw, (420, 714), "8 000 ₽", 44, "#F6F8F7", bold=True)
    text(draw, (420, 765), "с пакетом токенов", 24, "#C9D5DA")

    text(draw, (76, 855), "Напишите «Хочу бота»", 30, "#C7A86B", bold=True)

    phone_box = (786, 42, 1228, 918)
    rounded_shadow(bg, phone_box, 54, "#1C2C35")
    draw = ImageDraw.Draw(bg)
    draw.rounded_rectangle((804, 60, 1210, 900), 42, fill="#0A1A22")

    screen_w, screen_h = 382, 816
    screen = Image.open(FRAME).convert("RGBA")
    screen_ratio = screen.width / screen.height
    target_ratio = screen_w / screen_h
    if screen_ratio > target_ratio:
        new_h = screen_h
        new_w = int(new_h * screen_ratio)
    else:
        new_w = screen_w
        new_h = int(new_w / screen_ratio)
    screen = screen.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - screen_w) // 2
    top = max(0, (new_h - screen_h) // 2)
    screen = screen.crop((left, top, left + screen_w, top + screen_h))

    mask = Image.new("L", (screen_w, screen_h), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, screen_w, screen_h), 34, fill=255)
    bg.paste(screen, (816, 72), mask)

    bg.convert("RGB").save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    cover()
