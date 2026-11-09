/**
 * Which colour tokens the docs page shows, and how. Only names and groupings are read from the
 * token files; every value shown on the page comes from the browser (see show-colors.js).
 */
import rawColorsCss from '@oneonefour/rkui/tokens/colors.css?raw'
import rawPalettesCss from '@oneonefour/rkui/tokens/palettes.css?raw'
import rawChartTokensCss from './chart-tokens.css?raw'
import rawIllustrationTokensCss from './illustration-tokens.css?raw'

const COLOR_CSS = [rawColorsCss, rawChartTokensCss, rawIllustrationTokensCss].join('\n')

/**
 * Tokens in those files that get no swatch: a length, and a mix of the element's own text colour.
 */
const NOT_SWATCHES = new Set(['--rkui-illustration-outline', '--rkui-icon-fill-neutral'])

/** The names of every `--name: value;` declaration in a CSS string, in order, without repeats. */
function tokenNamesIn(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const declarations = withoutComments.matchAll(/(--[\w-]+)\s*:\s*[^;]+;/g)
  return [...new Set([...declarations].map(([, name]) => name))]
}

/** Every token the colour files declare. */
export const tokenNames: Set<string> = new Set(tokenNamesIn(COLOR_CSS))

/** The page palettes' names, in the order palettes.css gives them: the first is the default. */
export const paletteNames: string[] = [
  ...rawPalettesCss.matchAll(/\[data-palette='([\w-]+)'\]/g),
].map(([, name]) => name)
export const defaultPalette: string = paletteNames[0]

/** A foreground token on a background token. */
export interface ColorPair {
  fg: string
  bg: string
}

const SURFACES = ['--rkui-surface', '--rkui-raised']
/** Code sits on the page palette's panel. */
const CODE_PANELS = ['--rkui-panel']

/** A panel carries --rkui-fg text: the page surfaces and the tints. */
function isPanel(name: string): boolean {
  return SURFACES.includes(name) || name.endsWith('-tint')
}

/**
 * The --rkui-on-* token a fill's own label would have; `--rkui-coral-solid` shares
 * `--rkui-on-coral`.
 */
function ownLabel(fill: string): string {
  return `--rkui-on-${fill.replace(/^--rkui-/, '').replace(/-solid$/, '')}`
}

/** A sticky note's fill, which carries --rkui-on-fill text. The tape is a see-through wash. */
function isNote(name: string): boolean {
  return name.startsWith('--rkui-note-') && name !== '--rkui-note-tape'
}

/**
 * A fill is a hue with -deep or -tint variants, a sticky note, or a colour with its own --rkui-on-*
 * label.
 */
function isFill(name: string): boolean {
  if (name.startsWith('--rkui-on-')) return false
  if (isNote(name)) return true
  const hasVariant = tokenNames.has(`${name}-deep`) || tokenNames.has(`${name}-tint`)
  return hasVariant || tokenNames.has(ownLabel(name))
}

/** The label colour used on a fill: its own --rkui-on-* token, or --rkui-on-fill. */
function labelFor(fill: string): string {
  return tokenNames.has(ownLabel(fill)) ? ownLabel(fill) : '--rkui-on-fill'
}

/**
 * The pairs a colour token's swatch shows: panels carry --rkui-fg; fills carry their label; a label
 * is shown on every fill that uses it; syntax colours are read on the page palette's panel, and any other
 * colour on --rkui-surface and --rkui-raised.
 *
 * @param name a token, e.g. `--rkui-teal`
 */
export function swatchPairs(name: string): ColorPair[] {
  if (isPanel(name)) return [{ fg: '--rkui-fg', bg: name }]
  if (isFill(name)) return [{ fg: labelFor(name), bg: name }]
  if (name.startsWith('--rkui-on-')) {
    const fills = [...tokenNames].filter((fill) => isFill(fill) && labelFor(fill) === name)
    return fills.map((fill) => ({ fg: name, bg: fill }))
  }
  const backgrounds = name.startsWith('--rkui-code-') ? CODE_PANELS : SURFACES
  return backgrounds.map((bg) => ({ fg: name, bg }))
}

/** A group of colour tokens: a short title, an optional caption and the token names. */
export interface ColorGroup {
  title: string
  caption: string
  names: string[]
}

// A comment after a blank line or a `{` heads a group. One straight under a declaration is a
// note on the next token, so it stays in the group above.
const GROUP_HEADING = /(?:^|\{|\n[ \t]*\n)\s*\/\*\s*([\s\S]*?)\s*\*\//

/** Splits a heading comment such as `Fills: vivid in both themes` into title and caption. */
function splitHeading(comment: string): { title: string; caption: string } {
  const [title, ...rest] = comment.replace(/\s+/g, ' ').split(': ')
  const caption = rest.join(': ')
  return { title, caption: caption.charAt(0).toUpperCase() + caption.slice(1) }
}

/**
 * The colour tokens of the token files, grouped under the heading comment that precedes them.
 * A token appears in the first group that has it; groups left with no tokens are left out.
 */
export function colorGroups(): ColorGroup[] {
  // Splitting on a captured comment gives [before, comment, after, comment, after, ...].
  const parts = COLOR_CSS.split(GROUP_HEADING)
  const shown = new Set(NOT_SWATCHES)
  const groups: ColorGroup[] = []
  for (let i = 1; i < parts.length; i += 2) {
    const names = tokenNamesIn(parts[i + 1]).filter((name) => !shown.has(name))
    names.forEach((name) => shown.add(name))
    if (names.length > 0) groups.push({ ...splitHeading(parts[i]), names })
  }
  return groups
}
