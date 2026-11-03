/**
 * Prints what the browser painted into the colour readouts: a hex for each sample and a WCAG
 * ratio for each text pair. Runs again when the theme, palette or shadow mode changes.
 *
 * Markup: an `<output data-show="..." data-of="key">` in a `data-readout` element, next to the
 * sample it reads (see readout.ts). `data-show` is `hex-background` or `hex-color` (the sample's
 * background or text colour as a hex), or `ratio` (its text colour on its background, with
 * `data-digits` decimal places, 2 by default).
 */
import { sampleFor } from './readout'
import { contrast, grade, type Rgba } from './wcag'

const OUTPUTS =
  'output[data-show="hex-background"], output[data-show="hex-color"], output[data-show="ratio"]'

let context: OffscreenCanvasRenderingContext2D | null | undefined

/**
 * Converts any CSS colour the browser understands, including `color-mix()` and oklab results,
 * to sRGB by painting it on a 1 by 1 canvas. See-through colours lose a little precision.
 */
function toRgba(cssColor: string): Rgba {
  context ??= new OffscreenCanvas(1, 1).getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('No 2D canvas to read colours from')
  context.clearRect(0, 0, 1, 1)
  context.fillStyle = cssColor
  context.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data
  return { r, g, b, a }
}

/** `#rrggbb`, or `#rrggbbaa` when the colour is see-through. */
function toHex({ r, g, b, a }: Rgba): string {
  const bytes = a === 255 ? [r, g, b] : [r, g, b, a]
  return '#' + bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** What an output shows for its sample, as text. */
function readOutput(output: HTMLOutputElement, sample: Element): string {
  const style = getComputedStyle(sample)
  const text = toRgba(style.color)
  const background = toRgba(style.backgroundColor)

  if (output.dataset.show === 'hex-background') return toHex(background)
  if (output.dataset.show === 'hex-color') return toHex(text)

  const ratio = contrast(text, background)
  return `${ratio.toFixed(Number(output.dataset.digits ?? 2))} ${grade(ratio)}`
}

/** Fills every readout from the page as it is painted now. */
function showColors(): void {
  for (const output of document.querySelectorAll<HTMLOutputElement>(OUTPUTS)) {
    const sample = sampleFor(output)
    if (sample) output.textContent = readOutput(output, sample)
  }
}

showColors()

new MutationObserver(showColors).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme', 'data-palette', 'data-shadow'],
})
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', showColors)
