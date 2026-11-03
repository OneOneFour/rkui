"""Writes the rk-toon template as OOXML: light, dark and dark-colour-shadow masters with their
layouts, no slides.

Usage: python build_template.py <out dir>
Writes rk-toon-base.pptx, rk-toon.potx and one .thmx per master.
"""
import sys
import zipfile
from pathlib import Path

from layouts import all_layouts, layout_xml, master_xml, text_styles
from ooxml import NS_A, NS_DECL, XML_HEAD
from palette import VARIANTS, emu, SLIDE_W, SLIDE_H
from theme_xml import theme_xml

CT = "application/vnd.openxmlformats-officedocument"
PML = f"{CT}.presentationml"
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL = "http://schemas.openxmlformats.org/package/2006/relationships"
FIRST_MASTER_ID = 2147483648


def rels(items):
    """items: [(rId, type suffix, target)]; types are under officeDocument/2006/relationships."""
    body = "".join(
        f'<Relationship Id="{rid}" Type="{kind if kind.startswith("http") else f"{REL}/{kind}"}" Target="{target}"/>'
        for rid, kind, target in items
    )
    return f'{XML_HEAD}<Relationships xmlns="{PKG_REL}">{body}</Relationships>'


def content_types(overrides):
    body = "".join(f'<Override PartName="{p}" ContentType="{t}"/>' for p, t in overrides)
    return (
        f'{XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        f"{body}</Types>"
    )


def default_text_style():
    levels = "".join(
        f'<a:lvl{i}pPr marL="{emu(24 * (i - 1))}" algn="l" rtl="0"><a:defRPr sz="2000">'
        '<a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:latin typeface="+mn-lt"/>'
        f'<a:ea typeface="+mn-ea"/><a:cs typeface="+mn-cs"/></a:defRPr></a:lvl{i}pPr>'
        for i in range(1, 10)
    )
    return f'<p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr>{levels}</p:defaultTextStyle>'


