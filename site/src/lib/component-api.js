/**
 * A component's API, read from its own `.vue` file when the site is built, so the reference on its
 * docs page can't drift from it. Vue's own SFC parser (`vue/compiler-sfc`) splits the file and
 * parses its script as TypeScript; the reference then reads:
 * - props from `interface Props`: each one's type, its `/** *\/` comment, and its default, from
 *   `defineProps`' destructuring or the comment's "…; X when left out";
 * - `v-model` from each `defineModel()` and the `/** *\/` comment above it;
 * - slots from the template's `<slot>`s and the `slots.x` and `$slots.x` the component reads,
 *   each described by the header comment's sentences that mention it;
 * - where attributes go, from the header comment's sentences that say so.
 */
import { babelParse, parse } from 'vue/compiler-sfc'
import { link } from './pages'

const sources = import.meta.glob('../../../src/components/*/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * @typedef {object} TypePart one piece of a prop's type: code as written, or plain words
 * @property {string} [code] e.g. `'top'`
 * @property {string} [words] e.g. 'a palette hue or a hex code'
 * @property {string} [href] where the words link to
 */

/**
 * @typedef {object} Entry one prop, or one `v-model`
 * @property {string} name as a template writes it, e.g. 'value-display' or 'v-model'
 * @property {TypePart[]} type the parts of its type, read as alternatives
 * @property {string} defaultValue its default in words or code, '' when it has none
 * @property {string} description its comment, less the default
 */

/**
 * @typedef {object} Slot
 * @property {string} name 'default', or the named slot's name
 * @property {string[]} description the header comment's sentences that mention it
 */

/**
 * @typedef {object} ComponentApi
 * @property {string} name e.g. 'Range'
 * @property {string} file the file under src/components/, e.g. 'range/Range.vue'
 * @property {Entry[]} props
 * @property {Entry[]} models
 * @property {Slot[]} slots
 * @property {string[]} attributes the header comment's sentences on where attributes go
 */

/** Imported types that read better as words, and the section of the docs that explains them. */
const NAMED_TYPES = {
  Hue: { words: 'a palette hue', href: link('colors/#recolouring-a-component') },
  HueOrHex: {
    words: 'a palette hue or a hex code',
    href: link('colors/#recolouring-a-component'),
  },
}

/**
 * The API of one library component.
 * @param {string} name the component's name, which is its file's, e.g. 'Range'
 * @returns {ComponentApi}
 */
export function componentApi(name) {
  const path = Object.keys(sources).find((key) => key.endsWith(`/${name}.vue`))
  if (!path) throw new Error(`There is no component ${name}.vue in src/components/`)
  const source = String(sources[path])
  const { descriptor } = parse(source, { filename: path })
  const script = descriptor.scriptSetup?.content ?? ''
  const program = babelParse(script, { plugins: ['typescript'], sourceType: 'module' }).program
  const header = headerSentences(source)
  const types = localTypes(program)
  const text = (node) => script.slice(node.start, node.end)

  return {
    name,
    file: path.split('/src/components/')[1],
    props: readProps(program, types, text),
    models: readModels(program, types, text),
    slots: readSlots(program, descriptor.template?.ast).map((slot) => ({
      name: slot,
      description: slotDescription(header, slot),
    })),
    attributes: header.filter((sentence) => /attributes|`class`/.test(sentence)),
  }
}

/** Each prop in `interface Props`, with its default from the `defineProps` destructuring. */
function readProps(program, types, text) {
  const props = program.body.find(
    (node) => node.type === 'TSInterfaceDeclaration' && node.id.name === 'Props',
  )
  if (!props) return []
  const defaults = destructuredDefaults(program, text)
  return props.body.body.map((member) => {
    const { description, defaultValue } = splitDefault(docComment(member))
    const name = member.key.name
    const typeNode = member.typeAnnotation.typeAnnotation
    // The comment's default says more ("'drawer', a drawer sunk into its parent"), unless the code
    // gives another one; a boolean left out is false.
    const fromCode = defaults.get(name)
    const commentAgrees = !fromCode || fromCode === 'false' || defaultValue.includes(fromCode)
    const boolean = typeNode.type === 'TSBooleanKeyword' ? 'false' : ''
    return {
      name: kebabCase(name),
      type: typeParts(typeNode, types, text),
      defaultValue: member.optional
        ? (commentAgrees && defaultValue) || fromCode || boolean
        : 'required',
      description,
    }
  })
}

/** Each `defineModel()`, as `v-model` or `v-model:name`. */
function readModels(program, types, text) {
  const models = []
  for (const node of program.body) {
    if (node.type !== 'VariableDeclaration') continue
    const call = node.declarations[0].init
    if (call?.type !== 'CallExpression' || call.callee.name !== 'defineModel') continue
    const modelName = call.arguments[0]?.type === 'StringLiteral' ? call.arguments[0].value : ''
    const typeNode = call.typeParameters?.params[0]
    const { description, defaultValue } = splitDefault(
      docComment(node).replace(/ \(`v-model`\)/, ''),
    )
    models.push({
      name: modelName ? `v-model:${modelName}` : 'v-model',
      type: typeNode ? typeParts(typeNode, types, text) : [],
      defaultValue,
      description,
    })
  }
  return models
}

/** The default each destructured prop is given, as written: `placement = 'top'` → `'top'`. */
function destructuredDefaults(program, text) {
  const defaults = new Map()
  for (const node of program.body) {
    if (node.type !== 'VariableDeclaration') continue
    const { id, init } = node.declarations[0]
    if (init?.callee?.name !== 'defineProps' || id.type !== 'ObjectPattern') continue
    for (const property of id.properties) {
      if (property.value?.type === 'AssignmentPattern') {
        defaults.set(property.key.name, text(property.value.right))
      }
    }
  }
  return defaults
}

/** The slots the component renders or reads: `default` first, then the named ones in order. */
function readSlots(program, template) {
  const names = new Set()
  walk(program, (node) => {
    if (
      node.type === 'MemberExpression' &&
      node.object.type === 'Identifier' &&
      node.object.name === 'slots' &&
      node.property.type === 'Identifier'
    ) {
      names.add(node.property.name)
    }
  })
  walkTemplate(template, (node) => {
    if (node.tag === 'slot') {
      const nameAttribute = node.props.find((prop) => prop.name === 'name')
      names.add(nameAttribute?.value?.content ?? 'default')
    }
    // The `$slots.x` an expression reads, in a directive (`v-if="$slots.icon"`) or `{{ }}`.
    const expressions = [node.content, ...(node.props ?? []).map((prop) => prop.exp)]
    for (const expression of expressions) {
      if (typeof expression?.content !== 'string') continue
      for (const [, slot] of expression.content.matchAll(/\$slots\.(\w+)/g)) names.add(slot)
    }
  })
  return [...names].sort((a, b) => (a === 'default' ? -1 : b === 'default' ? 1 : 0))
}

/** Calls `visit` on every node of a Babel AST. */
function walk(node, visit) {
  if (!node || typeof node.type !== 'string') return
  visit(node)
  for (const [key, value] of Object.entries(node)) {
    if (key === 'leadingComments' || key === 'trailingComments' || key === 'loc') continue
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child && typeof child === 'object') walk(child, visit)
    }
  }
}

