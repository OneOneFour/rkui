# rkui design decisions

When and why the rules in [DESIGN.md](DESIGN.md) were chosen, and the questions still open.
Rob makes the design calls; entries that record a fix or a finding rather than his call say so.
A gate entry is his review of that phase's work. Newest first. When a decision changes, add a
new entry and update DESIGN.md; don't rewrite the old one.

- [Decisions](#decisions)
- [Open decisions](#open-decisions)

## Decisions

### 2026-11-09

**Equation references are written by hand** (a record of what is built). The rehype plugin for
`\label` and `\eqref` (2026-11-01) was not built. An equation is numbered with `\tag{n}`, and
`EquationReference` links to it by its `id` (`to`) with the number written out (`number`). Its
`long` prop gives the long "Equation (n)" pill, which leaves the proposed `\Cref` with nothing to
do. In MDX, rkui's Astro integration turns `$…$` into Maths and `$$…$$` into Equation.

**One Vue file per component, not framework wrappers** (a record of what is built). This replaces
"Framework wrappers" (2026-11-02). Each component is one `.vue` file that Astro, MDX and Vue pages
all use, and plain HTML pages get custom elements registered from the same files with
`defineElement()`. The optional Astro integration (`rkui()`) renders fenced code and dollar maths
in MDX with rkui's components.

### 2026-11-08

**Insets: two steps, ink then a grey shade, with the outline rim in dark** (Rob). Code blocks,
drawer trays and inset cards share one inset, `--rkui-shadow-recess`, chosen from a board of
prototypes. Inside the sides towards the light it draws two hard 3px steps: the shadow colour
(ink, or the lighter grey with the colour shadow in dark mode), then the floor 60% of the way to
the outline colour (`--rkui-recess-shade`). The raised shadow's rim sits just past them, so in
dark mode the outline shadow gives a cream rim and block gives none. All three are 6px deep (9px
with `data-depth="deep"`); the drawer's `--rkui-drawer-depth` is gone. It replaces the code
panel's `--rkui-stripe` inset and the 45% `--rkui-recess` shadow in drawers and inset cards.

**One panel, the palette's** (Rob). Panels follow the page palette instead of offering a choice:
`--rkui-panel` and `--rkui-panel-tab` replace `--rkui-slate` and `--rkui-slate-tab`, and each
palette sets its own pair. The slate palette keeps the cool slate panel, greige takes the greige
one, and cream, the default, gets a new cream panel a step from the cream page. The greige opt-in
(`.rkui-slate-greige`) is gone; a `data-palette="greige"` container gives the greige panel.

**Shadow and highlight, two settings** (Rob). The four dark-mode shadow modes become two settings
that work on their own. Shadow (`data-shadow`) is `outline` (the default, the near-black shadow on a
rim), `block` (no rim) or `color` (each fill casts its own shade). Highlight (`data-highlight`) is
`cream` (the default) or `dark`: the colour of the outlines on things with no fill. The old modes
map across: slab is outline and cream, color is color and cream, block is block and dark, and block-
color, the mode to try, is color and dark. Block with cream and outline with dark are new; the
outline shadow's rim stays cream with either highlight. `slab` and `block-color` are gone. The docs
site's settings drawer under the top bar holds both, with the palette.

**Tooltip** (Rob). The toon bubble, raised with the outline and hard shadow, is the default;
`variant="flat"` gives the bubble in the page's colours swapped.

**Card** (Rob). A static card has the outline by default (`variant="outline"`). The other three
edges stay as options: `raised` (the outline and a hard shadow that doesn't lift), `shaded` (a
slate fill) and `inset` (pushed in like a drawer's tray). Card's `hue` still only colours the
shadow in the dark colour shadow mode.

**Sidebar columns, bold links and selected slab** (Rob). Three more options that work with every
look: `columns`, where each group's links flow into columns when the sidebar is wide and stay in
one when it is narrow; `bold`, links at weight 600; and `selected-slab`, only the current page's
link in the slab serif. The site nav demos use the first two, as the sections look did.

**Block mode outlines** (Rob). In dark mode with `data-shadow="block"`, things with no fill of
their own (inputs, chips, tiles, folder tabs, unchecked controls) take the near-black outline too,
like the mockup's Surface card, though their edges are then hard to see on the dark page.

**Alert backdrop** (Rob). An open Alert blurs the page behind it, with no shade, the one exception
to "no blur"; the darken backdrop and `--rkui-scrim` are gone. The page behind stays still while
the alert is open, and keeps its scroll position when it closes.

**Range value** (Rob). Both stay as options: `value-display="thumb"` shows the value inside the
thumb, which widens to fit it, and `value-display="popup"` shows it in a bubble over the thumb,
raised like a Tooltip; `value-display="flat-popup"` is the same bubble flat. With none of them,
the value doesn't show.

**Sidebar options, not a sections look** (Rob). There is no separate sections look. What it
brought works with every look instead: slab type (`slab`), a colour for each link (`hue`), which
fills its icon and, on the current page, the link, an icon before a link's text, a header, and
groups with no heading.

**Quote slant** (Rob). Both stay: a quote is upright by default, and `slant="italic"` slants it,
with the browser slanting Roboto Slab, which has no italic.

**Motion** (Rob). The motion principles are the docs site's Motion page. The Motion component
stays in rkui as the Pause button for a group of animations; it doesn't pause them off-screen.

**Select's open list** (Rob). Every select draws its open list in the toon look where the browser
supports `appearance: base-select`, and shows the browser's own list elsewhere; there is no
`picker` option to turn it on. The checked option is filled with `--rkui-selected`, like every
other checked control, and the tinted variant is gone.

**Folder and Pagination tabs** (Rob). Tabs never wrap. They stand on the top, bottom, left or right
of the sheet; for bottom and right the tabs come after the sheet in the page, so the tab order
follows the reading order. When they don't fit, a strip either scrolls or collapses:
- Folder scrolls by default and has no ‹ › step tabs unless asked, so every panel's name stays in
  view and a tab is one click away. Pagination collapses by default, with its step tabs on.
- A collapsing strip shows the first and last tabs, the current one and its neighbours, then fills
  the spare room outwards from the current one, the next one first. A "…" never stands for a single
  tab. On a narrow screen it goes to its small size, then leaves out the first and last tabs,
  showing ‹ current › and as many tabs around it as fit, and scrolls only if even ‹ current ›
  doesn't fit. The script measures this; without JavaScript the strip scrolls.
- A step tab with nowhere to go, at either end, shows dimmed rather than disappearing.
- A Folder takes up to 20 tabs. Pagination's tiles go only above or below the content.

**Table rows that lift.** Only clickable things lift, with one opt-in exception: a Table's `lift`
option, where the hovered row lifts though it isn't clickable (Rob).

**Table header band in dark mode.** With no `hue` and no section hue, the band is ink in light mode;
in dark mode it is the raised surface colour with a line under it, so it reads as a header on the
dark sheet. A `hue`, or a section hue the page sets, wins in dark mode too (Rob).

**Table entrance plays once.** The first time a table is seen, it plays a short
entrance through `table-enhance.js` in every browser: the band fills, the rules draw, the values
are written in and the stickers stamp down. A table in view on load plays it too when the page
inlines `table-init.js` in `<head>`; without it, that table only draws its rules. The cascade runs
to the last row (Rob).

**Drawer, accepted as built** (Rob). Both looks stay: a drawer sunk into its parent by default,
and the blind (`variant="blind"`), a screen that unrolls from a roller.
- The blind's settle at the bottom is a single swing made by a delayed transition of a number,
  not one of the two snap curves or a keyframe, which bends DESIGN §5's easing rule.
- A drawer's slam gives its parent a jolt of about 2px, which moves the parent's text, though
  DESIGN §5 says readable text never moves.
- A `Cabinet` lets every drawer open by default; `exclusive` opts in to one at a time.
- The blind hangs in front of its parent as one raised object with the hard shadow.
- The blind's pull is a yellow ring on a short cord from the middle of a slim hem, holding the
  caret, with the label there for screen readers; `showLabel` grows the ring into a pill that
  shows the label too.

### 2026-11-02

**Prefix changed to `rkui-`, and every custom property takes `--rkui-`** (Rob), to match the
package name `@oneonefour/rkui` and avoid clashing with sites' own classes and variables.

**Code block language logos.** CodeBlock takes the logo from the site (the `logo` slot); without
one it shows Phosphor's file-type icon for the language, else the file extension as grey text.
The library holds no brand logos. The one logo it holds is its own (`Logo`).

**Dark-mode shadows.** The outlined slab (option B) is the default; own-colour extrusion (option
D) is a supported mode, `data-shadow="color"`. A near-black shadow is hard to see on night blue.
Four options were tried at Gate 1b and narrowed to these two. Block, the slab with no rim
(`data-shadow="block"`), is a third, rarely used mode, kept at Rob's request.

**Unfilled buttons, pressed** (Gate 1b). They fill with `--rkui-raised`, so the near-black inset shows
in dark mode. `--rkui-shadow-inset` is the pressed offset in `--rkui-line`, near-black in both themes.

**Depth.** The deep mode, `data-depth="deep"`, is approved on the terms in DESIGN §4.3.

**Page palettes.** Cream is the default and the site ships cream. Slate and greige stay as
opt-ins. (The greige palette was built at Gate 1b from the greige code slate Rob liked, with a
cool slate palette beside it.)

**The shading group** (from the colour audit). Repeated mixes became named tokens so the contrast
check reads them: `--rkui-stripe`, `--rkui-shade`, `--rkui-folder-back`.
- The code panel's inset moved from 20% `--rkui-line` to `--rkui-stripe` (25%), a touch darker.
- `--rkui-illustration-red-shade` and `--rkui-wave-line` stay as they are, though each is close to a
  `--rkui-shade`.

**`--rkui-ease-snap` retuned.** Rob found it "a tad too snappy", the overshoot "a bit much". It was
`cubic-bezier(0.3, 1.5, 0.45, 1)` (8% overshoot, 90% there at a quarter of the time). At Rob's
second look it went gentler again, to the current curve (DESIGN §5).

**Maths.**
- Numbering: both styles, a `\label` per `align` row, or one per `aligned`/`gathered` block.
- Wrappers: bare by default, with `--panel`, `--rule` and `--key`.
- Colour-coded terms: the hue's tint behind `--rkui-fg` text. The coloured-text option was removed.

**Components.**
- Filling (busy) button, `.rkui-button[aria-busy]` + `.rkui-water`.
- Dial ramps (`--ramp`, `--ramp-heat`) approved; the clock approved; sticky notes approved.
- Folder tabs: a flat scrollbar.
- Top bar: toast by default, flush for full-width headers.
- Spinners: ring, dots, water, orbit, triangle and squash stay; C (the icon spinner) and E were
  removed.
- Loader: the hopping ball stays; the others were removed.
- Progress: striped by default.
- Range ticks: B, the datalist tick row with labels. A (the browser's own ticks) and C (dots on
  the track) were removed.
- Water and pending: the filling panel stays; the slosh was removed.

**Illustration style.** From a flat cartoon locomotive Rob shared as a reference (not copied). Rob
ranked B, the pop look, first; C, the sticker, second; A, subdued, last ("too muted, not really
aligned with the brand"). The subdued look and per-part keylines were removed.

**The contrast check was dropped.** Rob: "honestly I'll do it and tweak it manually; the palette
we've chosen now is pretty robust." `scripts/check-contrast.js` and `scripts/color.js` and the
`npm run contrast` gate are gone. The WCAG targets in DESIGN stay as rules, checked by hand on the
docs page's Colours section, which prints each hex and ratio as the browser painted it. The check's
other job, matching the light-only fallback (`tokens/fallback.css`) against the `light-dark()`
tokens, is now by hand too.

**Contrast shortfalls accepted by Rob** (recorded from the dropped check, with his reasons):
- Ink icon lines (`--rkui-on-fill`) on the coral note's fold (`--rkui-shade` of `--rkui-note-coral`) in dark mode,
  2.8:1 against 3:1. "Just under in dark mode; the lines also read against the note."
- Colour shadow mode, dark theme: coral's and grape's `--rkui-shade` against the page (`--rkui-surface` and
  `--rkui-raised`), below 3:1 (coral 2.4–2.9:1, grape's on `--rkui-raised` 2.6–2.8:1). "Fine as they are; the
  ink outline marks the element's edge."
- A known gap, not one of Rob's acceptances: the dark-theme `--rkui-line` against the page, about
  1.2–1.4:1 (DESIGN §10).

**Contrast fix** (a fix, not a call). A busy `--rkui-section` button's label on its empty part was
2.9:1. The empty part now keeps 70% of the fill, giving 6.0–6.2:1.

**Framework wrappers.** Planned for Astro only, with an optional integration. Vue and vanilla
sites use the core directly.

**PowerPoint template.** First built ("route 1"), from the tokens. No review by Rob is recorded
yet; see [Open decisions](#open-decisions).

### Gate 1b: components and styleguide (approved 2026-11-02)

- **Options instead of one-offs.** Alternatives are kept as opt-in classes beside the default, on
  purpose.
- **One light** drives every shadow and pop; glints sit opposite.
- **Code panels:** cool slate is the default under every palette; `.rkui-slate-greige` opts in.
- **Code block:** the inset panel is the default.
- **Equation pills:** vivid `--rkui-lilac` in both themes, not the dark lilac tint.
- **Text fields:** the background sinks to the page on hover by default; ring, underline and none
  are opt-ins.
- **Folder tabs:** the bar sits above the tabs.
- **Scroll region:** dots plus a hover scrollbar by default; `--bar` is the alternate.
- **Grouping panel:** the direction (dashed, flat and raised) is agreed; it is not built.
- **Motion policy** written (DESIGN §5); two of its rules are still open.
- **Joins move with inset offsets, not `translate`** (a finding): seen on the folder tabs, where a
  `translate` transition opened a hairline seam.
- **Data visualisation:** nothing chart-related ships in this version of rkui (Rob: "just for
  general vibe check"). The toon charts are the only look on the styleguide.

### Gate 1a: foundations (approved 2026-11-01)

- **Hues:** Rob kept the proposed value of every `-deep` and `-tint`.
- **`--rkui-coral-solid`** added: coral for fills with small text.
- **`--rkui-coral-deep` `#c8322a`**, over the first candidate `#da382f`, which reached only 4.12:1.
- **Theme:** `color-scheme: light dark`, unregistered tokens, the `rkui-theme` key shared across the
  domain, an inlined classic script before first paint, and a Light / Dark / System toggle.
- **Type scale:** ratio 1.3, Rob's pick over 1.25 and 1.28, with `--rkui-step--1` fixed at 0.8rem.
- **JetBrains Mono:** ligatures on.
- **Focus:** the tangerine highlighter band.
- **Buttons:** filled, yellow by default. Text inputs, checkboxes, radios, switches, the range and
  chips (checked takes `--rkui-section`) decided in their current form.
- **Chart series order** checked for colour-blind viewers (DESIGN §9); the old order put green next
  to yellow (ΔE 2.6).

### 2026-11-01

**Font pairing A:** Roboto Slab headings, Xmind body and UI, self-hosted (reasons in DESIGN §3.1).
Xmind had been on Google Fonts only since 2026-10-20.

**Auxiliary colours** (approved direction): grape, lilac, tangerine and apricot have set jobs. As
of v0.0.3 they may also mark sections.

**Iconography** (approved after Rob saw the icons on the mood board): Phosphor duotone from the
GitHub sources, Tabler for gaps.
- Rejected: Phosphor's npm and Iconify builds (pre-flattened, no adjustable stroke); `astro-icon`
  (untested).
- Avoided: the sets in DESIGN §6. Remix Icon's licence turned restrictive in January 2026.
- Brand marks stay in each site, not in rkui.

**Equation references:** `\label` and `\eqref`, clickable, through a small rehype plugin before
KaTeX, since no off-the-shelf plugin does it.

**The pop:** keep the mood board's feel (Rob). A springy overshoot was offered and not adopted.

**Unfilled buttons:** discouraged (Rob).

**Distribution:** no CDN, so no third-party requests and no permanent URLs. The first rule, "no
build step", was replaced on 2026-11-02 (Rob, library goals): an npm task builds static, minified
CSS and JS, and Astro sites install the package with a one-line integration. Plain-HTML sites use
the same built files; copying them into a site's `vendor/` is the proposed route.

**Prefix `rk-`** (Gate 0): fixed, since it is in every consumer's markup and namespaces storage
keys.

## Open decisions

The options are built, lettered as on the docs site; the docs-site section to look at is in
quotes. Each pick is one small change that deletes the losing variant and updates DESIGN.md.

**Motion**
- [ ] "Only clickable things lift and sink": stays, or changes. ("Motion")
- [ ] Under reduced motion, illustrative loops stop while state loops fade: stays, or changes.
  ("Motion")
- [ ] Loaders and spinners: time their loops with the `--rkui-loop-*` tokens, or keep their own.
  ("Loading")

**Picks among built options**
- [ ] File input: A framed button and filename, or B drop panel. ("Special inputs")
- [ ] Search: A icon inside, or B attached button. ("Special inputs")
- [ ] Dial: A knob, or B arc. ("Dial")
- [ ] Dial ramp: blocks lit up to the value (as built), or all lit. ("Dial")
- [ ] Clock: the hour hand stays longer than the minute hand (as built), or not. ("Clock")
- [ ] Colour-tile flair: none, A paint brush, B paint drops, or C palette and brush stroke with
  legend. ("Tile and colour pickers")
- [ ] `.rkui-progress--flat`: stays, or goes. ("Loading")
- [ ] Corner badge edge: A outline, B ring, or C sticker. ("Badges")
- [ ] Breadcrumbs: A plain links, B chips, or C path bar. ("Breadcrumbs")
- [ ] Pagination: A folder tabs, or B tiles between buttons. ("Pagination")
- [ ] Logo: lift (the pop only), or motifs (each tile's motif plays on hover). ("Logo")
- [ ] Sidebar: A plain (the default), B card, C folders, D deck, or E note. ("Sidebar")
- [ ] Header band, built as a prototype beside a sidebar: stays, changes, or goes. A
  site's frame (nav column beside the page) stays a recipe in the site. ("Header band")
- [ ] Table: A sheet (the default), or B ledger. ("Table")
- [ ] Inline maths size (`--rkui-maths-scale`): A 1em, B 1.1em, C 1.15em (proposed, as built), or D
  1.21em (KaTeX's default). ("Maths in text")
- [ ] Number stepper: split, or stacked. No pick recorded; both may stay as opt-ins.
- [ ] Segmented control: pill, or deck. No pick recorded; both may stay as opt-ins.

**Docs site only**
- [ ] Heatmap layout: A side by side with ink gutters, or B tiles. ("Charts")
- [ ] Sequential scale: A navy (`--rkui-seq-*`), or B vivid (`--rkui-seq-vivid-*`). ("Chart colours",
  "Charts")
- [ ] Exploded view: A no sticker, or B the single-outline sticker demo. ("Exploded view")
- [ ] Exploded view: parts lose their shadows under the focus band (as built), or keep them.
- [ ] Exploded view: an open assembly labels every part (as built), or only the hovered one.

**Proposed, not built**
- [ ] The dashed grouping panel, flat and raised, with the widget frame as one use of it; to be
  built with the site's card work.
- [ ] Card variants (post, project, paper, album), `PullQuote`, `Sidenote`.
- [ ] Custom marks: a gravity-wave signature, a monogram.
- [ ] The PowerPoint template: review it, after the re-check in
  [pptx/README.md](../pptx/README.md#needs-updating-before-the-next-build).
