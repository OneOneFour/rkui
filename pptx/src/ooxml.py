"""Small DrawingML/PresentationML string builders."""
from palette import emu

NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS_DECL = f'xmlns:a="{NS_A}" xmlns:r="{NS_R}" xmlns:p="{NS_P}"'
XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
SHADOW_DIR = 2700000  # 45 degrees: down and to the right


def clr(c, alpha=None):
    """A colour element. c is a theme slot such as 'tx1' / 'accent2', or an RRGGBB hex string."""
    inner = f'<a:alpha val="{alpha}"/>' if alpha is not None else ""
    if len(c) == 6 and all(ch in "0123456789ABCDEF" for ch in c):
        return f'<a:srgbClr val="{c}">{inner}</a:srgbClr>'
    return f'<a:schemeClr val="{c}">{inner}</a:schemeClr>'


def solid(c, alpha=None):
    return f"<a:solidFill>{clr(c, alpha)}</a:solidFill>"


def line(width_pt, c, dash=None):
    dash_xml = f'<a:prstDash val="{dash}"/>' if dash else ""
    return f'<a:ln w="{emu(width_pt)}">{solid(c)}{dash_xml}</a:ln>'


NO_LINE = "<a:ln><a:noFill/></a:ln>"


def hard_shadow(c, dist_pt):
    """The toon shadow: an offset copy with zero blur, fully opaque."""
    return (
        f'<a:effectLst><a:outerShdw blurRad="0" dist="{emu(dist_pt)}" dir="{SHADOW_DIR}" '
        f'algn="tl" rotWithShape="0">{clr(c)}</a:outerShdw></a:effectLst>'
    )


def inset_shadow(c, dist_pt, alpha):
    return (
        f'<a:effectLst><a:innerShdw blurRad="0" dist="{emu(dist_pt)}" dir="{SHADOW_DIR}">'
        f"{clr(c, alpha)}</a:innerShdw></a:effectLst>"
    )


def geom(prst="rect", adj=None):
    av = f'<a:gd name="adj" fmla="val {adj}"/>' if adj is not None else ""
    return f'<a:prstGeom prst="{prst}"><a:avLst>{av}</a:avLst></a:prstGeom>'


def round_adj(radius_pt, w, h):
    """roundRect's adj value for a corner radius, given the shape's size in points."""
    return min(50000, int(round(radius_pt / min(w, h) * 100000)))


def xfrm(x, y, w, h):
    return f'<a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>'


def run_props(tag="a:defRPr", sz=None, b=None, i=None, color=None, font=None, caps=False, spc=None):
    """Character properties. font is '+mj' (headings), '+mn' (body) or a typeface name."""
    attrs = ' lang="en-US"' if tag == "a:rPr" else ""
    if sz is not None:
        attrs += f' sz="{int(round(sz * 100))}"'
    if b is not None:
        attrs += f' b="{1 if b else 0}"'
    if i is not None:
        attrs += f' i="{1 if i else 0}"'
    if caps:
        attrs += ' cap="all"'
    if spc is not None:
        attrs += f' spc="{spc}"'
    kids = solid(color) if color else ""
    if font in ("+mj", "+mn"):
        kids += f'<a:latin typeface="{font}-lt"/><a:ea typeface="{font}-ea"/><a:cs typeface="{font}-cs"/>'
    elif font:
        kids += f'<a:latin typeface="{font}"/><a:cs typeface="{font}"/>'
    return f"<{tag}{attrs}>{kids}</{tag}>" if kids else f"<{tag}{attrs}/>"


