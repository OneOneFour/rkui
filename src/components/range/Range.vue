<!--
  A range slider: a native `<input type="range">` with a pill track and an outlined thumb, inside
  a Field. `class` and `style` go on the Field's div when there is a visible label, hint or error,
  otherwise on the input; other attributes (name, min, max, step, disabled, ...) go on the input.

  With `readout` the value shows in an `<output>` beside the slider. The readout follows the
  slider only in the browser, so in an Astro page a Range with `readout` needs `client:visible`;
  without it the readout keeps the starting value. With `ticks` a row of tick marks and value
  labels sits under the slider; match them to min, max and step so the thumb lands on them.
  A plain HTML page's `<rkui-range>` doesn't take `ticks`; the page writes the slider's HTML.

  In a `.vue` file, `v-model` is the slider's value, a number. Without one, `value` is the
  starting value; the middle of the range when left out.

  @example
  <Range client:visible label="Opacity" readout min="0" max="1" step="0.01" value="0.28" />
  <Range label="Volume" step="25" ticks={[0, 25, 50, 75, 100]} />
-->
<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The slider's name: a visible label with `readout`, otherwise its aria-label. */
  label?: string
  /** A quiet line under the slider; none when left out. */
  hint?: string
  /** An error line under the slider; it also marks the input invalid. */
  error?: string
  /**
   * Show the value in an `<output>` beside the slider, which needs JavaScript (`client:visible`);
   * off when left out.
   */
  readout?: boolean
  /** The values to mark with a tick and a label under the slider; no ticks when left out. */
  ticks?: number[]
}

const { label, hint, error, readout, ticks } = defineProps<Props>()

const attrs = useAttrs()
/** The slider's value (`v-model`), a number; the page's `value` attribute when left out. */
const model = defineModel<number>()
if (model.value === undefined) {
  const min = Number(attrs.min ?? 0)
  const max = Number(attrs.max ?? 100)
  model.value = Number(attrs.value ?? min + (max - min) / 2)
}
// In the browser, the slider's own value wins: what was moved before the Range woke up, or a
// starting value it clamped or snapped to a step.
const vLiveValue = useLiveValue(model)
const id = (attrs.id as string | undefined) ?? useComponentId('range')

/** The label the Field shows: `label`, with `readout`. */
const visibleLabel = computed(() => (readout ? label : undefined))

/** The slider's own name when no label is shown: the page's `aria-label`, or else `label`. */
function ariaLabel() {
  return visibleLabel.value ? undefined : ((attrs['aria-label'] as string | undefined) ?? label)
}

/**
 * The page's attributes, split between the Field and the input, which carries `class` and `style`
 * itself when the Field draws no frame. `value` and `aria-label` are left out: the model holds the
 * value, and `ariaLabel()` gives the name.
 */
function pageAttrs() {
  const { value, 'aria-label': pageLabel, ...rest } = attrs
  // With ticks, the slider's `list` must name their datalist, so the page's is left out.
  if (ticks) delete rest.list
  return controlAttrs(rest, id, { label: visibleLabel.value, hint, error })
}
</script>

<template>
  <Field :label="visibleLabel" :for="id" :hint :error v-bind="pageAttrs().field">
    <div v-if="readout" class="rkui-range-row">
      <input
        v-live-value
        v-model.number="model"
        class="rkui-range"
        type="range"
        :aria-label="ariaLabel()"
        :list="ticks ? `${id}-ticks` : undefined"
        v-bind="pageAttrs().control"
      />
      <output class="rkui-output" :for="id">{{ model }}</output>
    </div>
    <input
      v-else
      v-live-value
      v-model.number="model"
      class="rkui-range"
      type="range"
      :aria-label="ariaLabel()"
      :list="ticks ? `${id}-ticks` : undefined"
      v-bind="pageAttrs().control"
    />
    <datalist v-if="ticks" :id="`${id}-ticks`" class="rkui-range-scale">
      <option v-for="tick in ticks" :key="tick" :value="tick">{{ tick }}</option>
    </datalist>
  </Field>
</template>
