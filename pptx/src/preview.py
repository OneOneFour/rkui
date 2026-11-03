"""Renders every slide of a deck with macOS Quick Look (which only draws the first slide), by
saving one single-slide copy per slide. Not PowerPoint's renderer: a rough check only.

Usage: python preview.py <deck.pptx> <out dir>
"""
import subprocess
import sys
from pathlib import Path

from pptx import Presentation

from palette import hex_of


def single_slide_copy(deck, keep, out):
    prs = Presentation(deck)
    id_list = prs.slides._sldIdLst
    for n, sld_id in reversed(list(enumerate(list(id_list)))):
        if n != keep:
            prs.part.drop_rel(sld_id.rId)
            id_list.remove(sld_id)
    prs.save(out)


def main(deck, out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    count = len(Presentation(deck).slides)
    copies = []
    for n in range(count):
        path = out / f"slide-{n + 1:02d}.pptx"
        single_slide_copy(deck, n, path)
        copies.append(str(path))
    subprocess.run(["qlmanage", "-t", "-s", "960", "-o", str(out), *copies], check=True,
                   stdout=subprocess.DEVNULL)
    for path in copies:
        Path(path).unlink()
    pngs = sorted(str(p) for p in out.glob("slide-*.pptx.png"))
    subprocess.run(["magick", "montage", *pngs, "-tile", "4x", "-geometry", "480x270+6+6",
                    "-background", "#" + hex_of("muted", "light"), str(out / "contact-sheet.png")], check=True)
    print(f"{len(pngs)} slides rendered")


if __name__ == "__main__":
    main(*sys.argv[1:])
