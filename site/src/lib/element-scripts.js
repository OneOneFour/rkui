/**
 * Which library script defines each rkui custom element, read from the library's own code, so the
 * docs can't drift from it: the `customElements.define('rkui-…')` calls in the element scripts,
 * and the `defineElement('rkui-…', Component)` calls that register a Vue component as an element
 * for plain HTML pages. Those come only in the bundle, `rkui.js`.
 */
const sources = import.meta.glob(
  ['../../../src/components/*/*.js', '../../../src/components/*/*-element.ts'],
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
)

/** The import a page writes for the bundle of every element. */
const BUNDLE = '@oneonefour/rkui/rkui.js'

/** @type {Map<string, string>} element name → the import a page writes, e.g. 'rkui-stepper' → '@oneonefour/rkui/rkui.js' */
const ELEMENT_SCRIPTS = new Map()
/** @type {Map<string, string>} Vue component name → its element's name, e.g. 'Stepper' → 'rkui-stepper' */
const COMPONENT_ELEMENTS = new Map()
for (const [path, source] of Object.entries(sources)) {
  const specifier = path.replace('../../../src/', '@oneonefour/rkui/')
  for (const [, element] of String(source).matchAll(/customElements\.define\('(rkui-[a-z-]+)'/g)) {
    ELEMENT_SCRIPTS.set(element, specifier)
  }
  for (const [, element, component] of String(source).matchAll(
    /defineElement\('(rkui-[a-z-]+)', (\w+)\)/g,
  )) {
    ELEMENT_SCRIPTS.set(element, BUNDLE)
    COMPONENT_ELEMENTS.set(component, element)
  }
}

/**
 * The custom element a plain HTML page writes for a Vue component, or undefined when it has none.
 * @param {string} component the component's name, e.g. 'Stepper'
 * @returns {string | undefined}
 */
export function elementFor(component) {
  return COMPONENT_ELEMENTS.get(component)
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
