"""Fills the template with a sample deck: every layout in the light master, the main ones in both
dark masters, plus components (buttons, chips, card, callouts, widget frame), a chart, icons, a
type scale and the palette. All text is placeholder text.

Usage: python build_sample.py <repo> <rk-toon-base.pptx> <out.pptx>
"""
import copy
import json
import subprocess
import sys
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.dml.color import RGBColor
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION
from pptx.enum.dml import MSO_THEME_COLOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.opc.package import Part
from pptx.opc.packuri import PackURI
from pptx.oxml.ns import qn
from pptx.util import Pt

from bake_icons import ICONS, bake
from ooxml import NS_A, hard_shadow, inset_shadow, line, solid, NO_LINE
from palette import (MARGIN, NOT_EXTRUDED, OUTLINE_PT, PRESSED_SHADOW_PT, RADIUS_PT, SHADOW_PT,
                     SLIDE_W, TOKENS, VARIANTS, hex_of, inset_hex, shadow_hex, shadow_style, step,
                     token_theme)
from layouts import CODE_FONT

HERE = Path(__file__).parent
CACHE = HERE.parent / "build/icon-cache"
SVG_EXT_URI = "{96DAC541-7B7A-43D3-8B79-37D633B846F1}"
NS_ASVG = "http://schemas.microsoft.com/office/drawing/2016/SVG/main"
RT_IMAGE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
THEME_SLOTS = {"tx1", "tx2", "bg1", "bg2", *(f"accent{i}" for i in range(1, 7))}


class Deck:
    """The presentation plus the master variant (light, dark, dark-colour) for the next slides."""

    def __init__(self, repo, base):
        self.repo = Path(repo)
        self.prs = Presentation(base)
        self.theme = "light"
        self.svg_parts = {}

    def c(self, token):
        """A colour for the current theme: theme slots pass through, tokens become hex."""
        return token if token in THEME_SLOTS else hex_of(token, self.theme)

    def add(self, layout_name):
        master = self.prs.slide_masters[VARIANTS.index(self.theme)]
        layout = next(l for l in master.slide_layouts if l.name == layout_name)
        slide = self.prs.slides.add_slide(layout)
        return slide


# Element helpers

def a_elements(xml):
    """Parses a run of DrawingML elements into a list."""
    wrapper = etree.fromstring(f'<w xmlns:a="{NS_A}">{xml}</w>')
    return list(wrapper)


def restyle(shape, sp_pr_xml):
    """Replaces a shape's fill, line and effects, and drops python-pptx's theme style reference."""
    sp_pr = shape._element.spPr
    for tag in ("a:solidFill", "a:noFill", "a:ln", "a:effectLst", "a:gradFill"):
        for el in sp_pr.findall(qn(tag)):
            sp_pr.remove(el)
    for el in a_elements(sp_pr_xml):
        sp_pr.append(el)
    style = shape._element.find(qn("p:style"))
    if style is not None:
        shape._element.remove(style)


def set_colour(font, colour):
    """Sets a font colour from a theme slot ('tx1', 'accent2') or an RRGGBB hex string."""
    if colour in THEME_SLOTS:
        names = {"tx1": "TEXT_1", "tx2": "TEXT_2", "bg1": "BACKGROUND_1", "bg2": "BACKGROUND_2"}
        name = names.get(colour, colour.replace("accent", "ACCENT_"))
        font.color.theme_color = getattr(MSO_THEME_COLOR, name)
    else:
        font.color.rgb = RGBColor.from_string(colour)


def write_text(frame, lines, size, colour, bold=False, font=None, align=None, anchor=None, inset=0):
    """Fills a text frame. lines is a list of strings or of [(text, colour, bold)] run lists."""
    frame.word_wrap = True
    for side in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
        setattr(frame, side, Pt(inset))
    if anchor:
        frame.vertical_anchor = anchor
    for n, item in enumerate(lines):
        para = frame.paragraphs[0] if n == 0 else frame.add_paragraph()
        if align:
            para.alignment = align
        runs = item if isinstance(item, list) else [(item, colour, bold)]
        for text, run_colour, run_bold in runs:
            run = para.add_run()
            run.text = text
            run.font.size = Pt(size)
            run.font.bold = run_bold
            if font:
                run.font.name = font
            set_colour(run.font, run_colour)


