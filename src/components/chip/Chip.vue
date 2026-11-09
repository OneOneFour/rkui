<!--
  A filter chip: a pill label around a native checkbox or radio. The slot is the label text, after
  an optional icon. Put chips in a ChipGroup, which fills in their `name` and input type, and holds
  their `v-model`. `class` and `style` go on the label; other attributes go on the input.

  @example
  <Chip value="fruit" checked>Fruit</Chip>
-->
<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue'
import { vLiveChecked } from '../../shared/live-value'
import { NAME_PLACEHOLDER } from '../../shared/option-group'
import { OPTION_GROUP, useOptionModel } from '../../shared/option-slot'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The value the form sends when this chip is chosen. */
  value: string
  /** 'checkbox' or 'radio'; its ChipGroup's type, or a checkbox on its own, when left out. */
  type?: 'checkbox' | 'radio'
  /** The input's name; its group's name when left out. */
  name?: string
  /** Starts chosen; unchosen when left out. */
  checked?: boolean
  /** Can't be chosen; enabled when left out. */
  disabled?: boolean
}

const { value, type, name, checked, disabled } = defineProps<Props>()

// Inside a Vue tree the group's name, input type and model arrive by inject. Rendered by Astro on
// its own, the chip writes a placeholder name on a checkbox, and the group around it fills in its
// own name and type (option-group.ts).
const group = inject(OPTION_GROUP, null)
const inputType = computed(() => type ?? (group && !group.value.multiple ? 'radio' : 'checkbox'))
const selection = useOptionModel(group, { type: inputType.value, value, checked })
const attrs = useAttrs()

/** The page's attributes: `class` and `style` for the label (`outer`), the rest for the input. */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <label class="rkui-chip" v-bind="pageAttrs().outer">
    <input
      v-live-checked
      v-model="selection"
      :type="inputType"
      :name="name ?? group?.name ?? NAME_PLACEHOLDER"
      :value
      :disabled
      v-bind="pageAttrs().inner"
    />
    <slot />
  </label>
</template>
