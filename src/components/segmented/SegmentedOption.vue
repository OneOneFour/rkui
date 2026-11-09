<!--
  One option of a Segmented control: a label around a native radio. Put an optional icon
  (`slot="icon"` in Astro, `<template #icon>` in Vue) and the label text in the slot. `class` and
  `style` go on the label; other attributes go on the input.

  @example
  <SegmentedOption value="dark"><MoonIcon slot="icon" />Dark</SegmentedOption>
-->
<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { vLiveChecked } from '../../shared/live-value'
import { NAME_PLACEHOLDER } from '../../shared/option-group'
import { OPTION_GROUP } from '../../shared/option-slot'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The value the form sends when this option is chosen. */
  value: string
  /** The input's name; its group's name when left out. */
  name?: string
  /** Starts chosen; unchosen when left out. */
  checked?: boolean
  /** Can't be chosen; enabled when left out. */
  disabled?: boolean
}

const { value, name, checked, disabled } = defineProps<Props>()

// Inside a Vue tree the group's name and input type arrive by inject. Rendered by Astro on its
// own, the option writes a placeholder name on a checkbox, and the group around it fills in its
// own name and type (option-group.ts).
const group = inject(
  OPTION_GROUP,
  computed(() => ({ name: NAME_PLACEHOLDER, multiple: true })),
)
const attrs = useAttrs()

/** The page's attributes: `class` and `style` for the label (`outer`), the rest for the input. */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <label v-bind="pageAttrs().outer">
    <input
      v-live-checked
      :type="group.multiple ? 'checkbox' : 'radio'"
      :name="name ?? group.name"
      :value
      :checked
      :disabled
      v-bind="pageAttrs().inner"
    />
    <slot name="icon" />
    <slot />
  </label>
</template>
