# rkui design language

What rkui looks like and how it behaves. Read it before adding a token, a component or a variant.
Usage and markup live in each file's header comment. When and why each rule was chosen, and the
questions still open, are in [DECISIONS.md](DECISIONS.md). The PowerPoint template has its own
notes in [pptx/README.md](../pptx/README.md).

## 1. Principles

**The look.** Flat, saturated fills on a cream page (deep night blue in dark mode), slab-serif
headings over a friendly sans, and "toon" edges: interactive things get a 2px ink outline and a
hard, unblurred offset shadow that falls away from one light, which the reader can turn. Clickable
things *pop*: they lift on hover and sink into their shadow on press. Labels on bright fills are
ink, not white. It draws on neo-brutalist graphics
([NN/G](https://www.nngroup.com/articles/neobrutalism/)) and replaces soft grey shadows.

**Non-negotiables.**
- **Colours only from tokens**, with semantic names (`--rkui-surface`, `--rkui-fg`, `--rkui-section`), so dark
  mode and palettes are token swaps. Mixes are `color-mix()` of tokens, named in the token files
  when they repeat (§2.5). A recipe that mixes a per-element value may stay in its component.
- **Text on bright fills is ink**, because white fails contrast on yellow and the other bright
  hues. White only on navy, and in light mode on `--rkui-coral-solid` and grape. Bright hues are never
  small text on the page: use the `-deep` step.
- **Every interactive thing has the 2px outline and the pop**, from one shared rule set
  (`src/interactive.css`), never per component. Static panels (callouts, code,
  equations) have no outline; text inputs are outlined but flat.
- **Hard shadows only:** zero blur, opaque, offsets always from `--rkui-shadow-dx`/`--rkui-shadow-dy`.
- **Focus is the tangerine highlighter band** hugging the outline, shadow off. Never removed.
- **Things move but never turn.** A shadowed thing only translates; parts that turn carry no
  shadow.
- **Discrete steps, never gradients.** No blur, glow or bevel, in illustrations, charts,
  third-party widgets and the PowerPoint template too.
- **WCAG AA:** every pair, both themes, every palette, checked by hand on the docs page's Colours
  section. Code text gets AAA (7:1).
- **Reduced motion:** nothing moves, shadows still change. **Forced colours:** meaning survives in
  system colours. Motion is never the only signal.
- **Platform first.** Native elements styled with CSS; JavaScript only enhances, and every
  component is usable without it.
- **Options, not one-offs.** An alternative look is an opt-in modifier class beside the default.
  Options still being compared are lettered A, B, C, as on the docs site.
- **Library boundary:** no site copy, no section names, no imports from a site; themed only through
  tokens. A site maps its own hues onto `--rkui-section`.

## 2. Tokens

All in `src/tokens/` (`colors.css`, `palettes.css`, `space.css`, `motion.css`,
`shadows.css`, `fallback.css`) unless noted. Colours are `light-dark(<light>, <dark>)` pairs.

### 2.1 Neutrals, lines and focus

| Token | Light | Dark | Use |
|---|---|---|---|
| `--rkui-surface` | `#f7f3e5` | `#1a1f2b` | page (cream palette) |
| `--rkui-raised` | `#fffaf0` | `#232a39` | cards, chips, tracks, unfilled press |
| `--rkui-fg` | `#1d232f` | `#f2eee2` | body text |
| `--rkui-muted` | `#5b6070` | `#a3a8b6` | captions, meta |
| `--rkui-line` | `#1d232f` | `#05070b` | outlines and hard shadows |
| `--rkui-line-unfilled` | = `--rkui-fg` | = `--rkui-fg` | outlines of things with no fill |
| `--rkui-ink` | `#1d232f` | `#1d232f` | ink, same in both themes |
| `--rkui-on-ink`, `--rkui-glint` | `#f7f3e5` | `#f2eee2` | text on ink; highlights on fills |
| `--rkui-shadow-lit` | = `--rkui-line` | `#6e7891` | colour mode: shadow of things without a fill |
| `--rkui-focus` / `--rkui-focus-alt` | `--rkui-tangerine` / `--rkui-yellow` | same | focus band; where tangerine surrounds it |

### 2.2 Hues

Fills stay vivid in both themes. Every hue has `-deep` (text and links on the page) and `-tint`
(panels carrying `--rkui-fg` text); tints flip to dark versions in dark mode so panels don't glare.
The auxiliary hues come in vivid and pale pairs that share steps: grape and lilac, tangerine and
apricot.

| Hue | Fill (light / dark) | `-deep` | `-tint` | Label |
|---|---|---|---|---|
| navy | `#2c4d6e` / `#4a78ad` | `#2c4d6e` / `#8fb3e0` | `#c7d5e6` / `#25364f` | `--rkui-on-navy` `#ffffff` |
| teal | `#2ea6b1` / `#3bb4bf` | `#176f78` / `#6fcfd7` | `#a6dfe3` / `#173f44` | `--rkui-on-fill` (ink) |
| coral | `#de4d45` / `#e8625a` | `#c8322a` / `#f08a83` | `#f6c1bb` / `#4d2623` | `--rkui-on-coral`, on `--rkui-coral-solid` |
| yellow | `#f4bc38` | `#856000` / `#f7d27a` | `#fbdf94` / `#4a3e18` | `--rkui-on-fill` |
| green | `#7bba3d` / `#86c44a` | `#3a7016` / `#a3d977` | `#c8e5a8` / `#2a4220` | `--rkui-on-fill` |
| sky | `#8fd3f7` | `#216b9a` / `#8fd3f7` | `#8fd3f7` / `#1e3a50` | `--rkui-on-fill` |
| grape | `#7b4fc9` / `#a584e6` | `#7b4fc9` / `#b89cf0` | = `--rkui-lilac-tint` | `--rkui-on-grape` |
| lilac | `#d4c4f5` | = `--rkui-grape-deep` | `#d4c4f5` / `#342c55` | `--rkui-on-fill` |
| tangerine | `#f58a2a` / `#f5923a` | `#a14c0a` / `#f8a65c` | = `--rkui-apricot-tint` | `--rkui-on-fill` |
| apricot | `#ffd2a6` | = `--rkui-tangerine-deep` | `#ffd2a6` / `#4a3324` | `--rkui-on-fill` |

- `--rkui-on-fill` = `--rkui-ink`. `--rkui-on-coral` and `--rkui-on-grape` are `#ffffff` in light mode, ink in dark.
- **`--rkui-coral-solid`** = `--rkui-coral-deep` light, `--rkui-coral` dark: coral for fills with small text.
  Bright `--rkui-coral` under white passes only as large text, so it is for display blocks and bands.
  Coral is the only hue with a `-solid` step.
- **`--rkui-coral-deep` `#c8322a`** is 4.79:1 as text on cream and 5.32:1 under white.
- **Auxiliary colours** have set jobs and are **never section colours**: grape (interactive
  accents, code and maths highlights), lilac (widget frames, equation pills), tangerine (warnings,
  work in progress, focus), apricot (`<mark>`, callouts, the `:target` flash). Every component that
  takes a `color` takes them too.
- **Recolouring a component:** every component with a colour takes it in one prop, `color`: a
  hue's name, which brings its label, `-tint` and dark-mode values, or a hex code for a colour
  outside the palette. A hex code is one colour in both themes, with no dark-mode value and no
  `-deep` step; its label and tint are worked out from it (§2.5), and its contrast is the author's
  to check. `colorVars()` in `src/shared/hues.ts` turns either into the component's custom
  properties. On a plain HTML page a hue is a modifier class, and any other colour is the custom
  properties the component's stylesheet names.
- **In JavaScript:** `import { colors } from '@oneonefour/rkui/colors.js'` gives every colour token
  that is a plain hex, light and dark (`colors.tealDeep.dark`). The build reads it from the token
  files (`build/colors.js`), so there is no second copy to drift.

### 2.3 Roles and code

| Token | Value | Use |
|---|---|---|
| `--rkui-selected` / `--rkui-on-selected` | `--rkui-yellow` / `--rkui-on-fill` | checked and selected controls |
| `--rkui-selected-tint` | `--rkui-yellow-tint` | the selected option's surroundings |
| `--rkui-section` / `--rkui-on-section` | unset; uses fall back to `--rkui-ink` / `--rkui-on-ink` | the site's section-hue hook |
| `--rkui-note-<hue>` | tint light, vivid fill dark | sticky notes (every hue but navy and teal); sky, lilac and apricot are their fill in both themes |
| `--rkui-note-tape` | `--rkui-glint` 60% | sticky-note tape |
| `--rkui-icon-fill-neutral` | `currentColor` 20% | quiet default fill for interface icons |
| `--rkui-slate` / `--rkui-slate-tab` | `#e7ebf3` / `#dbe0ea`; dark `#2c323d` / `#333946` | code panels, editor-tab strip |
| `--rkui-slate-greige` / `-tab` | `#eae7e2` / `#e0dcd6`; dark `#35332e` / `#3d3a34` | greige code, opt-in |

Syntax colours are deep steps: keyword `--rkui-navy-deep`, function `--rkui-teal-deep`, string
`--rkui-green-deep`, number `--rkui-tangerine-deep`, comment `--rkui-muted`, through Shiki's `css-variables`
theme. The language label is `--rkui-code-lang-color` (default `--rkui-muted`). The caption's mark
comes from the site (the `logo` slot), else Phosphor's file-type icon for the language, else the
file extension as grey text. Cool slate is the code
panel under every palette; `.rkui-slate-greige` opts in to greige.

### 2.4 Spacing and shape

`--rkui-space-1…8`: 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4rem. `--rkui-radius` 10px (buttons, cards, panels);
`--rkui-radius-pill` 999px (chips, toggles, tracks). `--rkui-outline-width` 2px. `--rkui-focus-width` 6px,
`--rkui-focus-offset` 0.

### 2.5 Shading

Repeated mixes are named, so the docs page can show them:
- `--rkui-stripe`: `--rkui-line` at 25% over whatever it crosses. Progress stripes, illustration hatching,
  the code panel's sunken edge.
- `--rkui-recess`: `--rkui-line` at 45% over whatever it crosses. The shadow inside a drawer's tray, a
  deeper recess than the code panel's.
- `--rkui-shade`: `color-mix(in oklab, var(--rkui-shade-of) 75%, var(--rkui-line))`; set `--rkui-shade-of` to a fill.
  The sticky-note fold and every colour-mode extrusion. Declared on `*`, so each element mixes its
  own.
- `--rkui-folder-back`: the page 8% towards `--rkui-line`, behind unselected folder tabs.
- A hex `color`'s label: `--rkui-on-fill` (ink), unless `--rkui-on-ink` has more contrast on it in
  both themes, worked out from the hex's WCAG luminance (`colorVars()`). It is the better of the
  two, not always AA: a mid-tone can fall short with both.
- A hex `color`'s tint: `light-dark(color-mix(in srgb, <hex> 35%, var(--rkui-raised)),
  color-mix(in srgb, <hex> 25%, var(--rkui-raised)))`. Pale enough in light mode, and dark enough
  in dark mode, to carry `--rkui-fg` at AA whatever the hex.
- A hex `color`'s colour-mode shadow is its `--rkui-shade`, as a hue's is. A dark hex's shade can
  be too close to the dark page to read, as navy's is; navy's is switched off, a hex's isn't.
- The table's lines (`table.css`), over the paper. The sheet's rules are `--rkui-stripe` in light
  mode and `--rkui-line-unfilled` at 40% in dark mode. The ledger's rules are `--rkui-sky-deep` at
  45% (50% dark) and its margin rule `--rkui-coral` at 70% (85% dark), like a notebook's blue rules
  and red margin.
- The ledger's shaded rows (`table.css`): `--rkui-raised` 5% towards `--rkui-line`, in oklab.
- `--rkui-illustration-red-shade` (80% to ink) and `--rkui-wave-line` (60% to `--rkui-line`) keep their own
  mixes, though each is close to a `--rkui-shade`.

### 2.6 Page palettes: `data-palette`

Cream is the default. Slate (cool grey) and greige (warm grey) are opt-ins on `<html>` or any
container, and `"cream"` switches back inside one.

| Palette | `--rkui-surface` (light / dark) | `--rkui-raised` (light / dark) |
|---|---|---|
| cream | `#f7f3e5` / `#1a1f2b` | `#fffaf0` / `#232a39` |
| slate | `#f1f3f8` / `#1f232b` | `#f9fafc` / `#282d37` |
| greige | `#f2f1ee` / `#252420` | `#faf9f8` / `#302e29` |

- Only the page colours change. The greys come from the code slates (light page 60% slate, 40%
  white; raised 25% slate; dark page 70% slate, 30% black; raised 90% slate).
- Code keeps the cool slate under every palette: on slate it sits the same luminance step from the
  page as on cream, and on greige it differs in hue too.
- **A token that mixes `--rkui-surface` must be redeclared on `[data-palette]`**, because a custom
  property resolves its `var()`s where it is declared: today `--rkui-folder-back` and the docs site's
  `--rkui-div-mid`.

### 2.7 Shadows, press and lift

Built on every element (`*`) from the light (`--rkui-shadow-dx`/`-dy`), the depth (`--rkui-shadow-depth`) and
the shadow colours (`--rkui-shadow-color`, `--rkui-shadow-edge`). Declared once on `:root` they would freeze,
and depth, light and shadow mode couldn't change inside a container.

| Token | Normal | Deep |
|---|---|---|
| `--rkui-shadow-offset` (resting) | 4px | 6px |
| `--rkui-shadow-offset-hover` | 6px | 9px |
| `--rkui-shadow-offset-pressed` | 2px | 3px |
| `--rkui-press-offset` (move on press) | 2px | 3px |
| `--rkui-lift-offset` (rise on hover) | 1px | 1.5px |
| `--rkui-depth-gap-scale` (gaps between raised neighbours) | 1 | 1.25 |

- **The recipe:** two layers, the shadow in `--rkui-shadow-color` at the offset, and the same widened by
  `--rkui-outline-width` in `--rkui-shadow-edge`. `--rkui-shadow`, `--rkui-shadow-hover`, `--rkui-shadow-pressed` all follow
  it; each offset has `-x`/`-y` forms.
- **Press equals rest:** press move + pressed shadow = resting shadow (2 + 2 = 4), so the outer edge
  stays put.
- `--rkui-shadow-inset`: pressed offset in `--rkui-line`, near-black in both themes.
- `--rkui-shadow-code-inset`: resting offset in `--rkui-stripe`, zero blur like every other shadow.

### 2.8 Modes

Attributes on `<html>` or any container (depth also on one element); each has a value that switches
back inside it.

| Mode | Attribute | Values | Mechanism |
|---|---|---|---|
| Theme | `data-theme` on `<html>` | `light`, `dark`, none = system | sets `color-scheme`; any container can set `color-scheme` itself |
| Palette | `data-palette` | `cream`, `slate`, `greige` | redeclares page colours and their mixes |
| Shadow | `data-shadow` | `slab`, `color`, `block` | `tokens/shadows.css` for `slab` and `block`; `tokens/shadow-color.css`: `@scope` from `color` to `slab` or `block` |
| Depth | `data-depth` | `normal`, `deep` | `--rkui-shadow-depth` 1 or 1.5 |
| Light | `style` on `<html>` | `--rkui-shadow-dx`/`-dy`, default 1, 1 | `<rkui-light-direction>` |

- **Theme:** `:root` is `color-scheme: light dark`. Tokens stay unregistered, because `@property`
  breaks `light-dark()`. The choice is stored under `rkui-theme`, shared by every site on the domain,
  and applied before first paint by `src/head-scripts/theme-init.js`, a classic script inlined in
  `<head>` (a module runs too late and flashes). `<rkui-theme-toggle>` is Light / Dark / System and
  syncs tabs and sites.
- **No `light-dark()`** (browsers before mid-2024): `tokens/fallback.css` gives the light theme on
  cream everywhere, palettes included. Checked by hand.
- **Light:** the angle names where light comes from, clockwise from 12. The default 315° (top left)
  gives dx = dy = 1: shadows fall down-right. `<rkui-light-direction>`
  (`src/components/light-direction/light-direction.js`) sets it from a range, or follows the sun (rises left
  at 6:00, overhead at noon, sets right at 18:00, default at night).
- `rkui-palette` and `rkui-shadow` are the docs site's own switch keys, not part of the theme contract.

## 3. Typography and maths

### 3.1 Fonts

| Role | Family | Token | Licence |
|---|---|---|---|
| Headings | Roboto Slab, weight 800 | `--rkui-font-display` | Apache-2.0 |
| Body and UI | Xmind | `--rkui-font-body` | OFL |
| Code, readouts | JetBrains Mono, ligatures on | `--rkui-font-mono` | OFL |

- Both main families have Greek and are variable. Slab headings give character; one sans for prose
  and widgets keeps them in one voice. Roboto Slab has no italics, so it never sets body text,
  except a quote (`.rkui-quote`, weight 400), which the serif sets apart from the prose around it.
- **Self-hosted and vendored.** Xmind isn't on Fontsource, plain files also suit vanilla sites, and
  pinning guards against changes to a very new font.
- Each family is split by `unicode-range` into latin, greek and a maths-symbols subset
  (≈ ≠ ≤ ≥ ∞ ∂ ∑ ∫ √), so "β ≈ 0.3" has no fallback seam; ← → and ∝ fall back. Woff2 files are
  never inlined into CSS. Licences ship beside the fonts.

### 3.2 Scale

Ratio **1.3**; `--rkui-step-0` = 1rem; h1–h4 use steps 4 to 1. **`--rkui-step--1` is fixed at 0.8rem**,
because 1 ÷ 1.3 (12.3px) is too small. Line height 1.6 body, 1.2 headings; `rem` everywhere.

### 3.3 Maths

KaTeX renders at build time; there is no runtime maths JavaScript.
- `.katex` is 1.15em (`--rkui-maths-scale`), where KaTeX's italic x-height matches Xmind's (KaTeX's
  default is 1.21em). Load KaTeX's stylesheet before rkui's. The size is still open (DECISIONS).
- **Equation references:** `\label{k}` and `\eqref{k}`; labelled equations are numbered, anchored
  `#eq-k` and linked, forward references work, and an unknown or duplicate label fails the build.
  No off-the-shelf plugin does this, so a small rehype plugin runs before KaTeX. The plugin is
  designed but not built yet.
  - A bare reference in prose is an `.rkui-eqref` pill; its brackets stay in spans, so it reads
    "(n)" without CSS.
  - One leading a sentence is the long pill: the `function` icon and "Equation (n)". Writing it
    as `\Cref` is proposed (DECISIONS).
  - Inside larger maths it is KaTeX's own `\href`, unstyled: KaTeX puts the next operator's spacing
    inside the link, so a pill would be lopsided.
- **Pills:** vivid `--rkui-lilac` with ink text in both themes, because the dark lilac tint is too close
  to the dark page.
- **Numbering:** both styles. A `\label` per `align` row numbers each row; one `\label` on an
  `aligned` or `gathered` display numbers the block once.
- **Wrappers:** `.rkui-equation` bare (default), `--panel` (slate), `--rule` (a grape rule down the
  left), `--key` (raised dashed panel on `--rkui-yellow-tint`, for a key result). `\boxed` keeps a
  thicker toon border. Wrappers are scroll regions for wide equations.
- **Colour-coded terms:** `rkui-maths-<hue>` always puts the hue's tint behind `--rkui-fg` text, never
  coloured text.
- A reference jump scrolls smoothly (off under reduced motion) and the target flashes
  `--rkui-apricot-tint`. KaTeX's `trust` allows only `#` links (`\href`) and `rkui-maths-*` classes
  (`\htmlClass`, behind `\teal{…}`-style macros).

## 4. The toon treatment

### 4.1 Outline and shadow

- 2px `--rkui-line` on interactive things (buttons, chips, linked cards, checkboxes, switches, thumbs,
  tiles). Things with no fill use `--rkui-line-unfilled` so the edge shows in dark mode (§10).
- Dashed outlines mean "a group", not a control: widget frame, file drop panel, pending panel, key
  equation.
- Hard shadow at 4px, zero blur, away from the light: the single biggest toon signal. One light
  drives every shadow and pop; glints sit opposite. SVG uses `drop-shadow()` from the same tokens,
  plus a second in `--rkui-shadow-edge`.

### 4.2 Dark-mode shadows: slab, colour and block

A near-black shadow is hard to see on night blue, so dark mode has three shadow modes.
- **The outlined slab is the default:** the shadow sits on a copy widened by the outline in
  `--rkui-shadow-edge`, cream in dark mode, transparent in light.
- **Own-colour extrusion is a supported mode** (`data-shadow="color"`). In dark mode a raised
  thing with a fill casts `--rkui-shade` of it, with no rim; light mode is unchanged.
  - Wired up: buttons, checked checkboxes, radios and switches, the arc dial's face, the clock's
    hour tag, the range thumb, the file button, colour tiles, badges (a table's stickers too),
    the three-dot spinners, the blind's pull, the scroll and sidebar pills, sticky notes.
  - Checked chips and section buttons take `--rkui-section` where it is set.
  - Navy buttons and badges, tinted badges, chips and section buttons on the default ink, and
    things without a fill (the page, panels, tints, the folder and the blind) cast
    `--rkui-shadow-lit`: their darkened fills sit too close to the page.
  - An element's extrusion is its own (`--rkui-extrusion` doesn't inherit), so the controls on a
    sticky note cast their own shadows, not the note's.
  - Without `@scope` or `light-dark()`, browsers keep the slab.
- **Block is a rarely used mode** (`data-shadow="block"`): the slab with no rim, so the near-black
  shadow sits straight on the page, as in the first mockup. `--rkui-shadow-edge` is transparent;
  light mode is unchanged. Things with no fill keep their `--rkui-line-unfilled` outline.

### 4.3 Depth

`data-depth="deep"` makes every shadow, inset and pop 1.5× deeper. Use it only where a page asks
for it explicitly; there is no page-wide switch. It combines with every mode, palette, theme and
light.

### 4.4 The pop

Defined once in `interactive.css` for every clickable component. **Hover** (only under
`(hover: hover)`) lifts by `--rkui-lift-offset` towards the light and grows the shadow; **press** moves
by `--rkui-press-offset` onto `--rkui-shadow-pressed`. 120ms, plain `ease`, no springy overshoot. Only
clickable things lift and sink (whether this stays is open: DECISIONS), with one opt-in exception:
a Table's `lift` option, where the hovered row lifts though it isn't clickable. Something static
shows emphasis with its fill and a small pop in place (scale 1.08 on `--rkui-ease-snap`).

### 4.5 Pressed, checked and busy

- **The pressed state is the centred one.** Where a control rests in a frame or row, the layout
  places its pressed or checked pose, and the resting pose sits back towards the light:
  - range thumb: at rest one press offset off the track's centre, centred when pressed;
  - file button: at rest one press offset towards the light, centred in its frame when pressed;
  - ballot: the checked tile is centred on its row; a resting tile sits back by the shadow offset;
  - deck plate: centred on where a pushed-in key sits.
- **Pushed in:** a checked deck key goes in by the whole shadow offset, flush, no shadow; a checked
  (or current-page) tile the same, with `--rkui-shadow-inset`. Neither pops. Both land with the
  "kerchunk": a keyframe drives past the depth, then settles.
- **Selected folder tab:** joined to the sheet, no pop, takes the state at once so the press
  doesn't ease back across the join.
- **Checked fills:** `--rkui-selected` for checkboxes, radios, switches, segmented pills and tiles;
  `--rkui-section` for chips.
- **Busy button:** `aria-busy="true"` plus `aria-disabled="true"` (not `disabled`, so focus isn't
  lost). It keeps its resting shadow and doesn't pop.
- **Disabled:** opacity 0.45, no shadow, no pop, `cursor: not-allowed`.

### 4.6 Unfilled buttons

Discouraged: use a filled button wherever possible. An unfilled one sits flush with no resting
shadow. Pressed, it doesn't move: it fills with `--rkui-raised` (so the near-black inset shows in dark
mode) and takes `--rkui-shadow-inset`, and its label sinks by `--rkui-press-offset` through padding.

