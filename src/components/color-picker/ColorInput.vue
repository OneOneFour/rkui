<!--
  A native colour input on its own, with no palette, in a frame that pops and a paint brush icon.
  `class` and `style` go on the frame; other attributes (name, disabled, ...) go on the input. In a
  `.vue` file, `v-model` is the input's value, a colour such as "#1f6f78". Without one, `value` is
  the starting colour.

  @example
  <ColorInput label="Background colour" name="background" />
  <ColorInput v-model="background" label="Background colour" />
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import PaintBrushIcon from '@oneonefour/rkui/icons/paint-brush.vue'
import { useLiveValue } from '../../shared/live-value'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The input's accessible name. */
  label: string
}

const { label } = defineProps<Props>()

const attrs = useAttrs()
/** The input's value (`v-model`); the page's `value` attribute when left out. */
const model = defineModel<string>()
if (model.value === undefined) model.value = attrs.value as string | undefined
// In the browser, the colour chosen before the input woke up wins.
const vLiveValue = useLiveValue(model)

/**
 * The page's attributes: `class` and `style` for the frame (`outer`), the rest for the input.
 * `value` is left out: the model holds it.
 */
function pageAttrs() {
  const { value, ...rest } = attrs
  return splitAttrs(rest)
}
</script>

<template>
  <span class="rkui-color-input" v-bind="pageAttrs().outer">
    <input
      v-live-value
      v-model="model"
      type="color"
      :aria-label="label"
      v-bind="pageAttrs().inner"
    />
    <PaintBrushIcon />
  </span>
</template>
