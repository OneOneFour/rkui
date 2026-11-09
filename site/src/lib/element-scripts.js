/**
 * Which rkui custom elements there are, read from the library's own code, so the docs can't drift
 * from it: the `defineElement('rkui-…', Component)` calls in the `*-element.ts` files, which
 * register a Vue component as an element for plain HTML pages. Those come only in the bundle,
 * `rkui.js`.
 */
const sources = import.meta.glob('../../../src/components/*/*-element.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** The import a page writes for the bundle of every element. */
const BUNDLE = '@oneonefour/rkui/rkui.js'

/** @type {Map<string, string>} Vue component name → its element's name, e.g. 'Stepper' → 'rkui-stepper' */
const COMPONENT_ELEMENTS = new Map()
for (const source of Object.values(sources)) {
  for (const [, element, component] of String(source).matchAll(
    /defineElement\('(rkui-[a-z-]+)', (\w+)\)/g,
  )) {
    COMPONENT_ELEMENTS.set(component, element)
  }
}
/** The names of every element, e.g. 'rkui-stepper'. */
const ELEMENTS = new Set(COMPONENT_ELEMENTS.values())

/**
 * The custom element a plain HTML page writes for a Vue component, or undefined when it has none.
 * @param {string} component the component's name, e.g. 'Stepper'
 * @returns {string | undefined}
 */
export function elementFor(component) {
  return COMPONENT_ELEMENTS.get(component)
}

/**
 * The scripts some markup needs: the bundle, when it uses an rkui custom element.
 * @param {string} html
 * @returns {string[]}
 */
export function scriptsFor(html) {
  for (const [, element] of html.matchAll(/<(rkui-[a-z-]+)[\s>]/g)) {
    if (ELEMENTS.has(element)) return [BUNDLE]
  }
  return []
}
