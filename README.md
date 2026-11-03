# rkui
![RKUI logo](logo/rkui-logo.png)
Rob King's "toon" component library. It covers flat token colours, 2px ink outlines, hard shadows that
follow a light direction, a hover-lift/press-sink "pop", light/dark themes, page palettes, shadow
modes and a depth mode. It is built to plug into Astro, Vue and plain HTML sites.

Published on npm as `@oneonefour/rkui` (not yet released).

## What's where

| Folder | What it is | Ships to sites? |
|---|---|---|
| `src/` | The library itself, one folder per component under `components/` (its CSS, its custom element script if it has one, and its Astro component), with `tokens/`, `base/` (fonts, type, base styles), `shared/` (helpers more than one component uses), `head-scripts/` (scripts to paste inline into `<head>`), `fonts/` and `icons/` (the icon set and sources) | yes |
| `site/` | The docs and demo site: every component, with the theme, palette and shadow switches. An Astro app that imports the library as `@oneonefour/rkui/...`, as any site would | no |
| `build/` | Node scripts that build `dist/`: the bundled CSS and JS, the type declarations and the icons | no |
| `dist/` | The build output (not committed): `rkui.css`, `rkui.js`, `fonts/`, `icons/`, `types/` | yes |
| `docs/` | The design language (`DESIGN.md`) and the decision record (`DECISIONS.md`) | no |
| `pptx/` | The PowerPoint template generator | no |

## Commands

```sh
npm install
npm run build       # builds dist/, then type-checks and builds the docs site into site/dist/
npm run dev         # builds dist/, then runs the docs site live on port 4321
```

## Start here

- `docs/DESIGN.md`: the design language: how it looks and behaves, and why.
- `docs/DECISIONS.md`: when each design call was made, and the questions still open.
- `docs/ELEMENTS.md`: how a custom element is written here, step by step.
- `pptx/`: the PowerPoint template generator in the same style.
- `CLAUDE.md`: the rules every agent follows here.
