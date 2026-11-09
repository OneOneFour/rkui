/**
 * Writes an inline demo as a Vue file. An inline demo's code is Astro source (demo-source.js):
 * its frontmatter's imports become the `<script setup>`, and its tags are printed again with
 * Vue's syntax. `attr={x}` becomes `:attr="x"`, `slot="icon"` on a component's child becomes a
 * `<template #icon>` around it, `<Fragment slot="icon">` becomes `<template #icon>`, `{x}` in text
 * becomes `{{ x }}` (and JSX's `{' '}` a space), and `client:visible` is dropped. Each library
 * component that runs in the browser (interactive-components.js) must have `client:visible`, and
 * no other component may. Anything else with no Vue form, and a file Vue can't compile, stops the
 * build.
 */
import { mdxToMdast } from 'satteri'
import { compileTemplate, parse } from 'vue/compiler-sfc'
import { flattenParagraphs } from '../../demo-source.js'
import { formatCode } from './format-code.js'
import { needsClientVisible } from './interactive-components.js'

/** Whether a tag names a component rather than an HTML element. */
function isComponent(name) {
  return /^[A-Z]/.test(name)
}

/**
 * An element's attributes by name, each with its value as the demo writes it: `custom` as '',
 * `copy="never"` as 'never'.
 */
function attributesOf(node) {
  const attributes = {}
  for (const { name, value } of node.attributes) {
    attributes[name] = typeof value === 'string' ? value : (value?.value ?? '')
  }
  return attributes
}

/** Throws unless a component has `client:visible` exactly when it runs in the browser. */
function checkClientVisible(node) {
  const attributes = attributesOf(node)
  const island = Object.keys(attributes).some((name) => name.startsWith('client:'))
  const needed = needsClientVisible(node.name, attributes)
  if (needed && !island) {
    throw new Error(`<${node.name}> runs in the browser; give it client:visible`)
  }
  if (island && !needed) {
    throw new Error(`<${node.name}> doesn't run in the browser; drop its client:visible`)
  }
}

/** One attribute written for Vue: `hue="navy"` as it is, `level={0.5}` as `:level="0.5"`. */
function printAttribute(attribute) {
  const { name, value } = attribute
  if (attribute.type !== 'mdxJsxAttribute') throw new Error(`{${value}} has no Vue form`)
  if (name.includes(':')) throw new Error(`${name} has no Vue form`)
  if (value === null) return name
  if (typeof value === 'string') return `${name}="${value.replaceAll('"', '&quot;')}"`
  if (value.value.includes('"')) {
    throw new Error(`Write ${name}={${value.value}} with single quotes`)
  }
  return `:${name}="${value.value}"`
}

/** The slot an element fills in its parent component, or undefined. */
function slotOf(node) {
  return node.attributes.find((attribute) => attribute.name === 'slot')?.value
}

/**
 * A node's children written for Vue, with the source's white space between them; Prettier lays
 * them out afterwards. As in JSX, white space that runs onto a new line between a tag and the text
 * just inside it is dropped. (demo-source.js stops the build on text beside a tag on another
 * line, where JSX and Vue would differ.)
 */
function printChildren(node, source, inComponent) {
  const { children } = node
  if (!children.length) return ''
  const first = children[0]
  const last = children.at(-1)
  const kept = (space, child) => (child.type === 'text' && space.includes('\n') ? '' : space)
  const open = source.slice(node.position.start.offset, first.position.start.offset).match(/\s*$/)
  const close = source.slice(last.position.end.offset, node.position.end.offset).match(/^\s*/)
  let printed = kept(open[0], first)
  children.forEach((child, index) => {
    if (index)
      printed += source.slice(children[index - 1].position.end.offset, child.position.start.offset)
    printed += printNode(child, source, inComponent)
  })
  return printed + kept(close[0], last)
}

/** An element, with its attributes and children, written for Vue. */
function printElement(node, source, inComponent) {
  const component = isComponent(node.name)
  const slot = slotOf(node)
  if (node.name === 'Fragment') {
    if (!slot) throw new Error('A <Fragment> with no slot has no Vue form')
    return `<template #${slot}>${printChildren(node, source, false)}</template>`
  }
  if (component) checkClientVisible(node)
  const attributes = node.attributes
    .filter(({ name }) => !name?.startsWith('client:') && !(inComponent && name === 'slot'))
    .map(printAttribute)
  const start = [node.name, ...attributes].join(' ')
  const { end } = node.position
  const selfClosing = source.slice(end.offset - 2, end.offset) === '/>'
  const element = selfClosing
    ? `<${start} />`
    : `<${start}>${printChildren(node, source, component)}</${node.name}>`
  return inComponent && slot ? `<template #${slot}>${element}</template>` : element
}

function printNode(node, source, inComponent) {
  const { start, end } = node.position
  if (node.type === 'text') return source.slice(start.offset, end.offset)
  // JSX's {' '}, which keeps a space at the end of a line, is the space it stands for.
  if (node.type.endsWith('Expression') && /^(['"]) \1$/.test(node.value.trim())) return ' '
  if (node.type.endsWith('Expression')) return `{{ ${node.value.trim()} }}`
  if (node.type.startsWith('mdxJsx')) return printElement(node, source, inComponent)
  throw new Error(`An inline demo with ${node.type} has no Vue form`)
}

/** Throws if Vue can't compile the file. */
function checkCompiles(file) {
  const { descriptor, errors } = parse(file)
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: 'demo.vue',
    id: 'demo',
  })
  const [error] = [...errors, ...template.errors]
  if (error) throw new Error(`Its Vue tab doesn't compile: ${error.message ?? error}`)
}

/**
 * The Vue file that writes the same demo as an inline demo's Astro source.
 * @param {string} astroSource the demo's code, as demo-source.js gives it
 * @returns {Promise<string>}
 */
export async function vueSource(astroSource) {
  const [, imports, body] = astroSource.match(/^(?:---\n([\s\S]*?)\n---\n)?([\s\S]*)$/)
  const tree = mdxToMdast(body, { position: true })
  const root = { ...tree, children: flattenParagraphs(tree.children) }
  const template = printChildren(root, body, false)
  const script = imports ? `<script setup>\n${imports}\n</script>\n\n` : ''
  const file = await formatCode(`${script}<template>\n${template}\n</template>\n`, 'vue')
  checkCompiles(file)
  return file
}
