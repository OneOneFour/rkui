/**
 * The setup half of the `rkui()` integration: the Vite settings the library needs, the licences
 * file and what goes in every page's head. `index.js` calls each from its hooks.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { SETTINGS } from '../src/shared/settings.js'

/** The package's folder. Node resolves symlinks, so it is the real one even when linked. */
const PACKAGE = new URL('../', import.meta.url)

/**
 * The licences rkui's fonts and icons travel with, from the package's source. A bare text gets a
 * copyright line.
 */
const LICENCES = [
  ['rkui (MIT)', 'LICENSE'],
  ['Xmind font (SIL Open Font License 1.1)', 'src/fonts/xmind/OFL.txt'],
  ['JetBrains Mono font (SIL Open Font License 1.1)', 'src/fonts/jetbrains-mono/OFL.txt'],
  [
    'Roboto Slab font (Apache License 2.0)',
    'src/fonts/roboto-slab/LICENSE.txt',
    'Copyright The Roboto Slab Project Authors',
  ],
  ['Phosphor Icons (MIT)', 'src/icons/LICENSE-phosphor.txt'],
  ['Tabler Icons (MIT)', 'src/icons/LICENSE-tabler.txt'],
]

/**
 * An option that is true, false or an object of switches, as each switch's value (true = on).
 * Warns of a switch it doesn't have, which would otherwise do nothing.
 * @param {unknown} option
 * @param {string[]} names the switches it has
 * @param {string} label the option's name, for the warning
 * @param {{ warn: (message: string) => void }} logger
 */
function switches(option, names, label, logger) {
  const given = typeof option === 'object' ? option : {}
  for (const key of Object.keys(given)) {
    if (!names.includes(key)) {
      logger.warn(
        `rkui(): ${label} has no "${key}", so it does nothing. It has ${names.join(', ')}.`,
      )
    }
  }
  return Object.fromEntries(names.map((name) => [name, option !== false && given[name] !== false]))
}

/** Never inline woff2; otherwise keep what the site chose (a number, a function or Vite's 4 KiB). */
function keepFontsAsFiles(userLimit) {
  return (file, content) => {
    if (file.endsWith('.woff2')) return false
    if (typeof userLimit === 'function') return userLimit(file, content)
    if (typeof userLimit === 'number') return content.length < userLimit
    return undefined // Vite's default.
  }
}

/** A Vite plugin that adds the package's real folder to the dev server's allow list. */
const allowPackage = {
  name: 'rkui-allow-package',
  configureServer(server) {
    server.config.server.fs.allow.push(fileURLToPath(PACKAGE).replaceAll('\\', '/'))
  },
}

/**
 * Vite settings for the library: one copy of Vue, the dev server allowed to read the package's
 * fonts when it is linked, and woff2 kept as files.
 * @param {object} config Astro's config, for the site's own `assetsInlineLimit`
 * @param {boolean | { dedupeVue?: boolean, allowPackage?: boolean, fontFiles?: boolean }} option
 * @param {{ warn: (message: string) => void }} logger Astro's logger
 */
export function viteSettings(config, option, logger) {
  const on = switches(option, ['dedupeVue', 'allowPackage', 'fontFiles'], 'vite', logger)
  return {
    ...(on.dedupeVue && { resolve: { dedupe: ['vue'] } }),
    ...(on.allowPackage && { plugins: [allowPackage] }),
    ...(on.fontFiles && {
      build: { assetsInlineLimit: keepFontsAsFiles(config.vite?.build?.assetsInlineLimit) },
    }),
  }
}

/** Contents of a file in the package. */
function packageFile(path) {
  return readFile(new URL(path, PACKAGE), 'utf8')
}

/**
 * Each setting's attribute and values, from `SETTINGS`, as the head script holds them: the
 * attribute first, then the values. The light is an angle, so it has none.
 * @returns {Record<string, string[]>}
 */
export function settingsTable() {
  return Object.fromEntries(
    Object.entries(SETTINGS).map(([name, { attribute, options }]) => [
      name,
      [attribute, ...Object.keys(options)],
    ]),
  )
}

/** The head script's table of settings, from `const settings = {` to its closing brace. */
export const TABLE = /const settings = \{[\s\S]*?\n {2}\}/

/**
 * The `settings` option, checked: throws on a setting or value the library doesn't have. False
 * is no settings at all.
 * @param {boolean | { switchable?: string[], [setting: string]: unknown }} option
 * @returns {{ switchable: string[], fixed: Record<string, unknown> }}
 */
export function checkedSettings(option) {
  if (option === false) return { switchable: [], fixed: {} }
  const { switchable = ['theme'], ...fixed } = option === true ? {} : option
  const names = [...Object.keys(SETTINGS), 'light']
  for (const name of [...switchable, ...Object.keys(fixed)]) {
    if (!names.includes(name)) {
      throw new Error(
        `rkui(): there is no setting "${name}". The settings are ${names.join(', ')}.`,
      )
    }
  }
  for (const [name, value] of Object.entries(fixed)) {
    if (name === 'light') {
      if (!Number.isFinite(value)) {
        throw new Error(
          `rkui(): settings.light is an angle in degrees, not ${JSON.stringify(value)}.`,
        )
      }
      continue
    }
    const values = Object.keys(SETTINGS[name].options)
    if (!values.includes(value)) {
      throw new Error(
        `rkui(): settings.${name} can't be ${JSON.stringify(value)}. It takes ${values.join(', ')}.`,
      )
    }
  }
  return { switchable, fixed }
}

