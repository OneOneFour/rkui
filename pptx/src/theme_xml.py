"""Theme parts: colour scheme, font scheme, format scheme and default shape/line/text styles."""
from ooxml import NS_A, XML_HEAD, clr, hard_shadow, line, solid
from palette import (CUSTOM_COLOURS, EXTRUSIONS, OUTLINE_PT, PRESSED_SHADOW_PT, SHADOW_PT,
                     VARIANT_NAMES, hex_of, shadow_hex, shadow_style, theme_slots)

HEADING_FONT = "Roboto Slab"
BODY_FONT = "Xmind"


def colour_scheme(theme):
    slots, _ = theme_slots(theme)
    order = ["dk1", "lt1", "dk2", "lt2", *[f"accent{i}" for i in range(1, 7)], "hlink", "folHlink"]
    body = "".join(f'<a:{k}><a:srgbClr val="{slots[k]}"/></a:{k}>' for k in order)
    return f'<a:clrScheme name="rk-toon {VARIANT_NAMES[theme]}">{body}</a:clrScheme>'


def font_scheme():
    def font(face):
        return f'<a:latin typeface="{face}"/><a:ea typeface=""/><a:cs typeface=""/>'

    return (
        f'<a:fontScheme name="rk-toon"><a:majorFont>{font(HEADING_FONT)}</a:majorFont>'
        f"<a:minorFont>{font(BODY_FONT)}</a:minorFont></a:fontScheme>"
    )


def format_scheme(theme):
    """Flat fills only; outlines in --line and hard shadows so the Shape Styles gallery stays toon.
    Gallery styles have many fills, so option D's gallery shadows use the neutral --shadow-lit."""
    edge = hex_of("line", theme)
    drop = shadow_hex(theme)
    flat = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>'
    lines = (
        f'<a:ln w="19050" cap="rnd" cmpd="sng" algn="ctr">{solid("phClr")}<a:prstDash val="solid"/><a:round/></a:ln>'
        f'<a:ln w="19050" cap="rnd" cmpd="sng" algn="ctr">{solid(edge)}<a:prstDash val="solid"/><a:round/></a:ln>'
        f'<a:ln w="28575" cap="rnd" cmpd="sng" algn="ctr">{solid(edge)}<a:prstDash val="solid"/><a:round/></a:ln>'
    )
    effects = (
        "<a:effectStyle><a:effectLst/></a:effectStyle>"
        f"<a:effectStyle>{hard_shadow(drop, PRESSED_SHADOW_PT)}</a:effectStyle>"
        f"<a:effectStyle>{hard_shadow(drop, SHADOW_PT)}</a:effectStyle>"
    )
    return (
        f'<a:fmtScheme name="rk-toon"><a:fillStyleLst>{flat * 3}</a:fillStyleLst>'
        f"<a:lnStyleLst>{lines}</a:lnStyleLst><a:effectStyleLst>{effects}</a:effectStyleLst>"
        f"<a:bgFillStyleLst>{flat * 3}</a:bgFillStyleLst></a:fmtScheme>"
    )


def object_defaults(theme):
    """New shapes look like the default (yellow) rk-button; new lines and text boxes are plain ink.
    A theme holds one shadow colour, so option D's default shadow is the yellow extrusion."""
    edge = hex_of("line", theme)
    drop = shadow_hex(theme, "yellow")
    label = hex_of("on-fill", theme)
    text = "tx1"
    shape = (
        "<a:spDef><a:spPr>"
        f'{solid("accent2")}{line(OUTLINE_PT, edge)}{hard_shadow(drop, SHADOW_PT)}'
        '</a:spPr><a:bodyPr rtlCol="0" anchor="ctr"/>'
        '<a:lstStyle><a:defPPr algn="ctr"><a:defRPr b="1"/></a:defPPr></a:lstStyle>'
        '<a:style><a:lnRef idx="2"><a:schemeClr val="tx1"/></a:lnRef>'
        '<a:fillRef idx="1"><a:schemeClr val="accent2"/></a:fillRef>'
        '<a:effectRef idx="3"><a:schemeClr val="tx1"/></a:effectRef>'
        f'<a:fontRef idx="minor">{clr(label)}</a:fontRef></a:style></a:spDef>'
    )
    connector = (
        f'<a:lnDef><a:spPr>{line(OUTLINE_PT, "tx1")}</a:spPr><a:bodyPr/><a:lstStyle/>'
        '<a:style><a:lnRef idx="1"><a:schemeClr val="tx1"/></a:lnRef>'
        '<a:fillRef idx="0"><a:schemeClr val="tx1"/></a:fillRef>'
        '<a:effectRef idx="0"><a:schemeClr val="tx1"/></a:effectRef>'
        f'<a:fontRef idx="minor">{clr(text)}</a:fontRef></a:style></a:lnDef>'
    )
    text_box = (
        '<a:txDef><a:spPr><a:noFill/></a:spPr><a:bodyPr wrap="square" rtlCol="0"><a:spAutoFit/></a:bodyPr>'
        '<a:lstStyle><a:defPPr algn="l"><a:defRPr/></a:defPPr></a:lstStyle>'
        '<a:style><a:lnRef idx="0"><a:schemeClr val="tx1"/></a:lnRef>'
        '<a:fillRef idx="0"><a:schemeClr val="tx1"/></a:fillRef>'
        '<a:effectRef idx="0"><a:schemeClr val="tx1"/></a:effectRef>'
        f'<a:fontRef idx="minor">{clr(text)}</a:fontRef></a:style></a:txDef>'
    )
    return f"<a:objectDefaults>{shape}{connector}{text_box}</a:objectDefaults>"


def custom_colours(theme):
    """Extra tokens in the colour picker. Option D's master lists the extrusions first, so shadow
    colours are one click away when restyling a shape."""
    named = [(name, hex_of(name, theme)) for name in CUSTOM_COLOURS]
    if shadow_style(theme) == "extrude":
        shadows = [("shadow-lit", hex_of("shadow-lit", theme))]
        shadows += [(f"{fill} shadow", EXTRUSIONS[fill]) for fill in
                    ("yellow", "teal", "green", "coral-solid", "grape", "tangerine", "sky", "lilac", "apricot")]
        named = shadows + named
    items = "".join(f'<a:custClr name="{name}"><a:srgbClr val="{value}"/></a:custClr>' for name, value in named)
    return f"<a:custClrLst>{items}</a:custClrLst>"


def theme_xml(theme):
    return (
        f'{XML_HEAD}<a:theme xmlns:a="{NS_A}" name="rk-toon {VARIANT_NAMES[theme]}"><a:themeElements>'
        f"{colour_scheme(theme)}{font_scheme()}{format_scheme(theme)}</a:themeElements>"
        f"{object_defaults(theme)}<a:extraClrSchemeLst/>{custom_colours(theme)}</a:theme>"
    )
