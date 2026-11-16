// rkui's settings API for a page's own controls and scripts: `@oneonefour/rkui/settings`, and the
// same exports from dist/rkui.js. The functions live in shared/settings.js.

/** @typedef {import('./shared/settings.js').SettingName} SettingName a setting: one in SETTINGS, or 'light' */

export {
  SETTINGS,
  applySetting,
  chooseSetting,
  onSettingChange,
  readSetting,
  storedSetting,
} from './shared/settings.js'
