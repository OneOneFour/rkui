<!--
  A switch: a native checkbox with role="switch", drawn as a pill track with a round thumb, inside
  a `label.rkui-check` with the label text in the slot. `class` and `style` go on the label; other
  attributes (name, disabled, ...) go on the input. In a `.vue` file, `v-model` is whether it is
  on. With `v-model`, the parent's value is the starting value; `checked` applies only without
  one.

  @example
  <Switch name="wifi" checked>Wi-Fi</Switch>
  <Switch v-model="wifi">Wi-Fi</Switch>
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import { vLiveChecked } from '../../shared/live-value'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** Starts on; off when left out. */
  checked?: boolean
}

const { checked } = defineProps<Props>()

/**
 * Whether it is on (`v-model`); `checked` when left out. The undefined default stops Vue reading a
 * missing model as false.
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
      class="rkui-switch"
      type="checkbox"
      role="switch"
      v-bind="pageAttrs().inner"
    />
    <slot />
  </label>
</template>