def package_parts(main_type):
    """Every part of the template package, as {path: xml}."""
    parts = {}
    overrides = []
    master_ids = []
    layout_no = 0
    next_id = FIRST_MASTER_ID
    for m, theme in enumerate(VARIANTS, start=1):
        master_id = next_id
        next_id += 1
        layouts = all_layouts(theme)
        layout_refs = []
        for j, (name, kind, shapes) in enumerate(layouts, start=1):
            layout_no += 1
            path = f"ppt/slideLayouts/slideLayout{layout_no}.xml"
            parts[path] = layout_xml(theme, name, kind, shapes)
            parts[f"ppt/slideLayouts/_rels/slideLayout{layout_no}.xml.rels"] = rels(
                [("rId1", "slideMaster", f"../slideMasters/slideMaster{m}.xml")]
            )
            overrides.append((f"/{path}", f"{PML}.slideLayout+xml"))
            layout_refs.append((next_id, f"rId{j}", f"../slideLayouts/slideLayout{layout_no}.xml"))
            next_id += 1
        parts[f"ppt/slideMasters/slideMaster{m}.xml"] = master_xml(theme, [(i, r) for i, r, _ in layout_refs])
        parts[f"ppt/slideMasters/_rels/slideMaster{m}.xml.rels"] = rels(
            [(r, "slideLayout", t) for _, r, t in layout_refs]
            + [(f"rId{len(layout_refs) + 1}", "theme", f"../theme/theme{m}.xml")]
        )
        parts[f"ppt/theme/theme{m}.xml"] = theme_xml(theme)
        overrides += [
            (f"/ppt/slideMasters/slideMaster{m}.xml", f"{PML}.slideMaster+xml"),
            (f"/ppt/theme/theme{m}.xml", f"{CT}.theme+xml"),
        ]
        master_ids.append((master_id, f"rId{m}"))

    master_list = "".join(f'<p:sldMasterId id="{i}" r:id="{r}"/>' for i, r in master_ids)
    parts["ppt/presentation.xml"] = (
        f'{XML_HEAD}<p:presentation {NS_DECL} saveSubsetFonts="1">'
        f"<p:sldMasterIdLst>{master_list}</p:sldMasterIdLst>"
        f'<p:sldSz cx="{emu(SLIDE_W)}" cy="{emu(SLIDE_H)}"/><p:notesSz cx="6858000" cy="9144000"/>'
        f"{default_text_style()}</p:presentation>"
    )
    n = len(VARIANTS)
    parts["ppt/_rels/presentation.xml.rels"] = rels(
        [(f"rId{m}", "slideMaster", f"slideMasters/slideMaster{m}.xml") for m in range(1, n + 1)]
        + [(f"rId{n + 1}", "presProps", "presProps.xml"),
           (f"rId{n + 2}", "viewProps", "viewProps.xml"),
           (f"rId{n + 3}", "theme", "theme/theme1.xml"),
           (f"rId{n + 4}", "tableStyles", "tableStyles.xml")]
    )
    parts["ppt/presProps.xml"] = f"{XML_HEAD}<p:presentationPr {NS_DECL}/>"
    parts["ppt/viewProps.xml"] = (
        f'{XML_HEAD}<p:viewPr {NS_DECL}><p:normalViewPr><p:restoredLeft sz="15620"/>'
        '<p:restoredTop sz="94660"/></p:normalViewPr><p:gridSpacing cx="76200" cy="76200"/></p:viewPr>'
    )
    parts["ppt/tableStyles.xml"] = f'{XML_HEAD}<a:tblStyleLst xmlns:a="{NS_A}" def="{{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}}"/>'
    parts["docProps/core.xml"] = (
        f'{XML_HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" '
        'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>rk-toon</dc:title>'
        '<dc:creator>Robert King</dc:creator>'
        '<dcterms:created xsi:type="dcterms:W3CDTF">2026-11-02T00:00:00Z</dcterms:created>'
        '<dcterms:modified xsi:type="dcterms:W3CDTF">2026-11-02T00:00:00Z</dcterms:modified>'
        "</cp:coreProperties>"
    )
    parts["docProps/app.xml"] = (
        f'{XML_HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">'
        "<Application>Microsoft Office PowerPoint</Application></Properties>"
    )
    parts["_rels/.rels"] = rels(
        [("rId1", "officeDocument", "ppt/presentation.xml"),
         ("rId2", f"{PKG_REL}/metadata/core-properties", "docProps/core.xml"),
         ("rId3", "extended-properties", "docProps/app.xml")]
    )
    overrides += [
        ("/ppt/presentation.xml", main_type),
        ("/ppt/presProps.xml", f"{PML}.presProps+xml"),
        ("/ppt/viewProps.xml", f"{PML}.viewProps+xml"),
        ("/ppt/tableStyles.xml", f"{PML}.tableStyles+xml"),
        ("/docProps/core.xml", "application/vnd.openxmlformats-package.core-properties+xml"),
        ("/docProps/app.xml", f"{CT}.extended-properties+xml"),
    ]
    parts["[Content_Types].xml"] = content_types(overrides)
    return parts


def write_zip(path, parts):
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", parts["[Content_Types].xml"])
        for name, data in parts.items():
            if name != "[Content_Types].xml":
                z.writestr(name, data)


def thmx_parts(theme):
    """A standalone Office theme file (colours, fonts, effects, default shape styles)."""
    return {
        "[Content_Types].xml": content_types(
            [("/theme/theme/themeManager.xml", f"{CT}.themeManager+xml"),
             ("/theme/theme/theme1.xml", f"{CT}.theme+xml")]
        ),
        "_rels/.rels": rels([("rId1", "officeDocument", "theme/theme/themeManager.xml")]),
        "theme/theme/themeManager.xml": f'{XML_HEAD}<a:themeManager xmlns:a="{NS_A}"/>',
        "theme/theme/_rels/themeManager.xml.rels": rels([("rId1", "theme", "theme1.xml")]),
        "theme/theme/theme1.xml": theme_xml(theme),
    }


def main(out):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    write_zip(out / "rk-toon-base.pptx", package_parts(f"{PML}.presentation.main+xml"))
    write_zip(out / "rk-toon.potx", package_parts(f"{PML}.template.main+xml"))
    write_zip(out / "rk-toon.thmx", thmx_parts("light"))
    write_zip(out / "rk-toon-dark.thmx", thmx_parts("dark"))
    write_zip(out / "rk-toon-dark-colour.thmx", thmx_parts("dark-colour"))


if __name__ == "__main__":
    main(*sys.argv[1:])
