"""Draws a one-page visual reference of the rk-toon look per theme (SVG, rendered to PNG with
rsvg-convert using the bundled fonts through a private fontconfig file).

Usage: python reference_sheet.py <fonts dir> <out dir>
"""
import os
import subprocess
import sys
from xml.sax.saxutils import escape
from pathlib import Path

from palette import (EXTRUSIONS, SERIES, VARIANT_NAMES, VARIANTS, hex_of, inset_hex, shadow_hex,
                     shadow_style)

W, H = 1600, 1180
OUTLINE, SHADOW, RADIUS = 2, 4, 10  # CSS px, drawn at 1:1 then rendered at 2x
SLAB, BODY, MONO = "Roboto Slab", "Xmind", "JetBrains Mono"


def c(token, theme):
    return "#" + hex_of(token, theme)


def text(x, y, s, size=14, fill="#000", family=BODY, weight=400, anchor="start", spacing=0, caps=False):
    s = s.upper() if caps else s
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
            f'fill="{fill}" text-anchor="{anchor}" letter-spacing="{spacing}">{escape(s)}</text>')


def rrect(x, y, w, h, fill, r=RADIUS, stroke=None, dash=None, shadow=None):
    """A rounded rect, optionally with an outline and a hard offset shadow behind it.
    shadow is (colour, edge): edge, if set, rims the shadow by the outline width (dark mode)."""
    out = ""
    if shadow:
        colour, edge = shadow
        sx, sy = x + SHADOW, y + SHADOW
        if edge:
            out += (f'<rect x="{sx - OUTLINE}" y="{sy - OUTLINE}" width="{w + 2 * OUTLINE}" '
                    f'height="{h + 2 * OUTLINE}" rx="{r + OUTLINE}" fill="{edge}"/>')
        out += f'<rect x="{sx}" y="{sy}" width="{w}" height="{h}" rx="{r}" fill="{colour}"/>'
    stroke_attrs = ""
    if stroke:
        stroke_attrs = f' stroke="{stroke}" stroke-width="{OUTLINE}"'
        if dash:
            stroke_attrs += ' stroke-dasharray="6 4"'
    return out + f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}"{stroke_attrs}/>'


def rounded_path(x, y, w, h, r):
    return (f"M{x + r},{y} H{x + w - r} A{r},{r} 0 0 1 {x + w},{y + r} V{y + h - r} "
            f"A{r},{r} 0 0 1 {x + w - r},{y + h} H{x + r} A{r},{r} 0 0 1 {x},{y + h - r} "
            f"V{y + r} A{r},{r} 0 0 1 {x + r},{y} Z")


def inset_panel(x, y, w, h, fill, shadow, ident):
    """The code panel: slate, pressed in by a 4px down-right inner shadow of --line at 20%."""
    hole = rounded_path(x + SHADOW, y + SHADOW, w, h, RADIUS)
    return (
        f'<clipPath id="{ident}"><path d="{rounded_path(x, y, w, h, RADIUS)}"/></clipPath>'
        f'<path d="{rounded_path(x, y, w, h, RADIUS)}" fill="{fill}"/>'
        f'<path clip-path="url(#{ident})" fill-rule="evenodd" fill="{shadow}" fill-opacity="0.2" '
        f'd="M{x - 50},{y - 50} H{x + w + 50} V{y + h + 50} H{x - 50} Z {hole}"/>'
    )


def swatch_row(x, y, tokens, theme, title, fg, muted, line):
    out = text(x, y - 12, title, 13, muted, weight=700, caps=True, spacing=1.3)
    for i, token in enumerate(tokens):
        sx = x + i * 92
        out += rrect(sx, y, 80, 44, c(token, theme), stroke=line)
        out += text(sx, y + 62, token, 12, fg, weight=700)
        out += text(sx, y + 78, c(token, theme), 12, muted, family=MONO)
    return out