### 4.7 Focus

- **The highlighter:** a 6px tangerine outline hugging the ink outline, shadow off. Its 3:1 edge is
  against the outline (6.41:1 light, 8.69:1 dark); tangerine on cream alone is about 2.2:1.
- **Marker pen** for things with no outline (text links): tangerine behind ink text, with a
  transparent outline that shows in forced colours.
- Where tangerine surrounds the element (tangerine buttons, apricot panels and notes, warnings) use
  `--rkui-focus: var(--rkui-focus-alt)`; such components set it themselves.
- Groups show the band on the group, never one option; chips, cards and tiles show it for the input
  inside. An outline-less pill (an equation reference) gets a ring for the band to hug.
- The band never animates.

### 4.8 Text fields

Outlined and flat at rest and on hover. Errors: `aria-invalid="true"`, a `--rkui-coral-deep` outline.
Hover cue: the background sinks to the page by default; `.rkui-hover-ring`, `.rkui-hover-underline` or
`.rkui-hover-none` on a field or any ancestor opts in to another.

## 5. Motion

**When.** Motion explains: it answers input, shows work under way, or shows how a change happens.
Never decoration.
- **Never moves:** readable text, layout, scroll position (smooth scrolling only for in-page jumps),
  the light, the outline width, the focus band. One accepted exception: a drawer's slam jolts its
  parent, text and all, by about 2px (DECISIONS, 2026-11-08).