def para_props(level=1, algn=None, mar_l=None, indent=None, line_pct=None, before_pt=None,
               bullet=None, bullet_color=None, rpr=""):
    """Paragraph properties for a lstStyle level. bullet is None (inherit), 'none' or a character."""
    attrs = ""
    if mar_l is not None:
        attrs += f' marL="{emu(mar_l)}"'
    if indent is not None:
        attrs += f' indent="{emu(indent)}"'
    if algn:
        attrs += f' algn="{algn}"'
    kids = ""
    if line_pct is not None:
        kids += f'<a:lnSpc><a:spcPct val="{line_pct * 1000}"/></a:lnSpc>'
    if before_pt is not None:
        kids += f'<a:spcBef><a:spcPts val="{int(before_pt * 100)}"/></a:spcBef>'
    if bullet == "none":
        kids += "<a:buNone/>"
    elif bullet:
        if bullet_color:
            kids += f"<a:buClr>{clr(bullet_color)}</a:buClr>"
        kids += f'<a:buFont typeface="Arial"/><a:buChar char="{bullet}"/>'
    kids += rpr
    return f"<a:lvl{level}pPr{attrs}>{kids}</a:lvl{level}pPr>"


def body_pr(anchor="t", inset_pt=0, autofit=True, wrap=True):
    ins = emu(inset_pt)
    fit = "<a:normAutofit/>" if autofit else ""
    wrap_attr = ' wrap="square"' if wrap else ' wrap="none"'
    return (
        f'<a:bodyPr{wrap_attr} lIns="{ins}" tIns="{ins}" rIns="{ins}" bIns="{ins}" '
        f'anchor="{anchor}" rtlCol="0">{fit}</a:bodyPr>'
    )


def paragraphs(lines):
    """Text paragraphs; each item is text, or (text, level) for an indented level."""
    out = ""
    for item in lines:
        text, level = item if isinstance(item, tuple) else (item, 0)
        ppr = f'<a:pPr lvl="{level}"/>' if level else ""
        run = f'<a:r><a:rPr lang="en-US"/><a:t>{text}</a:t></a:r>' if text else ""
        out += f'<a:p>{ppr}{run}<a:endParaRPr lang="en-US"/></a:p>'
    return out


SLIDE_NUMBER_PARA = (
    '<a:p><a:fld id="{B6F15528-21DE-4FAA-801E-634DDDAF4B2B}" type="slidenum">'
    '<a:rPr lang="en-US"/><a:t>&#8249;#&#8250;</a:t></a:fld><a:endParaRPr lang="en-US"/></a:p>'
)


def placeholder(shape_id, name, ph, box=None, sp_pr="", txbody_pr=None, lst="", text=None,
                text_xml=None):
    """A placeholder shape. ph holds the <p:ph> attributes, e.g. {'type': 'title'}."""
    ph_attrs = "".join(f' {k}="{v}"' for k, v in ph.items())
    geometry = xfrm(*box) if box else ""
    sp_pr_xml = f"<p:spPr>{geometry}{sp_pr}</p:spPr>" if (geometry or sp_pr) else "<p:spPr/>"
    is_pic = ph.get("type") == "pic"
    locks = '<a:spLocks noGrp="1"/>'
    body = ""
    if text_xml is not None or text is not None or txbody_pr is not None or not is_pic:
        content = text_xml if text_xml is not None else paragraphs(text or [""])
        body = f'<p:txBody>{txbody_pr or "<a:bodyPr/>"}<a:lstStyle>{lst}</a:lstStyle>{content}</p:txBody>'
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{shape_id}" name="{name}"/><p:cNvSpPr>{locks}</p:cNvSpPr>'
        f"<p:nvPr><p:ph{ph_attrs}/></p:nvPr></p:nvSpPr>{sp_pr_xml}{body}</p:sp>"
    )


def decoration(shape_id, name, box, sp_pr, txbody=None, text_box=False):
    """A fixed, non-placeholder shape on a master or layout."""
    c_nv = '<p:cNvSpPr txBox="1"/>' if text_box else "<p:cNvSpPr/>"
    body = txbody or ""
    return (
        f'<p:sp><p:nvSpPr><p:cNvPr id="{shape_id}" name="{name}"/>{c_nv}<p:nvPr userDrawn="1"/></p:nvSpPr>'
        f"<p:spPr>{xfrm(*box)}{sp_pr}</p:spPr>{body}</p:sp>"
    )


def sp_tree(shapes):
    return (
        '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
        '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/>'
        f'<a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>{"".join(shapes)}</p:spTree>'
    )