/**
 * The fixed settings as bakeSettings() writes them on `<html>`: each one's attribute, and the
 * light as a style. The "system" theme is no attribute.
 * @param {Record<string, unknown>} fixed
 * @returns {{ attributes: Record<string, string>, style: string }}
 */
function bakedSettings(fixed) {
  const attributes = {}
  for (const [name, value] of Object.entries(fixed)) {
    if (name !== 'light' && value !== 'system') attributes[SETTINGS[name].attribute] = value
  }
  const style = fixed.light === undefined ? '' : `--rkui-light-angle: ${fixed.light}deg`
  return { attributes, style }
}

/** A Vite plugin for the module the middleware reads the baked settings from. */
function bakedSettingsModule(baked) {
  const id = 'virtual:rkui/settings'
  return {
    name: 'rkui-settings',
    resolveId: (source) => (source === id ? `\0${id}` : undefined),
    load: (loaded) =>
      loaded === `\0${id}` ? `export default ${JSON.stringify(baked)}` : undefined,
  }
}

/**
 * Writes the site's fixed settings onto every page's `<html>` with a middleware
 * (`astro/middleware.js`), when there are any, so they need no JavaScript.
 * @param {{ addMiddleware: Function, updateConfig: Function }} hooks Astro's setup hooks
 * @param {Record<string, unknown>} fixed the fixed settings, checked
 */
export function bakeFixedSettings({ addMiddleware, updateConfig }, fixed) {
  if (Object.keys(fixed).length === 0) return
  updateConfig({ vite: { plugins: [bakedSettingsModule(bakedSettings(fixed))] } })
  addMiddleware({ order: 'pre', entrypoint: new URL('./middleware.js', import.meta.url) })
}

/**
 * The head script that puts back readers' choices of the switchable settings
 * (`src/head-scripts/settings-init.js`), without its comment for pasting, and with its
 * `switchable` line and its table written from the option and `SETTINGS`.
 * @param {string[]} switchable
 */
async function settingsInit(switchable) {
  let code = (await packageFile('src/head-scripts/settings-init.js')).replace(/^(\/\/.*\n)+/, '')
  for (const [line, written] of [
    ["const switchable = ['theme']", `const switchable = ${JSON.stringify(switchable)}`],
    [TABLE, `const settings = ${JSON.stringify(settingsTable())}`],
  ]) {
    const found = typeof line === 'string' ? code.includes(line) : line.test(code)
    if (!found) throw new Error(`settings-init.js has no "${line}"`)
    code = code.replace(line, () => written)
  }
  return code
}

/**
 * Injects into every page: readers' choices of the switchable settings and the table mark before
 * first paint (the choices again after each View Transitions swap, which replaces `<html>`'s
 * attributes), the stylesheet and the enhance scripts, once. With nothing switchable there is no
 * settings script.
 * @param {Function} injectScript Astro's `injectScript`
 * @param {boolean | { tables?: boolean, styles?: boolean, enhance?: boolean }} option `head`
 * @param {string[]} switchable the switchable settings, checked
 * @param {{ warn: (message: string) => void }} logger Astro's logger
 */
export async function injectHead(injectScript, option, switchable, logger) {
  const on = switches(option, ['tables', 'styles', 'enhance'], 'head', logger)
  if (switchable.length > 0) {
    injectScript(
      'head-inline',
      `{\n  const restore = () => {\n${await settingsInit(switchable)}\n  }\n  restore()\n  document.addEventListener('astro:after-swap', restore)\n}`,
    )
  }
  if (on.tables) {
    const tables = (await packageFile('src/head-scripts/table-init.js')).replace(/^(\/\/.*\n)+/, '')
    injectScript('head-inline', tables)
  }
  // `page-ssr` links the stylesheet; `page` would emit it without a link.
  if (on.styles) injectScript('page-ssr', "import '@oneonefour/rkui/styles.css'")
  if (on.enhance) injectScript('page', "import '@oneonefour/rkui/enhance.js'")
}

/**
 * Writes the licences of the fonts, icons and rkui into the build output, as one file.
 * @param {URL} dir the build output folder
 * @param {string} name the file's name
 */
export async function writeLicences(dir, name) {
  const parts = ["rkui's fonts and icons, and rkui itself, with their licences."]
  for (const [label, path, copyright] of LICENCES) {
    const notice = copyright ? `${copyright}\n\n` : ''
    parts.push(`${label}\n\n${notice}${(await packageFile(path)).trim()}`)
  }
  await writeFile(new URL(name, dir), parts.join(`\n\n${'='.repeat(72)}\n\n`) + '\n')
}
