/**
 * `<rkui-range-readout>`: keeps an `<output>` showing the value of the `<input type="range">`
 * beside it. Put both inside it; the output's first text is the value before any script runs.
 */
export class RkuiRangeReadout extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('input', this.handleInput)
  }

  // Internal: not for pages to use.

  // An arrow function, so "this" stays the element when it runs as an input handler.
  /** @param {Event} event */
  handleInput = (event) => {
    const range = event.target
    const readout = this.querySelector('output')
    if (range instanceof HTMLInputElement && range.type === 'range' && readout) {
      readout.value = range.value
    }
  }
}

customElements.define('rkui-range-readout', RkuiRangeReadout)
