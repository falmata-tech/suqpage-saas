#!/usr/bin/env python3
"""Render six source-owned, product-specific diagrams for the S197 demo clips.

These are fictional product illustrations, not photographs or evidence of a
manufacturing process. The square layout keeps both the product and its exact
title inside the portrait video's square foreground crop.
"""

from __future__ import annotations

import argparse
import hashlib
import math
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SIZE = 1200
FONT_REGULAR = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
FONT_BOLD = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")


@dataclass(frozen=True)
class Diagram:
    business: int
    product: int
    handle: str
    title: str
    accent: str
    background: str
    drawer: str

    @property
    def destination(self) -> Path:
        return (
            ROOT
            / "public/uploads/seed/portfolio"
            / self.handle
            / f"s197-product-{self.product}.png"
        )


DIAGRAMS = (
    Diagram(12, 45, "demo-lume-solar-repair", "Courtyard Solar Lamp",
            "#D99A25", "#F5F2E9", "solar_lamp"),
    Diagram(13, 49, "demo-tana-radio-works", "Compact PA Speaker",
            "#B95F42", "#F3F2F0", "pa_speaker"),
    Diagram(13, 50, "demo-tana-radio-works", "Floor Monitor Cabinet",
            "#B95F42", "#F3F2F0", "floor_monitor"),
    Diagram(39, 153, "demo-bale-equipment-repair", "Field Hoe Head",
            "#557B76", "#F1F4F0", "hoe_head"),
    Diagram(39, 154, "demo-bale-equipment-repair", "Compact Grain Hopper",
            "#557B76", "#F1F4F0", "grain_hopper"),
    Diagram(39, 155, "demo-bale-equipment-repair", "Pulley Guard Set",
            "#557B76", "#F1F4F0", "pulley_guards"),
)


def font(size: int, *, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_BOLD if bold else FONT_REGULAR), size)


def center_text(draw: ImageDraw.ImageDraw, text: str, y: int,
                size: int, fill: str, *, bold: bool = False) -> None:
    face = font(size, bold=bold)
    left, top, right, bottom = draw.textbbox((0, 0), text, font=face)
    draw.text(((SIZE - (right - left)) / 2, y - top), text, font=face, fill=fill)


def soft_shadow(image: Image.Image, box: tuple[int, int, int, int],
                *, blur: int = 25, alpha: int = 44) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).ellipse(box, fill=(25, 39, 42, alpha))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)))


def make_card(spec: Diagram) -> Image.Image:
    image = Image.new("RGBA", (SIZE, SIZE), spec.background)
    draw = ImageDraw.Draw(image)
    for x in range(0, SIZE, 80):
        draw.line((x, 0, x, SIZE), fill="#E6E9E6", width=1)
    for y in range(0, SIZE, 80):
        draw.line((0, y, SIZE, y), fill="#E6E9E6", width=1)
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle((64, 72, 1144, 1149), radius=46,
                                             fill=(27, 37, 38, 31))
    image.alpha_composite(layer.filter(ImageFilter.GaussianBlur(25)))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((55, 55, 1145, 1135), radius=46,
                           fill="#FFFFFF", outline="#DCE3E0", width=2)
    draw.line((105, 920, 1095, 920), fill="#DCE2E0", width=2)
    draw.ellipse((103, 918, 109, 924), fill=spec.accent)
    draw.ellipse((1091, 918, 1097, 924), fill=spec.accent)
    title_size = 69
    while draw.textbbox((0, 0), spec.title, font=font(title_size, bold=True))[2] > 960:
        title_size -= 2
    center_text(draw, spec.title, 977, title_size, "#19282D", bold=True)
    return image


