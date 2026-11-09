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
- **Branches.** `main` is the stable release; `develop` is where work lands.
  - Each feature or fix is built on its own branch off `develop` (an agent's worktree branch, or
    `feature/<name>`), then squash-merged into `develop` as one commit with a plain message saying
    what it adds. Never commit to `main`.
  - Rob releases by pull request from `develop` to `main` with a merge commit (never a squash, so
    the next release doesn't conflict), and tags the merge.
- **Never write site content.** No site copy, posts, bios or captions. Specimen and demo text in the
  docs site is fine.
- **Never hard-code a colour.** Colours come from the token files only
  (`src/tokens/`, and the docs-only token files). Derived colours become named tokens
  or documented recipes (DESIGN.md, "Shading").
- **Contrast is checked by hand** (WCAG AA; code text AAA), on the old styleguide's colour tables
  (`/rkui/old/`) until the new docs site has its own. Rob checks it himself. A shortfall is
  reported to Rob, never left unmentioned.
- **Library boundary.**
  - No `.css` or `.js` file under `src/` imports a framework (a `.astro` or `.vue` file, `astro` or
    `vue`). Components import the CSS classes and scripts beside them, never the other way round.
  - The `.ts` helpers that work with Vue (`tab-slot.ts`, `option-slot.ts`, `slot-html.ts`,
    `model-start.ts`, `component-id.ts`, `define-element.ts`) and the
    `*-element.ts` registrations may import Vue; no other `.ts` file in `src/` does, and none
    imports Astro. A new helper that needs Vue joins the list in `build/check-boundary.js`, which
    enforces all of this.
  - There are no `.astro` files under `src/`, and custom elements are only registered through
    `defineElement()` from a Vue component, never written by hand. The same check enforces it.
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
- **Every browser:** components and their animations work in Safari (iPhone too), Firefox and
  Chrome. A feature only Chromium has (`interpolate-size`, say) needs a way that works in all three;
  where CSS can't do it yet, a small plain-JavaScript fallback is acceptable for now.
- **Enhance scripts:** a `<name>-enhance.js` beside the component or the CSS it serves adds what a
  no-JavaScript component can't do in CSS: a browser fallback (it then does nothing where the CSS
  already works), or a small optional extra the component works without (a folder strip's bar
  and collapse, the Table's entrance). Plain JavaScript (no Vue), with as few listeners and observers as it
  needs, delegated or shared where it can be. It finds its elements with `eachElement()`
  (`src/shared/each-element.js`), so it also sets up ones a Vue app adds after it runs. A new script
  joins the list in `src/enhance.js` (the build checks the list) and in
  `site/src/lib/helper-scripts.js`; sites, the docs layout and `dist/rkui.js` load them through
  `src/enhance.js`.
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

## Vue components (`src/components/<name>/<Name>.vue`)

Three rules decide how a component is built:
1. **One file.** Every component is one `.vue` file beside its CSS. Astro pages, MDX and other
   `.vue` files all use the same file. No custom tags in library components or pages, except:
   - `<rkui-tab-item>`, the marker a Tab rendered by Astro writes for its Folder to read
     (`tab-items.ts`). It is server-only: the group replaces it, so it never reaches a page;
   - the custom elements for plain HTML pages (below).
2. **A component that wraps the page's content works with no JavaScript,** using the platform:
   radios for Folder, CSS hover and focus for Tooltip. It is never hydrated (no `client:`), because
   Vue waking up over the page's own HTML rebuilds it: page scripts lose their elements and
   nested islands restart. Inside a `.vue` widget its slot is Vue content, so it may take a
   `v-model` there (Folder's chosen tab).
3. **An interactive component is Vue with JavaScript, and draws its own markup,** with its
   behaviour in `<script setup>`. Its children, if any, are Vue components, never page HTML.
   `ColorPicker` with `custom` is the example: its `ColorTile`s are written in a `.vue` file. A
   group enforces this with a guard that throws when its slot is page HTML from Astro (`slotHtml()`
   in `src/shared/slot-html.ts`), saying what to write instead. In an Astro page the
   component, or the widget around it, gets `client:visible` (`client:load` only if it must run
   before it is scrolled to).

Every component follows these, so a site author learns them once:
- **Colour:** one prop, `color`, typed `Color` from `src/shared/hues.ts`: a palette hue (`Hue`) or a
  hex code (a component with fewer hues takes a subset of them, and hex). `colorVars()` there turns
  it into the component's custom properties (fill, text on it, tint) for its `vars`. A component
  whose hues are modifier classes (Button, Badge, StickyNote) keeps the class for a hue and uses
  `colorVars()` only when `isHex()`. Never a local list of hues, and never a page recolouring a
  component through `style` where `color` covers it.
- **Size:** `small` (boolean) for the small variant; `size` only ever takes a CSS length.
- **Open design choices:** a string prop named after the choice (`variant` if there's one), with
  "Open, see DECISIONS ("<section>")" in its comment only while DECISIONS lists it as open.
- **Props:** `defineProps<Props>()` with a plain `interface Props` that lists only the component's
  own props, destructured with defaults (`const { variant = 'split' } = defineProps<Props>()`).
  - No `extends` and no `@vue-ignore`: attributes a page hands on to the native element (`name`,
    `disabled`, `popovertarget`) are not props. `src/shared/astro-attributes.d.ts` types them for
    Astro pages; a new one joins that list, in alphabetical order.
- **Template style:** the `:` and `@` shorthands. Each attribute the component sets is written out
  on its element (`:class`, `:min`, `@click`; custom properties in `:style`, from a `computed` of
  the ones that are set, Spinner's `vars`). `v-bind="…"` only forwards the page's attributes.
- **Attributes:** `class` and `style` go on the component's outermost element. Other attributes go
  on the native control for form controls, otherwise on the outermost element.
  - Where they all go on the root, Vue's fallthrough does it; write nothing.
  - Where they split, `defineOptions({ inheritAttrs: false })` and the helpers in
    `src/shared/split-attrs.ts`: `splitAttrs()` for `class` and `style` against the rest,
    `controlAttrs()` for a form control in a Field. Call them from a `pageAttrs()` function that
    the template calls (`v-bind="pageAttrs().inner"`), not a `computed`: `useAttrs()` isn't
    reactive.
  - Bind each element's attributes once. Vue joins a written-out `class` or `style` with the
    page's. For any other attribute, `v-bind` comes last, so the page's wins; one the component
    must keep is left out of `pageAttrs()` (Dial's and Clock's `id`).
- **Form fields:** controls take `label`, `hint` and `error` and always render `<Field>`, which
  renders just its slot when all three are empty. A page's own `aria-describedby` is joined with
  the message id, never replaced (`fieldAttrs()` in `src/shared/field-attrs.ts`).
  - **`v-model`:** a form control declares it with `defineModel()` and binds it with `v-model` on
    its native control, so Vue casts the value and leaves a half-typed one (`1.0`) alone. Without
    a `v-model`, the page's `value` attribute is the starting value: copy it into the model in
    setup (`if (model.value === undefined) model.value = attrs.value`) and leave it out of the
    attributes bound to the control. Otherwise Vue's `v-model` writes an empty value over it, and
    the control gets `value` twice. Stepper is the example. The header comment says what the
    model holds, and that with `v-model` the parent's value is the starting value unless it is
    undefined; then `checked`, `selected`, `value` or the slot applies, on the server too, and is
    handed to the parent on mount.
  - **Before it wakes up:** every form control with a `v-model` puts `v-live-value` (or
    `v-live-checked` on a checkbox or radio) first, before its `v-model`, so what was typed or
    chosen before it woke up, or restored by the browser, isn't written over
    (`src/shared/live-value.ts`). A control with no JavaScript of its own (Input, Select) needs it
    too, as it wakes up inside an interactive widget. It goes first because it must read the
    control before Vue's `v-model` writes to it, which for a radio is as soon as it is created.
- **Lists of things are child components, never an array prop.** Options and tabs are each one
  tag inside their group: `<Folder label="Topics"><Tab label="One">…</Tab></Folder>`, the same in MDX,
  `.astro` and `.vue`. A child marks its own state (`checked`, `selected`); where only one can
  be, the first one marked wins, and the group's header comment says so.
  - A child that only carries data for its group (Tab) takes no other attributes: the
    group builds its markup, so `class`, `id` and the rest are dropped. Its header comment says so.
  - A group's slot comes in two shapes. From a `.vue` file it is vnodes. From MDX or `.astro` it is
    one vnode holding the slot's rendered HTML (`slot-html.ts`), because Astro renders each
    component on its own. The group reads both through a helper beside it: `tab-slot.ts` (over
    `tab-items.ts`) for tabs, `option-slot.ts` (over `option-group.ts`) for options.
  - An interactive group takes only vnodes (rule 3): ColorPicker's `tiles()` throws on the HTML
    shape when it has `custom`.
  - The group reads its slot while rendering (in the template or a `computed`), never in setup:
    Vue warns about a slot invoked there. A starting value read from the slot (Textarea's text,
    Select's and ChipGroup's choice) goes through `modelWithStart()` (`model-start.ts`).
  - An option in a `.vue` tree gets its group's name by `inject`; one rendered by Astro writes a
    placeholder that the group fills in.
  - **The one exception is Breadcrumbs**, which takes `items={[{ label, href }, …]}`. A trail is
    plain data, usually built from the page's URL, and the last item is always the current page.
- **Option groups** take `legend`, `name` (generated when left out) and `multiple`, and fill their
  `name` into their options: `<Segmented legend="Theme"><SegmentedOption value="light"
  checked>Light</SegmentedOption>…</Segmented>`. Options take `value`, `checked`, `disabled` and
  an icon or label in the slot.
- **Named slots:** `slot="icon"` from Astro and MDX, `<template #icon>` from a `.vue` file; the
  header comment shows both.
- **Ids:** `useComponentId('<component>')` from `src/shared/component-id.ts` (`useId()` behind an
  `rkui-<component>-` prefix, or a page-wide counter in an app with no `idPrefix`, such as a
  `client:only` island); an `id` the page passes wins.
- **Static first:** a component is props and a template, with no `onMounted`, unless it can't
  work without JavaScript (rule 3). Then:
  - its behaviour lives in the `.vue` file: event handlers in the template, `ref`s and small
    functions. Plain geometry and maths stay in `src/shared/*.js`;
  - it says in its header comment that it needs `client:visible` in an Astro page, and what it
    shows without it;
  - a control that only works with JavaScript (step buttons, a copy button) renders on the server
    and is hidden with `visibility: hidden` until the component sets `data-rkui-live` on mount, so
    nothing shifts; never `display: none`, `:hidden` or `:not(:defined)`. `data-rkui-live` goes on
    the component's own element that holds those controls, which its CSS selects by class, not on
    whatever happens to be outermost: CodeBlock's `<figure class="rkui-code">`, and Stepper's
    `.rkui-stepper` div, which sits inside the Field's frame when there is one;
  - an error it throws (a Folder with no Tab) stops the build: the docs site sets
    `throwUnhandledErrorInProduction` (`site/src/vue-app.js`).
- **Using one from Astro:** a component with behaviour gets `client:visible`; every other one gets
  no directive and ships no JavaScript. No inline event handlers.
- **Values worked out from props are `computed`:** with props destructured, a top-level `const`
  or `let` worked out from a prop is worked out once, and goes stale when the prop changes (a
  widget changes CodeBlock's `lang`). The template reads props directly. A plain `const` is only
  for values that don't depend on props. Something that reads `useAttrs()` or `useSlots()`, which
  aren't reactive, is a function the template calls instead (CodeBlock's `mark()`).
- **Decide in a `computed`:** a ternary in the template only for a plain either/or. Three or more
  cases are decided in a `computed` (`computed<'split' | 'stacked' | …>(() => …)`), or in a
  function when they read the attributes or slots (CodeBlock's `mark()`), and the template has
  one line per case.
- **Reuse:** build composites from components (`Button`, `Field`), not by repeating
  their classes. Icons are template-only components: `import CopyIcon from
  '@oneonefour/rkui/icons/copy.vue'`.
- **One style in pages:** docs pages, examples and the site's own components use the library's
  components (`<Folder>`, `<CodeBlock>`, `<Button>`), never a component's markup written by hand.
  Native elements with a utility class (`<span class="rkui-visually-hidden">`) are fine.
- **Demos in the docs:** written inline in the MDX page, inside `<Demo>`, as an Astro page writes
  them, with one import per component at the top of the page and `client:visible` on each
  component that runs in the browser. `site/demo-source.js` copies the source into Demo's `astro`
  prop, and Demo generates the Vue and HTML tabs from it.
  - A demo is a `.vue` file in `site/src/examples/`, passed as `vue={…}`, only when it needs one:
    a widget (`ref`, `v-model`, `@event`; its Demo is marked `widget`), script logic, a `<style>`
    a `style` attribute can't replace, a helper component of its own, or text that Markdown would
    change (`--` in `--rkui-step-1`).
  - Inline text follows JSX's rule for white space: text and a tag on separate lines run together.
    Put them on one line, or end the first line with `{' '}` as Prettier does; the build stops
    otherwise.
- **Header comment:** an HTML comment at the top of the file: what it renders, where attributes go,
  what needs `client:visible`, one `@example`. Each prop has its own `/** */` comment in `Props`,
  with its default written "…; X when left out". No `@param` lists.
- **Plain HTML pages:**
  - a no-JavaScript component is just its HTML, as the docs' HTML tab shows it;
  - a component with behaviour is also a custom element, registered from the same `.vue` file in a
    tiny `<name>-element.ts` beside it: `defineElement('rkui-stepper', Stepper)`
    (`src/shared/define-element.ts`, Vue's `defineCustomElement` without a shadow root). The
    element's attributes become the component's props and attributes. It reads them once, when it
    first starts: changing one later does nothing, and an element moved elsewhere keeps the ones it
    started with. `build/js.js` bundles the elements, with the Vue runtime, into `dist/rkui.js`. A
    plain page has no other way to say "put a Stepper here", so this is where custom tags belong.
  - children that must be Vue components have no plain HTML form: a plain page writes
    `<rkui-color-picker custom>`, which draws every hue, rather than its own ColorTiles.

## Working with subagents

See `.claude/notes/PLAN.md`, "Agent workflow". In short:
- one task per agent, in its own worktree;
- shared files (`package.json`, the exports map, the CSS import list, the docs nav) change only in
  the coordinator's serial setup commits;
- the coordinator squash-merges each finished branch into `develop` as one commit with a plain
  message saying what it adds, then re-runs every check.
