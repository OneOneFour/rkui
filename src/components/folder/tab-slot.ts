import { Comment, Fragment, Text, type VNode } from 'vue'
import { slotHtml } from '../../shared/slot-html'
import { readTabs } from './tab-items'
import Tab from './Tab.vue'

/**
 * One tab read from a group's slot. A tab written in a .vue file comes with its slot as vnodes
 * (`panel`); a Tab written in MDX or .astro reaches Vue already rendered, as HTML (`html`).
 */
export interface SlotTab {
  label: string
  selected: boolean
  panel?: () => VNode[]
  html?: string
}

/** A group's slot, split into its tabs and everything outside them, in one of the two shapes. */
interface SlotParts {
  tabs: SlotTab[]
  /** What was outside the tabs in a .vue file. */
  outside: VNode[]
  /** What was outside the tabs in MDX or .astro, as HTML. */
  outsideHtml: string
}

/** Whether a vnode renders nothing a reader would see: a comment or whitespace. */
function isBlank(vnode: VNode): boolean {
  return vnode.type === Comment || (vnode.type === Text && !String(vnode.children).trim())
}

/** A slot's vnodes in order, with fragments (`v-for`) opened up and blank ones left out. */
export function slotVnodes(vnodes: VNode[]): VNode[] {
  return vnodes.flatMap((vnode) => {
    if (vnode.type === Fragment && Array.isArray(vnode.children)) {
      return slotVnodes(vnode.children as VNode[])
    }
    return isBlank(vnode) ? [] : [vnode]
  })
}

/** A Tab or WidgetTab read from its vnode's props and slot. `selected` alone arrives as ''. */
export function vnodeTab(vnode: VNode): SlotTab {
  const selected = vnode.props?.selected
  const children = vnode.children as { default?: () => VNode[] } | null
  return {
    label: String(vnode.props?.label),
    selected: selected === '' || selected === true || selected === 'true',
    panel: children?.default,
  }
}

/**
 * Reads the tabs out of a Tabs or Folder slot, in order, and everything outside them. A slot
 * written in MDX or .astro arrives as HTML (slot-html.ts) and is read with tab-items.ts; Tab vnodes
 * from a .vue file are read from their props. The first tab marked `selected` is the selected
 * one, or the first tab when none is. Stops with a clear message when there are no tabs.
 */
export function readSlotTabs(vnodes: VNode[], group: 'Tabs' | 'Folder'): SlotParts {
  const parts: SlotParts = { tabs: [], outside: [], outsideHtml: '' }
  for (const vnode of slotVnodes(vnodes)) {
    const html = slotHtml(vnode)
    if (vnode.type === Tab) {
      parts.tabs.push(vnodeTab(vnode))
    } else if (html !== undefined) {
      const { tabs, outside } = readTabs(html, group)
      parts.tabs.push(
        ...tabs.map(({ label, selected, content }) => ({ label, selected, html: content })),
      )
      parts.outsideHtml += outside
    } else {
      parts.outside.push(vnode)
    }
  }
  if (parts.tabs.length === 0) throw new Error(`${group} needs at least one Tab.`)
  // The first tab marked selected wins, or the first tab when none is marked.
  const marked = parts.tabs.findIndex((tab) => tab.selected)
  const first = marked === -1 ? 0 : marked
  parts.tabs.forEach((tab, i) => (tab.selected = i === first))
  return parts
}
