<!--
  A range slider: a native `<input type="range">` with a pill track and an outlined thumb, in a
  `.rkui-range-control` div inside a Field. `class` and `style` go on the Field's div when there is
  a label, hint or error, otherwise on the `.rkui-range-control` div; other attributes (name, min,
  max, step, disabled, aria-label, ...) go on the input. Without a label, give it an `aria-label`.

  With `ticks` a row of tick marks and value labels sits under the slider; match them to min, max
  and step so the thumb lands on them. In the browser the thumb then snaps from tick to tick with
  one small overshoot. `valueDisplay` shows the value in the thumb or in a popup over it, raised
  like a Tooltip or flat. Both follow the slider only in the browser, so in an Astro page a Range
  with `ticks` or `valueDisplay` needs `client:visible`; without it, it is a plain slider: the
  thumb jumps, and the value doesn't show. A plain HTML page's `<rkui-range>` doesn't take
  `ticks`; the page writes the slider's HTML.

  In a `.vue` file, `v-model` is the slider's value, a number. Without one, `value` is the
  starting value; the middle of the range when left out.

  @example
  <Range client:visible label="Opacity" value-display="popup" min="0" max="1" step="0.01" value="0.28" />
  <Range client:visible label="Volume" step="25" ticks={[0, 25, 50, 75, 100]} />
-->
<script setup lang="ts">
import { computed, onMounted, ref, useAttrs } from 'vue'
import Field from '../field/Field.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { controlAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The visible label; none when left out. */
  label?: string
  /** A quiet line under the slider; none when left out. */
  hint?: string
  /** An error line under the slider; it also marks the input invalid; none when left out. */
  error?: string
  /** The values to mark with a tick and a label under the slider; no ticks when left out. */
  ticks?: number[]
  /**
   * Where the value shows while the slider runs in the browser: 'thumb' (inside the thumb, which
   * widens to fit it), 'popup' (in a raised bubble over the thumb, like a Tooltip, while it is
   * hovered, dragged or focused from the keyboard) or 'flat-popup' (the same bubble in the page's
   * colours swapped, with no outline or shadow); not shown when left out.
   */
  valueDisplay?: 'thumb' | 'popup' | 'flat-popup'
}

const { label, hint, error, ticks, valueDisplay } = defineProps<Props>()

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
// Set once the Range runs in the browser; until then range.css hides the drawn thumb and popup.
const live = ref(false)
onMounted(() => (live.value = true))
// Whether a pointer is holding the slider: `:active` alone misses a touch in Safari on iPhone.
const dragging = ref(false)

/** Whether the Range draws its own thumb over the native one, which can't move smoothly. */
const drawsThumb = computed(() => Boolean(ticks) || valueDisplay === 'thumb')

/** The popup's look, or undefined when the value shows in the thumb or not at all. */
const popup = computed<'toon' | 'flat' | undefined>(() => {
  if (valueDisplay === 'popup') return 'toon'
  if (valueDisplay === 'flat-popup') return 'flat'
  return undefined
})

/** How many decimals the value shows: as many as `step` has. */
function decimals() {
  return String(attrs.step ?? 1).split('.')[1]?.length ?? 0
}

/** The slider's bounds, from the page's `min` and `max`. */
function bounds() {
  return { min: Number(attrs.min ?? 0), max: Number(attrs.max ?? 100) }
}

/** The value as the thumb or popup shows it. */
function shownValue() {
  return Number(model.value).toFixed(decimals())
}

/**
 * Where the thumb sits, as `--rkui-range-fraction` (0 at min, 1 at max), and in the thumb, how many
 * characters its widest value has, as `--rkui-range-chars`.
 */
function vars() {
  const style: Record<string, number> = {}
  if (!drawsThumb.value && !valueDisplay) return style
  const { min, max } = bounds()
  style['--rkui-range-fraction'] = Math.min(Math.max((model.value! - min) / (max - min), 0), 1)
  if (valueDisplay === 'thumb') {
    const widest = [min, max].map((end) => end.toFixed(decimals()).length)
    style['--rkui-range-chars'] = Math.max(...widest)
  }
  return style
}

/** Marks the slider held until the pointer lets go, anywhere on the page. */
function grab(event: PointerEvent) {
  if ((event.target as HTMLInputElement).disabled) return
  dragging.value = true
  const letGo = () => {
    dragging.value = false
    window.removeEventListener('pointerup', letGo)
    window.removeEventListener('pointercancel', letGo)
  }
  window.addEventListener('pointerup', letGo)
  window.addEventListener('pointercancel', letGo)
}

/**
 * The page's attributes: `class` and `style` for the Field's div when it draws a frame, otherwise
 * for the `.rkui-range-control` div (`wrapper`); the rest for the input (`wrappedControl`).
 * `value` is left out: the model holds it. With ticks, the slider's `list` must name their
 * datalist, so the page's is left out too.
 */
function pageAttrs() {
  const { value, ...rest } = attrs
  if (ticks) delete rest.list
  return controlAttrs(rest, id, { label, hint, error })
}
</script>

<template>
  <Field :label :for="id" :hint :error v-bind="pageAttrs().field">
    <div
      :class="['rkui-range-control', valueDisplay === 'thumb' && 'rkui-range-control--thumb']"
      :style="vars()"
      :data-rkui-live="live ? '' : undefined"
      :data-rkui-dragging="dragging ? '' : undefined"
      v-bind="pageAttrs().wrapper"
    >
      <input
        v-live-value
        v-model.number="model"
        class="rkui-range"
        type="range"
        :list="ticks ? `${id}-ticks` : undefined"
        v-bind="pageAttrs().wrappedControl"
        @pointerdown="grab"
      />
      <span v-if="drawsThumb" class="rkui-range-thumb" aria-hidden="true">
        {{ valueDisplay === 'thumb' ? shownValue() : '' }}
      </span>
      <span
        v-if="popup"
        :class="['rkui-range-popup', popup === 'flat' && 'rkui-range-popup--flat']"
        aria-hidden="true"
      >
        {{ shownValue() }}
      </span>
      <datalist v-if="ticks" :id="`${id}-ticks`" class="rkui-range-scale">
        <option v-for="tick in ticks" :key="tick" :value="tick">{{ tick }}</option>
      </datalist>
    </div>
  </Field>
</template>
