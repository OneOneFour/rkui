/**
 * WCAG 2.x contrast maths.
 */

/** A colour as bytes from 0 to 255 for each of red, green, blue and alpha. */
export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

/** One channel, 0 to 255, as linear light from 0 to 1. */
function linear(byte: number): number {
  const value = byte / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

/** The relative luminance, from 0 (black) to 1 (white); alpha is ignored. */
export function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b)
}

/** The colour `top` paints over an opaque `bottom`. */
function over(top: Rgba, bottom: Rgba): Rgba {
  const share = top.a / 255
  const mix = (above: number, below: number) => above * share + below * (1 - share)
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 255 }
}

/**
 * The contrast ratio, from 1 to 21, of a foreground (painted over the background if it is
 * see-through) on a background (treated as opaque).
 */
export function contrast(foreground: Rgba, background: Rgba): number {
  const [lighter, darker] = [luminance(over(foreground, background)), luminance(background)].sort(
    (a, b) => b - a,
  )
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * The level a ratio reaches: AAA and AA for body text, 3:1 for large text and UI edges, else
 * `fail`.
 */
export function grade(ratio: number): string {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return '3:1'
  return 'fail'
}
