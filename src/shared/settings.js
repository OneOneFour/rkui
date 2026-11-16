// rkui's global settings. src/settings.js publishes all but showSetting(), as
// `@oneonefour/rkui/settings`, for a page's own controls and scripts. The theme, palette, dark-mode
// shadow and highlight, scroll dots and light angle each live on <html> (an attribute, or for the
// light a custom property), where the CSS reads them. A reader's choice is stored under
// rkui-<setting>, where the head script (head-scripts/settings-init.js) puts it back before the
// next page is drawn, for the settings a site lets readers switch. Plain JavaScript: it works in
// any page, with or without Vue.

import { DEFAULT_ANGLE } from './light-angle.js'

/**
 * @typedef {object} Setting
 * @property {string} legend the setting's name, for a control's label
 * @property {string} attribute the attribute on <html> that holds it
 * @property {Record<string, string>} options each value and its label; the first is the default
 */

/**
 * Every setting with a set of values, its attribute on <html>, and its values with their labels,
 * the default first; the light, an angle, is the one setting not listed. It is the library's one
 * list of them: rkui() writes the head script's table from it, and the build checks the copy in
 * head-scripts/settings-init.js and the unions in astro/index.d.ts against it.
 * @type {Record<'theme' | 'palette' | 'shadow' | 'highlight' | 'dots', Setting>}
 */
export const SETTINGS = {
  // "system" is no attribute: the page follows the OS.
  theme: {
    legend: 'Theme',
    attribute: 'data-theme',
    options: { system: 'System', light: 'Light', dark: 'Dark' },
  },
  palette: {
    legend: 'Palette',
    attribute: 'data-palette',
    options: { cream: 'Cream', slate: 'Slate', greige: 'Greige' },
  },
  shadow: {
    legend: 'Shadow',
    attribute: 'data-shadow',
    options: { outline: 'Outline', block: 'Block', color: 'Colour' },
  },
  highlight: {
    legend: 'Highlight',
    attribute: 'data-highlight',
    options: { cream: 'Cream', dark: 'Dark' },
  },
  dots: {
    legend: 'Scroll dots',
    attribute: 'data-rkui-dots',
    options: { plain: 'Plain', pill: 'Pill' },
  },
}

/** The light's setting: an angle in degrees, clockwise from the top, held in this property. */
const LIGHT_PROPERTY = '--rkui-light-angle'

/** Tells the switches on the page that a setting changed; its detail is `{ setting, value }`. */
const CHANGE_EVENT = 'rkui-settings-change'

/** @typedef {keyof typeof SETTINGS | 'light'} SettingName a setting: one in SETTINGS, or 'light' */

/**
 * A setting's default: its first value, or for the light, the top left.
 * @param {SettingName} name
 * @returns {string}
 */
function defaultValue(name) {
  return name === 'light' ? String(DEFAULT_ANGLE) : Object.keys(SETTINGS[name].options)[0]
}

/**
 * A setting's value on the page: one of its values (its default where the page has none, or one
 * that is no longer a value), or for the light, the angle in degrees.
 * @param {SettingName} name
 * @returns {string}
 */
export function readSetting(name) {
  const root = document.documentElement
  if (name === 'light') {
    const angle = parseFloat(getComputedStyle(root).getPropertyValue(LIGHT_PROPERTY))
    return Number.isFinite(angle) ? String(angle) : defaultValue(name)
  }
  const value = root.getAttribute(SETTINGS[name].attribute)
  return value !== null && isValue(name, value) ? value : defaultValue(name)
}

/**
 * Whether `value` is one of a setting's values, or for the light, a number.
 * @param {SettingName} name
 * @param {string} value
 */
function isValue(name, value) {
  return name === 'light'
    ? Number.isFinite(parseFloat(value))
    : Object.hasOwn(SETTINGS[name].options, value)
}

/**
 * Sets a setting on <html>, which restyles the page. It stores nothing. A segmented control calls
 * it once its pill has slid there (`afterSlide()`), so the restyle doesn't cut the slide short.
 * @param {SettingName} name
 * @param {string} value
 */
export function applySetting(name, value) {
  const root = document.documentElement
  if (name === 'light') root.style.setProperty(LIGHT_PROPERTY, `${parseFloat(value)}deg`)
  else if (name === 'theme' && value === 'system') root.removeAttribute('data-theme')
  else root.setAttribute(SETTINGS[name].attribute, value)
}

/**
 * The reader chose a setting: stores it and tells the page's other controls (`onSettingChange`),
 * at once, so it isn't lost to a link followed straight after. It doesn't restyle the page:
 * `applySetting` does.
 * @param {SettingName} name
 * @param {string} value
 */
export function chooseSetting(name, value) {
  try {
    localStorage.setItem(`rkui-${name}`, value)
  } catch {
    // Storage is blocked, so the choice lasts only until the page is left.
  }
  document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { setting: name, value } }))
}

/**
 * A setting's stored value, or null where there is none (or storage is blocked).
 * @param {SettingName} name
 * @returns {string | null}
 */
export function storedSetting(name) {
  try {
    const value = localStorage.getItem(`rkui-${name}`)
    return value !== null && isValue(name, value) ? value : null
  } catch {
    return null
  }
}

/**
 * Tells the page's other controls of a value the page shows without the reader choosing it, such
 * as the light following the clock. It stores nothing and doesn't restyle the page.
 * @param {SettingName} name
 * @param {string} value
 */
export function showSetting(name, value) {
  document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { setting: name, value } }))
}

/**
 * Calls `callback` with a setting's new value whenever it is chosen or shown on this page, or
 * chosen in another tab; a choice made in another tab is put on this page too. Storage cleared in
 * another tab puts back the default.
 * @param {SettingName} name
 * @param {(value: string) => void} callback
 * @param {AbortSignal} [signal] stops listening when aborted; it listens for the page's life when
 *   left out
 */
export function onSettingChange(name, callback, signal) {
  document.addEventListener(
    CHANGE_EVENT,
    (event) => {
      if (event instanceof CustomEvent && event.detail.setting === name)
        callback(event.detail.value)
    },
    { signal },
  )
  window.addEventListener(
    'storage',
    (event) => {
      if (event.key !== `rkui-${name}` && event.key !== null) return
      // A null key, or a null value, is storage cleared.
      const value = event.newValue ?? defaultValue(name)
      if (!isValue(name, value)) return
      applySetting(name, value)
      callback(value)
    },
    { signal },
  )
}
