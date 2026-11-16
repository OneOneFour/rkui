# rkui
![RKUI logo](logo/rkui-logo.png)
Rob King's "toon" component library. It covers flat token colours, 2px ink outlines, hard shadows that
follow a light direction, a hover-lift/press-sink "pop", light/dark themes, page palettes, shadow
modes and a depth mode. It is built to plug into Astro, Vue and plain HTML sites.

Published on npm as `@oneonefour/rkui`.

## What's where

| Folder | What it is | Ships to sites? |
|---|---|---|
| `src/` | The library itself, one folder per component under `components/` (its Vue component, its CSS, and the `*-element.ts` that registers its custom element if it has behaviour), with `tokens/`, `base/` (fonts, type, base styles), `shared/` (helpers more than one component uses), `head-scripts/` (scripts to paste inline into `<head>`), `fonts/` and `icons/` (the icon set and sources) | yes |
| `astro/` | The Astro integration, `@oneonefour/rkui/astro`: page setup (head scripts, one Vue, fonts as files, licences) and, in MDX, fenced code as CodeBlock and dollar maths as Maths and Equation. It sits outside `src/`, which never imports Astro | yes |
| `site/` | The docs and demo site: every component, with the theme, palette and shadow switches. An Astro app that imports the library as `@oneonefour/rkui/...`, as any site would | no |
| `build/` | Node scripts that build `dist/`: the bundled CSS and JS, the type declarations and the icons | no |
| `dist/` | The build output (not committed): `rkui.css`, `rkui.js`, `colors.js` (the colour tokens' light and dark hex values, for places CSS can't reach, such as a canvas), `fonts/`, `icons/`, `types/` | yes |
| `docs/` | The design language (`DESIGN.md`) and the decision record (`DECISIONS.md`) | no |
| `pptx/` | The PowerPoint template generator | no |

## Commands

```sh
npm install
npm run build       # builds dist/, then type-checks and builds the docs site into site/dist/
npm run dev         # builds dist/, then runs the docs site live on port 4321
```

## Install

```sh
npm install @oneonefour/rkui vue astro @astrojs/vue
```

Optional peers: `shiki` (CodeBlock's highlighting), `katex` (Equation and Maths) and `@astrojs/mdx`
(fenced code and `$…$` in MDX). A site using `katex` sets `rkui({ head: { styles: false } })` and
imports `katex/dist/katex.min.css` and then `@oneonefour/rkui/styles.css` in its layout; by default
rkui's stylesheet comes first, and KaTeX's rules beat its maths styles.

In `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import rkui from '@oneonefour/rkui/astro'

export default defineConfig({
  integrations: [vue({ appEntrypoint: '/src/vue-app.js' }), rkui()],
})
```

`rkui()` sets up what a site needs:

- the stylesheet, the global settings (below), the table mark and the enhance scripts, on every
  page;
- one copy of Vue, even when the library is linked;
- the dev server allowed to read the package's fonts, and fonts kept as files, never inlined;
- `rkui-licences.txt` in the build output: the fonts', icons' and rkui's licences, which a site
  serving them must ship. Link it from the footer;
- with `@astrojs/mdx`, fenced code as CodeBlock and `$…$` as Maths.

Each is on by default and each can be turned off (`rkui({ head: false, licences: false })`; the
options are in `astro/index.d.ts`). The layout still writes `<meta charset>` and
`<meta name="viewport" content="width=device-width, initial-scale=1" />`.

`src/vue-app.js` makes a component that throws while the site builds stop the build. Without it, a
component that throws, such as a Folder with no Tab, is left out of the page and the build passes:

```js
export default function setup(app) {
  app.config.throwUnhandledErrorInProduction = true
}
```

Add this line to `src/env.d.ts`, so `astro check` accepts the form and link attributes (`name`,
`disabled`, `href`) that rkui's components hand on to their native elements:

```ts
/// <reference types="@oneonefour/rkui/astro-attributes" />
```

Some components have a small helper script, a `*-enhance.js` file beside the component or the
CSS it serves: a browser fallback (the "more" dots and the sidebar in Safari and Firefox), or a
small extra the component works without (Pagination's scrollbar, the Table's entrance).
`src/enhance.js` imports every one; `rkui()` loads it on every page.

`dist/rkui.js` includes them for plain HTML pages.

## Global settings

Six settings style a whole site, from its configuration or code, with no control on the page:

| Setting | On `<html>` | Values |
|---|---|---|
| Theme | `data-theme` | `light`, `dark`; none follows the system |
| Palette | `data-palette` | `cream` (the default), `slate`, `greige` |
| Shadow, in dark mode | `data-shadow` | `outline` (the default), `block`, `color` |
| Highlight, in dark mode | `data-highlight` | `cream` (the default), `dark` |
| Scroll dots | `data-rkui-dots` | `plain` (the default), `pill` |
| Light | `style="--rkui-light-angle: …"` | an angle, `315deg` (the top left) by default |

- **Fixed, in Astro:** `rkui({ settings: { palette: 'slate', light: 45 } })` writes them on every
  page's `<html>` as it renders, so they need no JavaScript. An attribute the layout already
  writes on `<html>` wins.
- **Any other site** writes the attributes on `<html>` itself:
  `<html data-palette="slate" style="--rkui-light-angle: 45deg">`. Every setting but the theme
  also works on any element, for what is inside it.
- **Readers' choices:** `switchable` lists the settings readers may change, such as
  `rkui({ settings: { switchable: ['theme', 'palette'] } })`. A head script puts their stored
  choices back before the first paint, from the keys `rkui-theme`, `rkui-palette`, `rkui-shadow`,
  `rkui-highlight`, `rkui-dots` and `rkui-light`, which every site on the domain shares, so only
  the listed settings are put back. It is `['theme']` when left out; `[]` or `settings: false`
  injects no script. A plain HTML page pastes `src/head-scripts/settings-init.js` and edits its
  `switchable` line.
- **JavaScript:** `@oneonefour/rkui/settings` reads, chooses and applies them, for an app or a
  site's own controls; a plain HTML page imports the same from `rkui.js`:

  ```js
  import { applySetting, chooseSetting, readSetting } from '@oneonefour/rkui/settings'
  chooseSetting('palette', 'slate') // stores it, and tells the page's other controls
  applySetting('palette', 'slate') // restyles the page
  ```

- **Controls:** ThemeToggle and LightDirection ship with the library; any other is the site's own,
  like the docs site's settings drawer
  ([`site/src/components/SettingSwitch.astro`](site/src/components/SettingSwitch.astro)). The
  [Settings docs page](https://www.robertcking.com/rkui/settings/) has the whole API.

## Start here

- `docs/DESIGN.md`: the design language: how it looks and behaves, and why.
- `docs/DECISIONS.md`: when each design call was made, and the questions still open.
- `docs/ELEMENTS.md`: how a custom element is written here, step by step.
- `pptx/`: the PowerPoint template generator in the same style.
- `CLAUDE.md`: the rules every agent follows here.
