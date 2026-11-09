/**
 * Writes a Vue demo as an Astro page would: the `<script setup>` becomes the frontmatter, and the
 * template is printed again with Astro's syntax. `:attr="x"` becomes `attr={x}`, a
 * `<template #icon>` becomes `slot="icon"` on what it holds, `{{ x }}` becomes `{x}`, `:class` on
 * an element becomes `class:list`, and each library component that runs in the browser
 * (interactive-components.js) gets `client:visible`. Anything in the demo that has no Astro form
 * stops the build, as does a page Prettier can't read when it formats it.
 */
import { camelize } from 'vue'
import { parse } from 'vue/compiler-sfc'
import { formatCode } from './format-code.js'
import { needsClientVisible } from './interactive-components.js'

// The node and prop types of Vue's template tree (compiler-core's NodeTypes and ElementTypes).
const ELEMENT = 1
const TEXT = 2
const COMMENT = 3
const INTERPOLATION = 5
const ATTRIBUTE = 6
const COMPONENT = 1

/** The error for something in a demo that only a `.vue` file can say. */
function vueOnly(what) {
  return new Error(`A Vue demo with ${what} has no Astro form; mark its Demo \`widget\``)
}

/** The expression a bound prop holds: `x` for `:hue="x"`, and `hue` for the shorthand `:hue`. */
function boundValue(prop) {
  return prop.exp?.loc.source ?? camelize(prop.arg.content)
}

/**
 * One attribute or prop written for Astro: `:hue="x"` as `hue={x}`, and `:class` on an element as
 * `class:list={x}`. Vue's `ref` and `key`, any other directive, a modifier such as `.camel`, and a
 * `v-bind` with no attribute name throw.
 */
function printProp(prop, node) {
  if (prop.type === ATTRIBUTE) {
    if (prop.name === 'ref' || prop.name === 'key') throw vueOnly(prop.loc.source)
    return prop.loc.source
  }
  if (prop.name !== 'bind' || !prop.arg?.isStatic || prop.modifiers.length) {
    throw vueOnly(prop.loc.source)
  }
  const name = prop.arg.content
  const value = boundValue(prop)
  if (name === 'key') throw vueOnly(prop.loc.source)
  if (name === 'class' && node.tagType !== COMPONENT) return `class:list={${value}}`
  if (name === 'class' && /^[[{]/.test(value)) throw vueOnly(`a list of classes on <${node.tag}>`)
  return `${name}={${value}}`
}

/**
 * An element's attributes and bound props by name, each with its value as the demo writes it:
 * `custom` as '', `copy="never"` as 'never'.
 */
function attributesOf(node) {
  const attributes = {}
  for (const prop of node.props) {
    if (prop.type === ATTRIBUTE) attributes[prop.name] = prop.value?.content ?? ''
    else if (prop.arg?.isStatic) attributes[prop.arg.content] = boundValue(prop)
  }
  return attributes
}

/** The slot a `<template #name>` fills, or undefined for any other node. */
function slotName(node) {
  if (node.type !== ELEMENT || node.tag !== 'template') return undefined
  const slot = node.props.find((prop) => prop.name === 'slot')
  return slot && (slot.arg?.content ?? 'default')
}

/**
 * A `<template #name>`'s contents, for Astro: one element gets `slot="name"`, and anything else
 * goes in a `<Fragment slot="name">`. The default slot's contents are written as they are.
 */
function printSlot(node, name) {
  if (name === 'default') return printChildren(node.children)
  const [first] = node.children
  if (node.children.length === 1 && first.type === ELEMENT) {
    return printElement(first, [`slot="${name}"`])
  }
  return `<Fragment slot="${name}">${printChildren(node.children)}</Fragment>`
}

/** An element, with its attributes and children, written for Astro. */
function printElement(node, extraAttributes = []) {
  const name = slotName(node)
  if (name) return printSlot(node, name)
  const island = node.tagType === COMPONENT && needsClientVisible(node.tag, attributesOf(node))
  const attributes = [
    ...(island ? ['client:visible'] : []),
    ...node.props.map((prop) => printProp(prop, node)),
    ...extraAttributes,
  ]
  const start = [node.tag, ...attributes].join(' ')
  if (node.isSelfClosing) return `<${start} />`
  // A void element such as <input> has no end tag in the source either.
  if (!node.loc.source.endsWith(`</${node.tag}>`)) return `<${start}>`
  return `<${start}>${printChildren(node.children)}</${node.tag}>`
}

function printChildren(children) {
  return children.map(printNode).join('')
}

function printNode(node) {
  if (node.type === ELEMENT) return printElement(node)
  if (node.type === COMMENT) return node.loc.source
  // Astro reads a brace in text as the start of an expression.
  if (node.type === TEXT && /[{}]/.test(node.loc.source)) {
    throw new Error('A Vue demo with a brace in its text has no Astro form; write it as &#123;')
  }
  if (node.type === TEXT) return node.loc.source
  if (node.type === INTERPOLATION) return `{${node.content.loc.source}}`
  throw vueOnly(node.loc.source)
}

/**
 * The Astro page that writes the same demo as a Vue demo's source.
 * @param {string} vueSource the demo's `.vue` file
 * @returns {Promise<string>}
 */
export async function astroSource(vueSource) {
  const { descriptor, errors } = parse(vueSource)
  if (errors.length) throw errors[0]
  if (descriptor.script) throw vueOnly('a <script> that is not <script setup>')
  const script = descriptor.scriptSetup?.content.trim() ?? ''
  if (/from ['"]vue['"]/.test(script)) throw vueOnly("Vue's reactivity")
  const frontmatter = script ? `---\n${script}\n---\n\n` : ''
  const template = printChildren(descriptor.template.ast.children)
  // Astro scopes a page's styles itself; a Vue style that isn't scoped is a global one.
  const styles = descriptor.styles.map(
    (style) => `<style${style.scoped ? '' : ' is:global'}>${style.content}</style>`,
  )
  return formatCode([frontmatter + template.trim(), ...styles].join('\n\n'), 'astro')
}