def text_box(slide, box, lines, size, colour="tx1", **kw):
    shape = slide.shapes.add_textbox(*(Pt(v) for v in box))
    write_text(shape.text_frame, lines, size, colour, **kw)
    return shape


def toon(deck, slide, box, fill, label=None, label_colour="on-fill", shadow=True, outline="line",
         radius=RADIUS_PT, size=step(-1), dash=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE, bold=True,
         pressed_in=False, excluded=NOT_EXTRUDED):
    """A shape in the toon style: outline, hard offset shadow (True, or a distance in pt), rounded
    corners. The shadow follows the master: --line in light, a separate cream-rimmed slab grouped
    with the shape in dark (option B), the fill's own extrusion in dark-colour (option D; fills in
    excluded fall back to --shadow-lit). pressed_in gives the inside shadow of a pressed unfilled
    button instead."""
    dist = SHADOW_PT if shadow is True else shadow
    rimmed = bool(shadow) and shadow_style(deck.theme) == "rim"
    shapes = slide.shapes
    if rimmed:
        shapes = slide.shapes.add_group_shape().shapes
        add_rimmed_slab(deck, shapes, box, dist, radius, shape)
    sp = shapes.add_shape(shape, *(Pt(v) for v in box))
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sp.adjustments[0] = min(0.5, radius / min(box[2], box[3]))
    fill_xml = solid(deck.c(fill)) if fill else "<a:noFill/>"
    line_xml = line(OUTLINE_PT, deck.c(outline), dash) if outline else NO_LINE
    shadow_xml = ""
    if shadow and not rimmed:
        shadow_xml = hard_shadow(shadow_hex(deck.theme, fill, excluded), dist)
    elif pressed_in:
        shadow_xml = inset_shadow(inset_hex(deck.theme), PRESSED_SHADOW_PT, None)
    restyle(sp, fill_xml + line_xml + shadow_xml)
    if label:
        write_text(sp.text_frame, [label], size, deck.c(label_colour), bold=bold, align=PP_ALIGN.CENTER,
                   anchor=MSO_ANCHOR.MIDDLE, inset=4)
    return sp


def add_rimmed_slab(deck, shapes, box, dist, radius, shape):
    """Dark-mode shadow (--shadow-edge): a --line copy at the shadow offset, widened by the outline
    width in --line-unfilled. The rim is a centred 1.5 pt line on a copy grown by half of it."""
    x, y, w, h = box
    half = OUTLINE_PT / 2
    slab_box = (x + dist - half, y + dist - half, w + OUTLINE_PT, h + OUTLINE_PT)
    slab = shapes.add_shape(shape, *(Pt(v) for v in slab_box))
    slab.name = "Shadow"
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        slab.adjustments[0] = min(0.5, (radius + half) / min(slab_box[2], slab_box[3]))
    restyle(slab, solid(deck.c("line")) + line(OUTLINE_PT, deck.c("line-unfilled")))


def add_slide_number(slide):
    """Copies the layout's slide-number chip onto the slide, as Header & Footer would."""
    for ph in slide.slide_layout.placeholders:
        if ph.placeholder_format.type is not None and "SLIDE_NUMBER" in str(ph.placeholder_format.type):
            el = copy.deepcopy(ph._element)
            el.find(".//" + qn("p:cNvPr")).set("id", str(slide.shapes._next_shape_id))
            number = list(slide.part.package.presentation_part.presentation.slides).index(slide) + 1
            el.find(".//" + qn("a:fld")).find(qn("a:t")).text = str(number)
            sp_pr = el.find(qn("p:spPr"))
            for child in list(sp_pr):
                sp_pr.remove(child)
            slide.shapes._spTree.append(el)


# Icons as SVG pictures with PNG fallbacks

def icon_files(deck, name, fill=None):
    CACHE.mkdir(parents=True, exist_ok=True)
    stem = f"{name}-{deck.theme}-{fill or 'default'}"
    svg, png = CACHE / f"{stem}.svg", CACHE / f"{stem}.png"
    if not svg.exists():
        source = (deck.repo / "packages/rk-ui/icons" / f"{name}.svg").read_text()
        svg.write_text(bake(source, TOKENS, token_theme(deck.theme), fill))
        subprocess.run(["rsvg-convert", "-w", "256", "-h", "256", "-o", png, svg], check=True)
    return svg, png


