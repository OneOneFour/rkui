// Fails the build if a list of the settings has drifted from SETTINGS (src/shared/settings.js),
// the one list of them: the table pasted into head-scripts/settings-init.js for plain pages, and
// the plain TypeScript unions in astro/index.d.ts, which name each setting's values, and the
// settings themselves, by hand.
import { readFile } from 'node:fs/promises'
import { isDeepStrictEqual } from 'node:util'
import { settingsTable, TABLE } from '../astro/setup.js'
import { SETTINGS } from '../src/shared/settings.js'

/** A file in the repo. */
function repoFile(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8')
}

/**
 * The quoted strings in the union written after `label` (`palette?:`), or null if none. The union
 * may be wrapped onto several lines, with a leading `|`, and may end in `| string`, which is not
 * a value. Anything else in it (a number, a type name) ends the union.
 */
function union(source, label) {
  const escaped = label.replaceAll('?', '\\?')
  const line = source.match(new RegExp(`\\b${escaped}\\s*((?:\\|?\\s*(?:'[^']*'|string)\\s*)+)`))
  return line && [...line[1].matchAll(/'([^']*)'/g)].map(([, value]) => value)
}

const problems = []
const values = Object.fromEntries(
  Object.entries(SETTINGS).map(([name, setting]) => [name, Object.keys(setting.options)]),
)
/** Checks that the union after `label` in `file` is `expected`, when the file has one. */
function check(file, source, label, expected) {
  const found = union(source, label)
  if (found === null)
    problems.push(`${file} has no union for ${label}: write it as 'a' | 'b' (quoted values)`)
  else if (!isDeepStrictEqual(found, expected)) {
    problems.push(`${file}: ${label} is ${found.join(' | ')}, not ${expected.join(' | ')}`)
  }
}

const init = await repoFile('src/head-scripts/settings-init.js')
const table = init.match(TABLE)
// The table is a plain object literal of strings, written for pasting.
const pasted = table && new Function(`return ${table[0].replace('const settings = ', '')}`)()
if (!isDeepStrictEqual(pasted, settingsTable())) {
  problems.push("src/head-scripts/settings-init.js: its settings table isn't SETTINGS")
}

const types = await repoFile('astro/index.d.ts')
check('astro/index.d.ts', types, 'SettingName =', [...Object.keys(SETTINGS), 'light'])
for (const name of Object.keys(SETTINGS))
  check('astro/index.d.ts', types, `${name}?:`, values[name])

if (problems.length > 0) {
  throw new Error(
    `The settings have drifted from SETTINGS (build/check-settings.js):\n${problems.join('\n')}`,
  )
}
console.log('settings: the head script and the unions match SETTINGS')
