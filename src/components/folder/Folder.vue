<!--
  A static folder: a strip of tabs over a sheet, with no JavaScript. The tabs only show which one
  is current; for tabs that switch panels use `Tabs`. Each `Tab` in the slot is one tab, and the
  rest of the slot is the sheet. When the tabs don't fit, the strip scrolls sideways (by touch,
  trackpad, wheel or keyboard), with dots at the edge that has more. `class`, `style` and other
  attributes go on the outer div.

  @example
  <Folder label="Example">
    <Tab label="One" />
    <Tab label="Two" selected />
    <p>Sheet for two.</p>
  </Folder>
-->
<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { strayContent } from './tab-items'
import { readSlotTabs } from './tab-slot'

interface Props {
  /** The strip's accessible name; "Folder" when left out. */
  label?: string
  /** A sheet in the selected tint; the raised surface when left out. */
  tinted?: boolean
}

const { label = 'Folder', tinted } = defineProps<Props>()

const slots = useSlots()
// Read while rendering, as Vue asks of slots, not once in setup.
const parts = computed(() => {
  const parts = readSlotTabs(slots.default?.() ?? [], 'Folder')
  if (parts.tabs.some((tab) => tab.panel || strayContent(tab.html ?? ''))) {
    throw new Error('Folder: a Tab in a Folder has no content; the sheet is the rest of the slot.')
  }
  return parts
})
</script>

<template>
  <div :class="['rkui-folder', { 'rkui-folder--tinted': tinted }]">
    <ul class="rkui-folder-tabs rkui-scroll" :aria-label="label" tabindex="0">
      <li v-for="(tab, i) in parts.tabs" :key="i">
        <span class="rkui-folder-tab" :aria-current="tab.selected ? 'true' : undefined">
          {{ tab.label }}
        </span>
      </li>
    </ul>
    <div v-if="parts.outside.length > 0" class="rkui-folder-sheet">
      <component :is="part" v-for="(part, i) in parts.outside" :key="i" />
    </div>
    <div v-else class="rkui-folder-sheet" v-html="parts.outsideHtml" />
  </div>
</template>
