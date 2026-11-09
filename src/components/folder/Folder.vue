<!--
  A folder: tabs standing on a sheet, each with its own panel, with no JavaScript. Each `Tab` in
  the slot is one tab, and its slot is that tab's panel. Each tab is a label around a native
  radio, so clicking a tab or the arrow keys choose it, and CSS shows the chosen tab's panel. The
  first tab marked `selected` starts chosen, or the first tab when none is. Tabs that don't fit
  wrap onto another row. `class`, `style` and other attributes go on the outer div.

  In a `.vue` file, `v-model` is the chosen tab's index, counting from 0, so the widget can read
  and switch the tab; an index past either end chooses the nearest tab. With `v-model`, the
  parent's value is the starting value unless it is undefined; then `selected` applies, on the
  server too, and is handed to the parent on mount. In an Astro or MDX page it gets no `client:`
  directive and ships no JavaScript; the widget that holds a Folder with `v-model` gets
  `client:visible`, and until then its tabs switch as they do without JavaScript.

  Inside a `<form>`, the radios are form fields: the form sends `rkui-folder-…=<index>` for the
  chosen tab, and resetting the form goes back to the tab that started chosen.

  @example
  <Folder label="Topics">
    <Tab label="One"><p>First panel.</p></Tab>
    <Tab label="Two"><p>Second panel.</p></Tab>
  </Folder>
  <Folder v-model="step" label="Steps">…</Folder>
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useSlots, useTemplateRef } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { vLiveChecked } from '../../shared/live-value'
import { modelWithStart } from '../../shared/model-start'
import { strayContent } from './tab-items'
import { readSlotTabs } from './tab-slot'

interface Props {
  /** The group's accessible name. */
  label: string
  /** A sheet in the selected tint; the raised surface when left out. */
  tinted?: boolean
}

const { label, tinted } = defineProps<Props>()

/** The chosen tab's index, from 0 (`v-model`); the tab marked `selected`, or 0, when left out. */
const model = defineModel<number>()

const slots = useSlots()
// Read while rendering, as Vue asks of slots, not once in setup.
const tabs = computed(() => {
  const { tabs, outside, outsideHtml } = readSlotTabs(slots.default?.() ?? [])
  const stray = strayContent(outsideHtml)
  if (outside.length > 0 || stray) {
    throw new Error(`Folder: put everything inside a Tab. Found outside one: ${stray.slice(0, 80)}`)
  }
  return tabs
})
const selection = modelWithStart(model, () => tabs.value.findIndex((tab) => tab.selected))
/** The chosen tab's index, kept within the tabs there are. */
const chosen = computed({
  get: () => Math.min(Math.max(selection.value, 0), tabs.value.length - 1),
  set: (index) => {
    selection.value = index
  },
})
// The radios' name, and the start of each tab's id.
const base = useComponentId('folder')

/** The tab chosen when the Folder first renders, whose radio a form reset goes back to. */
let start: number | undefined
function isStart(index: number): boolean {
  start ??= chosen.value
  return index === start
}

const root = useTemplateRef<HTMLElement>('root')
let form: HTMLFormElement | null = null
/** After a form reset has put the radios back, tells the model which tab is chosen. */
function onReset() {
  // The reset event comes before the reset itself.
  setTimeout(() => {
    const radios = [
      ...(root.value?.querySelectorAll<HTMLInputElement>(':scope > label > input') ?? []),
    ]
    model.value = radios.findIndex((radio) => radio.checked)
  })
}

onMounted(() => {
  form = root.value?.closest('form') ?? null
  form?.addEventListener('reset', onReset)
})
onBeforeUnmount(() => form?.removeEventListener('reset', onReset))
</script>

<template>
  <div
    ref="root"
    :class="['rkui-folder', 'rkui-folder--tabs', { 'rkui-folder--tinted': tinted }]"
    role="group"
    :aria-label="label"
  >
    <template v-for="(tab, i) in tabs" :key="i">
      <label class="rkui-folder-tab" :id="`${base}-tab-${i}`">
        <input
          v-live-checked
          v-model="chosen"
          type="radio"
          :name="base"
          :value="i"
          :checked.attr="isStart(i) || undefined"
        />
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
