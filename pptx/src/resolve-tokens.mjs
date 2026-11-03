// Resolves every rk-ui colour token to #rrggbb for light and dark, using the repo's own parser.
// Usage: node resolve-tokens.mjs <repo> <out.json>
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const [repo, out] = process.argv.slice(2)
const { parseTokens, splitFallback, resolveColor, THEMES } = await import(
  pathToFileURL(path.join(repo, 'scripts/check-contrast.mjs')).href
)

const css = readFileSync(path.join(repo, 'packages/rk-ui/tokens.css'), 'utf8')
const tokens = parseTokens(splitFallback(css).main)
const colours = {}
const skipped = []
for (const name of tokens.keys()) {
  try {
    const pair = Object.fromEntries(THEMES.map((t) => [t, resolveColor(tokens, name, t).toLowerCase()]))
    colours[name] = pair
  } catch {
    skipped.push(name)
  }
}

// Shadow option D (src/components/styleguide/shadow-variants.css): in dark mode a filled element's
// shadow is color-mix(in oklab, <fill> 75%, var(--line)); everything else uses --shadow-lit.
const EXTRUSION_FILLS = ['navy', 'teal', 'coral', 'coral-solid', 'yellow', 'green', 'sky', 'grape',
  'lilac', 'tangerine', 'apricot', 'selected']

function toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function fromLinear(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

function hexToOklab(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToHex([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return '#' + rgb.map((c) => Math.round(Math.min(1, Math.max(0, fromLinear(c))) * 255).toString(16).padStart(2, '0')).join('')
}

/** color-mix(in oklab, a weight, b) for two #rrggbb colours. */
function mixOklab(a, b, weight) {
  const [la, lb] = [hexToOklab(a), hexToOklab(b)]
  return oklabToHex(la.map((v, i) => v * weight + lb[i] * (1 - weight)))
}

const line = resolveColor(tokens, '--line', 'dark')
const extrusionsDark = Object.fromEntries(
  EXTRUSION_FILLS.map((fill) => [fill, mixOklab(resolveColor(tokens, `--${fill}`, 'dark'), line, 0.75)])
)

const shape = {}
for (const name of ['--radius', '--radius-pill', '--outline-width', '--shadow-offset', '--focus-width']) {
  shape[name] = tokens.get(name)
}

writeFileSync(
  out,
  JSON.stringify(
    {
      source: 'packages/rk-ui/tokens.css, resolved with scripts/check-contrast.mjs',
      colours,
      shadowD: {
        rule: 'dark mode: filled element shadow = color-mix(in oklab, fill 75%, --line); else --shadow-lit; navy and section buttons and checked chips use --shadow-lit',
        extrusionsDark,
      },
      seriesOrder: ['teal', 'yellow', 'navy', 'green', 'sky', 'coral', 'grape', 'tangerine'],
      shape,
      typeScale: { ratio: 1.3, lineHeightBody: 1.6, lineHeightHeading: 1.2 },
      fonts: { heading: 'Roboto Slab (weight 800 on the site)', body: 'Xmind', code: 'JetBrains Mono' },
      notTokensOfColour: skipped,
    },
    null,
    2
  ) + '\n'
)
console.log(`${Object.keys(colours).length} colours; skipped ${skipped.length}: ${skipped.join(' ')}`)
