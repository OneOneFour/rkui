import { addScrollbarAbove } from './folder-scrollbar.js'

/**
 * `<rkui-tabs>`: the ARIA tabs pattern over markup the page writes: a `role="tablist"` of
 * `role="tab"` buttons, each naming its `role="tabpanel"` with `aria-controls`. Clicking a tab, or
 * moving to it with the arrow keys, Home or End, selects it and shows only its panel. Like
 * `<rkui-folder>`, it puts a scrollbar above the tab strip.
 */
export class RkuiTabs extends HTMLElement {
  /** Unhooks this element's event listeners. @type {AbortController | undefined} */
  listeners
  /** Removes the scrollbar above the strip. @type {(() => void) | undefined} */
  removeScrollbar

  connectedCallback() {
    this.listeners = new AbortController()
    const { signal } = this.listeners
    this.addEventListener('click', this.handleClick, { signal })
    this.addEventListener('keydown', this.handleKeydown, { signal })
    const strip = this.querySelector(':scope > .rkui-folder-tabs')
    if (strip instanceof HTMLElement) this.removeScrollbar = addScrollbarAbove(strip)
  }

  disconnectedCallback() {
    this.listeners?.abort()
    this.removeScrollbar?.()
  }

  // Internal: not for pages to use.

  /** @returns {HTMLElement[]} this element's own tabs, not those of tabs nested in a panel */
  get tabs() {
    return [...this.querySelectorAll(':scope > [role="tablist"] [role="tab"]')].filter(
      (tab) => tab instanceof HTMLElement,
    )
  }

  // An arrow function, so "this" stays the element when it runs as a click handler.
  /** @param {MouseEvent} event */
  handleClick = (event) => {
    const tab = event.target instanceof Element ? event.target.closest('[role="tab"]') : null
    if (tab instanceof HTMLElement && this.tabs.includes(tab)) this.selectTab(tab)
  }

  /** @param {KeyboardEvent} event */
  handleKeydown = (event) => {
    const tabs = this.tabs
    const current = event.target instanceof HTMLElement ? tabs.indexOf(event.target) : -1
    if (current === -1) return

    /** @type {Record<string, number>} */
    const targets = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: tabs.length - 1,
    }
    const target = targets[event.key]
    if (target === undefined) return

    event.preventDefault()
    // The arrow keys wrap around from the last tab to the first, and back.
    const tab = tabs[(target + tabs.length) % tabs.length]
    this.selectTab(tab)
    tab.focus()
  }

  /** @param {HTMLElement} selected the tab to select */
  selectTab(selected) {
    for (const tab of this.tabs) {
      const isSelected = tab === selected
      tab.setAttribute('aria-selected', String(isSelected))
      tab.tabIndex = isSelected ? 0 : -1
      const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '')
      if (panel) panel.hidden = !isSelected
    }
  }
}

customElements.define('rkui-tabs', RkuiTabs)
