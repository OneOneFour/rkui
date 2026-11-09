<!--
  A radio button: a native radio inside a `label.rkui-check`. The slot is the label text.
  Radios with the same `name` form a group. `class` and `style` go on the label; other attributes
  (name, disabled, required, aria-invalid, ...) go on the input. In a `.vue` file, give each radio
  in a group the same `v-model`: it holds the chosen radio's `value`. With `v-model`, the parent's
  value is the starting value; `checked` applies only without one.

  @example
  <Radio name="size" value="s" checked>Small</Radio>
  <Radio v-model="size" value="s">Small</Radio>
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import { vLiveChecked } from '../../shared/live-value'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The value the form sends, and the model holds, when this radio is chosen. */
  value: string
  /** Starts chosen; unchosen when left out. */
  checked?: boolean
}

const { value, checked } = defineProps<Props>()

/** The chosen radio's value (`v-model`); this one's `value` when it is `checked`. */
const model = defineModel<string>()
if (model.value === undefined && checked) model.value = value
const attrs = useAttrs()

/** The page's attributes: `class` and `style` for the label (`outer`), the rest for the input. */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <label class="rkui-check" v-bind="pageAttrs().outer">
    <input
      v-live-checked
      v-model="model"
      class="rkui-radio"
      type="radio"
      :value
      v-bind="pageAttrs().inner"
    />
    <slot />
  </label>
</template>
