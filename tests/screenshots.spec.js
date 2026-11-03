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
  // The palette page in every palette, and in dark mode with both shadow modes.
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
  { path: 'old/', theme: 'light', palette: 'cream', shadow: 'slab' },
]

for (const { path, theme, palette, shadow } of SHOTS) {
  const pageName = path === '' ? 'home' : path.replace(/\/$/, '').replaceAll('/', '-')
  const name = `${pageName}-${theme}-${palette}-${shadow}`

  test(name, async ({ page }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))

    await page.goto(path)
    await page.evaluate(
      ([theme, palette, shadow]) => {
        const root = document.documentElement
        root.dataset.theme = theme
        root.dataset.palette = palette
        root.dataset.shadow = shadow
      },
      [theme, palette, shadow],
    )
    await page.screenshot({ path: `screenshots/${name}.png`, fullPage: false })

    expect(errors, 'the page threw no errors').toEqual([])
  })
}
