<!--
  A form field: a label, a control in the slot and an optional hint or error message, stacked in
  `div.rkui-field`. `class`, `style` and other attributes go on the div. With no `label`, `hint`
  or `error` it renders just its slot, and those attributes have nothing to go on.

  Input, Textarea, Select, Stepper, Search, File and Range wrap themselves in a Field and take its
  `label`, `hint` and `error` props, so a labelled form field is one tag. They also set the
  control's `id`, `aria-describedby` and `aria-invalid`. Use Field itself to put another control
  (your own markup) in the same frame. Then the control needs the `id` that `for` names, and
  `aria-describedby` pointing at `${for}-message`, which is the message's id.

  @example
  <Field label="Volume" for="volume" hint="0 to 100">
    <input id="volume" type="number" aria-describedby="volume-message" />
  </Field>
-->
<script setup lang="ts">
interface Props {
  /** The label text; no label when left out. */
  label?: string
  /** The id of the control the label belongs to. */
  for?: string
  /** A quiet line under the control; none when left out. */
  hint?: string
  /** An error line under the control, in the error colour; it replaces the hint. */
  error?: string
}

const { label, for: controlId, hint, error } = defineProps<Props>()
</script>

<template>
  <div v-if="label || error || hint" class="rkui-field">
    <label v-if="label" :for="controlId">{{ label }}</label>
    <slot />
    <span
      v-if="error || hint"
      :class="['rkui-field-message', error && 'rkui-field-message--error']"
      :id="controlId && `${controlId}-message`"
    >
      {{ error || hint }}
    </span>
  </div>
  <slot v-else />
</template>
