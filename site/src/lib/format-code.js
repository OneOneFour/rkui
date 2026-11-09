/**
 * Formats code for the docs' tabs with Prettier, using the repository's own settings
 * (.prettierrc). Code Prettier can't read stops the build.
 */
import { fileURLToPath } from 'node:url'
import { format, resolveConfig } from 'prettier'

const settings = await resolveConfig(fileURLToPath(import.meta.url))

/**
 * The code, formatted.
 * @param {string} code
 * @param {string} parser Prettier's parser: 'astro', 'vue' or 'html'
 * @param {object} [options] Prettier options that differ from the repository's
 * @returns {Promise<string>}
 */
export async function formatCode(code, parser, options = {}) {
  const formatted = await format(code, { ...settings, ...options, parser })
  return formatted.trim()
}
