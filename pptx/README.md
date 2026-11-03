# PowerPoint template

A PowerPoint template in the rk-ui toon style, generated from the library's tokens, with every value
baked in (PowerPoint can't read CSS variables). It has three masters, 45 layouts and a 34-slide
sample. The design language it follows is [docs/DESIGN.md](../docs/DESIGN.md); when it was built
and what is still to review are in [docs/DECISIONS.md](../docs/DECISIONS.md).

The last build, from 2026-11-02, is on Rob's Desktop in `~/Desktop/rk-toon-powerpoint/`:
- `rk-toon.potx` and `rk-toon-sample.pptx`;
- three `.thmx` themes;
- the TTF fonts;
- `rk-toon-pptx-handoff.zip`, a prompt plus assets for building a template with Claude on the web.

`HANDOFF-PROMPT.md` is a copy of that prompt.

## Masters and layouts

- **3 masters with identical layouts:** `rk-toon light`, `rk-toon dark` (the slab shadow) and
  `rk-toon dark colour shadows` (own-colour extrusion). Both dark masters use dark values and
  differ only in shadows.
- **15 layouts each, 45 in all:**
  - Title, with six accent dots;
  - Section header × 5: navy (`secHead`), teal, coral (`--coral-solid`), yellow, green;
  - Title and content, Two content, Title only;
  - Big number (125pt slab in `tx2`), Quote (a 200pt coral “);
  - Code (slate panel, JetBrains Mono), Chart, Image and caption, Blank.
- Section headers are the site's header band: full-width hue, no outline, a 1.5pt `--line` rule
  along the bottom, labels in the hue's `--on-*`.
- The slide number is a chip: pill, `--raised`, 1.5pt `tx1` outline. Bullets • and – in teal.

## Units, type and theme

- 960 × 540pt treated as 1280 × 720px: **1px = 0.75pt**.
  - Outline 1.5pt; shadow 3pt (pressed 1.5pt) at 45° down-right, zero blur, opaque.
  - Radius 7.5pt; margin 48pt (`--space-8`).
- Type: ratio 1.3 from a **20pt base** (16px × 1.25, for projection): 16, 20, 26, 34, 44, 57, 74pt
  for steps −1 to 5. Line spacing 90% headings, 120% body.
- Fonts: major Roboto Slab, minor Xmind. JetBrains Mono is set on code placeholders, since code has
  no theme slot.

| Slot | Light | Dark (both) |
|---|---|---|
| dk1 / lt1 | `--fg` / `--raised` | `--surface` / `--fg` |
| dk2 / lt2 | `--navy-deep` / `--surface` | `--raised` / `--navy-deep` |
| accent1–6 | teal, yellow, navy, green, sky, coral (the chart order) | same, dark values |
| hlink / folHlink | `--navy-deep` / `--grape-deep` | same |

- Colour maps give every master **bg1 = raised, tx1 = fg, bg2 = surface (slide background),
  tx2 = navy-deep**. Grape, tangerine and the other tokens are Custom Colours.
- Format scheme all flat. **A new shape is the default button:** yellow `accent2`, 1.5pt `--line`
  outline, 3pt hard shadow, bold ink text.

## Shadows

- Light: `--line`.
- Dark, slab: `--line`, with the cream rim drawn as a separate grouped slab shape behind the
  element: same geometry, offset 3pt, grown 0.75pt each side, `--line` fill, 1.5pt
  `--line-unfilled` outline.
- Dark, colour shadows: each fill's extrusion. Navy and section buttons, checked chips, neutral and
  unfilled things get `--shadow-lit`. The master lists the extrusions first under Custom Colours.
- Inside shadows (pressed unfilled button, checked tile): 1.5pt `--line` on every master; the
  pressed unfilled button fills `--raised`. The code panel's inset is `--line` at 20%.
- Charts: `accent1…6` in order, 1.5pt `--line` outlines, no chart-area fill. Icons: 87 Phosphor
  icons baked per theme (ink or cream stroke, width 16 of 256) as SVG with a PNG fallback.

## What PowerPoint can't do

| Site | Template |
|---|---|
| `light-dark()` tokens | one master per theme and shadow mode |
| Two-layer slab shadow | one outer shadow per shape: the rim is a separate shape, on sample shapes and the picture placeholder only |
| Shadow follows the fill | a theme names one shadow colour: the colour-shadow master's default shape has the yellow extrusion, and a recoloured shape keeps it until recoloured by hand. Its gallery styles use `--shadow-lit` |
| Turning light, depth, palettes | fixed: top-left light, normal depth, cream only |
| Pop, focus band, motion | none; focus only as tangerine highlighting |
| Heading weight 800 | Bold: the variable fonts are instanced to static 400/700 TTFs named as plain four-style families, so the B and I buttons work |
| Eight series | six accent slots; grape and tangerine are custom colours |
| Embedded fonts | Python can't write them: install the TTFs and turn on "Embed fonts" when saving (remove an installed Roboto Slab variable font first) |
| Masters and layouts | python-pptx can't create them: hand-written OOXML, with python-pptx only for sample slides |

## Regenerating

```sh
python3 -m venv pptx/.venv
pptx/.venv/bin/pip install -r pptx/requirements.txt
sh pptx/src/build_all.sh <path to a checkout with packages/rk-ui and scripts/check-contrast.mjs>
```

`<repo>` is the checkout whose tokens and icons it reads: today the site repo, since the scripts
still use its layout (see below). `requirements.txt` gives python-pptx, lxml, fonttools, pillow
and xlsxwriter. It also needs `node`, `rsvg-convert` (librsvg), ImageMagick's `magick`, and macOS
`qlmanage` for the rough previews (which ignore shadows).

`build_all.sh` runs these in order:
1. resolves the colour tokens and the colour-shadow extrusions to hex in `build/tokens.json`
   (`resolve-tokens.mjs`, using the contrast script's parser: `parseTokens`, `splitFallback`,
   `resolveColor`, `THEMES`);
2. builds static TTFs from the variable fonts (`build_fonts.py`);
3. bakes the icons (`bake_icons.py`);
4. builds the template (`build_template.py`: the `.potx`, a base `.pptx` and one `.thmx` per
   master) and the sample (`build_sample.py`, placeholder text only);
5. validates every part against the ECMA-376 transitional schemas (`validate.py`);
6. renders previews and a reference sheet;
7. assembles the handoff zip.

Outputs land in `pptx/out/`.

`pptx/downloads/` is git-ignored but kept locally. It holds:
- `fonts/`: the Roboto Slab and Xmind variable TTFs with their licences;
- `jbm/`: JetBrains Mono's static TTFs;
- `xsd/`: the OOXML schemas, from python-docx's `ref/xsd`.

## Needs updating before the next build

The template predates several token changes of 2026-11-02.
- **Paths:** the scripts read `packages/rk-ui/tokens.css`, `packages/rk-ui/icons` and
  `scripts/check-contrast.mjs` under `<repo>`. In this repo those are the split files in
  `src/tokens/`, `src/icons/` and `scripts/check-contrast.js`. Better still, read
  the `tokens.json` that the library build will emit.
- **Missing tokens:** the shading group (`--stripe`, `--shade`, `--folder-back`) and the
  sticky-note tokens aren't in its `tokens.json`.
  - The code inset should follow `--stripe` (25%), not 20% `--line`.
  - The extrusions should come from `--shade`, not the resolver's own oklab mix. The contrast
    script now resolves `color-mix()`, so this becomes a lookup.
- **Modes:** deep depth and the slate and greige palettes aren't represented. The colour shadow
  mode now lives in the library (`src/tokens/shadow-color.css`), and the slab-default,
  colour-as-a-mode ruling postdates the template's brief.
- **Icon stroke:** confirm the 16 (of 256) was meant; the library uses 21.
- **`HANDOFF-PROMPT.md`:** it still calls the slab shadow "provisional", names the old
  `shadow-variants.css`, and gives the code inset as 20%.
