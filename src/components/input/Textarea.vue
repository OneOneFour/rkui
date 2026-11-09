<!--
  A multi-line text input: a native `<textarea>` in the `.rkui-input` frame, inside a Field.
  `class` and `style` go on the Field's div when there is a label, hint or error, otherwise on the
  textarea; other attributes (name, rows, placeholder, disabled, ...) go on the textarea. Its
  starting text goes in the slot, trimmed. Without a label, give it an `aria-label`. In a `.vue`
  file, `v-model` is the textarea's text. With `v-model`, the parent's value is the starting
  value unless it is undefined; then the slot applies and is handed to the parent.

  @example
  <Textarea label="Message" name="message" rows="4" />
  <Textarea v-model="message" label="Message" rows="4" />
-->
<script setup lang="ts">
import { useAttrs, useSlots } from 'vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { modelWithStart } from '../../shared/model-start'
import { slotText } from '../../shared/slot-html'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the textarea; none when left out. */
  hint?: string
  /** An error line under the textarea; it also marks the textarea invalid. */
  error?: string
  /**
   * The hover cue: 'ring', 'underline' or 'none'; the background sinks to the page colour when
   * left out.
   */
  hover?: 'ring' | 'underline' | 'none'
}

const { label, hint, error, hover } = defineProps<Props>()

const attrs = useAttrs()
/** The textarea's text (`v-model`); the slot's text, trimmed, when left out. */
const model = defineModel<string>()
// Trimmed, as a textarea would otherwise show the indentation Prettier adds around it.
const slots = useSlots()
const text = modelWithStart(model, () => slotText(slots.default?.() ?? []).trim())
const id = (attrs.id as string | undefined) ?? useComponentId('textarea')

/**
 * The page's attributes, split between the Field and the textarea. Without a frame the textarea
 * is the outermost element, so it takes `class` and `style` too.
 */
function pageAttrs() {
  return controlAttrs(attrs, id, { label, hint, error })
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <textarea
      v-model="text"
      :class="['rkui-input', hover && `rkui-hover-${hover}`]"
      v-bind="pageAttrs().control"
    />
  </Field>
</template>
