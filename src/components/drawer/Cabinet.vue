<!--
  A cabinet: Drawers stacked as one, on a raised panel, each front the cabinet's width. The slot
  holds the Drawers. With
  `exclusive`, opening a drawer closes the others: the cabinet gives them one generated `name`
  (native `<details name>`), and a drawer's own `name` wins. Without it, each drawer opens and
  closes on its own. Its drawers pull out from the bottom (leave their `placement` out). Needs no
  JavaScript. `class`, `style` and other attributes go on the `<div>`.

  @example
  <Cabinet exclusive>
    <Drawer label="Pens"><p>…</p></Drawer>
    <Drawer label="Paper"><p>…</p></Drawer>
  </Cabinet>
-->
<script setup lang="ts">
import { cloneVNode, computed, provide, type VNode } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { slotHtml } from '../../shared/slot-html'

interface Props {
  /** One drawer open at a time; each drawer opens and closes on its own when left out. */
  exclusive?: boolean
}

const { exclusive = false } = defineProps<Props>()
const generatedName = useComponentId('cabinet')
const name = computed(() => (exclusive ? generatedName : undefined))
// Drawers in a .vue file read the name by inject.
provide('rkui-cabinet-name', name)

/**
 * The HTML with the cabinet's name written into its own drawers, the `<details>` at the top level
 * of it, and not into drawers inside them.
 */
function nameTopDrawers(html: string): string {
  let depth = 0
  return html.replace(/<details\b[^>]*>|<\/details>/g, (tag) => {
    if (tag === '</details>') {
      depth--
      return tag
    }
    depth++
    const ownDrawer = depth === 1 && /^<details class="rkui-drawer[ "]/.test(tag)
    if (!ownDrawer || tag.includes(' name="')) return tag
    return tag.replace('<details', `<details name="${generatedName}"`)
  })
}

/**
 * The slot, with the name written into drawers written in MDX or .astro, which reach the cabinet
 * already rendered, as HTML (slot-html.ts). A drawer with a name of its own keeps it.
 */
function drawers(vnodes: VNode[]): VNode[] {
  if (!exclusive) return vnodes
  return vnodes.map((vnode) => {
    const html = slotHtml(vnode)
    if (html === undefined) return vnode
    return cloneVNode(vnode, { value: nameTopDrawers(html) })
  })
}
</script>

<template>
  <div class="rkui-cabinet">
    <component :is="drawer" v-for="(drawer, i) in drawers($slots.default?.() ?? [])" :key="i" />
  </div>
</template>