def pressed_in(x, y, w, h, fill, stroke, inset, ident):
    """An unfilled button pressed in: --raised fill, outline, a 2px down-right inside shadow."""
    hole = rounded_path(x + 2, y + 2, w, h, RADIUS)
    return (
        f'<clipPath id="{ident}"><path d="{rounded_path(x, y, w, h, RADIUS)}"/></clipPath>'
        f'<path d="{rounded_path(x, y, w, h, RADIUS)}" fill="{fill}"/>'
        f'<path clip-path="url(#{ident})" fill-rule="evenodd" fill="{inset}" '
        f'd="M{x - 20},{y - 20} H{x + w + 20} V{y + h + 20} H{x - 20} Z {hole}"/>'
        f'<path d="{rounded_path(x, y, w, h, RADIUS)}" fill="none" stroke="{stroke}" stroke-width="{OUTLINE}"/>'
    )


SHADOW_NOTES = {
    "plain": ["Shadows: --line, 4px down-right, no blur.",
              "Inside shadow (pressed unfilled button, filled --raised): --line, 2px."],
    "rim": ["Shadows (option B, the default): near-black --line on a copy widened 2px",
            "in --line-unfilled (cream rim). Inside shadow: --line, 2px, on --raised."],
    "extrude": ["Shadows (option D): each fill's own colour, color-mix(in oklab, fill 75%, --line).",
                "Neutral, unfilled, navy and section fills use --shadow-lit. No rim.",
                "Inside shadow: --line, 2px, on --raised."],
}


