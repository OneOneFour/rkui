<!--
  A text-like input: a native `<input>` in the `.rkui-input` frame, inside a Field. `class` and
  `style` go on the Field's div when there is a label, hint or error, otherwise on the input; other
  attributes (name, placeholder, disabled, required, ...) go on the input. Without a label, give it
  an `aria-label`. Search and file inputs have their own components: Search, File. In a `.vue`
  file, `v-model` is the input's value (a number for `type="number"`). With `v-model`, the
  parent's value is the starting value; `value` applies only without one. In Safari on macOS and
  in Firefox, `type="month"` and `type="week"` fall back to a plain text box.

  @example
  <Input label="Email" type="email" name="email" hint="We never share it" />
  <Input v-model="email" label="Email" type="email" />
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The input's type; text when left out. */
  type?: string
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the input; none when left out. */
  hint?: string
  /** An error line under the input; it also marks the input invalid. */
  error?: string
  /**
   * The hover cue: 'ring', 'underline' or 'none'; the background sinks to the page colour when
   * left out.
   */
  hover?: 'ring' | 'underline' | 'none'
}

const { type = 'text', label, hint, error, hover } = defineProps<Props>()

const attrs = useAttrs()
/** The input's value (`v-model`); the page's `value` attribute when left out. */
const model = defineModel<string | number>()
if (model.value === undefined) model.value = attrs.value as string | undefined
// In the browser, what was typed before the input woke up wins.
const vLiveValue = useLiveValue(model)
const id = (attrs.id as string | undefined) ?? useComponentId('input')

/**
 * The page's attributes, split between the Field and the input. Without a frame the input is the
 * outermost element, so it takes `class` and `style` too. `value` is left out: the model holds it.
 */
function pageAttrs() {
  const { value, ...rest } = attrs
  return controlAttrs(rest, id, { label, hint, error })
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <input
      v-live-value
      v-model="model"
      :class="['rkui-input', hover && `rkui-hover-${hover}`]"
      :type
      v-bind="pageAttrs().control"
    />
  </Field>
</template>
