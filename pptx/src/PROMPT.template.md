# Build a PowerPoint template in the "rk-toon" style

You are building (or refining) a PowerPoint template for Rob King that matches the visual style of
his website's design package, rk-ui. This ZIP holds everything you need; you do not need the
website. Every colour below comes from the package's `tokens.css`. **Do not invent colours**: use
only the hex values in this file or `tokens.json`. Do not write real content: sample slides use
placeholder text only ("Slide title", "Lorem ipsum…").

## What is in this ZIP

| Path | What |
|---|---|
| `PROMPT.md` | This brief. |
| `tokens.json` | Every colour token resolved to hex for `light` and `dark`, the option D extrusion colours (`shadowD`), the chart series order, shape tokens. |
| `reference/reference-light.png`, `reference-dark.png`, `reference-dark-colour.png` | The look, one sheet per master: swatches, buttons, chips, a pressed unfilled button, card, callouts, code panel, dashed frame, type. Look at these first. SVG sources beside them. |
| `fonts/` | Static TTFs: Roboto Slab (Regular, Bold; Apache-2.0), Xmind (Regular, Bold, Italic, Bold Italic; OFL), JetBrains Mono (Regular, Bold, Italic; OFL). Licences in each folder. All have embedding permission (fsType 0). |
| `icons/light/svg`, `icons/dark/svg` | 87 Phosphor duotone icons with colours baked in (MIT; `LICENSE-phosphor.txt`). Light: ink stroke. Dark: cream stroke. |
| `icons/*/png` | The same icons as 256 px PNGs; `icons/contact-sheet-*.png` shows them all with names. |
| `route1/` | A first build: `rk-toon.potx` (template, no slides), `rk-toon-sample.pptx` ({{SLIDE_COUNT}}-slide sample deck), `rk-toon.thmx` / `rk-toon-dark.thmx` / `rk-toon-dark-colour.thmx` (one theme file per master), `preview-contact-sheet.png` (a rough macOS Quick Look render; it ignores outer and inner shadow effects, and fonts were not installed). |
| `route1/src/` | The Python that built route1 (hand-written OOXML for themes/masters/layouts, python-pptx for sample slides). Worked examples of every XML trick below. |

**Prefer refining `route1/` over starting again.** Open it, check it against the acceptance list at
the end, and fix what fails. If you rebuild, keep the same structure.

## The look in one paragraph

Flat, bright fills; a cream page (dark mode: deep night blue); slab-serif headings; "toon" edges:
interactive and raised things get a **2 px ink outline** and a **hard offset shadow with zero blur**
(4 px down-right, fully opaque, ink colour), with **10 px rounded corners** or full pill ends. Labels
on bright fills are ink, not white (white only on navy, deep coral and grape in light mode). Static
panels (callouts, code) have no outline. Code sits on a pale slate panel pressed in by an inner
shadow. Interactive figures sit in a dashed frame on a lilac tint.

## Three masters: light and two dark shadow options

A near-black shadow is hard to see on the night-blue page, and Rob is still choosing between two
fixes, so the template has **three masters** with identical layouts:

1. **Light** (`rk-toon light`): shadows in `--line`.
2. **Dark** (`rk-toon dark`), option B, the site's provisional default: the near-black `--line`
   shadow sits on a copy widened by the outline width (2 px) in `--line-unfilled` (cream), a rim
   that makes it read (`--shadow-edge`).
3. **Dark: colour shadows** (`rk-toon dark colour shadows`), option D, own-colour extrusion
   (`src/components/styleguide/shadow-variants.css` in the repo): a filled element's shadow is its
   own fill darkened, `color-mix(in oklab, <fill> 75%, var(--line))`. Neutral fills (raised cards,
   chips) and unfilled things use the slate `--shadow-lit`. Navy and section-coloured (ink)
   buttons, and checked chips, are excluded and use `--shadow-lit` too, because darkened they sit
   too close to the page. No rim. Colour swatch tiles use their own extrusion, navy included.