def add_icon(deck, slide, name, x, y, size, fill=None):
    svg, png = icon_files(deck, name, fill)
    pic = slide.shapes.add_picture(str(png), Pt(x), Pt(y), Pt(size), Pt(size))
    pic.name = f"Icon {name}"
    part = deck.svg_parts.get(svg)
    if part is None:
        partname = PackURI(f"/ppt/media/rk-icon-{len(deck.svg_parts) + 1}.svg")
        part = Part(partname, "image/svg+xml", deck.prs.part.package, svg.read_bytes())
        deck.svg_parts[svg] = part
    rid = slide.part.relate_to(part, RT_IMAGE)
    blip = pic._element.find(".//" + qn("a:blip"))
    ext_lst = etree.SubElement(blip, qn("a:extLst"))
    ext = etree.SubElement(ext_lst, qn("a:ext"), uri=SVG_EXT_URI)
    svg_blip = etree.SubElement(ext, f"{{{NS_ASVG}}}svgBlip", nsmap={"asvg": NS_ASVG})
    svg_blip.set(qn("r:embed"), rid)
    return pic


# Slides

def slide_title(deck):
    s = deck.add("Title")
    s.shapes.title.text = "Presentation title"
    s.placeholders[1].text = "Subtitle lorem ipsum"


def slide_section(deck, hue):
    s = deck.add(f"Section header ({hue})")
    s.placeholders[1].text = "Kicker · 01"
    s.shapes.title.text = "Section title"
    s.placeholders[2].text = LOREM


def slide_title_content(deck):
    s = deck.add("Title and content")
    s.shapes.title.text = "Slide title"
    body = s.placeholders[1].text_frame
    body.text = "Lorem ipsum dolor sit amet"
    for text, level in [("Consectetur adipiscing elit", 1), ("Sed do eiusmod tempor", 2),
                        ("Ut enim ad minim veniam", 0), ("Quis nostrud exercitation", 0)]:
        p = body.add_paragraph()
        p.text, p.level = text, level
    add_slide_number(s)


def slide_two_content(deck):
    s = deck.add("Two content")
    s.shapes.title.text = "Slide title"
    for idx in (1, 2):
        frame = s.placeholders[idx].text_frame
        frame.text = "Lorem ipsum dolor"
        for text in ("Sit amet consectetur", "Adipiscing elit"):
            frame.add_paragraph().text = text
    add_slide_number(s)


def slide_components(deck):
    s = deck.add("Title only")
    s.shapes.title.text = "Components"
    buttons = [("yellow", "on-fill"), ("teal", "on-fill"), ("green", "on-fill"), ("navy", "on-navy"),
               ("coral-solid", "on-coral"), ("grape", "on-grape")]
    for i, (fill, label) in enumerate(buttons):
        toon(deck, s, (MARGIN + i * 136, 132, 120, 40), fill, "Button", label)
    # Chips: pills on --raised, the selected one in --section; the fourth is pressed.
    chips = [("section", "on-section", "line", True), ("raised", "fg", "line-unfilled", True),
             ("raised", "fg", "line-unfilled", True), ("raised", "fg", "line-unfilled", PRESSED_SHADOW_PT)]
    for i, (fill, label, edge, shadow) in enumerate(chips):
        toon(deck, s, (MARGIN + i * 96, 192, 84, 28), fill, "Pressed" if i == 3 else "Chip", label,
             shadow=shadow, outline=edge, radius=14, size=14)
    toon(deck, s, (MARGIN + 4 * 96, 190, 96, 32), "yellow", "Pressed", "on-fill", shadow=PRESSED_SHADOW_PT)
    # Pressed, an unfilled button fills with --raised so its inside shadow shows.
    toon(deck, s, (MARGIN + 4 * 96 + 112, 190, 96, 32), "raised", "Unfilled", "fg", shadow=False,
         outline="line-unfilled", pressed_in=True)

    card_card(deck, s, (MARGIN, 248, 256, 228))
    callout(deck, s, (MARGIN + 280, 248, 296, 104), "sky-tint", "info", "teal", "Note")
    callout(deck, s, (MARGIN + 280, 372, 296, 104), "apricot-tint", "warning", "tangerine", "Warning")
    widget_frame(deck, s, (MARGIN + 600, 248, 264, 228))