- **Never turns**, so shadows stay on the light's side. Parts that turn have no shadow: the spinner
  wedge, the dial's notch (the knob stays still), the clock hands, whose tags counter-turn. The
  orbit spinner's dots counter-turn too.

| | Input response | Ambient loop |
|---|---|---|
| Starts | on input, same frame | by itself, while a state lasts |
| Length | `--rkui-duration-fast` 120ms (hover, press); `--rkui-duration-spring` 180ms (toggles, snapping); `--rkui-duration-slide` 320ms (travel, panels) | `--rkui-loop-short` 0.9s; `--rkui-loop-medium` 1.6s; `--rkui-loop-long` 2.4s (fills); `--rkui-loop-panel` 4s (diagrams) |
| Repeats | never | until the state ends or the reader pauses it |

**Easing.** Plain `ease` for input responses; `linear` for steady travel; `ease-out` up and
`ease-in` down for gravity; `ease-in-out` `alternate` for fills. `--rkui-ease-spring`
(`cubic-bezier(0.34, 1.56, 0.64, 1)`) recovers from a squash or press. `--rkui-ease-snap`
(`cubic-bezier(0.38, 1.35, 0.52, 1)`, about 4% overshoot, 90% there at 35% of the time) is a jump
to a new place or state with one visible overshoot. No other curves and no elastic easing.

