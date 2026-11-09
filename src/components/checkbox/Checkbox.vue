<!--
  A checkbox: a native checkbox inside a `label.rkui-check`, with the label text in the slot.
  `class` and `style` go on the label; other attributes (name, value, disabled, required,
  aria-invalid, ...) go on the input. In a `.vue` file, `v-model` is whether it is checked.
  With `v-model`, the parent's value is the starting value; `checked` applies only without one.

  @example
  <Checkbox name="news" checked>Send me the newsletter</Checkbox>
  <Checkbox v-model="news">Send me the newsletter</Checkbox>
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import { vLiveChecked } from '../../shared/live-value'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** Starts checked; unchecked when left out. */
  checked?: boolean
}

const { checked } = defineProps<Props>()

/**
 * Whether it is checked (`v-model`); `checked` when left out. The undefined default stops Vue
 * reading a missing model as false.
 */
const model = defineModel<boolean | undefined>({ default: undefined })
if (model.value === undefined) model.value = checked
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
      class="rkui-checkbox"
      type="checkbox"
      v-bind="pageAttrs().inner"
    />
    <slot />
  </label>
</template>