def card_card(deck, s, box):
    x, y, w, h = box
    toon(deck, s, box, "raised")
    image = s.shapes.add_shape(MSO_SHAPE.ROUND_2_SAME_RECTANGLE, Pt(x), Pt(y), Pt(w), Pt(92))
    image.adjustments[0] = RADIUS_PT / 92
    restyle(image, solid(deck.c("sky-tint")) + NO_LINE)
    edge = s.shapes.add_connector(1, Pt(x), Pt(y + 92), Pt(x + w), Pt(y + 92))
    restyle(edge, line(OUTLINE_PT, deck.c("line")))
    add_icon(deck, s, "image", x + w / 2 - 22, y + 24, 44)
    text_box(s, (x + 16, y + 104, w - 32, 30), ["Card title"], step(0), "tx1", bold=True, font="+mj-lt")
    text_box(s, (x + 16, y + 134, w - 32, 20), ["Meta · 2026"], 12, deck.c("muted"))
    text_box(s, (x + 16, y + 158, w - 32, 60), [LOREM], 14, "tx1")


def callout(deck, s, box, tint, icon, icon_fill, title):
    x, y, w, h = box
    toon(deck, s, box, tint, shadow=False, outline=None)
    add_icon(deck, s, icon, x + 16, y + 16, 28, fill=icon_fill)
    text_box(s, (x + 56, y + 14, w - 72, h - 28), [[(title, "tx1", True)], LOREM], 14, "tx1")


def widget_frame(deck, s, box):
    x, y, w, h = box
    toon(deck, s, box, "lilac-tint", shadow=False, outline="line-unfilled", dash="dash")
    text_box(s, (x + 16, y + 12, w - 32, 28), ["Widget title"], step(0), "tx1", bold=True, font="+mj-lt")
    toon(deck, s, (x + 16, y + 48, w - 32, 116), "raised", shadow=False, outline=None)
    add_icon(deck, s, "wave-sine", x + w / 2 - 28, y + 78, 56)
    toon(deck, s, (x + 16, y + 178, 72, 30), "yellow", "Start", size=14)
    toon(deck, s, (x + 100, y + 178, 72, 30), "teal", "Reset", size=14)


def slide_code(deck):
    s = deck.add("Code")
    s.shapes.title.text = "Code slide"
    s.placeholders[13].text = "Python"
    kw, fn, st, num, com, txt = (deck.c(t) for t in
                                 ("code-keyword", "code-function", "code-string", "code-number",
                                  "code-comment", "fg"))
    lines = [
        [("# Lorem ipsum dolor sit amet", com, False)],
        [("def ", kw, False), ("lorem", fn, False), ("(ipsum, dolor=", txt, False), ("42", num, False),
         ("):", txt, False)],
        [("    ", txt, False), ('"""Consectetur adipiscing elit."""', st, False)],
        [("    ", txt, False), ("return ", kw, False), ("[ipsum * n ", txt, False), ("for ", kw, False),
         ("n ", txt, False), ("in ", kw, False), ("range", fn, False), ("(dolor)]", txt, False)],
        [("", txt, False)],
        [("x ", txt, False), ("!= ", txt, False), ("y ", txt, False), ("=> ", txt, False),
         ("a ", txt, False), ("<= ", txt, False), ("b", txt, False), ("  ", txt, False),
         ("# ligatures", com, False)],
    ]
    frame = s.placeholders[1].text_frame
    frame.paragraphs[0].text = ""
    for n, runs in enumerate(lines):
        para = frame.paragraphs[0] if n == 0 else frame.add_paragraph()
        for text, colour, _ in runs:
            run = para.add_run()
            run.text = text
            set_colour(run.font, colour)
    add_slide_number(s)


