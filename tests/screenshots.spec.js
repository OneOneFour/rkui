// Screenshots of the docs site, saved to screenshots/ for a person (or an agent) to look at. They
// are not compared against anything. Every docs page is shot in light and dark; the Colours page
// in every palette and shadow mode too; the old styleguide once.
import { readdirSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Every page in site/src/content/docs/, as a path under the site's base ('' is the home page).
const DOCS_PAGES = readdirSync('site/src/content/docs')
  .filter((file) => file.endsWith('.mdx'))
  .map((file) => (file === 'index.mdx' ? '' : `${file.replace(/\.mdx$/, '')}/`))

const SHOTS = [
  ...DOCS_PAGES.flatMap((path) => [
    { path, theme: 'light', palette: 'cream', shadow: 'slab' },
    { path, theme: 'dark', palette: 'cream', shadow: 'slab' },
  ]),
  // The palette page in every palette, and in dark mode with every shadow mode.
  ...['slate', 'greige'].map((palette) => ({
    path: 'colors/',
    theme: 'light',
    palette,
    shadow: 'slab',
  })),
  ...['slate', 'greige'].map((palette) => ({
    path: 'colors/',
    theme: 'dark',
    palette,
    shadow: 'slab',
  })),
  ...['cream', 'slate', 'greige'].map((palette) => ({
    path: 'colors/',
    theme: 'dark',
    palette,
    shadow: 'color',
  })),
  { path: 'colors/', theme: 'dark', palette: 'cream', shadow: 'block' },
  { path: 'old/', theme: 'light', palette: 'cream', shadow: 'slab' },
]

for (const { path, theme, palette, shadow } of SHOTS) {
  const pageName = path === '' ? 'home' : path.replace(/\/$/, '').replaceAll('/', '-')
  const name = `${pageName}-${theme}-${palette}-${shadow}`

  test(name, async ({ page }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    // Stored before the page loads, as a reader's choice would be, so the head scripts apply it
    // before the first paint and nothing switches over while the shot is taken.
    await page.addInitScript(
      ([theme, palette, shadow]) => {
        localStorage.setItem('rkui-theme', theme)
        localStorage.setItem('rkui-palette', palette)
        localStorage.setItem('rkui-shadow', shadow)
      },
      [theme, palette, shadow],
    )
    await page.goto(path)
    // Wait until every island on screen has woken up (Astro drops `ssr` once it has hydrated).
    await page.waitForFunction(() =>
      [...document.querySelectorAll('astro-island[ssr]')].every((island) => {
        const box = island.getBoundingClientRect()
        return box.bottom < 0 || box.top > innerHeight
      }),
    )
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: false })

    expect(errors, 'the page threw no errors').toEqual([])
  })
}
