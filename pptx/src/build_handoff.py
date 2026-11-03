"""Assembles the Claude-on-the-web handoff: PROMPT.md with generated colour tables, tokens.json,
fonts, icons, reference sheets and the route-1 build, zipped.

Usage: python build_handoff.py <scratch root>
"""
import json
import shutil
import sys
import zipfile
from pathlib import Path

from pptx import Presentation

from palette import EXTRUSIONS, NOT_EXTRUDED, SERIES, TOKENS, hex_of, theme_slots

ON_FILLS = [
    ("teal, yellow, green, sky, lilac, tangerine, apricot", "on-fill"),
    ("navy", "on-navy"),
    ("coral-solid", "on-coral"),
    ("grape", "on-grape"),
    ("section (ink)", "on-section"),
    ("selected (yellow)", "on-selected"),
]


def colour_table():
    rows = ["| Token | Light | Dark |", "|---|---|---|"]
    rows += [f"| `{name}` | `{v['light']}` | `{v['dark']}` |" for name, v in TOKENS.items()]
    return "\n".join(rows)


def on_fill_table():
    rows = ["| Fill | Label token | Light | Dark |", "|---|---|---|---|"]
    for fills, token in ON_FILLS:
        rows.append(f"| {fills} | `--{token}` | `#{hex_of(token, 'light')}` | `#{hex_of(token, 'dark')}` |")
    return "\n".join(rows)


def extrusion_table():
    rows = ["| Fill | Fill (dark) | Shadow in option D |", "|---|---|---|"]
    for fill, shadow in EXTRUSIONS.items():
        note = " (buttons: use `--shadow-lit`)" if fill in NOT_EXTRUDED else ""
        rows.append(f"| `--{fill}` | `#{hex_of(fill, 'dark')}` | `#{shadow}`{note} |")
    rows.append(f"| anything else, unfilled, navy/section buttons, checked chips | — | `--shadow-lit` `#{hex_of('shadow-lit', 'dark')}` |")
    return "\n".join(rows)


def slot_table():
    light, light_src = theme_slots("light")
    dark, dark_src = theme_slots("dark")
    rows = []
    for slot in light:
        src_l = light_src.get(slot) or ("navy-deep" if slot == "hlink" else "grape-deep" if slot == "folHlink"
                                        else SERIES[int(slot[-1]) - 1])
        src_d = dark_src.get(slot) or src_l
        rows.append(f"| {slot} | `#{light[slot]}` ({src_l}) | `#{dark[slot]}` ({src_d}) |")
    return "\n".join(rows)


def main(root):
    root = Path(root)
    stage = root / "handoff/rk-toon-pptx-handoff"
    if stage.exists():
        shutil.rmtree(stage)
    stage.mkdir(parents=True)

    prompt = (root / "src/PROMPT.template.md").read_text()
    for key, value in {
        "COLOUR_TABLE": colour_table(),
        "ON_FILL_TABLE": on_fill_table(),
        "SLOT_TABLE": slot_table(),
        "SERIES": ", ".join(SERIES),
        "EXTRUSION_TABLE": extrusion_table(),
        "YELLOW_EXTRUSION": f"`#{EXTRUSIONS['yellow']}`",
        "SLIDE_COUNT": str(len(Presentation(root / "out/rk-toon-sample.pptx").slides)),
        "LINE_LIGHT": f"`#{hex_of('line', 'light')}`",
        "LINE_DARK": f"`#{hex_of('line', 'dark')}`",
    }.items():
        prompt = prompt.replace("{{" + key + "}}", value)
    assert "{{" not in prompt
    (stage / "PROMPT.md").write_text(prompt)

    shutil.copy(root / "build/tokens.json", stage / "tokens.json")
    shutil.copytree(root / "out/fonts", stage / "fonts")
    shutil.copytree(root / "out/icons", stage / "icons")
    shutil.copytree(root / "out/reference", stage / "reference")
    route1 = stage / "route1"
    route1.mkdir()
    for name in ("rk-toon.potx", "rk-toon-sample.pptx", "rk-toon.thmx", "rk-toon-dark.thmx",
                 "rk-toon-dark-colour.thmx"):
        shutil.copy(root / "out" / name, route1 / name)
    shutil.copy(root / "out/preview-contact-sheet.png", route1 / "preview-contact-sheet.png")
    shutil.copytree(root / "src", route1 / "src", ignore=shutil.ignore_patterns("__pycache__", "PROMPT*"))

    archive = root / "out/rk-toon-pptx-handoff.zip"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
        for path in sorted(stage.rglob("*")):
            if path.is_file() and path.name != ".DS_Store":
                z.write(path, path.relative_to(stage.parent))
    print(f"{archive} {archive.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main(*sys.argv[1:])