def sheet(theme):
    fg, muted, line = c("fg", theme), c("muted", theme), c("line", theme)
    unfilled, raised = c("line-unfilled", theme), c("raised", theme)
    style = shadow_style(theme)

    def shadow(fill=None, excluded=None):
        """(shadow colour, rim) for an element with this fill, in this master's shadow option."""
        kwargs = {} if excluded is None else {"excluded": excluded}
        return "#" + shadow_hex(theme, fill, **kwargs), unfilled if style == "rim" else None

    parts = [f'<rect width="{W}" height="{H}" fill="{c("surface", theme)}"/>']
    parts.append(text(48, 64, f"rk-toon reference · {VARIANT_NAMES[theme]}", 40, fg, SLAB, 700))
    parts.append(text(48, 94, "Values from packages/rk-ui/tokens.css. 1 px = 0.75 pt on a 960 × 540 pt slide.",
                      15, muted))

    y = 150
    parts.append(swatch_row(48, y, SERIES, theme, "Fills · chart series order", fg, muted, line))
    parts.append(swatch_row(48, y + 120, ["surface", "raised", "fg", "muted", "line", "line-unfilled",
                                          "slate", "slate-tab"], theme, "Neutrals", fg, muted, line))
    parts.append(swatch_row(48, y + 240, [f"{h}-deep" for h in SERIES], theme, "Hue text (-deep)", fg,
                            muted, line))
    parts.append(swatch_row(48, y + 360, ["navy-tint", "teal-tint", "coral-tint", "yellow-tint",
                                          "green-tint", "sky-tint", "lilac-tint", "apricot-tint"],
                            theme, "Panels (-tint)", fg, muted, line))

    # Right column: buttons, chips, measurements
    x0 = 820
    parts.append(text(x0, y - 12, "Buttons: 2px outline, 4px hard shadow at 45°, 0 blur, 10px radius", 13,
                      muted, weight=700))
    buttons = [("yellow", "on-fill"), ("teal", "on-fill"), ("green", "on-fill"), ("navy", "on-navy"),
               ("coral-solid", "on-coral"), ("grape", "on-grape")]
    for i, (fill, label) in enumerate(buttons):
        bx, by = x0 + (i % 3) * 240, y + (i // 3) * 64
        parts.append(rrect(bx, by, 200, 44, c(fill, theme), stroke=line, shadow=shadow(fill)))
        parts.append(text(bx + 100, by + 28, f"{fill} / {label}", 15, c(label, theme), weight=700,
                          anchor="middle"))
    cy = y + 150
    parts.append(text(x0, cy - 12, "Chips (selected = --section) and a pressed unfilled button", 13, muted,
                      weight=700))
    for i, sel in enumerate([True, False, False]):
        fill = "section" if sel else "raised"
        parts.append(rrect(x0 + i * 110, cy, 96, 32, c(fill, theme), r=16, stroke=line if sel else unfilled,
                           shadow=shadow(fill)))
        parts.append(text(x0 + i * 110 + 48, cy + 21, "Chip", 14, c("on-section", theme) if sel else fg,
                          weight=600, anchor="middle"))
    parts.append(pressed_in(x0 + 350, cy - 2, 130, 36, raised, unfilled, "#" + inset_hex(theme), f"inset-{theme}"))
    parts.append(text(x0 + 415, cy + 21, "Unfilled", 14, fg, weight=700, anchor="middle"))
    for n, note in enumerate(SHADOW_NOTES[style]):
        parts.append(text(x0, cy + 76 + n * 20, note, 13, muted))
    if style == "extrude":
        fills = ["yellow", "teal", "green", "coral-solid", "grape", "tangerine", "sky", "shadow-lit"]
        parts.append(text(x0, cy + 160, "Extrusion colours", 13, muted, weight=700, caps=True, spacing=1.3))
        for i, fill in enumerate(fills):
            hexv = hex_of(fill, theme) if fill == "shadow-lit" else EXTRUSIONS[fill]
            parts.append(rrect(x0 + i * 92, cy + 172, 80, 32, "#" + hexv, stroke=line))
            parts.append(text(x0 + i * 92, cy + 220, fill, 12, fg, weight=700))
            parts.append(text(x0 + i * 92, cy + 236, "#" + hexv, 12, muted, family=MONO))

    # Card, callouts, code, frame
    py = 660
    parts.append(rrect(48, py, 300, 240, raised, stroke=line, shadow=shadow("raised")))
    parts.append(f'<path d="{rounded_path(49, py + 1, 298, 98, 9)}" fill="{c("sky-tint", theme)}"/>')
    parts.append(f'<rect x="49" y="{py + 60}" width="298" height="39" fill="{c("sky-tint", theme)}"/>')
    parts.append(f'<path d="M48,{py + 100} H348" stroke="{line}" stroke-width="{OUTLINE}"/>')
    parts.append(text(64, py + 136, "Card title", 20, fg, SLAB, 700))
    parts.append(text(64, py + 160, "Meta · muted", 13, muted))
    parts.append(text(64, py + 190, "Raised panel; linked cards add", 15, fg))
    parts.append(text(64, py + 210, "the outline and hard shadow.", 15, fg))

    parts.append(rrect(380, py, 360, 110, c("sky-tint", theme)))
    parts.append(f'<circle cx="406" cy="{py + 28}" r="11" fill="{c("teal", theme)}" stroke="{fg}" stroke-width="2"/>')
    parts.append(text(428, py + 33, "Note callout", 16, fg, weight=700))
    parts.append(text(428, py + 58, "sky-tint panel, no outline;", 15, fg))
    parts.append(text(428, py + 78, "icon fill teal", 15, fg))
    parts.append(rrect(380, py + 130, 360, 110, c("apricot-tint", theme)))
    parts.append(f'<path d="M406,{py + 146} L418,{py + 168} H394 Z" fill="{c("tangerine", theme)}" '
                 f'stroke="{fg}" stroke-width="2" stroke-linejoin="round"/>')
    parts.append(text(428, py + 163, "Warning callout", 16, fg, weight=700))
    parts.append(text(428, py + 188, "apricot-tint panel, no outline;", 15, fg))
    parts.append(text(428, py + 208, "icon fill tangerine", 15, fg))

    parts.append(inset_panel(772, py, 380, 240, c("slate", theme), line, f"code-{theme}"))
    parts.append(text(792, py + 30, "Python", 12, muted, weight=600, caps=True, spacing=1.2))
    code = [
        [("# comment", "code-comment")],
        [("def ", "code-keyword"), ("lorem", "code-function"), ("(x, n=", "fg"), ("42", "code-number"),
         ("):", "fg")],
        [("    return ", "code-keyword"), ('"ipsum"', "code-string")],
        [("x != y => a <= b", "fg")],
    ]
    for n, runs in enumerate(code):
        spans = "".join(f'<tspan fill="{c(t, theme)}">{escape(s)}</tspan>' for s, t in runs)
        parts.append(f'<text x="792" y="{py + 66 + n * 26}" font-family="{MONO}" font-size="16" '
                     f'xml:space="preserve">{spans}</text>')
    parts.append(text(792, py + 222, "slate, inset 4px shadow of --line at 20%", 12, muted))

    parts.append(rrect(1184, py, 368, 240, c("lilac-tint", theme), stroke=unfilled, dash=True))
    parts.append(text(1204, py + 34, "Widget frame", 20, fg, SLAB, 700))
    parts.append(rrect(1204, py + 50, 328, 120, raised))
    parts.append(text(1368, py + 116, "stage: raised, no outline", 14, muted, anchor="middle"))
    parts.append(rrect(1204, py + 186, 90, 34, c("yellow", theme), stroke=line, shadow=shadow("yellow")))
    parts.append(text(1249, py + 208, "Start", 14, c("on-fill", theme), weight=700, anchor="middle"))
    parts.append(text(1310, py + 208, "lilac-tint, 2px dashed --line-unfilled", 12, muted))

    # Type
    ty = 960
    parts.append(text(48, ty, "Roboto Slab · headings (800 on the site; Bold in PowerPoint)", 13, muted,
                      weight=700))
    parts.append(text(48, ty + 52, "Heading specimen Aa", 44, fg, SLAB, 700))
    parts.append(text(620, ty, "Xmind · body (regular, bold, italic)", 13, muted, weight=700))
    parts.append(text(620, ty + 40, "Body text specimen, lorem ipsum dolor sit amet.", 20, fg))
    parts.append(f'<text x="620" y="{ty + 72}" font-family="{BODY}" font-size="20" fill="{fg}">'
                 f'<tspan font-weight="700">Bold</tspan> and <tspan font-style="italic">italic</tspan></text>')
    parts.append(text(1140, ty, "JetBrains Mono · code", 13, muted, weight=700))
    parts.append(text(1140, ty + 40, "!= => <= -> ===", 20, fg, MONO))
    parts.append(text(48, ty + 120, "Slide scale (ratio 1.3, base 20 pt): 16 · 20 · 26 · 34 · 44 · 57 · 74 pt."
                      "  Links --navy-deep. Focus/highlight --tangerine.", 15, muted))
    parts.append(text(48, ty + 146, "Text on fills: ink on teal, yellow, green, sky, tangerine; "
                      "on-navy on navy; on-coral on coral-solid; on-grape on grape.", 15, muted))

    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">' + "".join(parts) + "</svg>"


def main(fonts_dir, out_dir):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    conf = out / "fonts.conf"
    conf.write_text(
        '<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig>'
        f"<dir>{Path(fonts_dir).resolve()}</dir><cachedir>{Path(__file__).resolve().parent.parent}/build/fc-cache</cachedir></fontconfig>"
    )
    env = {**os.environ, "FONTCONFIG_FILE": str(conf.resolve()), "PANGOCAIRO_BACKEND": "fc"}
    for theme in VARIANTS:
        svg = out / f"reference-{theme}.svg"
        svg.write_text(sheet(theme))
        subprocess.run(["rsvg-convert", "-z", "1", "-o", out / f"reference-{theme}.png", svg], check=True, env=env)
    conf.unlink()


if __name__ == "__main__":
    main(*sys.argv[1:])