/** Calls `visit` on every element and `{{ }}` of a template's AST. */
function walkTemplate(node, visit) {
  if (!node) return
  visit(node)
  for (const child of node.children ?? []) walkTemplate(child, visit)
  for (const branch of node.branches ?? []) walkTemplate(branch, visit)
}

/** The local type aliases and interfaces, by name, to spell out where a prop uses one. */
function localTypes(program) {
  const types = new Map()
  for (const node of program.body) {
    if (node.type === 'TSTypeAliasDeclaration') types.set(node.id.name, node.typeAnnotation)
    if (node.type === 'TSInterfaceDeclaration' && node.id.name !== 'Props') {
      types.set(node.id.name, node.body)
    }
  }
  return types
}

/**
 * A type as parts to show: a union's members each in turn, less `undefined`; a palette type in
 * words; a local type spelled out; anything else as written.
 * @returns {TypePart[]}
 */
function typeParts(node, types, text) {
  if (node.type === 'TSUnionType') {
    return node.types
      .filter((member) => member.type !== 'TSUndefinedKeyword')
      .flatMap((member) => typeParts(member, types, text))
  }
  if (node.type === 'TSTypeReference' && node.typeName.type === 'Identifier') {
    const name = node.typeName.name
    if (NAMED_TYPES[name]) return [NAMED_TYPES[name]]
    if (types.has(name)) return typeParts(types.get(name), types, text)
  }
  if (node.type === 'TSTemplateLiteralType' && text(node) === '`#${string}`') {
    return [{ words: 'a hex code' }]
  }
  if (node.type === 'TSInterfaceBody') {
    const fields = node.body.map((member) => text(member).replace(/[;,]$/, ''))
    return [{ code: `{ ${fields.join('; ')} }` }]
  }
  if (node.type === 'TSArrayType') {
    const element = typeParts(node.elementType, types, text)
    if (element.length === 1 && element[0].code) return [{ code: `${element[0].code}[]` }]
  }
  return [{ code: text(node) }]
}