def slide_chart(deck):
    s = deck.add("Chart")
    s.shapes.title.text = "Chart slide"
    data = CategoryChartData()
    data.categories = ["Alpha", "Beta", "Gamma", "Delta"]
    values = [(4, 5, 3, 6), (3, 4, 5, 4), (5, 3, 4, 5), (2, 4, 6, 3), (4, 6, 2, 4), (3, 2, 5, 6)]
    for i, series in enumerate(values, start=1):
        data.add_series(f"Series {i}", series)
    frame = s.placeholders[1].insert_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, data)
    style_chart(deck, frame.chart)
    s.placeholders[13].text = "Source: lorem ipsum. Series use the theme accents in the site's order."
    add_slide_number(s)


def positive_axis_ids(chart):
    """python-pptx copies PowerPoint's negative axis ids; the schema wants unsigned ints."""
    for tag in ("c:axId", "c:crossAx"):
        for el in chart._chartSpace.iter(qn(tag)):
            el.set("val", str(int(el.get("val")) & 0xFFFFFFFF))


def transparent_chart_area(chart):
    """No fill or border on the chart area, so the slide shows through."""
    space = chart._chartSpace
    sp_pr = etree.SubElement(space, qn("c:spPr"))
    for el in a_elements("<a:noFill/><a:ln><a:noFill/></a:ln>"):
        sp_pr.append(el)
    space.remove(sp_pr)
    space.find(qn("c:chart")).addnext(sp_pr)


def style_chart(deck, chart):
    positive_axis_ids(chart)
    transparent_chart_area(chart)
    chart.font.size = Pt(14)
    set_colour(chart.font, deck.c("fg"))
    chart.has_legend = True
    chart.legend.position = XL_LEGEND_POSITION.BOTTOM
    chart.legend.include_in_layout = False
    chart.legend.font.size = Pt(14)
    set_colour(chart.legend.font, deck.c("fg"))
    plot = chart.plots[0]
    plot.gap_width = 60
    plot.overlap = -10
    for i, series in enumerate(plot.series, start=1):
        series.format.fill.solid()
        series.format.fill.fore_color.theme_color = getattr(MSO_THEME_COLOR, f"ACCENT_{i}")
        # Marks get the ink outline: several hues are under 3:1 on cream (PLAN 5.1 rule 5).
        series.format.line.width = Pt(OUTLINE_PT)
        set_line_colour(series.format.line, deck.c("line"))
    value_axis = chart.value_axis
    value_axis.has_major_gridlines = True
    value_axis.format.line.fill.background()
    gridline = value_axis.major_gridlines.format.line
    gridline.width = Pt(0.75)
    set_line_colour(gridline, deck.c("line-unfilled"), alpha=20000)
    category_axis = chart.category_axis
    category_axis.format.line.width = Pt(OUTLINE_PT)
    set_line_colour(category_axis.format.line, deck.c("line-unfilled"))
    for axis in (value_axis, category_axis):
        axis.tick_labels.font.size = Pt(14)
        set_colour(axis.tick_labels.font, deck.c("muted"))


def set_line_colour(line_format, colour, alpha=None):
    line_format.fill.solid()
    line_format.fill.fore_color.rgb = RGBColor.from_string(colour)
    if alpha is not None:
        srgb = line_format._get_or_add_ln().find(".//" + qn("a:srgbClr"))
        etree.SubElement(srgb, qn("a:alpha"), val=str(alpha))


def slide_big_number(deck):
    s = deck.add("Big number")
    s.shapes.title.text = "Slide title"
    s.placeholders[1].text = "42%"
    s.placeholders[2].text = LOREM
    add_slide_number(s)


def slide_quote(deck):
    s = deck.add("Quote")
    s.placeholders[1].text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
    s.placeholders[2].text = "Firstname Lastname"


def slide_image(deck, placeholder_png):
    s = deck.add("Image and caption")
    s.placeholders[1].insert_picture(str(placeholder_png))
    s.shapes.title.text = "Caption title"
    s.placeholders[2].text = LOREM


def slide_icons(deck):
    s = deck.add("Title only")
    s.shapes.title.text = "Icons"
    names = [ICONS[g][i] for i in range(4) for g in ICONS][:24]
    for n, name in enumerate(names):
        col, row = n % 8, n // 8
        x, y = MARGIN + 12 + col * 108, 136 + row * 112
        add_icon(deck, s, name, x + 14, y, 56)
        text_box(s, (x - 10, y + 62, 104, 20), [name], 11, deck.c("muted"), align=PP_ALIGN.CENTER)
    add_slide_number(s)


