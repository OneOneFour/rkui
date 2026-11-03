"""Slide masters and layouts, one set per theme."""
from ooxml import (NO_LINE, NS_DECL, SLIDE_NUMBER_PARA, XML_HEAD, body_pr, clr, decoration, geom,
                   hard_shadow, inset_shadow, line, para_props, placeholder, round_adj, run_props,
                   solid, sp_tree)
from palette import (CLR_MAP, MARGIN, OUTLINE_PT, RADIUS_PT, SHADOW_PT, SLIDE_H, SLIDE_W,
                     VARIANT_NAMES, hex_of, shadow_hex, shadow_style, step)

CODE_FONT = "JetBrains Mono"
CONTENT_W = SLIDE_W - 2 * MARGIN
TITLE_BOX = (MARGIN, 32, CONTENT_W, 80)
BODY_BOX = (MARGIN, 128, CONTENT_W, 340)
FOOTER_BOX = (MARGIN, 492, 600, 24)
NUMBER_BOX = (SLIDE_W - MARGIN - 48, 490, 48, 26)
BAND_H = 330

# Section-header bands: (layout name suffix, fill, label token). Fill is a theme slot or a token.
BANDS = [
    ("navy", "accent3", "on-navy"),
    ("teal", "accent1", "on-fill"),
    ("coral", "coral-solid", "on-coral"),
    ("yellow", "accent2", "on-fill"),
    ("green", "accent4", "on-fill"),
]


def no_bullet(size, color=None, font=None, b=None, caps=False, spc=None, line_pct=None, algn=None):
    """A level-1 list style with no bullet, for single-purpose text placeholders."""
    rpr = run_props(sz=size, color=color, font=font, b=b, caps=caps, spc=spc)
    return para_props(1, algn=algn, mar_l=0, indent=0, line_pct=line_pct, bullet="none", rpr=rpr)


def kicker_style(color):
    """Small uppercase label, as on the site's band kicker and code caption."""
    return no_bullet(step(-1), color=color, b=True, caps=True, spc=int(step(-1) * 10))


def footer_shapes(theme, ids=(90, 91), on_master=False):
    ftr_idx, num_idx = ("3", "4") if on_master else ("11", "12")
    muted = hex_of("muted", theme)
    footer = placeholder(
        ids[0], "Footer", {"type": "ftr", "sz": "quarter", "idx": ftr_idx}, FOOTER_BOX,
        txbody_pr=body_pr("ctr", autofit=False),
        lst=no_bullet(12, color=muted) if on_master else "", text=[""],
    )
    pill = ""
    lst = ""
    if on_master:
        w, h = NUMBER_BOX[2], NUMBER_BOX[3]
        # The slide number is a chip: raised fill, --line-unfilled outline (tx1), pill corners.
        pill = f'{geom("roundRect", 50000)}{solid(hex_of("raised", theme))}{line(OUTLINE_PT, "tx1")}'
        lst = no_bullet(12, color="tx1", b=True, algn="ctr")
    number = placeholder(
        ids[1], "Slide Number", {"type": "sldNum", "sz": "quarter", "idx": num_idx}, NUMBER_BOX,
        sp_pr=pill, txbody_pr=body_pr("ctr", autofit=False), lst=lst, text_xml=SLIDE_NUMBER_PARA,
    )
    return [footer, number]


def title_ph(box=TITLE_BOX, anchor="b", lst="", prompt="Slide title"):
    return placeholder(2, "Title", {"type": "title"}, box, txbody_pr=body_pr(anchor), lst=lst,
                       text=[prompt])


def content_ph(shape_id, idx, box, sz=None):
    ph = {"idx": str(idx)}
    if sz:
        ph["sz"] = sz
    return placeholder(shape_id, f"Content {idx}", ph, box, txbody_pr=body_pr("t"),
                       text=["Lorem ipsum dolor sit amet", ("Second level", 1), ("Third level", 2)])


def text_ph(shape_id, idx, box, lst, prompt, anchor="t", autofit=True):
    ph = {"type": "body", "idx": str(idx), "hasCustomPrompt": "1"}
    return placeholder(shape_id, f"Text {idx}", ph, box, txbody_pr=body_pr(anchor, autofit=autofit),
                       lst=lst, text=[prompt])


# Layouts: each returns (name, layout type or None for custom, shapes)

def layout_title(theme):
    edge = hex_of("line", theme)
    dots = []
    for i in range(6):
        sp = f'{geom("ellipse")}{solid(f"accent{i + 1}")}{line(OUTLINE_PT, edge)}'
        dots.append(decoration(10 + i, f"Palette dot {i + 1}", (MARGIN + i * 34, 440, 22, 22), sp))
    title = placeholder(
        2, "Title", {"type": "ctrTitle"}, (MARGIN, 140, CONTENT_W, 170), txbody_pr=body_pr("b"),
        lst=para_props(1, rpr=run_props(sz=step(4))), text=["Presentation title"],
    )
    subtitle = placeholder(
        3, "Subtitle", {"type": "subTitle", "idx": "1"}, (MARGIN, 326, CONTENT_W, 90),
        txbody_pr=body_pr("t"), lst=no_bullet(step(1), color=hex_of("muted", theme)),
        text=["Subtitle"],
    )
    return "Title", "title", [*dots, title, subtitle]