def solar_lamp(image: Image.Image, accent: str) -> None:
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse((375, 330, 825, 760), fill=(250, 192, 68, 77))
    image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(68)))
    soft_shadow(image, (385, 832, 815, 885))
    d = ImageDraw.Draw(image)
    d.rounded_rectangle((566, 686, 634, 828), radius=14, fill="#303D43")
    d.polygon(((510, 814), (690, 814), (740, 854), (460, 854)), fill="#2D383F")
    d.line(((480, 840), (720, 840)), fill="#7B8B8F", width=5)
    d.polygon(((462, 390), (739, 390), (707, 678), (494, 678)),
              fill="#27363F")
    d.polygon(((510, 406), (691, 406), (670, 651), (530, 651)),
              fill="#F6CD6E")
    d.polygon(((539, 420), (661, 420), (651, 631), (549, 631)),
              fill="#FFE7A2")
    for x in (508, 542, 658, 692):
        d.line(((x, 410), (x + (-10 if x < 600 else 10), 647)),
               fill="#344A4F", width=11 if x in (508, 692) else 5)
    d.rounded_rectangle((485, 652, 715, 681), radius=8, fill="#27363F")
    d.line((500, 673, 700, 673), fill="#64777B", width=4)
    # The gridded cap identifies the light as solar without suggesting a runtime.
    p00, p10, p11, p01 = (431, 345), (650, 268), (802, 343), (570, 420)
    d.polygon((p00, p10, p11, p01), fill="#263D50")
    d.line((p00, p10, p11, p01, p00), fill="#152834", width=13, joint="curve")
    for fraction in (0.25, 0.5, 0.75):
        a = (int(p00[0] + fraction * (p10[0] - p00[0])),
             int(p00[1] + fraction * (p10[1] - p00[1])))
        b = (int(p01[0] + fraction * (p11[0] - p01[0])),
             int(p01[1] + fraction * (p11[1] - p01[1])))
        d.line((a, b), fill="#658B9F", width=5)
    for fraction in (1 / 3, 2 / 3):
        a = (int(p00[0] + fraction * (p01[0] - p00[0])),
             int(p00[1] + fraction * (p01[1] - p00[1])))
        b = (int(p10[0] + fraction * (p11[0] - p10[0])),
             int(p10[1] + fraction * (p11[1] - p10[1])))
        d.line((a, b), fill="#658B9F", width=5)
    d.line(((571, 418), (465, 418)), fill="#1E303A", width=16)
    d.line(((572, 423), (748, 404)), fill="#1E303A", width=12)


def pa_speaker(image: Image.Image, accent: str) -> None:
    soft_shadow(image, (324, 827, 936, 888))
    d = ImageDraw.Draw(image)
    d.polygon(((340, 312), (768, 293), (870, 342), (437, 370)),
              fill="#5C6870")
    d.polygon(((768, 293), (870, 342), (870, 800), (768, 839)),
              fill="#30383F")
    d.polygon(((340, 312), (768, 293), (768, 839), (340, 808)),
              fill="#333D43")
    d.polygon(((372, 343), (736, 331), (736, 795), (372, 773)),
              fill="#17252C")
    for x in range(393, 730, 18):
        for y in range(360, 778, 19):
            d.ellipse((x, y, x + 3, y + 3), fill="#42515A")
    d.rounded_rectangle((505, 273, 615, 299), radius=12, fill="#1B252C")
    d.rounded_rectangle((522, 277, 598, 288), radius=5, fill="#76858B")
    d.ellipse((483, 376, 628, 485), fill="#64757B")
    d.ellipse((494, 385, 618, 474), fill="#17262D")
    d.rounded_rectangle((519, 413, 593, 444), radius=7, fill="#384951")
    d.ellipse((406, 497, 704, 787), fill="#75878B")
    d.ellipse((424, 513, 686, 770), fill="#1F3039")
    d.ellipse((446, 536, 663, 749), fill="#3C4D55")
    d.ellipse((493, 580, 619, 704), fill="#23333A")
    d.ellipse((541, 627, 570, 656), fill=accent)
    for x, y in ((388, 358), (720, 347), (388, 755), (720, 773)):
        d.ellipse((x - 5, y - 5, x + 5, y + 5), fill="#89989A")
    d.rectangle((378, 802, 417, 840), fill="#242B30")
    d.rectangle((700, 813, 739, 849), fill="#242B30")


