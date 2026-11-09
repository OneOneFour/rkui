import type { VNode } from 'vue'
import { slotHtml } from '../../shared/slot-html'
import { slotVnodes, vnodeTab, type SlotTab } from './tab-slot'
import WidgetTab from './WidgetTab.vue'

/**
 * Reads the tabs out of a WidgetTabs slot, in order. Stops with a clear message when there are no
 * tabs, when something other than a WidgetTab is in the slot, or when the slot is page HTML that
 * Astro rendered (slot-html.ts) rather than Vue content.
 */
export function readWidgetTabs(vnodes: VNode[]): SlotTab[] {
  const tabs = slotVnodes(vnodes).map((vnode) => {
    if (slotHtml(vnode) !== undefined) {
      throw new Error(
        'WidgetTabs: its panels must be Vue components. In an Astro or MDX page, use <Tabs>.',
      )
    }
    if (vnode.type !== WidgetTab) throw new Error('WidgetTabs: put everything inside a WidgetTab.')
    return vnodeTab(vnode)
  })
  if (tabs.length === 0) throw new Error('WidgetTabs needs at least one WidgetTab.')
  return tabs
}
