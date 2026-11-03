import { addScrollbarAbove } from './folder-scrollbar.js'

/**
 * `<rkui-folder>`: a folder (`.rkui-folder`) that puts a scrollbar above each tab strip
 * (`.rkui-folder-tabs`) inside it, for the folders that aren't `<rkui-tabs>`: pagination and
 * static tabs. Without the script the strip still scrolls.
 */
export class RkuiFolder extends HTMLElement {
  /** Removes each scrollbar this element added. @type {(() => void)[]} */
  removeScrollbars = []

  connectedCallback() {
    for (const strip of this.querySelectorAll('.rkui-folder-tabs')) {
      if (strip instanceof HTMLElement) this.removeScrollbars.push(addScrollbarAbove(strip))
    }
  }

  disconnectedCallback() {
    for (const remove of this.removeScrollbars) remove()
    this.removeScrollbars = []
  }
}

customElements.define('rkui-folder', RkuiFolder)
