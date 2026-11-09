<!--
  A folder: tabs standing on a sheet, each with its own panel, with no JavaScript. Each `Tab` in
  the slot is one tab, and its slot is that tab's panel. Each tab is a label around a native
  radio, so clicking a tab or the arrow keys choose it, and CSS shows the chosen tab's panel. The
  first tab marked `selected` starts chosen, or the first tab when none is. A Folder takes up to
  20 tabs. `class`, `style` and other attributes go on the outer div.

  The tabs stand on any side of the sheet (`placement`); on the left and right they stack down
  its edge, as long as the sheet, with the foot of their letters towards it. They never wrap: when
  they don't fit, the strip scrolls (`overflow="scroll"`), and folder-enhance.js shows a thin bar
  on its outer side. With `overflow="collapse"`, folder-enhance.js shows as many tabs as fit: the
  first and last, the chosen one and its neighbours, and more around it as there is room. On a
  narrow screen the tabs go to their small size, then leave out the first and last: the chosen
  one between the ‹ › step tabs (`steps`), or with its neighbours when there are none, and as
  many around it as fit. They scroll only if even that doesn't fit. Without the script the strip scrolls. Hidden tabs are reached with the arrow keys or
  the step tabs, which choose the tab before or after.

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
  <Folder v-model="step" label="Steps" placement="left" steps>…</Folder>
-->
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useSlots, useTemplateRef, watch } from 'vue'
import CaretLeftIcon from '@oneonefour/rkui/icons/caret-left.vue'
import CaretRightIcon from '@oneonefour/rkui/icons/caret-right.vue'
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
  /** The side of the sheet the tabs stand on; 'top' when left out. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * When the tabs don't fit: 'scroll' (a strip that scrolls, every tab in reach) or 'collapse'
   * (as many tabs as fit around the chosen one); 'scroll' when left out.
   */
  overflow?: 'scroll' | 'collapse'
  /** ‹ › step tabs at the strip's ends, choosing the tab before or after; none when left out. */
  steps?: boolean
}

const { label, tinted, placement = 'top', overflow = 'scroll', steps } = defineProps<Props>()

/** The chosen tab's index, from 0 (`v-model`); the tab marked `selected`, or 0, when left out. */
const model = defineModel<number>()

/** The most tabs a Folder takes: folder.css matches each tab to its panel by number. */
const MOST_TABS = 20

const slots = useSlots()
// Read while rendering, as Vue asks of slots, not once in setup.
const tabs = computed(() => {
  const { tabs, outside, outsideHtml } = readSlotTabs(slots.default?.() ?? [])
  const stray = strayContent(outsideHtml)
  if (outside.length > 0 || stray) {
    throw new Error(`Folder: put everything inside a Tab. Found outside one: ${stray.slice(0, 80)}`)
  }
  if (tabs.length > MOST_TABS) {
    throw new Error(`Folder takes up to ${MOST_TABS} tabs; "${label}" has ${tabs.length}.`)
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
// The radios' name, and the start of each tab's and radio's id.
const base = useComponentId('folder')

/** Below and right of the sheet, the strip comes after the panels, as it is read. */
const parts = computed(() =>
  placement === 'bottom' || placement === 'right' ? ['content', 'strip'] : ['strip', 'content'],
)

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
      ...(root.value?.querySelectorAll<HTMLInputElement>(
        ':scope > .rkui-folder-strip input[type="radio"]',
      ) ?? []),
    ]
    model.value = radios.findIndex((radio) => radio.checked)
  })
}

onMounted(() => {
  form = root.value?.closest('form') ?? null
  form?.addEventListener('reset', onReset)
})

// Vue checks the radio without a change event when the widget switches the tab, so the strip
// says so itself, for folder-enhance.js to show the tabs around the new one.
watch(
  chosen,
  () => {
    const strip = root.value?.querySelector(':scope > .rkui-folder-strip > .rkui-folder-tabs')
    strip?.dispatchEvent(new Event('change', { bubbles: true }))
  },
  { flush: 'post' },
)
onBeforeUnmount(() => form?.removeEventListener('reset', onReset))
</script>

<template>
  <div
    ref="root"
    :class="[
      'rkui-folder',
      'rkui-folder--tabs',
      `rkui-folder--${overflow}`,
      { [`rkui-folder--${placement}`]: placement !== 'top', 'rkui-folder--tinted': tinted },
    ]"
    role="group"
    :aria-label="label"
  >
    <template v-for="part in parts" :key="part">
      <div v-if="part === 'strip'" class="rkui-folder-strip">
        <div
          class="rkui-folder-scrollbar rkui-scroll rkui-scroll--bar"
          aria-hidden="true"
          tabindex="-1"
          hidden
        >
          <div></div>
        </div>
        <div
          :class="[
            'rkui-folder-tabs',
            'rkui-scroll',
            { 'rkui-scroll--bar': placement === 'left' || placement === 'right' },
          ]"
        >
          <span v-for="(tab, i) in tabs" :key="i" class="rkui-strip-item">
            <span
              v-if="overflow === 'collapse' && i > 1 && i === tabs.length - 1"
              class="rkui-strip-gap"
              >…</span
            >
            <label class="rkui-folder-tab" :id="`${base}-tab-${i}`">
              <input
                v-live-checked
                v-model="chosen"
                type="radio"
                :id="`${base}-${i}`"
                :name="base"
                :value="i"
                :checked.attr="isStart(i) || undefined"
              />
              <span class="rkui-folder-label">{{ tab.label }}</span>
            </label>
            <span
              v-if="overflow === 'collapse' && i === 0 && tabs.length > 2"
              class="rkui-strip-gap"
              >…</span
            >
            <template v-if="steps">
              <span class="rkui-folder-step rkui-folder-step--previous" aria-hidden="true">
                <label
                  :class="['rkui-folder-tab', { 'rkui-folder-tab--off': i === 0 }]"
                  :for="i > 0 ? `${base}-${i - 1}` : undefined"
                >
                  <CaretLeftIcon class="rkui-icon rkui-icon--small" />
                </label>
              </span>
              <span class="rkui-folder-step rkui-folder-step--next" aria-hidden="true">
                <label
                  :class="['rkui-folder-tab', { 'rkui-folder-tab--off': i === tabs.length - 1 }]"
                  :for="i < tabs.length - 1 ? `${base}-${i + 1}` : undefined"
                >
                  <CaretRightIcon class="rkui-icon rkui-icon--small" />
                </label>
              </span>
            </template>
          </span>
        </div>
      </div>
      <template v-else>
        <template v-for="(tab, i) in tabs" :key="i">
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
      </template>
    </template>
  </div>
</template>
