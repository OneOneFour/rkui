/**
 * `<rkui-tooltip>`: lets Escape hide an rkui tooltip while its control is hovered or focused, so
 * it can be dismissed without moving the pointer or focus. It shows again once the pointer leaves
 * or focus moves on.
 */
export class RkuiTooltip extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('pointerleave', this.clearDismissal)
    this.addEventListener('focusout', this.clearDismissal)
  }

  connectedCallback() {
    document.addEventListener('keydown', this.handleKeydown)
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  // Internal: not for pages to use.

  // An arrow function, so "this" stays the element when it runs as a keydown handler.
  /** @param {KeyboardEvent} event */
  handleKeydown = (event) => {
    if (event.key === 'Escape' && this.matches(':hover, :focus-within')) {
      this.toggleAttribute('data-dismissed', true)
    }
  }

  clearDismissal = () => {
    this.removeAttribute('data-dismissed')
  }
}

customElements.define('rkui-tooltip', RkuiTooltip)
