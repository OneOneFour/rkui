import { afterSlide } from '../../shared/after-slide.js'

/** @typedef {'light' | 'dark' | 'system'} ThemeChoice */

const STORAGE_KEY = 'rkui-theme'
const CHANGE_EVENT = 'rkui-theme-change'

/**
 * @param {string | null} value
 * @returns {ThemeChoice}
 */
function toChoice(value) {
  return value === 'light' || value === 'dark' ? value : 'system'
}

/** @returns {ThemeChoice} the stored choice, or 'system' if there is none or storage is blocked */
function readChoice() {
  try {
    return toChoice(localStorage.getItem(STORAGE_KEY))
  } catch {
    return 'system'
  }
}

/** @param {ThemeChoice} choice */
function saveChoice(choice) {
  try {
    localStorage.setItem(STORAGE_KEY, choice)
  } catch {
    // Storage is blocked, so the choice lasts only until the page is left.
  }
}

/** @param {ThemeChoice} choice */
function applyChoice(choice) {
  const root = document.documentElement
  if (choice === 'system') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = choice
  }
}

/**
 * `<rkui-theme-toggle>`: a Light / Dark / System switch. It enhances radios (values `light`,
 * `dark`, `system`) that the page puts inside it, storing the choice under `rkui-theme` and setting
 * `data-theme` on `<html>`. Other toggles, tabs and sites on the domain stay in sync.
 */
export class RkuiThemeToggle extends HTMLElement {
  // Internal state, set up by the lifecycle callbacks below. Not for pages to use.
  /** Unhooks all of this element's event listeners at once. @type {AbortController | undefined} */
  listeners

  connectedCallback() {
    this.listeners = new AbortController()
    const { signal } = this.listeners
    this.addEventListener('change', this.handleChange, { signal })
    document.addEventListener(CHANGE_EVENT, this.handleChoiceChanged, { signal })
    window.addEventListener('storage', this.handleStorage, { signal })
    this.checkRadio(readChoice())
  }

  disconnectedCallback() {
    this.listeners?.abort()
  }

  // Internal: not for pages to use.

  // An arrow function, so "this" stays the element when it runs as a change handler.
  /** @param {Event} event */
  handleChange = (event) => {
    if (!(event.target instanceof HTMLInputElement)) return
    const choice = toChoice(event.target.value)
    saveChoice(choice)
    afterSlide(event.target, () => applyChoice(choice))
    document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: choice }))
  }

  /**
   * Another toggle on this page changed the theme.
   * @param {Event} event
   */
  handleChoiceChanged = (event) => {
    if (event instanceof CustomEvent) this.checkRadio(toChoice(event.detail))
  }

  /**
   * Another tab or site changed the theme. A null key means storage was cleared.
   * @param {StorageEvent} event
   */
  handleStorage = (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return
    const choice = toChoice(event.newValue)
    applyChoice(choice)
    this.checkRadio(choice)
  }

  /** @param {ThemeChoice} choice */
  checkRadio(choice) {
    const radio = this.querySelector(`input[type="radio"][value="${choice}"]`)
    if (radio instanceof HTMLInputElement) radio.checked = true
  }
}

customElements.define('rkui-theme-toggle', RkuiThemeToggle)