def floor_monitor(image: Image.Image, accent: str) -> None:
    soft_shadow(image, (280, 793, 1004, 904))
    d = ImageDraw.Draw(image)
    # Floor wedge: the tilted grille faces the performer, with a deep rear edge.
    d.polygon(((269, 641), (746, 419), (965, 650), (470, 871)),
              fill="#303B43")
    d.polygon(((470, 871), (965, 650), (965, 760), (470, 912)),
              fill="#212B31")
    d.polygon(((269, 641), (470, 871), (470, 912), (269, 723)),
              fill="#47545B")
    face = ((310, 647), (741, 458), (918, 644), (473, 832))
    d.polygon(face, fill="#17262D")
    # Rows of grille perforations follow the slanted front plane.
    for row in range(7):
        for col in range(15):
            x = 355 + col * 28 + row * 19
            y = 635 - col * 12 + row * 25
            if 355 < x < 880 and 490 < y < 801:
                d.ellipse((x, y, x + 3, y + 3), fill="#46565D")
    d.ellipse((476, 550, 784, 789), fill="#66777B")
    d.ellipse((494, 566, 766, 775), fill="#17262D")
    d.ellipse((519, 588, 742, 752), fill="#33464F")
    d.ellipse((562, 623, 699, 723), fill="#1C2D35")
    d.ellipse((674, 484, 772, 557), fill="#65777C")
    d.ellipse((685, 493, 761, 546), fill="#1D2C34")
    d.line(((296, 644), (746, 434), (946, 647)), fill="#738388", width=8)
    d.line(((488, 853), (946, 650)), fill=accent, width=7)
    for x, y in ((326, 657), (750, 477), (884, 649), (475, 801)):
        d.ellipse((x - 5, y - 5, x + 5, y + 5), fill="#A5ADAC")
    d.polygon(((330, 746), (382, 799), (382, 819), (330, 770)),
              fill="#151E23")
    d.polygon(((846, 805), (903, 783), (903, 802), (846, 826)),
              fill="#151E23")


def hoe_head(image: Image.Image, accent: str) -> None:
    soft_shadow(image, (337, 797, 868, 865))
    d = ImageDraw.Draw(image)
    d.ellipse((524, 328, 684, 450), fill="#2E4248")
    d.ellipse((550, 346, 659, 401), fill="#AEBDBA")
    d.ellipse((561, 355, 648, 393), fill="#304148")
    d.polygon(((554, 399), (649, 399), (678, 508), (527, 508)),
              fill="#34474D")
    d.polygon(((513, 451), (690, 451), (827, 792), (372, 792)),
              fill="#586B70")
    d.polygon(((520, 465), (677, 465), (791, 758), (409, 758)),
              fill="#718388")
    d.polygon(((408, 758), (792, 758), (827, 792), (372, 792)),
              fill="#293C43")
    d.line(((418, 748), (780, 748)), fill="#AABAB8", width=9)
    d.line(((513, 462), (411, 760)), fill="#A5B3B1", width=7)
    d.line(((681, 463), (789, 760)), fill="#40545A", width=7)
    d.line(((595, 475), (595, 736)), fill="#53676C", width=4)
    d.arc((538, 332, 668, 418), 192, 342, fill="#C0CBC7", width=7)
    d.ellipse((593, 502, 607, 516), fill=accent)


def grain_hopper(image: Image.Image, accent: str) -> None:
    soft_shadow(image, (336, 822, 918, 890))
    d = ImageDraw.Draw(image)
    d.polygon(((332, 367), (781, 344), (910, 449), (465, 485)),
              fill="#41545B")
    d.polygon(((368, 379), (771, 360), (868, 437), (469, 461)),
              fill="#D7BA71")
    for x, y in ((425, 401), (493, 413), (562, 388), (630, 418), (695, 390),
                 (763, 413), (824, 430), (543, 441), (729, 447), (608, 450)):
        d.ellipse((x - 9, y - 5, x + 9, y + 5), fill="#AE894B")
    d.polygon(((332, 367), (465, 485), (536, 762), (423, 630)),
              fill="#6B7B7C")
    d.polygon(((465, 485), (910, 449), (744, 765), (536, 762)),
              fill="#98A7A4")
    d.polygon(((465, 485), (910, 449), (894, 475), (473, 510)),
              fill="#53676A")
    d.line(((499, 524), (565, 728)), fill="#C4CECA", width=8)
    d.line(((859, 486), (721, 731)), fill="#5F7475", width=9)
    d.polygon(((537, 758), (744, 758), (727, 823), (555, 823)),
              fill="#596C70")
    d.polygon(((522, 817), (762, 817), (777, 851), (509, 851)),
              fill="#344950")
    for x in (539, 741):
        d.ellipse((x - 7, 828, x + 7, 842), fill="#AEBFBA")
    d.line(((363, 395), (460, 481), (907, 448)), fill="#B8C6C0", width=7)
    d.ellipse((627, 646, 645, 664), fill=accent)