Option D extrusion colours (dark values, already resolved; light mode always uses `--line`):

{{EXTRUSION_TABLE}}

**Inside shadow** (a pressed unfilled button, a checked tile; `--shadow-inset`): 2 px (1.5 pt)
down-right, no blur, fully opaque, near-black **`--line`** on every master. A pressed unfilled
button also fills with **`--raised`**, so the inside shadow shows on the dark page. In OOXML: `<a:innerShdw blurRad="0" dist="19050" dir="2700000">`. The
code panel's 20 % inner shadow is separate and unchanged.

## Units

Slide: 16:9, 13.333 × 7.5 in = 960 × 540 pt = 12192000 × 6858000 EMU. Treat it as a 1280 × 720 px
page, so **1 CSS px = 0.75 pt = 9525 EMU** (1 pt = 12700 EMU).

| Token | Site | Slide | EMU |
|---|---|---|---|
| `--outline-width` | 2 px | 1.5 pt | 19050 |
| `--shadow-offset` (hard shadow, 45°, blur 0) | 4 px | 3 pt | 38100 |
| `--shadow-pressed` | 2 px | 1.5 pt | 19050 |
| `--radius` | 10 px | 7.5 pt | 95250 (roundRect `adj` = 7.5 / min(w, h) × 100000) |
| `--radius-pill` | 999 px | half the height (`adj` 50000) | |
| page margin (`--space-8`) | 64 px | 48 pt | 609600 |