def layout_section(theme, hue, fill, label_token):
    fill_clr = fill if fill.startswith("accent") else hex_of(fill, theme)
    label = hex_of(label_token, theme)
    band = decoration(10, "Header band", (0, 0, SLIDE_W, BAND_H), f"{geom()}{solid(fill_clr)}{NO_LINE}")
    rule = decoration(11, "Header band edge", (0, BAND_H, SLIDE_W, 0),
                      f'{geom("line")}{line(OUTLINE_PT, hex_of("line", theme))}')
    kicker = text_ph(3, 1, (MARGIN, 136, CONTENT_W, 30), kicker_style(label), "Kicker", anchor="b",
                     autofit=False)
    title = title_ph((MARGIN, 172, CONTENT_W, 140), anchor="t",
                     lst=para_props(1, rpr=run_props(sz=step(4), color=label)), prompt="Section title")
    intro = text_ph(4, 2, (MARGIN, BAND_H + 32, CONTENT_W, 110), no_bullet(step(0)), "Optional text")
    name = f"Section header ({hue})"
    return name, ("secHead" if hue == "navy" else None), [band, rule, kicker, title, intro]


def layout_title_content(theme):
    return "Title and content", "obj", [title_ph(), content_ph(3, 1, BODY_BOX)]


def layout_two_content(theme):
    half = (CONTENT_W - 24) / 2
    left = content_ph(3, 1, (MARGIN, 128, half, 340), sz="half")
    right = content_ph(4, 2, (MARGIN + half + 24, 128, half, 340), sz="half")
    return "Two content", "twoObj", [title_ph(), left, right]


def layout_title_only(theme):
    return "Title only", "titleOnly", [title_ph()]


def layout_big_number(theme):
    number = text_ph(3, 1, (MARGIN, 112, CONTENT_W, 210),
                     no_bullet(step(7), color="tx2", font="+mj", b=True, line_pct=90), "00%", anchor="b")
    caption = text_ph(4, 2, (MARGIN, 336, CONTENT_W, 120), no_bullet(step(1)), "What the number means")
    return "Big number", None, [title_ph(), number, caption]


def layout_quote(theme):
    mark_run = run_props("a:rPr", sz=200, b=True, color="accent6", font="+mj")
    mark = decoration(
        10, "Quote mark", (MARGIN - 8, 24, 140, 200), f"{geom()}<a:noFill/>",
        txbody=f'<p:txBody>{body_pr("t", autofit=False)}<a:lstStyle/>'
               f"<a:p><a:r>{mark_run}<a:t>&#8220;</a:t></a:r></a:p></p:txBody>",
        text_box=True,
    )
    quote = text_ph(3, 1, (136, 120, 752, 250),
                    no_bullet(step(2), font="+mj", b=False, line_pct=100), "Quotation", anchor="ctr")
    who = text_ph(4, 2, (136, 390, 752, 40), no_bullet(step(0), color=hex_of("muted", theme)),
                  "Attribution", autofit=False)
    return "Quote", None, [mark, quote, who]


def layout_code(theme):
    panel_box = (MARGIN, 128, CONTENT_W, 348)
    # The code block: a slate panel pressed in by an inset shadow of --line at 20%.
    panel = decoration(
        10, "Code panel", panel_box,
        f'{geom("roundRect", round_adj(RADIUS_PT, *panel_box[2:]))}{solid(hex_of("slate", theme))}'
        f'{NO_LINE}{inset_shadow(hex_of("line", theme), SHADOW_PT, 20000)}',
    )
    caption = text_ph(3, 13, (MARGIN + 24, 140, 400, 24), kicker_style(hex_of("muted", theme)),
                      "Language", autofit=False)
    indent_pt = round(0.6 * step(-1) * 4)  # four monospace spaces
    levels = "".join(
        para_props(lvl, mar_l=(lvl - 1) * indent_pt, indent=0, line_pct=120, bullet="none",
                   rpr=run_props(sz=step(-1), font=CODE_FONT, color="tx1"))
        for lvl in range(1, 6)
    )
    code = placeholder(4, "Code", {"type": "body", "idx": "1", "hasCustomPrompt": "1"},
                       (MARGIN + 24, 172, CONTENT_W - 48, 288), txbody_pr=body_pr("t"), lst=levels,
                       text=["Code"])
    return "Code", None, [title_ph(), panel, caption, code]


def layout_chart(theme):
    chart = placeholder(3, "Chart", {"type": "chart", "idx": "1"}, (MARGIN, 128, CONTENT_W, 320))
    note = text_ph(4, 13, (MARGIN, 456, 760, 28), no_bullet(14, color=hex_of("muted", theme)),
                   "Source or note", autofit=False)
    return "Chart", None, [title_ph(), chart, note]


