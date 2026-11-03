/**
 * `<rkui-color-picker>`: put it around a tile group that ends with a custom colour tile (a radio
 * and an `<input type="color">` in one `.rkui-tile`). Picking a colour checks that tile's radio, so
 * the custom colour becomes the group's choice.
 */
export class RkuiColorPicker extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('input', this.handleInput)
  }

  // Internal: not for pages to use.

  // An arrow function, so "this" stays the element when it runs as an input handler.
  /** @param {Event} event */
  handleInput = (event) => {
    const picker = event.target
    if (!(picker instanceof HTMLInputElement) || picker.type !== 'color') return

    const radio = picker.closest('.rkui-tile')?.querySelector('input[type="radio"]')
    if (radio instanceof HTMLInputElement) radio.checked = true
  }
}

customElements.define('rkui-color-picker', RkuiColorPicker)
