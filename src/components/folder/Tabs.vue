<!--
  Folder tabs with panels, with no JavaScript. Each `Tab` in the slot is one tab, and its slot is
  that tab's panel. Each tab is a label around a native radio, so clicking a tab or the arrow keys
  choose it, and CSS shows the chosen tab's panel. The first tab marked `selected` starts chosen,
  or the first tab when none is. Tabs that don't fit wrap onto another row. `class`, `style` and
  other attributes go on the outer div.

  Inside a `<form>`, the radios are form fields: the form sends `rkui-tabs-…=on` for the chosen
  tab, and resetting the form goes back to the tab that started chosen.

  @example
  <Tabs label="Topics">
    <Tab label="One"><p>First panel.</p></Tab>
    <Tab label="Two"><p>Second panel.</p></Tab>
  </Tabs>
-->
<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { strayContent } from './tab-items'
import { readSlotTabs } from './tab-slot'

interface Props {
  /** The group's accessible name. */
  label: string
  /** A sheet in the selected tint; the raised surface when left out. */
  tinted?: boolean
}

const { label, tinted } = defineProps<Props>()

const slots = useSlots()
// Read while rendering, as Vue asks of slots, not once in setup.
const tabs = computed(() => {
  const { tabs, outside, outsideHtml } = readSlotTabs(slots.default?.() ?? [], 'Tabs')
  const stray = strayContent(outsideHtml)
  if (outside.length > 0 || stray) {
    throw new Error(`Tabs: put everything inside a Tab. Found outside one: ${stray.slice(0, 80)}`)
  }
  return tabs
})
// The radios' name, and the start of each tab's id.
const base = useComponentId('tabs')
</script>

<template>
  <div
    :class="['rkui-folder', 'rkui-folder--tabs', { 'rkui-folder--tinted': tinted }]"
    role="group"
    :aria-label="label"
  >
    <template v-for="(tab, i) in tabs" :key="i">
      <label class="rkui-folder-tab" :id="`${base}-tab-${i}`">
        <input type="radio" :name="base" :checked="tab.selected" />
        {{ tab.label }}
      </label>
      <div
        v-if="tab.panel"
        class="rkui-folder-sheet"
        role="group"
        :aria-labelledby="`${base}-tab-${i}`"
        tabindex="0"
      >
        <component :is="tab.panel" />
      </div>
      <div
        v-else
        class="rkui-folder-sheet"
        role="group"
        :aria-labelledby="`${base}-tab-${i}`"
        tabindex="0"
        v-html="tab.html"
      />
    </template>
  </div>
</template>