**Toon phases.** Wind-up, go, overshoot, settle, with holds; a loop holds for a third or more of its
cycle. A sequence uses equal steps of 0.6–1s and ends on a held step.
- **Squash:** up to 1.3 × 0.7 on impact, 0.8–0.9 × 1.1–1.25 in flight, 0.95 × 1.05 to settle.
  Area within about 10%, pinned to the contact point.
- **Overshoot:** one swing only, from the snap curves or one keyframe past the target (10% at most).
  The drawer's slam and the blind's settle make their one swing with a delayed transition of a
  number instead (DECISIONS, 2026-11-08).

**Shadows while moving.** Offsets from `--rkui-shadow-dx`/`-dy`, never literal; lengths that go with a
shadow multiply by `--rkui-shadow-depth`.

**Stagger.** Neighbours start `--rkui-stagger` (0.15s) apart (`calc(var(--rkui-i) * var(--rkui-stagger))`), in
reading order or the order a cause travels. An entrance spreads over 0.6s at most; staggered loops
share one period.

**Third-party widgets and canvases.**
- Colour library marks with classes and tokens in CSS, so a theme change needs no redraw.
- On a canvas, resolve a token through a probe element inside the widget
  (`probe.style.color = 'var(--rkui-teal)'`, then read the computed colour). The raw property is
  `light-dark(…)` text.
