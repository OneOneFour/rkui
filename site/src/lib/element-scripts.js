/**
 * Which library script defines each rkui custom element, read from the library's own
 * `customElements.define('rkui-…')` calls, so the docs can't drift from the code.
 */
const sources = import.meta.glob('../../../src/components/*/*.js', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** @type {Map<string, string>} element name → the import a page writes, e.g. 'rkui-tabs' → '@oneonefour/rkui/components/folder/tabs.js' */
const ELEMENT_SCRIPTS = new Map()
for (const [path, source] of Object.entries(sources)) {
  const specifier = path.replace('../../../src/', '@oneonefour/rkui/')
  for (const [, element] of String(source).matchAll(/customElements\.define\('(rkui-[a-z-]+)'/g)) {
    ELEMENT_SCRIPTS.set(element, specifier)
  }
}

/**
 * The scripts some markup needs: one import per element script it uses, in order of first use.
 * @param {string} html
 * @returns {string[]}
 */
export function scriptsFor(html) {
  const scripts = new Set()
  for (const [, element] of html.matchAll(/<(rkui-[a-z-]+)[\s>]/g)) {
    const script = ELEMENT_SCRIPTS.get(element)
    if (script) scripts.add(script)
  }
  return [...scripts]
}
