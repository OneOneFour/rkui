import { createStaticVNode, type VNode } from 'vue'

/**
 * The HTML of a slot that Astro rendered, or undefined for any other vnode. Astro hands a Vue
 * component each slot written in MDX or .astro as one vnode of its StaticHtml component, whose
 * `value` prop holds the slot's HTML (a string, or a String object).
 */
export function slotHtml(vnode: VNode): string | undefined {
  const value = vnode.props?.value
  return typeof value === 'string' || value instanceof String ? String(value) : undefined
}

/**
 * A slot's content with no wrapper element, for a slot that sits where a wrapper isn't allowed,
 * such as inside a `<table>`: vnodes from a `.vue` file as they are, and the HTML Astro rendered
 * as one static vnode, which is written out unchanged. The HTML shape only exists when Astro
 * renders on the server, where the static vnode's node count isn't used (it matters only when Vue
 * hydrates or moves the nodes in a browser), so it is given as 1.
 */
export function unwrappedSlot(vnodes: VNode[]): VNode[] {
  const html = vnodes.length === 1 ? slotHtml(vnodes[0]) : undefined
  return html === undefined ? vnodes : [createStaticVNode(html, 1)]
}

/** The character references Astro writes when it escapes text. */
const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

/** Turns Astro's escaped HTML back into the text it shows, as a browser does inside a textarea. */
function decode(html: string): string {
  return html.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (reference, name: string) => {
    if (name[0] !== '#') return NAMED[name] ?? reference
    const code =
      name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : Number(name.slice(1))
    return String.fromCodePoint(code)
  })
}

/**
 * The text of a slot. A slot from a `.vue` file is vnodes, whose text is joined. One written in MDX
 * or .astro is Astro's rendered HTML (`slotHtml`), read as a textarea reads it: its escapes are
 * undone.
 */
export function slotText(vnodes: VNode[]): string {
  return vnodes
    .map((vnode) => {
      const html = slotHtml(vnode)
      if (html !== undefined) return decode(html)
      if (typeof vnode.children === 'string') return vnode.children
      if (Array.isArray(vnode.children)) return slotText(vnode.children as VNode[])
      return ''
    })
    .join('')
}