- Redraw on `data-theme`/`data-palette` changes, system theme changes, light turns and
  reduced-motion changes. Turn off library tooltips and animations, or time them with the tokens.

**Reduced motion, forced colours, pausing.**
- Reduced motion: the tokens zero durations and press/lift offsets. State loops (spinners, loaders,
  pending panels) become a fade (`rkui-spinner-fade`, 1.8s); illustrative loops stop (this split is
  open: DECISIONS).
- Forced colours: `CanvasText` outlines, `Highlight` for lit parts, `Canvas` behind.
- Self-moving content over five seconds, other than a loader, gets a pause control (WCAG 2.2.2):
  `<rkui-motion>`, which also pauses off-screen. JS loops stop when paused, off-screen or hidden.

**Performance.** Animate `transform` and `opacity`; never layout in a loop; no permanent
`will-change`. **At a join, move with inset offsets, not `translate`:** a `translate` transition
gets its own compositor layer, which snaps to whole pixels and can open a hairline seam.

## 6. Iconography

- **Phosphor duotone (MIT)** from the GitHub `raw/duotone/` sources, which keep the fill separate
  from the round-capped strokes. `build/icons.js` reads them from the `phosphor-raw` dev dependency,
  rewrites stroke → `currentColor` and fill → `var(--rkui-icon-fill, <default>)`, and writes them
  to `dist/icons/` (nothing generated is committed). The icon list and default fills are design
  data in `src/icons/icon-set.js`; the satellite is hand-adapted in `src/icons/sources/`.
  The npm and Iconify builds are pre-flattened (no adjustable
  stroke), so they aren't used. **Tabler (MIT)** fills gaps (the satellite).
