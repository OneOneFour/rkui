/**
 * Prints the sizes the browser resolved for the type scale readouts.
 *
 * Markup: `<output data-show="size" data-of="key">` in a `data-readout` element, next to the
 * `data-sample="key"` text it measures (see readout.js), prints its font size as rem and px.
 * `<output data-custom-property="--name">` prints that property's value on `<html>`.
 */
import { sampleFor } from './readout'

/** A size as e.g. `1.69rem / 27px`, given the root font size in px. */
function formatSize(px: number, rootPx: number): string {
  return `${Number((px / rootPx).toFixed(3))}rem / ${Number(px.toFixed(1))}px`
}

const root = document.documentElement
const rootPx = parseFloat(getComputedStyle(root).fontSize)

for (const output of document.querySelectorAll<HTMLOutputElement>('output[data-show="size"]')) {
  const sample = sampleFor(output)
  if (sample) output.textContent = formatSize(parseFloat(getComputedStyle(sample).fontSize), rootPx)
}

for (const output of document.querySelectorAll<HTMLOutputElement>('output[data-custom-property]')) {
  output.textContent = getComputedStyle(root)
    .getPropertyValue(output.dataset.customProperty ?? '')
    .trim()
}