def slide_type_scale(deck):
    s = deck.add("Title only")
    s.shapes.title.text = "Type scale"
    y = 124
    for n in (5, 4, 3, 2, 1, 0, -1):
        size = step(n)
        heading = n >= 1
        text_box(s, (MARGIN, y, 120, size * 1.3), [f"step {n} · {size} pt"], 12, deck.c("muted"),
                 anchor=MSO_ANCHOR.MIDDLE)
        face = "+mj-lt" if heading else None
        text_box(s, (MARGIN + 130, y, 730, size * 1.3), ["Lorem ipsum" if heading else LOREM], size,
                 "tx1", bold=heading, font=face, anchor=MSO_ANCHOR.MIDDLE)
        y += size * 1.3 + 4
    text_box(s, (MARGIN + 130, y + 4, 730, 24), [[("JetBrains Mono · code · != => <=", "tx1", False)]],
             step(-1), "tx1", font=CODE_FONT)


def slide_palette(deck):
    s = deck.add("Title only")
    s.shapes.title.text = "Palette"
    rows = [
        ["surface", "raised", "fg", "muted", "line", "slate", "slate-tab", "on-navy"],
        ["teal", "yellow", "navy", "green", "sky", "coral", "grape", "tangerine"],
        ["navy-deep", "teal-deep", "coral-deep", "yellow-deep", "green-deep", "sky-deep", "grape-deep",
         "tangerine-deep"],
        ["navy-tint", "teal-tint", "coral-tint", "yellow-tint", "green-tint", "sky-tint", "lilac-tint",
         "apricot-tint"],
    ]
    for r, row in enumerate(rows):
        for c, token in enumerate(row):
            x, y = MARGIN + c * 108, 124 + r * 92
            toon(deck, s, (x, y, 96, 44), token, shadow=(r == 1), excluded=())
            text_box(s, (x, y + 48, 104, 34), [[(token, "tx1", True)], f"#{hex_of(token, deck.theme)}"],
                     10, deck.c("muted"))


def placeholder_image(repo, out):
    """A generated stand-in picture (no photo): the image icon on a sky tint."""
    sky, stroke = TOKENS["--sky-tint"]["light"], TOKENS["--fg"]["light"]
    icon = bake((Path(repo) / "packages/rk-ui/icons/image.svg").read_text(), TOKENS, "light")
    icon_body = icon.split(">", 1)[1].rsplit("</svg>", 1)[0]
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200">'
        f'<rect width="1600" height="1200" fill="{sky}"/>'
        f'<g transform="translate(560 360) scale(1.875)" fill="none" stroke="{stroke}" stroke-width="16" '
        f'stroke-linecap="round" stroke-linejoin="round">{icon_body}</g></svg>'
    )
    svg_path = out.with_suffix(".svg")
    svg_path.write_text(svg)
    subprocess.run(["rsvg-convert", "-o", out, svg_path], check=True)


def main(repo, base, out):
    deck = Deck(repo, base)
    picture = HERE.parent / "build/placeholder-image.png"
    placeholder_image(repo, picture)

    slide_title(deck)
    slide_section(deck, "navy")
    slide_title_content(deck)
    slide_two_content(deck)
    slide_components(deck)
    slide_code(deck)
    slide_chart(deck)
    slide_big_number(deck)
    slide_quote(deck)
    slide_image(deck, picture)
    slide_icons(deck)
    slide_type_scale(deck)
    slide_palette(deck)
    for hue in ("teal", "coral", "yellow", "green"):
        slide_section(deck, hue)

    deck.theme = "dark"
    slide_title(deck)
    slide_section(deck, "teal")
    slide_title_content(deck)
    slide_components(deck)
    slide_code(deck)
    slide_chart(deck)
    slide_image(deck, picture)
    slide_icons(deck)
    slide_palette(deck)

    deck.theme = "dark-colour"
    slide_title(deck)
    slide_section(deck, "teal")
    slide_title_content(deck)
    slide_components(deck)
    slide_code(deck)
    slide_chart(deck)
    slide_image(deck, picture)
    slide_palette(deck)

    deck.prs.save(out)
    print(f"{len(deck.prs.slides)} slides -> {out}")


if __name__ == "__main__":
    main(*sys.argv[1:])
