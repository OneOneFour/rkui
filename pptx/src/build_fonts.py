"""Makes static TTFs that PowerPoint can use: instances of the Roboto Slab and Xmind variable fonts
at 400 and 700, named as plain RIBBI families, plus JetBrains Mono's upstream statics.

Usage: python build_fonts.py <downloads/fonts> <downloads/jbm> <out/fonts>
"""
import shutil
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

STYLES = {  # style name -> (weight, italic)
    "Regular": (400, False),
    "Bold": (700, False),
    "Italic": (400, True),
    "Bold Italic": (700, True),
}


def set_ribbi_names(font, family, style, weight, italic):
    """Names the font as one member of a four-style family, so PowerPoint's B and I buttons work."""
    ps_family = family.replace(" ", "")
    ps_style = style.replace(" ", "")
    full = family if style == "Regular" else f"{family} {style}"
    name = font["name"]
    for record_id in (16, 17, 21, 22, 25):
        name.removeNames(nameID=record_id)
    for record_id, value in {
        1: family,
        2: style,
        3: f"{ps_family}-{ps_style};instance",
        4: full,
        6: f"{ps_family}-{ps_style}",
    }.items():
        name.setName(value, record_id, 3, 1, 0x409)
        name.setName(value, record_id, 1, 0, 0)

    bold = weight >= 700
    os2 = font["OS/2"]
    os2.usWeightClass = weight
    # fsSelection bits: 0 italic, 5 bold, 6 regular, 8 WWS
    fs = os2.fsSelection & ~(1 | 1 << 5 | 1 << 6)
    fs |= (1 if italic else 0) | (1 << 5 if bold else 0)
    if not italic and not bold:
        fs |= 1 << 6
    os2.fsSelection = fs
    font["head"].macStyle = (1 if bold else 0) | (2 if italic else 0)
    if "STAT" in font:
        del font["STAT"]


def instance(src, family, style, out_dir):
    weight, italic = STYLES[style]
    font = TTFont(src)
    font = instancer.instantiateVariableFont(font, {"wght": weight})
    set_ribbi_names(font, family, style, weight, italic)
    out = out_dir / f"{family.replace(' ', '')}-{style.replace(' ', '')}.ttf"
    font.save(out)
    return out


def main(downloads, jbm, out):
    downloads, jbm, out = Path(downloads), Path(jbm), Path(out)
    for sub in ("roboto-slab", "xmind", "jetbrains-mono"):
        (out / sub).mkdir(parents=True, exist_ok=True)

    for style in ("Regular", "Bold"):
        instance(downloads / "RobotoSlab-VF.ttf", "Roboto Slab", style, out / "roboto-slab")
        instance(downloads / "Xmind-VF.ttf", "Xmind", style, out / "xmind")
    for style in ("Italic", "Bold Italic"):
        instance(downloads / "Xmind-Italic-VF.ttf", "Xmind", style, out / "xmind")
    for style in ("Regular", "Bold", "Italic"):
        name = f"JetBrainsMono-{style.replace(' ', '')}.ttf"
        shutil.copy(jbm / "fonts/ttf" / name, out / "jetbrains-mono" / name)

    shutil.copy(downloads / "LICENSE-RobotoSlab.txt", out / "roboto-slab/LICENSE.txt")
    shutil.copy(downloads / "OFL-Xmind.txt", out / "xmind/OFL.txt")
    shutil.copy(downloads / "OFL-JetBrainsMono.txt", out / "jetbrains-mono/OFL.txt")


if __name__ == "__main__":
    main(*sys.argv[1:])
