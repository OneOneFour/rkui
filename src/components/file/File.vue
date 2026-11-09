<!--
  A file input, in two variants, inside a Field. `class` and `style` go on the Field's div when
  there is a label, hint or error, otherwise on the outer element (the input, or the drop panel's
  label); other attributes (name, accept, multiple, disabled, ...) go on the input. Without a
  label, give it an `aria-label`; the 'drop' variant is labelled by its own text. It has no
  `v-model`, as a browser lets no script set a file input's files: read them in a `change`
  handler. Without JavaScript the drop panel keeps showing its prompt. In Safari, the 'button' variant's "no file selected" sits right against the button.

  @example
  <File variant="drop" name="upload" prompt="Choose a file or drop it here" />
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import UploadIcon from '@oneonefour/rkui/icons/upload-simple.vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /**
   * 'button' (A: the input frame with a small button and the filename) or 'drop' (B: a dashed
   * panel that takes clicks and dropped files, and shows the chosen filename, or "3 files", when
   * file-enhance.js is loaded); button when left
   * out. Open, see DECISIONS ("Special inputs").
   */
  variant?: 'button' | 'drop'
  /**
   * The drop panel's text, for the 'drop' variant; "Choose a file or drop it here" when left out.
   */
  prompt?: string
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the input; none when left out. */
  hint?: string
  /** An error line under the input; it also marks the input invalid; none when left out. */
  error?: string
}

const {
  variant = 'button',
  prompt = 'Choose a file or drop it here',
  label,
  hint,
  error,
} = defineProps<Props>()

const attrs = useAttrs()
const id = (attrs.id as string | undefined) ?? useComponentId('file')

/**
 * The page's attributes: `class` and `style` for the Field's div when it draws a frame, otherwise
 * for the outer element (the drop panel, or the input); the rest for the input.
 */
function pageAttrs() {
  return controlAttrs(attrs, id, { label, hint, error })
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <label v-if="variant === 'drop'" class="rkui-file-drop" v-bind="pageAttrs().wrapper">
      <input type="file" v-bind="pageAttrs().wrappedControl" />
      <UploadIcon class="rkui-icon" />
      <span class="rkui-file-drop-prompt">{{ prompt }}</span>
      <span class="rkui-file-drop-chosen"></span>
    </label>
    <input v-else class="rkui-input" type="file" v-bind="pageAttrs().control" />
  </Field>
</template>
