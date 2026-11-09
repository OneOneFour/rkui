// Builds dist/icons/: one recolourable SVG per icon, the same icon as a template-only Vue
// component (`<name>.vue`, for the Vue components to import), plus sprite.svg and the icon licences.
// Reads Phosphor's raw duotone SVGs from the `phosphor-raw` dev dependency (no network), restyles
// them, and runs SVGO. The icon list and fills are design data in src/icons/icon-set.js.
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { optimize } from 'svgo'
import { DEFAULT_FILLS, GLOBES, LOCAL_ICONS, PHOSPHOR_ICONS } from '../src/icons/icon-set.js'

const ICONS_SRC = new URL('../src/icons/', import.meta.url)
const COLORS_CSS = new URL('../src/tokens/colors.css', import.meta.url)
const PHOSPHOR_DIR = new URL('../node_modules/phosphor-raw/raw/duotone/', import.meta.url)
const OUT_DIR = new URL('../dist/icons/', import.meta.url)

const BACKGROUND_RECT = '<rect width="256" height="256" fill="none"/>'
const FILL_LAYER = ' opacity="0.2"'
// A few icons (code-block) draw their outline in a fixed colour instead of currentColor.
const FIXED_STROKE = /stroke="#\w+"/g
const SHARED_STROKE_ATTRS =
  / (fill="none"|stroke="currentColor"|stroke-linecap="round"|stroke-linejoin="round"|stroke-width="16")/g
const ROOT_ATTRS =
  'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="stroke-width:var(--rkui-icon-stroke, 16)" aria-hidden="true"'
// Fills the globes' outline circle, so it sits behind every other shape.
const OCEAN_DISC =
  '<circle cx="128" cy="128" r="96" stroke="none" style="fill:var(--rkui-icon-ocean, var(--rkui-sky))"/>'

/** The attributes for an icon's fill layer: `--rkui-icon-fill`, falling back to the icon's default. */
function fillHook(name) {
  const defaultFill = DEFAULT_FILLS[name] ?? 'icon-fill-neutral'
  return ` stroke="none" style="fill:var(--rkui-icon-fill, var(--rkui-${defaultFill}))"`
}

/** Moves the opacity of `<g opacity="0.2">` groups onto each shape inside and drops the group. */
function ungroupFillLayers(svg) {
  return svg.replace(/<g opacity="0.2">(.*?)<\/g>/g, (_, shapes) =>
    shapes.replaceAll('/>', `${FILL_LAYER}/>`),
  )
}

/** Gives fixed-colour outlines the current text colour. */
function fixStrokeColors(svg) {
  return svg.replace(FIXED_STROKE, 'stroke="currentColor"')
}

/** Drops the transparent background rectangle. */
function dropBackground(svg) {
  return svg.replace(BACKGROUND_RECT, '')
}

/**
 * Rewrites every shape: the 20% opacity layer becomes the fill region, given `fillAttrs`. Outline
 * strokes lose the attributes the root now carries, and unpainted shapes (solid dots) are filled
 * with the outline colour.
 */
function recolorShapes(svg, fillAttrs) {
  return svg.replace(/<(path|line|circle|ellipse|rect|polyline|polygon)\b[^>]*\/>/g, (tag) => {
    if (tag.includes(FILL_LAYER)) return tag.replace(FILL_LAYER, fillAttrs)
    if (tag.includes('stroke="currentColor"')) return tag.replace(SHARED_STROKE_ATTRS, '')
    return tag.replace('/>', ' fill="currentColor" stroke="none"/>')
  })
}

/** Puts the shared stroke attributes on the root, with the ocean disc first for globes. */
function setRootAttributes(svg, ocean) {
  return svg.replace(/<svg ([^>]*)>/, `<svg $1 ${ROOT_ATTRS}>${ocean}`)
}

/** Turns a raw duotone SVG into a recolourable, SVGO-optimised one. */
function makeRecolorable(name, rawSvg) {
  const ocean = GLOBES.includes(name) ? OCEAN_DISC : ''
  let svg = ungroupFillLayers(rawSvg)
  svg = fixStrokeColors(svg)
  svg = dropBackground(svg)
  svg = recolorShapes(svg, fillHook(name))
  svg = setRootAttributes(svg, ocean)
  // convertStyleToAttrs stays off (it isn't in preset-default) so the fill hook remains a style.
  return optimize(svg, { multipass: true, plugins: ['preset-default'] }).data
}

/** Wraps an optimised icon as a `<symbol>` for the sprite. */
function toSymbol(name, svg) {
  return svg
    .replace('<svg', `<symbol id="${name}"`)
    .replace(' xmlns="http://www.w3.org/2000/svg"', '')
    .replace(' aria-hidden="true"', '')
    .replace('</svg>', '</symbol>')
}

/** Returns the raw duotone source of every icon, keyed by name. */
async function loadRawIcons() {
  const phosphor = PHOSPHOR_ICONS.map(async (name) => [
    name,
    await readFile(new URL(`${name}-duotone.svg`, PHOSPHOR_DIR), 'utf8'),
  ])
  const local = LOCAL_ICONS.map(async (name) => [
    name,
    await readFile(new URL(`sources/${name}-duotone.svg`, ICONS_SRC), 'utf8'),
  ])
  return Promise.all([...phosphor, ...local])
}

/** Fails the build if a default fill names a colour token that colors.css doesn't declare. */
async function checkFillTokens() {
  const css = await readFile(COLORS_CSS, 'utf8')
  const tokens = new Set([...css.matchAll(/--rkui-([\w-]+)\s*:/g)].map((match) => match[1]))
  const unknown = Object.entries(DEFAULT_FILLS).filter(([, token]) => !tokens.has(token))
  if (unknown.length > 0) {
    const list = unknown.map(([name, token]) => `${name}: ${token}`).join(', ')
    throw new Error(`icon-set.js has default fills with no --rkui- token in colors.css: ${list}`)
  }
}

/** Writes dist/icons/: every icon as .svg and .vue, sprite.svg and the licences. */
export async function buildIcons() {
  await checkFillTokens()
  await mkdir(OUT_DIR, { recursive: true })

  const symbols = []
  for (const [name, rawSvg] of await loadRawIcons()) {
    const svg = makeRecolorable(name, rawSvg)
    await writeFile(new URL(`${name}.svg`, OUT_DIR), `${svg}\n`)
    await writeFile(new URL(`${name}.vue`, OUT_DIR), `<template>${svg}</template>\n`)
    symbols.push(toSymbol(name, svg))
  }

  const sprite = `<svg xmlns="http://www.w3.org/2000/svg">\n${symbols.join('\n')}\n</svg>\n`
  await writeFile(new URL('sprite.svg', OUT_DIR), sprite)

  for (const licence of ['LICENSE-phosphor.txt', 'LICENSE-tabler.txt']) {
    await copyFile(new URL(licence, ICONS_SRC), new URL(licence, OUT_DIR))
  }
  console.log(`dist/icons: ${symbols.length} icons (.svg and .vue), sprite.svg, licences`)
}