- `--rkui-icon-stroke` is in the 256-unit viewBox: 21 at 24px (about 2px), 24 for `.rkui-icon--small`.
  Globes have `--rkui-icon-ocean`.
- Icons take their control's fill (buttons, chips, badges, segmented options). Unfilled buttons
  unset `--rkui-icon-fill`, so their icons keep their defaults.
- **Inline SVG or `<use>` only:** the hooks don't reach `<img>` or CSS backgrounds. Astro inlines
  via SVG imports; vanilla sites use `<use href="…/sprite.svg#name"/>` from a same-origin copy of
  `dist/icons/sprite.svg`.
  SVGO `preset-default` keeps the hooks. Don't use `astro-icon` (untested).
- Small glyphs drawn as CSS masks in `currentColor` (search, date pickers, carets, the brush) keep
  that fill in forced colours.
- **Brand marks are not in rkui:** trademarks live in each site (a code block's language logo
  arrives through its `logo` slot). They stay single flat black or
  white (brand rules forbid recolouring); the colour, outline and shadow go on the button. The
  one logo rkui holds is its own (`Logo`), drawn in the library's tokens.
- **Avoid:** Remix Icon (restrictive licence), Solar and Streamline (credit required), OpenMoji
  (share-alike), IconPark (archived).
- Custom drawing only for a few marks (DECISIONS lists the candidates).

## 7. Components