/** A node's `/** *\/` comment as one line of text, or '' when it has none. */
function docComment(node) {
  const comment = node.leadingComments?.findLast(
    (each) => each.type === 'CommentBlock' && each.value.startsWith('*'),
  )
  if (!comment) return ''
  return comment.value
    .split('\n')
    .map((line) => line.replace(/^\s*\*?\s?/, ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Splits a comment's "…; X when left out." off as the default: "The visible label; none when left
 * out." → 'The visible label.' and 'none'. A comment that says it another way is kept whole.
 */
function splitDefault(comment) {
  const match = comment.match(/^(.*?);\s*([^;]+?),? when left out\.(.*)$/)
  if (!match) return { description: comment, defaultValue: '' }
  const [, before, defaultValue, after] = match
  return { description: `${before}.${after}`.trim(), defaultValue }
}

/**
 * The header comment's sentences, less its `@example`, with the lines of each paragraph (or list
 * item) joined.
 */
function headerSentences(source) {
  if (!source.startsWith('<!--')) return []
  const comment = source.slice(4, source.indexOf('-->')).split('@example')[0]
  return comment
    .split(/\n\s*\n|\n(?=\s*(?:-|\d\.) )/)
    .map((paragraph) =>
      paragraph
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^(?:-|\d\.) /, ''),
    )
    .flatMap((paragraph) => paragraph.split(/(?<!\b(?:e\.g|i\.e)\.)(?<=[.!?]\)?)\s+(?=[A-Z`(])/))
    .filter(Boolean)
}

/**
 * What the header comment says a slot holds: its clauses that start "The slot …" (or "The `icon`
 * slot …"), else every sentence that mentions it. How to fill a named slot is left out, as the
 * reference says that once.
 */
function slotDescription(header, slot) {
  const opening = slot === 'default' ? /^(?:the|its|the default) slot\b/i : `the \`${slot}\` slot`
  const clauses = header.flatMap(splitClauses).filter((clause) => {
    return typeof opening === 'string'
      ? clause.toLowerCase().startsWith(opening)
      : opening.test(clause)
  })
  const found = clauses.length ? clauses : header.filter((sentence) => mentionsSlot(sentence, slot))
  return found.map((sentence) => {
    const tidy = sentence.replace(/\s*\([^()]*slot="[^"]*"[^()]*\)/g, '').replace(/[.:]?$/, '.')
    return tidy[0].toUpperCase() + tidy.slice(1)
  })
}

/** A sentence's clauses, split at each semicolon outside brackets and code. */
function splitClauses(sentence) {
  const clauses = ['']
  let depth = 0
  let code = false
  for (const character of sentence) {
    if (character === '`') code = !code
    if (!code && character === '(') depth++
    if (!code && character === ')') depth--
    if (character === ';' && depth === 0 && !code) clauses.push('')
    else clauses[clauses.length - 1] += character
  }
  return clauses.map((clause) => clause.trim())
}

/** Whether a header sentence mentions the slot: by name for a named slot, else "the slot". */
function mentionsSlot(sentence, slot) {
  if (slot === 'default') return /\b(?:default|the|its) slot\b|\bslot is\b/i.test(sentence)
  return (
    sentence.includes(`\`${slot}\``) ||
    sentence.includes(`slot="${slot}"`) ||
    sentence.includes(`"${slot}" slot`)
  )
}

/** A camelCase name as a template writes it: `valueDisplay` → `value-display`. */
function kebabCase(name) {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

/**
 * Text with its `code` spans marked, to render each part as text or `<code>`.
 * @param {string} text
 * @returns {{ text: string, code: boolean }[]}
 */
export function codeSpans(text) {
  return text.split('`').map((part, i) => ({ text: part, code: i % 2 === 1 }))
}
