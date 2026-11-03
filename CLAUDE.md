# rkui

Rob King's toon component library. Rob reviews every diff by hand.

## Read first

- `.claude/notes/HANDOFF.md`: what exists and what's next. Read its "Next steps" first.
- `.claude/notes/PLAN.md`: phases, gates, lanes and file ownership.
- `docs/DESIGN.md`: the design language. A change that goes against it needs Rob's OK.

## Where docs go

- **`docs/`** is for people: the design language, the decision record, and guides to using and
  maintaining the library. Rob edits these by hand, so keep them plain and present-tense.
- **`.claude/notes/`** is git-ignored and holds agent working material: plans, handoffs, briefs
  and logs. Never put these in `docs/`. Worktree agents can't see `.claude/notes/`; briefs carry
  what they need or point at the main checkout's absolute path.

## Hard rules

- **Never push.** Commit locally; Rob pushes.
- **Work on `develop`, never on `main`.** `main` is the stable release: Rob merges `develop` into it
  by pull request and tags each release.
- **Never write site content.** No site copy, posts, bios or captions. Specimen and demo text in the
  docs site is fine.
- **Never hard-code a colour.** Colours come from the token files only
  (`src/tokens/`, and the docs-only token files). Derived colours become named tokens
  or documented recipes (DESIGN.md, "Shading").
- **Contrast is checked by hand** (WCAG AA; code text AAA), on the old styleguide's colour tables
  (`/rkui/old/`) until the new docs site has its own. Rob checks it himself. A shortfall is
  reported to Rob, never left unmentioned.
- **Library boundary.**
  - No `.css` or `.js` file under `src/` imports Astro (a `.astro` file or `astro`). Astro components
    import the CSS classes and scripts beside them, never the other way round; later framework
    layers will do the same. `build/check-boundary.js` enforces it.
  - Nothing in the library holds site copy, site section names or brand logos. The one logo it
    holds is its own (`Logo`).
- **Browser checks go through Playwright only** (`npm run build && npm run screenshots`, which
  saves images to `screenshots/`). Never launch Chrome, Chromium or "Chrome for Testing" directly:
  it crashes and asks for Rob's keychain. Never start a dev server Rob is already running; pass an
  explicit `--port` if you start one.
- **Few tests.** Playwright is for looking: screenshots and a handful of smoke checks. Add a test
  only when it guards something that actually broke, or that a screenshot can't show.
- **Git hygiene:** never `git add -A` or `git commit -a`. Stage files by name.

## Code style

- **Readable by a human first:** clear names, small files, obvious structure.
- **Use the platform:** native elements, CSS custom properties, `light-dark()`, `@scope` and
  container queries before custom code. Add a dependency only when it removes real code, and say
  why in the commit message.
- **Comment where it helps:** short docstrings on exported functions and components. No design
  notes, history or reasoning dumps in code; those go in the docs or commit messages.
- **No dead code or speculative options.** When a variant loses, delete it everywhere.
- **Naming:** prefix `rkui-` for classes, custom elements, events and storage keys, and `--rkui-`
  for every custom property the library defines (the package is `@oneonefour/rkui`). Files are
  kebab-case; Astro and Vue components are PascalCase. Names in code use American `color`,
  matching CSS; prose may keep British spelling. Scripts are ESM `.js`, never `.mjs`.
- **TypeScript stays simple:** plain annotations and interfaces. No nested generics, conditional
  types or `Extract<…>`-style tricks; where one can't be avoided, a one-line comment says what it
  means in plain words.
- **Commits:** small and focused, with plain messages. Every commit passes `npm run build` (and
  the tests, once they exist).

## Astro components (`src/components/<name>/`)

Every component follows these, so a site author learns them once:
- **Colour:** one prop, `hue`, typed `Hue` from `src/shared/hues.ts` (or a subset of it); `onHue()` there
  gives the text token. Never a local list of hues.
- **Size:** `small` (boolean) for the small variant; `size` only ever takes a CSS length.
- **Open design choices:** a string prop named after the choice (`variant` if there's one), with
  "Open, see DECISIONS ("<section>")" in its comment only while DECISIONS lists it as open.
- **Attributes:** `class` and `style` go on the component's outermost element. Other attributes go
  on the native control for form controls, otherwise on the outermost element. Build each
  element's attributes as one merged object; never spread and then repeat an attribute.
- **Form fields:** controls take `label`, `hint` and `error` and always render `<Field>`, which
  renders just its slot when all three are empty. A page's own `aria-describedby` is joined with
  the message id, never replaced.
- **Lists of things are child components, never an array prop.** Options and tabs are each one
  tag inside their group: `<Tabs label="Topics"><Tab label="One">…</Tab></Tabs>`. A child marks
  its own state (`checked`, `selected`). When the group has to change what its children render (a
  name) or build their markup itself (tabs and panels), it reads its rendered slot through a small
  helper beside it (`option-group.ts`, `tab-items.ts`).
  - **The one exception is Breadcrumbs**, which takes `items={[{ label, href }, …]}`. A trail is
    plain data, usually built from the page's URL, and the last item is always the current page.
- **Option groups** take `legend`, `name` (generated when left out) and `multiple`, and fill their
  `name` into their options: `<Segmented legend="Theme"><SegmentedOption value="light"
  checked>Light</SegmentedOption>…</Segmented>`. Options take `value`, `checked`, `disabled` and
  an icon or label in the slot.
- **Ids:** `uniqueId('rkui-<component>')` from `src/shared/unique-id.ts`; an `id` the page passes wins.
- **Scripts:** an element script loads with `<script>import '@oneonefour/rkui/components/<name>/<name>.js'</script>`;
  no inline event handlers.
- **Markup reads top to bottom:** a ternary in markup only for a plain either/or. Three or more
  cases are decided in the frontmatter (e.g. `let mark: 'logo' | 'icon' | …`), and the markup has
  one line per case.
- **Reuse:** build composites from components (`Button`, `Field`, `Tile`), not by repeating their
  classes.
- **One style in pages:** docs pages, examples and the site's own components use the library's
  Astro components (`<Tabs>`, `<CodeBlock>`, `<Button>`), never its custom elements (`<rkui-…>`)
  or a component's markup written by hand. Custom elements appear only inside `src/components/`.
  Native elements with a utility class (`<span class="rkui-visually-hidden">`) are fine.
- **Header comment:** what it renders, where attributes go, one `@example`. Each prop has its own
  `/** */` comment in `Props`, with its default written "…; X when left out". No `@param` lists.

## Working with subagents

See `.claude/notes/PLAN.md`, "Agent workflow". In short:
- one task per agent, in its own worktree;
- shared files (`package.json`, the exports map, the CSS import list, the docs nav) change only in
  the coordinator's serial setup commits;
- the coordinator squash-merges each finished branch into `develop` as one commit with a plain
  message saying what it adds, then re-runs every check.
