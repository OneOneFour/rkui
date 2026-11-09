import { colors } from '../../dist/colors.js'

/**
 * The palette's hues, for every component's `color` prop: the core hues, then the auxiliary ones.
 * Each has a `--rkui-<hue>` fill token and `-deep` and `-tint` steps in src/tokens/colors.css. A
 * component that supports fewer hues picks from this list.
 */
export const HUES = [
  'navy',
  'teal',
  'coral',
  'yellow',
  'green',
  'sky',
  'grape',
  'tangerine',
  'lilac',
  'apricot',
] as const

/** One of the palette's hues, e.g. 'teal'. (Read from the list above, so the two can't drift.) */
export type Hue = (typeof HUES)[number]

/** A component's `color`: a palette hue, e.g. 'teal', or a hex code, e.g. '#ff8800'. */
export type Color = Hue | `#${string}`

/** The hues whose fill carries its own text colour (`--rkui-on-<hue>`); the rest take ink. */
const HUES_WITH_OWN_TEXT: Hue[] = ['navy', 'coral', 'grape']

/** The text token for text on a `hue` fill, e.g. `--rkui-on-navy`, or `--rkui-on-fill` (ink). */
export function onHue(hue: Hue): string {
  return HUES_WITH_OWN_TEXT.includes(hue) ? `--rkui-on-${hue}` : '--rkui-on-fill'
}

/** Whether `color` is a hex code rather than a palette hue. */
export function isHex(color: string | undefined): color is `#${string}` {
  return color?.startsWith('#') ?? false
}

/** The custom properties a component paints with, each set from its `color`. */
export interface ColorProperties {
  /** Takes the fill. */
  fill?: string
  /** Takes the colour of text and icons on the fill. */
  text?: string
  /** Takes the tint: a pale panel that carries `--rkui-fg` text. */
  tint?: string
  /** The fill carries small text, so coral takes `--rkui-coral-solid`. */
  solid?: boolean
}

/**
 * The style that paints a component in `color`, for its `vars`: each of `properties` set to the
 * hue's token, or for a hex code to the code and the colours worked out from it (DESIGN.md,
 * "Shading"). Empty when `color` is left out.
 */
export function colorVars(
  color: Color | undefined,
  properties: ColorProperties,
): Record<string, string> {
  if (!color) return {}
  const { fill, text, tint, solid } = properties
  const style: Record<string, string> = {}
  if (isHex(color)) {
    if (fill) style[fill] = color
    if (text) style[text] = `var(${textOn(color)})`
    if (tint) style[tint] = tintOf(color)
  } else {
    if (fill) style[fill] = `var(--rkui-${solid && color === 'coral' ? 'coral-solid' : color})`
    if (text) style[text] = `var(${onHue(color)})`
    if (tint) style[tint] = `var(--rkui-${color}-tint)`
  }
  return style
}

/** A hex code's tint: 35% of it over `--rkui-raised` in light mode, 25% in dark mode. */
function tintOf(hex: string): string {
  const mix = (share: string) => `color-mix(in srgb, ${hex} ${share}, var(--rkui-raised))`
  return `light-dark(${mix('35%')}, ${mix('25%')})`
}

/**
 * The text token for a hex fill: ink (`--rkui-on-fill`), unless `--rkui-on-ink` has more contrast
 * on it in both themes.
 */
function textOn(hex: string): string {
  const fill = luminance(hex)
  const ink = contrast(fill, luminance(colors.onFill.light))
  const light = Math.min(
    contrast(fill, luminance(colors.onInk.light)),
    contrast(fill, luminance(colors.onInk.dark)),
  )
  return light > ink ? '--rkui-on-ink' : '--rkui-on-fill'
}

/** The WCAG contrast ratio of two relative luminances. */
function contrast(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** The WCAG relative luminance of a hex code (#rgb, #rgba, #rrggbb or #rrggbbaa); alpha is ignored. */
function luminance(hex: string): number {
  const digits = hex.slice(1)
  const short = digits.length <= 4
  const channels = [0, 1, 2].map((i) => {
    const pair = short ? digits[i] + digits[i] : digits.slice(i * 2, i * 2 + 2)
    const value = parseInt(pair, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}
