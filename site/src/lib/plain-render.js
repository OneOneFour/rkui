/**
 * Renders a Vue demo's template as a plain HTML page writes it. The template is rendered on its
 * own, with each component it imports registered by name, except that a component with a custom
 * element for plain pages (Stepper) is drawn as that element, with the attributes the demo gives
 * it: `<rkui-stepper label="Quantity" value="3">`. Everything else, and such a component given a
 * list or an object, renders as it does in the page.
 */
import * as Vue from 'vue'
import { parse } from 'vue/compiler-sfc'
import { renderToString } from 'vue/server-renderer'
import { elementFor } from './element-scripts.js'

const library = import.meta.glob(['../../../src/components/*/*.vue', '../../../dist/icons/*.vue'], {
  import: 'default',
  eager: true,
})

/** The library component a demo imports from `specifier`, e.g. '@oneonefour/rkui/icons/sun.vue'. */
function libraryComponent(specifier) {
  const path = specifier
    .replace('@oneonefour/rkui/components/', '../../../src/components/')
    .replace('@oneonefour/rkui/icons/', '../../../dist/icons/')
  const component = library[path]
  if (!component) throw new Error(`A demo for a plain page imports ${specifier}`)
  return component
}

/**
 * A component that writes `element` with the attributes it is given, and nothing inside. Given a
 * list or an object, which no attribute can hold (Range's `ticks`), it writes `component`'s own
 * markup instead, as a plain page would.
 */
function standIn(element, component) {
  return {
    inheritAttrs: false,
    render() {
      const attributes = Object.values(this.$attrs).every((value) => typeof value !== 'object')
      return attributes ? Vue.h(element, this.$attrs) : Vue.h(component, this.$attrs, this.$slots)
    },
  }
}

/**
 * The components a demo's `<script setup>` imports, by the names it gives them. The script must
 * be imports only: a plain page has nothing else to give the template.
 */
function importedComponents(script) {
  const components = {}
  for (const line of script.split('\n').filter((line) => line.trim())) {
    const [, name, specifier] = line.match(/^import (\w+) from '([^']+)'$/) ?? []
    if (!name) throw new Error(`A demo for a plain page has more than imports: ${line}`)
    const element = elementFor(name)
    const component = libraryComponent(specifier)
    components[name] = element ? standIn(element, component) : component
  }
  return components
}

/**
 * Whether a Vue demo's template uses a component with a custom element for plain pages.
 * @param {string} vueSource the demo's `.vue` file
 * @returns {boolean}
 */
export function usesElement(vueSource) {
  const template = parse(vueSource).descriptor.template?.content ?? ''
  return [...template.matchAll(/<([A-Z]\w*)/g)].some(([, name]) => elementFor(name))
}

/**
 * A Vue demo's template rendered to HTML, with components that have a custom element written as
 * that element. A template that uses a component it doesn't import stops the build.
 * @param {string} vueSource the demo's `.vue` file
 * @returns {Promise<string>}
 */
export async function plainRender(vueSource) {
  const { descriptor } = parse(vueSource)
  const template = descriptor.template.content
  const components = importedComponents(descriptor.scriptSetup?.content ?? '')
  for (const [, name] of template.matchAll(/<([A-Z]\w*)/g)) {
    if (!components[name]) throw new Error(`A demo uses <${name}> without importing it`)
  }
  // Compiled without the script's bindings, the template finds components by name.
  const app = Vue.createSSRApp({ components, template })
  app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('rkui-')
  return renderToString(app)
}
