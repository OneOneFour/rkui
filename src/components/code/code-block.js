const COPIED = 'Copied'
const FAILED = "Couldn't copy"
const RESET_DELAY_MS = 2000

/**
 * `<rkui-code-block>`: a copy button for the `<pre><code>` inside it. The markup carries the button
 * (`.rkui-code-copy`) with `hidden`, so it only shows once this script runs. A click copies the
 * code's text, shows the result in the button's `.rkui-code-copy-label` for a moment, and announces
 * it to screen readers.
 */
export class RkuiCodeBlock extends HTMLElement {
  // Internal state, set up by the lifecycle callbacks below. Not for pages to use.
  /** Unhooks all of this element's event listeners at once. @type {AbortController | undefined} */
  listeners
  /**
   * The hidden span that screen readers read out, e.g. "Copied".
   * @type {HTMLElement | undefined}
   */
  announcer
  /** The pending timeout that puts the button's label back. @type {number | undefined} */
  resetTimer
  /** The button's label as the page wrote it, restored after a message. */
  restingLabel = ''

  connectedCallback() {
    const button = this.querySelector('.rkui-code-copy')
    if (!(button instanceof HTMLButtonElement)) return

    this.listeners = new AbortController()
    button.addEventListener('click', this.copy, { signal: this.listeners.signal })
    this.restingLabel = this.labelElement()?.textContent ?? ''
    this.announcer = this.createAnnouncer()
    this.append(this.announcer)
    button.hidden = false
  }

  disconnectedCallback() {
    this.listeners?.abort()
    clearTimeout(this.resetTimer)
    this.announcer?.remove()
  }

  // Internal: not for pages to use.

  // An arrow function, so "this" stays the element when it runs as a click handler.
  copy = async () => {
    const text = this.querySelector('pre code')?.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      this.showMessage(COPIED)
    } catch {
      // No clipboard (an insecure page or an old browser) or permission denied.
      this.showMessage(FAILED)
    }
  }

  /** @param {string} message */
  showMessage(message) {
    const label = this.labelElement()
    if (label) label.textContent = message
    if (this.announcer) this.announcer.textContent = message

    clearTimeout(this.resetTimer)
    this.resetTimer = window.setTimeout(() => {
      if (label) label.textContent = this.restingLabel
      if (this.announcer) this.announcer.textContent = ''
    }, RESET_DELAY_MS)
  }

  labelElement() {
    return this.querySelector('.rkui-code-copy-label')
  }

  createAnnouncer() {
    const announcer = document.createElement('span')
    announcer.className = 'rkui-visually-hidden'
    announcer.setAttribute('aria-live', 'polite')
    return announcer
  }
}

customElements.define('rkui-code-block', RkuiCodeBlock)
