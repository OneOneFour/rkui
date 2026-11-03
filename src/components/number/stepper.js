/**
 * `<rkui-stepper>`: step buttons for a number input. Put an `<input type="number">` and buttons
 * with `data-step="up"` and `data-step="down"` inside it. A click steps the input by its `step`,
 * within `min` and `max`, and fires `input` and `change` as typing would.
 */
export class RkuiStepper extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', this.handleClick)
  }

  // Internal: not for pages to use.

  // An arrow function, so "this" stays the element when it runs as a click handler.
  /** @param {MouseEvent} event */
  handleClick = (event) => {
    const target = event.target
    const button = target instanceof Element ? target.closest('button[data-step]') : null
    const input = this.querySelector('input[type="number"]')
    if (!(button instanceof HTMLButtonElement) || !(input instanceof HTMLInputElement)) return
    if (input.disabled || input.readOnly) return

    const before = input.value
    if (button.dataset.step === 'up') {
      input.stepUp()
    } else {
      input.stepDown()
    }
    if (input.value === before) return

    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

customElements.define('rkui-stepper', RkuiStepper)
