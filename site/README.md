# The rkui docs site

An Astro site that documents rkui, built with rkui itself. It imports the library as
`@oneonefour/rkui/...`, as any site would.

## Run it

From the repository root:

```sh
npm run dev                             # builds the library, then live at http://localhost:4321/rkui/
npm run build                           # type-checks, builds into site/dist/, indexes search
```

The site lives under `/rkui/` because it is published as a GitHub Pages project page
(`base` in `astro.config.js`). Internal links go through `link()` in `src/lib/pages.ts`, which
adds the base.

Search only works on the built site. To try it, build and then serve `site/dist/`:
`npm run preview`, then open `http://localhost:4322/rkui/`.

## Add a page

Copy a page in `src/content/docs/`, for example `button.mdx`, and change its frontmatter:

```yaml
---
title: Chip # the page's heading and its name in the sidebar
description: A small toggle. # the line under the heading, and the page's meta description
group: Components # the sidebar group it is listed under
order: 21 # sorts the pages; a group sits where its first page sits
---
```

The file name is the address: `chip.mdx` is `/rkui/chip/`, and `index.mdx` is the home page.
The sidebar is built from these files, so there is nothing else to register. To start a new
group, give a page a new `group`.

Write the page in Markdown. Fenced code blocks (` ```astro `, ` ```css `, ` ```sh `) show as
rkui's code block with a copy button.

## Show a demo

A demo is a small `.astro` file in `src/examples/<page>/`, for example `button/hues.astro`. Import it
twice in the page, as a component and with `?raw` for its source, and wrap it in `<Demo>`:

```mdx
import Demo from '../../components/Demo.astro'
import Hues from '../../examples/button/hues.astro'
import huesCode from '../../examples/button/hues.astro?raw'

<Demo code={huesCode} label="Button hues">
  <Hues />
</Demo>
```

The demo gets three folder tabs: Preview (the demo, live), Astro (the file's source) and HTML
(what it renders to). The preview lays things out in a row; add `stack` for a column.

## Where things are

| File                                 | What it does                                                      |
| ------------------------------------ | ----------------------------------------------------------------- |
| `src/content/docs/*.mdx`             | the pages                                                         |
| `src/examples/*.astro`               | the demos the pages show                                          |
| `src/content.config.ts`              | the frontmatter fields every page needs                           |
| `src/pages/[...slug].astro`          | renders every page with the layout                                |
| `src/layouts/DocsLayout.astro`       | the top bar, the sidebar and the content column                   |
| `src/components/Sidebar.astro`       | the page list, built from the pages' `group` and `order`          |
| `src/components/Search.astro`        | the search box and its results                                    |
| `pagefind-index.js`                  | builds the search index after `astro build`                       |
| `src/components/Demo.astro`          | a demo in Preview / Astro / HTML tabs                             |
| `src/components/ColorPalette.astro`  | the clickable colour blocks on the Colours page                   |
| `src/styles/docs.css`                | the site's own layout CSS                                         |
| `src/old/`, `src/pages/old.astro`    | the old one-page styleguide at `/rkui/old/`, kept to crib from    |
