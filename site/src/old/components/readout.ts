/**
 * Finds what an `<output>` reports on. Markup marks the thing measured with `data-sample="key"`,
 * the output names it with `data-of="key"`, and both sit inside one `data-readout` element.
 *
 * @returns the sample with the output's key, in the output's readout
 */
export function sampleFor(output: HTMLOutputElement): Element | null {
  const readout = output.closest('[data-readout]')
  return readout?.querySelector(`[data-sample="${output.dataset.of}"]`) ?? null
}