**Type scale** (site ratio 1.3; slides use a 20 pt base, the site's 16 px × 1.25):
step −1 = 16 pt (fixed 0.8 × base), step 0 = 20, step 1 = 26, step 2 = 34, step 3 = 44, step 4 = 57,
step 5 = 74, step 7 = 125 pt.
Headings: **Roboto Slab**, weight 800 on the site → **Bold** in PowerPoint, line spacing 90 %
(≈ CSS 1.2). Body: **Xmind**, line spacing 120 % (≈ CSS 1.6). Code: **JetBrains Mono** (ligatures
on), 16 pt, 120 %. Small uppercase labels (kickers, code language): bold, all caps, letter-spacing
0.1 em (`spc` = size × 10, e.g. `spc="160"` at 16 pt).

## Colours

{{COLOUR_TABLE}}

Chart and series order (PLAN rule, checked for colour-blind separation): **{{SERIES}}**. In light
mode several series hues are under 3:1 on cream, so chart marks get the ink outline (1.5 pt) or
direct labels.

Text-on-fill rules (`--on-*` tokens):

{{ON_FILL_TABLE}}

## Theme (all three masters)

Three themes, one per master; both dark themes carry the dark token values.

| Slot | Light | Dark (both dark masters) |
|---|---|---|
{{SLOT_TABLE}}

Colour maps (`p:clrMap` on each master) give every master the same meaning: **bg1 = raised,
tx1 = fg, bg2 = surface (slide background), tx2 = navy-deep**.

- Light master: `bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2"`.
- Both dark masters: `bg1="dk2" tx1="lt1" bg2="dk1" tx2="lt2"`.

Fonts (`a:fontScheme`): major **Roboto Slab**, minor **Xmind**. Code has no theme slot; set
`JetBrains Mono` explicitly on code placeholders.

Custom colours (`a:custClrLst` after `a:extraClrSchemeLst`; PowerPoint shows them under Custom
Colors): grape, tangerine, lilac, apricot, coral-solid, muted, slate, teal-deep, coral-deep,
green-deep, then the tints and remaining deeps.

Format scheme (`a:fmtScheme`), all flat (no gradients anywhere):
- fills: three `solidFill phClr`; background fills the same.
- lines: 1.5 pt `phClr`; 1.5 pt `--line`; 2.25 pt `--line`.
- effects: none; hard shadow 1.5 pt; hard shadow 3 pt (both in `--line`).

Object defaults (`a:objectDefaults`) — new shapes look like the site's default button:

```xml
<a:spDef>
  <a:spPr>
    <a:solidFill><a:schemeClr val="accent2"/></a:solidFill>            <!-- yellow -->
    <a:ln w="19050"><a:solidFill><a:srgbClr val="LINE"/></a:solidFill></a:ln>
    <a:effectLst>
      <a:outerShdw blurRad="0" dist="38100" dir="2700000" algn="tl" rotWithShape="0">
        <a:srgbClr val="LINE"/>                                          <!-- alpha 100 % -->
      </a:outerShdw>
    </a:effectLst>
  </a:spPr>
  <a:bodyPr rtlCol="0" anchor="ctr"/>
  <a:lstStyle><a:defPPr algn="ctr"><a:defRPr b="1"/></a:defPPr></a:lstStyle>
  <a:style>
    <a:lnRef idx="2"><a:schemeClr val="tx1"/></a:lnRef>
    <a:fillRef idx="1"><a:schemeClr val="accent2"/></a:fillRef>
    <a:effectRef idx="3"><a:schemeClr val="tx1"/></a:effectRef>
    <a:fontRef idx="minor"><a:srgbClr val="1D232F"/></a:fontRef>        <!-- --on-fill (ink) -->
  </a:style>
</a:spDef>
```

`LINE` = `--line`: {{LINE_LIGHT}} light, {{LINE_DARK}} dark. The default shadow colour differs per
master: `--line` in light and dark (B); in dark-colour (D) it is the **yellow extrusion
{{YELLOW_EXTRUSION}}**, because the default shape is the yellow button. A theme can name only one
shadow colour, and a shape's shadow does not follow its fill, so in the D master a shape recoloured
to teal keeps the yellow extrusion until its shadow is recoloured too (Format Shape › Effects ›
Shadow › Color; the extrusions are the first entries under Custom Colors on that master). The
Shape Styles gallery's effect styles in D use the neutral `--shadow-lit`, since gallery styles span
every fill. Sample shapes on the D master set each shadow explicitly from the table above.

PowerPoint allows one outer shadow per shape, so the B rim cannot be a theme default either: the
dark (B) theme's default shape has the plain near-black shadow. Where the rim matters (sample shapes, the dark picture placeholder), draw it as
a separate shape behind the element, grouped with it: same geometry, offset 3 pt down-right,
grown by 0.75 pt on every side (corner radius + 0.75 pt), fill `--line`, 1.5 pt `--line-unfilled`
outline, no effect; the element itself then has no shadow. `route1/src/build_sample.py`
(`add_rimmed_slab`) and `layouts.py` (`layout_image_caption`) do this. `lnDef`: 1.5 pt `tx1` line, no
shadow. `txDef`: no fill, no line, `tx1` text, `spAutoFit`.

python-pptx cannot set any of this: write the theme XML directly (string templates, then zip), or
open the package with python-pptx and replace `ppt/theme/theme1.xml` / `theme2.xml` part blobs.
python-pptx also cannot create masters or layouts; build them as XML (see `route1/src/layouts.py`)
and use python-pptx only to add slides (`prs.slide_masters[1]` is dark B, `[2]` dark D). Shapes added by python-pptx carry a `p:style` that pulls theme effects and `lt1` text; to
get the toon look on a sample shape, set fill, `a:ln` and `a:effectLst` in `p:spPr` explicitly and
remove `p:style`.

## Masters and layouts

Each of the three masters has these layouts, same geometry, different token values. Both dark
masters use the dark theme colours; they differ only in shadows. Positions
are in pt (x, y, w, h). Placeholder text insets are 0 so text lines up with the 48 pt margin.

Master: background `bg2`; title (48, 32, 864, 80) anchored bottom, Roboto Slab Bold 34 pt `tx1`;
body (48, 128, 864, 340), Xmind 20 pt `tx1`, bullets • and – in `accent1`, hanging indent 24 pt
per level, levels 3–5 at 16 pt; footer (48, 492, 600, 24) 12 pt muted; slide number
(864, 490, 48, 26) as a **chip**: pill, `--raised` fill, 1.5 pt `tx1` outline, 12 pt bold, centred.

1. **Title** (`title`): title (48, 140, 864, 170) 57 pt anchored bottom; subtitle (48, 326, 864, 90)
   26 pt muted; six 22 pt palette dots (accent1–6, 1.5 pt `--line` outline) at y 440, 34 pt apart.
2. **Section header** × 5 hues — navy (`secHead`), teal, coral, yellow, green: a full-width band
   (0, 0, 960, 330) in the hue, no outline, with a 1.5 pt `--line` rule along its bottom edge (the
   site's header band). Kicker (48, 136, 864, 30): 16 pt bold caps, spacing 160, anchored bottom.
   Title (48, 172, 864, 140) 57 pt. Optional text below the band (48, 362, 864, 110) 20 pt. Band
   fill / label: navy `accent3` / `--on-navy`; teal `accent1` / `--on-fill`; coral `--coral-solid`
   / `--on-coral`; yellow `accent2` / `--on-fill`; green `accent4` / `--on-fill`.
3. **Title and content** (`obj`): title + content placeholder at the body box; footer, number.
4. **Two content** (`twoObj`): two content placeholders 420 pt wide, 24 pt gap.
5. **Title only** (`titleOnly`).
6. **Big number**: title; number (48, 112, 864, 210) Roboto Slab Bold 125 pt `tx2`, anchored bottom;
   caption (48, 336, 864, 120) 26 pt.
7. **Quote**: a decorative “ (Roboto Slab Bold 200 pt, `accent6`) at top left; quotation
   (136, 120, 752, 250) Roboto Slab regular 34 pt, centred vertically; attribution (136, 390, 752, 40)
   20 pt muted.
8. **Code**: title; slate panel (48, 128, 864, 348), radius 7.5 pt, no outline, inner shadow
   `<a:innerShdw blurRad="0" dist="38100" dir="2700000">` in `--line` at 20 % alpha; language label
   (72, 140, 400, 24) 16 pt bold caps muted; code placeholder (72, 172, 816, 288) JetBrains Mono
   16 pt `tx1`, no bullets, 120 % spacing, each level indented by four monospace spaces.
   Syntax colours: keyword `--code-keyword`, function `--code-function`, string `--code-string`,
   number `--code-number`, comment `--code-comment`.
9. **Chart**: title; chart placeholder (48, 128, 864, 320); note (48, 456, 760, 28) 14 pt muted.
   Charts: series fills `accent1…6` in order, 1.5 pt `--line` outline on marks, no chart-area
   fill or border, axis labels 14 pt muted, gridlines `--line-unfilled` at 20 % alpha 0.75 pt,
   category axis 1.5 pt `--line-unfilled`, legend at the bottom.
10. **Image and caption** (`picTx`): picture placeholder (48, 48, 540, 428) as a rounded rectangle
    with 1.5 pt `--line` outline and the hard 3 pt shadow (pictures inherit it). Dark B: no
    effect, a rimmed slab drawn on the layout behind it. Dark D: `--shadow-lit` (a picture has no
    fill token); caption title
    (624, 96, 288, 140) 26 pt anchored bottom; caption text (624, 252, 288, 200) 16 pt muted.
11. **Blank** (`blank`).

## Components (for the sample deck)

All sizes in pt.

- **Button**: roundRect 120 × 40, fill hue, 1.5 pt `--line` outline, hard 3 pt shadow, label Xmind
  Bold 16 pt in the matching `--on-*` colour. Default fill yellow. Variants: teal, green, navy,
  coral-solid, grape (and tangerine). Pressed state: 1.5 pt shadow. Unfilled button: no fill,
  1.5 pt `--line-unfilled` outline, no resting shadow; pressed, it fills with `--raised` and gets
  the inside shadow.
- **Chip**: pill 84 × 28, `--raised` fill, 1.5 pt `--line-unfilled` outline, the hard 3 pt shadow
  (1.5 pt when pressed), 600–700 weight. Selected: `--section` fill (ink), `--on-section` text,
  `--line` outline.
- **Shadow colour** on every element follows its master: `--line` (light); `--line` plus the
  cream-rimmed slab (dark B); the fill's extrusion or `--shadow-lit` (dark D).
- **Card**: `--raised`, 7.5 pt radius; linked cards add the outline and the hard shadow. Image strip
  at the top with a 1.5 pt `--line` rule beneath; title Roboto Slab Bold 20 pt; meta 12 pt muted.
- **Callout**: no outline, no shadow, 7.5 pt radius. Note: `--sky-tint` panel, icon fill `--teal`.
  Warning: `--apricot-tint` panel, icon fill `--tangerine`. Bold title, 14 pt text.
- **Widget frame**: `--lilac-tint` panel, 1.5 pt **dashed** `--line-unfilled` outline, title Roboto
  Slab Bold 20 pt, a `--raised` stage inside (no outline), small buttons below.
- **Focus / highlight**: `--tangerine` (where tangerine surrounds it, `--yellow`).
- **Icons**: use `icons/<theme>/svg`. In PowerPoint, insert SVG with a PNG fallback:
  `<a:blip r:embed="rIdPng"><a:extLst><a:ext uri="{96DAC541-7B7A-43D3-8B79-37D633B846F1}">
  <asvg:svgBlip xmlns:asvg="http://schemas.microsoft.com/office/drawing/2016/SVG/main"
  r:embed="rIdSvg"/></a:ext></a:extLst></a:blip>`. The SVG part has content type `image/svg+xml`.

## Fonts

The template names the fonts; it cannot carry them unless PowerPoint embeds them when saving
(File › Options › Save › "Embed fonts in the file", or on Mac: PowerPoint › Preferences › Save ›
Embed fonts). Python tools cannot write PowerPoint's embedded-font format reliably, so do not try:
the user installs the TTFs in `fonts/` and turns embedding on. If the Roboto Slab variable font is
already installed, remove it first or PowerPoint may pick the wrong instance.

## Acceptance checks

1. Every part is well-formed XML and validates against ECMA-376 transitional schemas
   (`route1/src/validate.py` does this with lxml); PowerPoint opens it with no repair prompt.
2. Theme colours, fonts and custom colours match the tables above exactly, in all three themes.
3. Three masters (light, dark, dark colour shadows), eleven layout kinds each (fifteen layouts
   with the five section bands), names as listed, every placeholder at the stated position.
4. A shape drawn fresh with Insert › Shapes is yellow with a 1.5 pt ink outline, a hard 3 pt
   offset shadow (blur 0, transparency 0 %, 45° down-right) and bold ink text, on every master;
   the shadow is `--line`, except on the D master where it is the yellow extrusion.
   Dark B sample shapes show the cream-rimmed slab; dark D sample shapes each have their own
   fill's extrusion (navy, section, neutral and unfilled: `--shadow-lit`), with no rim.
5. Inside shadows are `--line` on every master; the pressed unfilled button is filled `--raised`.
6. No gradients, soft shadows, glows, bevels or 3-D anywhere.
7. Text on every fill uses its `--on-*` colour; no bright hue is used for small text on cream
   (use the `-deep` variants for coloured text).
8. Charts use the accents in series order with ink outlines.
9. The sample deck shows every layout, the button row, chips, a pressed button, a pressed
   unfilled button, a card, both callouts, the widget frame, a code panel, a chart, icons, the
   type scale and the palette in light, and the main layouts on both dark masters.
10. Placeholder text only. No real titles, names, captions or photos.
