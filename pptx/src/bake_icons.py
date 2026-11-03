"""Bakes a curated subset of rk-ui icons into plain SVGs (no CSS variables) for PowerPoint,
one set per theme, plus 256px PNG renders and a contact sheet per theme.

Usage: python bake_icons.py <repo> <tokens.json> <out/icons>
"""
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)

ICONS = {
    "science": [
        "atom", "flask", "microscope", "dna", "test-tube", "brain", "planet", "satellite",
        "rocket-launch", "magnet", "function", "sigma", "graph", "cube", "lightbulb",
        "globe-hemisphere-west",
    ],
    "weather": [
        "sun", "moon", "cloud", "cloud-rain", "cloud-snow", "cloud-lightning", "cloud-sun",
        "snowflake", "wind", "hurricane", "thermometer", "drop", "rainbow", "waves",
    ],
    "charts": [
        "chart-bar", "chart-line", "chart-line-up", "chart-pie-slice", "chart-scatter",
        "chart-donut", "presentation-chart", "trend-up", "trend-down", "gauge", "pulse", "table",
    ],
    "arrows": [
        "arrow-left", "arrow-right", "arrow-up", "arrow-counter-clockwise", "arrow-square-out",
        "arrows-out", "caret-right", "flow-arrow",
    ],
    "interface": [
        "check", "check-circle", "x-circle", "plus", "info", "warning", "question", "star",
        "sparkle", "gear", "magnifying-glass", "link", "eye", "calendar-blank", "clock",
        "envelope-simple", "users", "image", "map-pin", "book-open-text", "graduation-cap",
        "quotes", "pen-nib", "trophy", "puzzle-piece",
    ],
    "code": [
        "code", "code-block", "terminal-window", "brackets-curly", "git-branch", "git-merge",
        "bug", "database", "cpu", "file-py", "robot", "tree-structure",
    ],
}

STROKE_WIDTH = "16"
LABEL_FONT = str(Path(__file__).parent.parent / "out/fonts/xmind/Xmind-Regular.ttf")
NEUTRAL_FILL_OPACITY = "0.2"  # --icon-fill-neutral is currentColor at 20%
FILL_VAR = re.compile(r"fill:var\(--icon-(?:fill|ocean), var\(--([\w-]+)\)\)")


def stroke_colour(colours, theme):
    """Icons draw in --fg, which is ink in light and cream in dark."""
    return colours["--fg"][theme]


def bake(svg_text, colours, theme, fill=None):
    """Returns the SVG with every var() and currentColor replaced by a theme's hex values.
    fill, a token name such as 'teal', stands in for --icon-fill as when a container sets it."""
    root = ET.fromstring(svg_text)
    stroke = stroke_colour(colours, theme)
    for el in root.iter():
        style = el.attrib.pop("style", None)
        if style:
            match = FILL_VAR.search(style)
            if "stroke-width" in style:
                el.set("stroke-width", STROKE_WIDTH)
            elif fill and "--icon-fill" in style:
                el.set("fill", colours[f"--{fill}"][theme])
            elif match and match.group(1) == "icon-fill-neutral":
                el.set("fill", stroke)
                el.set("fill-opacity", NEUTRAL_FILL_OPACITY)
            elif match:
                el.set("fill", colours[f"--{match.group(1)}"][theme])
            else:
                raise ValueError(f"Unhandled style: {style}")
        for attr in ("fill", "stroke"):
            if el.get(attr) == "currentColor":
                el.set(attr, stroke)
    root.attrib.pop("aria-hidden", None)
    root.set("width", "256")
    root.set("height", "256")
    return ET.tostring(root, encoding="unicode")


def contact_sheet(png_dir, names, background, label_colour, out):
    tiles = [str(png_dir / f"{n}.png") for n in names]
    subprocess.run(
        ["magick", "montage", "-font", LABEL_FONT, "-label", "%t", "-pointsize", "11", "-fill", label_colour,
         "-background", background, *tiles, "-tile", "12x", "-geometry", "96x96+14+8", out],
        check=True,
    )


def main(repo, tokens_path, out):
    src = Path(repo) / "packages/rk-ui/icons"
    out = Path(out)
    colours = json.loads(Path(tokens_path).read_text())["colours"]
    names = [n for group in ICONS.values() for n in group]
    for theme in ("light", "dark"):
        svg_dir, png_dir = out / theme / "svg", out / theme / "png"
        svg_dir.mkdir(parents=True, exist_ok=True)
        png_dir.mkdir(parents=True, exist_ok=True)
        for name in names:
            baked = bake((src / f"{name}.svg").read_text(), colours, theme)
            (svg_dir / f"{name}.svg").write_text(baked + "\n")
            subprocess.run(
                ["rsvg-convert", "-w", "256", "-h", "256", "-o", png_dir / f"{name}.png", svg_dir / f"{name}.svg"],
                check=True,
            )
        contact_sheet(png_dir, names, colours["--surface"][theme], colours["--fg"][theme], out / f"contact-sheet-{theme}.png")
    for licence in ("LICENSE-phosphor.txt", "LICENSE-tabler.txt"):
        (out / licence).write_text((src / licence).read_text())
    (out / "icons.json").write_text(json.dumps(ICONS, indent=2) + "\n")
    print(f"{len(names)} icons baked")


if __name__ == "__main__":
    main(*sys.argv[1:])