def guard_outline(cx: int, base_y: int, radius_x: int, radius_y: int) -> list[tuple[int, int]]:
    arch = [
        (int(cx + radius_x * math.cos(math.pi - math.pi * index / 40)),
         int(base_y - radius_y * math.sin(math.pi - math.pi * index / 40)))
        for index in range(41)
    ]
    return arch + [(cx + radius_x, base_y + 145),
                   (cx - radius_x, base_y + 145)]


def pulley_guards(image: Image.Image, accent: str) -> None:
    soft_shadow(image, (275, 786, 982, 879))
    d = ImageDraw.Draw(image)
    # Three flanged covers read as a matched set, not as exposed pulleys.
    d.polygon(guard_outline(399, 601, 139, 135), fill="#6D8485")
    d.polygon(guard_outline(807, 586, 137, 129), fill="#728B89")
    d.polygon(guard_outline(606, 584, 222, 239), fill="#354D56")
    d.polygon(guard_outline(606, 573, 201, 212), fill="#789493")
    d.arc((423, 378, 789, 749), 182, 358, fill="#B8CAC2", width=13)
    d.rounded_rectangle((348, 721, 864, 787), radius=20, fill="#314A52")
    d.line((370, 744, 843, 744), fill="#9AB2AD", width=6)
    for x in (382, 459, 752, 828):
        d.ellipse((x - 10, 742, x + 10, 762), fill="#CBD5CE")
        d.ellipse((x - 4, 748, x + 4, 756), fill="#526668")
    # Separate radial ventilation slots on the large central guard.
    for angle in (205, 225, 245, 265, 285, 305, 325, 345):
        theta = math.radians(angle)
        x1 = 606 + 105 * math.cos(theta)
        y1 = 577 + 105 * math.sin(theta)
        x2 = 606 + 165 * math.cos(theta)
        y2 = 577 + 165 * math.sin(theta)
        d.line((x1, y1, x2, y2), fill="#2C454D", width=12)
    d.ellipse((546, 510, 666, 630), fill="#3D555C")
    d.ellipse((572, 535, 640, 603), fill="#92A9A4")
    for cx in (399, 807):
        for x_offset in (-44, 0, 44):
            d.line((cx + x_offset, 562, cx + x_offset, 646),
                   fill="#3C555B", width=9)
        d.ellipse((cx - 34, 532, cx + 34, 600), fill=accent)
        d.ellipse((cx - 18, 548, cx + 18, 584), fill="#3B555B")


DRAWERS = {
    "solar_lamp": solar_lamp,
    "pa_speaker": pa_speaker,
    "floor_monitor": floor_monitor,
    "hoe_head": hoe_head,
    "grain_hopper": grain_hopper,
    "pulley_guards": pulley_guards,
}


def render(spec: Diagram) -> bytes:
    image = make_card(spec)
    DRAWERS[spec.drawer](image, spec.accent)
    from io import BytesIO

    buffer = BytesIO()
    image.convert("RGB").save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true",
                        help="compare on-disk images with a fresh deterministic render")
    args = parser.parse_args()
    for spec in DIAGRAMS:
        data = render(spec)
        target = spec.destination
        if args.check:
            if not target.is_file() or target.read_bytes() != data:
                raise SystemExit(f"Missing or changed diagram: {target}")
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        print(f"{target.relative_to(ROOT)} {len(data)} bytes "
              f"sha256:{hashlib.sha256(data).hexdigest()}")


if __name__ == "__main__":
    main()
