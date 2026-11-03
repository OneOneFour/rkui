/**
 * `<rkui-motion>`: pauses the CSS animations inside it (motion.css) while it is scrolled out of
 * view, and while the reader has pressed its pause button, a `<button data-motion-pause
 * aria-pressed="false">` inside it. It sets data-paused while either holds.
 */
export class RkuiMotion extends HTMLElement {
  // Internal state, set up by the lifecycle callbacks below. Not for pages to use.
  /** Unhooks all of this element's event listeners at once. @type {AbortController | undefined} */
  listeners
  /** Watches whether this element is on screen. @type {IntersectionObserver | undefined} */
  observer
  /** True while this element is scrolled out of view. */
  offscreen = false

  connectedCallback() {
    this.listeners = new AbortController()
    const { signal } = this.listeners
    this.pauseButton?.addEventListener('click', this.handlePauseClick, { signal })
    this.observer = new IntersectionObserver(([entry]) => {
      this.offscreen = !entry.isIntersecting
      this.updatePaused()
    })
    this.observer.observe(this)
  }

  disconnectedCallback() {
    this.listeners?.abort()
    this.observer?.disconnect()
  }

  // Internal: not for pages to use.

  get pauseButton() {
    return this.querySelector('[data-motion-pause]')
  }

  get pausedByReader() {
    return this.pauseButton?.getAttribute('aria-pressed') === 'true'
  }

  // An arrow function, so "this" stays the element when it runs as a click handler.
  handlePauseClick = () => {
    this.pauseButton?.setAttribute('aria-pressed', String(!this.pausedByReader))
    this.updatePaused()
  }

  updatePaused() {
    this.toggleAttribute('data-paused', this.offscreen || this.pausedByReader)
  }
}

customElements.define('rkui-motion', RkuiMotion)
