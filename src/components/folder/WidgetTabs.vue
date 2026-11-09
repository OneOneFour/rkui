<!--
  Folder tabs with panels, for inside a `.vue` file, where every panel is Vue content: a widget's
  own pages. They look the same as `Tabs`, but are ARIA tabs run by Vue: clicking a tab, or the
  arrow keys, Home and End, switch panels and move focus, and a scrollbar sits above the strip
  when the tabs don't fit. Each `WidgetTab` in the slot is one tab, and its slot is that tab's
  panel; `v-for` works. `v-model` is the selected tab's index, starting from 0, and an index past
  either end selects the nearest tab. Without it the first tab marked `selected` starts selected,
  or the first tab when none is. `class`, `style` and other attributes go on the outer div.

  Only for Vue: there is no plain HTML version, and in an Astro or MDX page, where panels are page
  HTML, it stops the build; use `Tabs` there. The widget that holds it needs `client:visible` in
  an Astro page; until then the selected panel shows and the tabs don't switch.

  @example
  <WidgetTabs v-model="current" label="Topics">
    <WidgetTab label="One"><p>First panel.</p></WidgetTab>
    <WidgetTab label="Two"><p>Second panel.</p></WidgetTab>
  </WidgetTabs>
-->
<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useComponentId } from '../../shared/component-id'
import FolderStrip from './FolderStrip.vue'
import { readWidgetTabs } from './widget-tab-slot'

interface Props {
  /** The tab list's accessible name. */
  label: string
  /** A sheet in the selected tint; the raised surface when left out. */
  tinted?: boolean
}

const { label, tinted } = defineProps<Props>()
/** The selected tab's index (`v-model`); the tab marked `selected`, or 0, when left out. */
const model = defineModel<number>()

const slots = useSlots()
// Read while rendering, as Vue asks of slots, not once in setup.
const tabs = computed(() => readWidgetTabs(slots.default?.() ?? []))
const base = useComponentId('widget-tabs')
/**
 * The selected tab's index: the `v-model`, else the first tab marked `selected`, else the first,
 * kept within the tabs there are.
 */
const selected = computed(() => {
  const marked = tabs.value.findIndex((tab) => tab.selected)
  const index = model.value ?? (marked === -1 ? 0 : marked)
  return Math.min(Math.max(index, 0), tabs.value.length - 1)
})

/** Arrow keys wrap from the last tab to the first and back; Home and End jump to the ends. */
function onKeydown(event: KeyboardEvent, current: number) {
  const count = tabs.value.length
  const targets: Record<string, number> = {
    ArrowLeft: current - 1,
    ArrowRight: current + 1,
    Home: 0,
    End: count - 1,
  }
  const target = targets[event.key]
  if (target === undefined) return
  event.preventDefault()
  // Not read back from the model: with a v-model, that changes only once the parent re-renders.
  const next = (target + count) % count
  model.value = next
  document.getElementById(`${base}-tab-${next}`)?.focus()
}
</script>

<template>
  <div :class="['rkui-folder', { 'rkui-folder--tinted': tinted }]">
    <FolderStrip role="tablist" :aria-label="label">
      <button
        v-for="(tab, i) in tabs"
        :key="i"
        class="rkui-folder-tab"
        type="button"
        role="tab"
        :id="`${base}-tab-${i}`"
        :aria-controls="`${base}-panel-${i}`"
        :aria-selected="i === selected ? 'true' : 'false'"
        :tabindex="i === selected ? 0 : -1"
        @click="model = i"
        @keydown="onKeydown($event, i)"
      >
        {{ tab.label }}
      </button>
    </FolderStrip>
    <div
      v-for="(tab, i) in tabs"
      :key="i"
      class="rkui-folder-sheet"
      role="tabpanel"
      :id="`${base}-panel-${i}`"
      :aria-labelledby="`${base}-tab-${i}`"
      tabindex="0"
      :hidden="i !== selected"
    >
      <component :is="tab.panel" v-if="tab.panel" />
    </div>
  </div>
</template>
