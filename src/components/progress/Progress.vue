<!--
  A progress bar on the native `<progress>`, inside a `<label>` that holds its visible label.
  Striped by default; without a `value` it is indeterminate. `class` and other attributes go on the
  `<progress>`.

  @example
  <Progress label="Uploading" :value="65" />
-->
<script setup lang="ts">
defineOptions({ inheritAttrs: false })

interface Props {
  /** The bar's visible label, which is also its accessible name. */
  label: string
  /** How far along, from 0 to `max`; an indeterminate bar when left out. */
  value?: number
  /** The full value; 100 when left out. */
  max?: number
  /** A plain fill instead of stripes; striped when left out. Open, see DECISIONS ("Loading"). */
  flat?: boolean
}

const { label, value, max = 100, flat } = defineProps<Props>()
</script>

<template>
  <label class="rkui-field">
    {{ label }}
    <progress
      :class="['rkui-progress', { 'rkui-progress--flat': flat }]"
      :max="value === undefined ? undefined : max"
      :value="value"
      v-bind="$attrs"
    >
      <template v-if="value !== undefined">{{ Math.round((value / max) * 100) }}%</template>
    </progress>
  </label>
</template>
