/**
 * Swaps inline icons for references to the icon sprite, as a plain HTML page would write them.
 * An Astro page inlines each icon's SVG; a plain page points at the symbol of the same name in
 * the library's built sprite (dist/icons/sprite.svg), which `<use>` draws with the same colours.
 */
const icons = import.meta.glob('../../../dist/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Where a plain page keeps the sprite: dist/ copied into the site as rkui/. */
export const SPRITE = 'rkui/icons/sprite.svg'

/** An SVG's drawing, for comparison: what's inside the <svg>, with self-closing tags written alike. */
function drawing(svg) {
  return svg
    .slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'))
    .replaceAll(/\s*\/>/g, '/>')
    .trim()
}

/** @type {Map<string, string>} an icon's drawing → its name, e.g. the copy icon → 'copy' */
const ICON_NAMES = new Map()
for (const [path, svg] of Object.entries(icons)) {
  const name = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length)
  if (name !== 'sprite') ICON_NAMES.set(drawing(String(svg)), name)
}

/**
 * Replaces each inline library icon in some markup with an `<svg><use></svg>` pointing at the
 * sprite, keeping the icon's class and aria attributes. Other SVGs are left as they are.
 * @param {string} html
 * @returns {string}
 */
export function useSprite(html) {
  return html.replaceAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg>/g, (svg, attributes) => {
    const name = ICON_NAMES.get(drawing(svg))
    if (!name) return svg
    const kept = attributes.match(/\s(?:class|aria-[\w-]+)="[^"]*"/g) ?? []
    return `<svg${kept.join('')}><use href="${SPRITE}#${name}"></use></svg>`
  })
}