def layout_image_caption(theme):
    box = (MARGIN, MARGIN, 540, SLIDE_H - 2 * MARGIN - 16)
    edge = hex_of("line", theme)
    # An unfilled frame: --line in light, --shadow-lit in option D, a rimmed slab in option B.
    rimmed = shadow_style(theme) == "rim"
    shadow = "" if rimmed else hard_shadow(shadow_hex(theme), SHADOW_PT)
    picture = placeholder(
        3, "Picture", {"type": "pic", "idx": "1"}, box,
        sp_pr=f'{geom("roundRect", round_adj(RADIUS_PT, *box[2:]))}{line(OUTLINE_PT, edge)}{shadow}',
        txbody_pr=body_pr("ctr"), lst=no_bullet(step(-1), algn="ctr"), text=[""],
    )
    shapes = [picture]
    if rimmed:
        # Dark-mode shadow (--shadow-edge): a cream-rimmed slab behind the picture, not an effect.
        half = OUTLINE_PT / 2
        slab_box = (box[0] + SHADOW_PT - half, box[1] + SHADOW_PT - half, box[2] + OUTLINE_PT,
                    box[3] + OUTLINE_PT)
        slab = decoration(
            10, "Picture shadow", slab_box,
            f'{geom("roundRect", round_adj(RADIUS_PT + half, *slab_box[2:]))}{solid(edge)}'
            f'{line(OUTLINE_PT, hex_of("line-unfilled", theme))}',
        )
        shapes = [slab, picture]
    x = MARGIN + 540 + 36
    title = title_ph((x, 96, SLIDE_W - MARGIN - x, 140), lst=para_props(1, rpr=run_props(sz=step(1))),
                     prompt="Caption title")
    text = text_ph(4, 2, (x, 252, SLIDE_W - MARGIN - x, 200),
                   no_bullet(step(-1), color=hex_of("muted", theme)), "Caption text")
    return "Image and caption", "picTx", [*shapes, title, text]


def layout_blank(theme):
    return "Blank", "blank", []


def all_layouts(theme):
    layouts = [layout_title(theme)]
    layouts += [layout_section(theme, *band) for band in BANDS]
    layouts += [f(theme) for f in (layout_title_content, layout_two_content, layout_title_only,
                                   layout_big_number, layout_quote, layout_code, layout_chart,
                                   layout_image_caption, layout_blank)]
    return layouts


WITH_FOOTER = {"Title and content", "Two content", "Title only", "Big number", "Code", "Chart", "Blank"}


def layout_xml(theme, name, layout_type, shapes):
    if name in WITH_FOOTER:
        shapes = [*shapes, *footer_shapes(theme)]
    type_attr = f' type="{layout_type}"' if layout_type else ""
    return (
        f'{XML_HEAD}<p:sldLayout {NS_DECL}{type_attr} preserve="1"><p:cSld name="{name}">'
        f"{sp_tree(shapes)}</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>"
    )


def text_styles(theme):
    title = para_props(1, algn="l", line_pct=90, before_pt=0, bullet="none",
                       rpr=run_props(sz=step(2), b=True, color="tx1", font="+mj"))
    body_levels = [  # (indent pt, size, bullet)
        (24, step(0), "•"), (48, step(0), "–"), (72, step(-1), "•"),
        (96, step(-1), "–"), (120, step(-1), "•"),
    ]
    body = "".join(
        para_props(i, algn="l", mar_l=m, indent=-24, line_pct=120, before_pt=10, bullet=ch,
                   bullet_color="accent1", rpr=run_props(sz=sz, color="tx1", font="+mn"))
        for i, (m, sz, ch) in enumerate(body_levels, start=1)
    )
    other = para_props(1, algn="l", mar_l=0, indent=0, rpr=run_props(sz=step(0), color="tx1", font="+mn"))
    return (
        f"<p:txStyles><p:titleStyle>{title}</p:titleStyle><p:bodyStyle>{body}</p:bodyStyle>"
        f'<p:otherStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr>{other}</p:otherStyle></p:txStyles>'
    )


def master_xml(theme, layout_ids):
    """layout_ids: [(sldLayoutId, rId)]."""
    shapes = [
        placeholder(2, "Title", {"type": "title"}, TITLE_BOX, txbody_pr=body_pr("b"),
                    text=["Slide title"]),
        placeholder(3, "Text", {"type": "body", "idx": "1"}, BODY_BOX, txbody_pr=body_pr("t"),
                    text=["First level", ("Second level", 1), ("Third level", 2), ("Fourth level", 3),
                          ("Fifth level", 4)]),
        *footer_shapes(theme, on_master=True),
    ]
    ids = "".join(f'<p:sldLayoutId id="{i}" r:id="{r}"/>' for i, r in layout_ids)
    return (
        f'{XML_HEAD}<p:sldMaster {NS_DECL} preserve="1"><p:cSld name="rk-toon {VARIANT_NAMES[theme]}">'
        f'<p:bg><p:bgPr>{solid("bg2")}<a:effectLst/></p:bgPr></p:bg>{sp_tree(shapes)}</p:cSld>'
        f'<p:clrMap {CLR_MAP[theme]} accent1="accent1" accent2="accent2" accent3="accent3" '
        f'accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
        f"<p:sldLayoutIdLst>{ids}</p:sldLayoutIdLst>{text_styles(theme)}</p:sldMaster>"
    )
