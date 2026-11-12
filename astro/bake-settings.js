/**
 * Writes a site's fixed settings onto each page's `<html>` tag as the page streams out. No DOM, so
 * it runs anywhere a page is rendered.
 */

/** What may come before `<html>`: white space, comments and the doctype. */
const LEAD = /^(?:\s+|<!--[\s\S]*?-->|<![^>]*>)*/

/** The text after the lead while the `<html …>` tag may still be on its way: `<ht`, `<html lang`. */
const PARTIAL_TAG = /^(?:<(?:h(?:t(?:m(?:l(?:\s[^>]*)?)?)?)?)?)?$/i

/**
 * Where a page's `<html>` start tag is in its text so far: `{ start, end }` once it has been read;
 * null when the page has none, as something else comes first (a partial page); undefined while
 * the text could still lead up to it. A `<html` inside a comment before the tag doesn't count.
 * @param {string} text
 * @returns {{ start: number, end: number } | null | undefined}
 */
export function findHtmlTag(text) {
  const start = text.match(LEAD)[0].length
  const rest = text.slice(start)
  const tag = rest.match(/^<html(?=[\s>])[^>]*>/i)
  if (tag) return { start, end: start + tag[0].length }
  // An unclosed comment or doctype, or the tag's start.
  if (rest.startsWith('<!') || PARTIAL_TAG.test(rest)) return undefined
  return null
}

/**
 * An `<html …>` tag with the fixed settings added: each attribute, and the light as
 * `--rkui-light-angle` in its `style`, after any style already there. An attribute the layout
 * already wrote wins, and so does a light angle already in its style.
 * @param {string} tag
 * @param {{ attributes: Record<string, string>, style: string }} settings from bakedSettings()
 * @returns {string}
 */
export function bakeTag(tag, { attributes, style }) {
  let baked = tag.slice(0, -1)
  for (const [name, value] of Object.entries(attributes)) {
    if (!hasAttribute(baked, name)) baked += ` ${name}="${value}"`
  }
  if (style) {
    const written = baked.match(/\sstyle\s*=\s*(["'])(.*?)\1/is)
    if (!written) baked += ` style="${style}"`
    else if (!written[2].includes('--rkui-light-angle')) {
      const before = written[2].trim().replace(/;$/, '')
      const merged = before ? `${before}; ${style}` : style
      baked = baked.replace(written[0], ` style=${written[1]}${merged}${written[1]}`)
    }
  }
  return `${baked}>`
}

/** Whether a start tag (without its `>`) has the attribute `name`. */
function hasAttribute(tag, name) {
  return new RegExp(`\\s${name}(?=[\\s=/]|$)`, 'i').test(tag)
}

/**
 * A page's body with the fixed settings baked into its `<html>` tag. It holds the chunks only
 * until it has read that tag (or knows there is none), then passes the rest through as it comes,
 * so the page still streams.
 * @param {ReadableStream<Uint8Array>} body
 * @param {{ attributes: Record<string, string>, style: string }} settings from bakedSettings()
 * @returns {ReadableStream<Uint8Array>}
 */
export function bakeStream(body, settings) {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  /** The text held while the tag is still to come; null once it has gone out. */
  let held = ''
  /** Sends the held text, baked when it holds the tag. */
  const release = (controller) => {
    const tag = findHtmlTag(held)
    const text = tag
      ? held.slice(0, tag.start) +
        bakeTag(held.slice(tag.start, tag.end), settings) +
        held.slice(tag.end)
      : held
    controller.enqueue(encoder.encode(text))
    held = null
  }
  return body.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        // Decoded as a stream, so a character split across chunks stays whole.
        const text = decoder.decode(chunk, { stream: true })
        if (held === null) {
          if (text) controller.enqueue(encoder.encode(text))
          return
        }
        held += text
        if (findHtmlTag(held) !== undefined) release(controller)
      },
      flush(controller) {
        const rest = decoder.decode()
        if (held === null) {
          if (rest) controller.enqueue(encoder.encode(rest))
          return
        }
        held += rest
        release(controller)
      },
    }),
  )
}