`src/index.css` imports the tokens, fonts, type, base and the colour shadow mode, then
every component, then `interactive.css` last so the shared states win. "Open" means the options are
built and the pick is in [DECISIONS.md](DECISIONS.md#open-decisions).

### 7.1 Actions and form controls

| Component | Class | Default and options |
|---|---|---|
| Button | `.rkui-button` (`--<hue>` for every hue, `--section`, `--small`) | filled; yellow by default |
| Unfilled button | `.rkui-button--unfilled` | discouraged (§4.6) |
| Filling (busy) button | `.rkui-button[aria-busy]` + `.rkui-water` | |
| Field wrapper | `.rkui-field`, `.rkui-check` | |
| Text input, textarea | `.rkui-input` | hover cues opt-in (§4.8) |
| Select | `.rkui-select` | toon open list where `appearance: base-select` works, the browser's own elsewhere |
| Checkbox, radio, switch | `.rkui-checkbox`, `.rkui-radio`, `.rkui-switch` | |
| Range | `.rkui-range`, `.rkui-output` | |
| Range ticks | `.rkui-range-scale` (`ticks`) | |
| Segmented | `.rkui-segmented`; `--deck`, `--plate` | deck keys opt-in; pill or deck open |
| Tiles | `.rkui-tiles`, `.rkui-tile` (`--compact`, `--vertical`) | |
| Colour picker | `.rkui-tile--color`, `--custom-color`, `.rkui-color-input`, `<rkui-color-picker>` | flair open (none, A `--brush`, B `--drops`, C `--stroke`) |
| Ballot | `.rkui-ballot` (`--mark-end`, `--overlap`, `--inside`, `--tight`) | layouts opt-in |
| File | A `.rkui-input[type=file]`, B `.rkui-file-drop` | open |
| Date and time | `.rkui-input[type=date…]` | |
| Search | A `.rkui-search`, B `.rkui-search-bar` | open |
| Number stepper | `<rkui-stepper>` `--split`, `--stacked` | open |
| Dial | `<rkui-dial>` A `--knob`, B `--arc`; `--ramp`, `--ramp-heat` | knob or arc open; ramp lighting open |
| Clock | `<rkui-clock>` | hour-hand length open |

### 7.2 Navigation, containers and feedback

| Component | Class | Default and options |
|---|---|---|
| Chips | `.rkui-chip`, `.rkui-chip-group` | checked takes `--rkui-section`, or inverts the page colours |
| Breadcrumbs | `.rkui-breadcrumbs` (chips; `--path`) | open |
| Pagination | `.rkui-pagination`; folder-tab version in `folder.css` | open |
| Folder tabs | `.rkui-folder`, `<rkui-tabs>` (`--tinted`) | bar above the tabs; flat scrollbar |
| Top bar | `.rkui-topbar--toast`, `--flush` | toast by default; flush for full-width headers |
| Popup | `.rkui-popup` (Popover API) | |
| Tooltip | `<rkui-tooltip>` A inverted, B `--toon` | A by default; open |
| Card | `.rkui-card`, `--link` | content variants proposed (DECISIONS) |
| Callout | `.rkui-callout--note` (sky tint), `--warning` (apricot tint) | |
| Sticky note | `.rkui-sticky-note` (hues, `--tilt`, `--tape`, `--pin`) | |
| Widget frame | `.rkui-widget-frame` (dashed, lilac tint) | |
| Figure | `.rkui-figure` | |
| Quote | `.rkui-quote` (slate panel, slab serif; `--italic`) | upright by default; slant open |
| Code block | `.rkui-code`, `<rkui-code-block>` (`--tab`) | inset panel by default |
| Drawer | `.rkui-drawer` (`<details>`), `--blind` (`--show-label`); `.rkui-cabinet` | drawer by default |
| Equations | `.rkui-equation`, `.rkui-eqref` | §3.3 |
| Table | `.rkui-table` (`--ledger`, `--small`, `--messy`, `--still`, `--lift`) | sheet by default; sheet or ledger open |
| Scroll region | `.rkui-scroll`, `--bar` | dots plus a hover scrollbar by default; `--bar` always on |
| Sidebar | `.rkui-sidebar` (`--card`, `--folders`, `--deck`, `--note`) | plain by default; open |
| Badge | `.rkui-badge` (`--tint`, hues, `--corner`, `--dot`); corner `--ring`, `--sticker` | corner edge open |
| Spinners | `.rkui-spinner` `--ring`, `--dots` (with `--squash`), `--water`, `--orbit`, `--triangle` | |
| Loader | `.rkui-loader--hop` | |
| Progress, meter | `.rkui-progress` (striped), `--flat`; `.rkui-meter` | striped by default; whether `--flat` stays is open |
| Water, pending | `.rkui-water`, `--rise`; `.rkui-pending` | a filling panel |
| Motion pause | `<rkui-motion>` | whether it stays in rkui is open |

### 7.3 Behaviour and distribution

- Custom elements (vanilla, JSDoc types, each beside its CSS in `src/components/<name>/`) enhance markup the page writes:
  - `<rkui-theme-toggle>`, `<rkui-light-direction>`, `<rkui-motion>`, `<rkui-tabs>`, `<rkui-tooltip>`;
  - `<rkui-stepper>`, `<rkui-color-picker>`, `<rkui-code-block>`, `<rkui-dial>`, `<rkui-clock>`;
  - helpers: `src/head-scripts/theme-init.js`, `src/head-scripts/table-init.js` (inlined beside it;
    tables visible on load keep their values hidden until their entrance), `afterSlide()` in
    `src/shared/after-slide.js`, `src/components/folder/folder-scrollbar.js`, and
    `src/components/table/table-enhance.js` (plays each table's entrance the first time it is
    seen, in every browser).
- Plain CSS and JS, fonts by relative path, icons and sprite. There is no CDN, so pages make no
  third-party requests: plain-HTML sites copy a tagged release into `vendor/`.
- Layers: tokens → fonts and base → CSS classes → icons → custom elements → thin wrappers.
  Wrappers are for Astro only, with an optional integration. Vue and vanilla sites use the core
  directly.
- The prefix `rkui-` is fixed: it is in every consumer's markup and namespaces storage keys.

## 8. Illustration style

A flat cartoon style. Its tokens are docs-only for now, in
`site/src/old/components/illustration-tokens.css`; they can move into the library with `explode.css`
if the style is kept.

- **The pop look, with the UI's own fills.**
  - Fills aren't dimmed in dark mode.
  - Each assembly casts the resting shadow, handing over to its parts' shadows while apart.
  - No per-part keylines. A sticker outline, if any, goes round the whole drawing only (open:
    DECISIONS).
- **Palette:** `--rkui-illustration-red`, `-ochre`, `-steel`, `-navy` = `--rkui-coral`, `--rkui-yellow`,
  `--rkui-sky`, `--rkui-navy`. At most one more step each:
  - `-ochre-light` and `-steel-light`: 55% hue, the rest glint;
  - `-red-shade`: 80% red, the rest ink;
  - navy is never shaded.

  No `--rkui-surface`, so every palette gets the same drawing.
- **Outline:** 2.5px (`--rkui-illustration-outline`, 1.25 × the UI's) in `--rkui-line`, round joins and caps,
  non-scaling, outside each shape so overlaps outline as one. Ground lines use `--rkui-line-unfilled`.
- **Tones:** two per part, the fill plus one light *or* shade band. A third only where the form
  needs it, or hatching instead. Bands are flat, cut off at the outline.
- **Hatching:** the progress bar's 45° `--rkui-stripe` stripes, as an SVG pattern, never animated.
- **Light:** drawn lit from the top left. Bands and hatching flip by quadrant to face the light (a
  CSS `scale` from `sign()` of `--rkui-shadow-dx/-dy`, no JS). They jump rather than slide: toon shading
  is stepped.
- **Detail:** cartoony, short of technical. Simple geometry, only what makes the thing read,
  nothing much under half a grid unit.
- **Build:** an HTML stage with an inline SVG per part, so each keeps an HTML box (`drop-shadow()`
  in screen pixels, `z-index`). Parts are drawn back to front. A drawing never pops, so it never
  looks like a button.

## 9. Data visualisation

Nothing chart-related ships in rkui: the toon charts are a vibe check on the docs site, with their
tokens in `site/src/old/components/chart-tokens.css`.

- **Series order:** teal, yellow, navy, green, sky, coral, grape, tangerine (`--rkui-chart-1…8`).
  Adjacent pairs stay apart for protan and deutan viewers in both themes (worst ΔE 19.2).
- Light-mode yellow, sky, teal, green and tangerine are under 3:1 on cream, so **marks carry the ink
  outline or direct labels**.
- `--rkui-chart-context` (`--rkui-muted` 45%) for background series; `--rkui-chart-grid` (`--rkui-fg` 12%).
- **Sequential** `--rkui-seq-1…5`: navy tint to `--rkui-navy-deep`. **Vivid** option `--rkui-seq-vivid-1…5`
  (YlGnBu order: yellow to navy in light, navy to yellow in dark).
- **Diverging** `--rkui-div-*`: navy below, coral (leaning to `--rkui-fg`) above, `--rkui-div-mid` from the page.
- Heatmap cells pop a raised copy with a toon tooltip; arrow keys move between them. Diagrams pulse
  a layer at a time or light steps in turn.

## 10. Accessibility and known gaps

- **Contrast targets, checked by hand on the docs page** (it prints each ratio as painted):
  - text 4.5:1 on surfaces, tints, fills and notes; code 7:1;
  - 3:1 for the focus band against the outline, unfilled outlines, fill edges, and the colour-mode
    shades against the page;
  - every palette, both themes, and the fallback.
- **Dark outline gap:** near-black `--rkui-line` on the dark page is about 1.2–1.4:1. Filled components
  get their 3:1 edge from the fill; outline-only ones use `--rkui-line-unfilled`. It is a known gap.
- **`--rkui-section` in dark mode** defaults to ink, nearly the page colour. Sites set their own hues.
- **Accepted shortfalls** (Rob's reasons are in DECISIONS.md):
  - ink icon lines on the coral note's fold in dark mode, 2.8:1 against 3;
  - colour mode: coral's shade on the dark page (2.4–2.9:1) and grape's on `--rkui-raised` (2.6–2.8:1),
    as the ink outline marks the edge.
- **A busy `--rkui-section` button's** empty part keeps 70% of the fill, so its label stays at
  6.0–6.2:1.
- **Without JavaScript:** the clock and dial fall back to native inputs, folder panels all show, the
  copy button stays hidden, colour tiles check from the keyboard.
- **Tooltips** are plain text (`aria-describedby`), dismissable with Escape; interactive content
  goes in a popup.
- **Progressive features** (plain fallback without them): anchor positioning, scroll-driven
  animations, `appearance: base-select`, `@scope`, `sign()`.
- **Browser-owned parts** that can't be styled: date picker popups, Firefox's date icon, datalist
  ticks on a styled slider.
