<!--
  A rotary dial for a number: a labelled range drawn as a dial, with its value in a readout.
  Dragging round the dial sets the value, snapped to `step`, and fires `input` and, on release,
  `change`; the wheel steps it while the range has focus. The range stays the control for keys,
  screen readers and forms, lying invisibly over the face. In an Astro page it needs
  `client:visible`; without it the face stays hidden, holding its place, and the range shows at
  its foot. `class` and `style` go on the outermost div; other attributes (name, min, max, step,
  disabled, ...) go on the range, whose `min`, `max` and `step` are 0, 100 and 1 when left out.
  In a `.vue` file, `v-model` is the range's value, a number. Without one, `value` is the starting
  value; the middle of the range when left out. In the browser a starting value outside the range
  or off its steps moves to the nearest one, as the range has it.

  @example
  <Dial client:visible label="Temperature" min="10" max="30" step="0.5" value="20" variant="arc" />
  <Dial v-model="temperature" label="Temperature" min="10" max="30" step="0.5" />
-->
<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, useTemplateRef } from 'vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { splitAttrs } from '../../shared/split-attrs'
import {
  END_ANGLE,
  MAX_LABEL,
  MIN_LABEL,
  START_ANGLE,
  TICKS,
  TRACK,
  TRACK_RADIUS,
  angleToValue,
  faceStyle,
  isBlockLit,
  rampBlocks,
  valueToAngle,
} from '../../shared/dial-face.js'
import { VIEWBOX, arcPath, pointToAngle } from '../../shared/dial-geometry.js'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The dial's visible label, which is also its accessible name. */
  label: string
  /** 'arc'; 'knob' when left out. Open, see DECISIONS ("Dial"). */
  variant?: 'knob' | 'arc'
  /**
   * A ring of blocks that light up to the value: 'cool' (cool to warm) or 'heat' (yellow to coral);
   * no ramp when left out. Open, see DECISIONS ("Dial").
   */
  ramp?: 'cool' | 'heat'
}

const { label, variant = 'knob', ramp } = defineProps<Props>()

const attrs = useAttrs()
/** The range's lowest and highest values, from its attributes; 0 and 100 when left out. */
function limits() {
  return { min: Number(attrs.min ?? 0), max: Number(attrs.max ?? 100) }
}

/**
 * The range's value (`v-model`), a number; the page's `value` attribute when left out, or the
 * middle of the range.
 */
const model = defineModel<number>()
if (model.value === undefined) {
  const { min, max } = limits()
  model.value = Number(attrs.value ?? (min + max) / 2)
}
// In the browser, the range's own value wins: what was typed before the dial woke up, or a
// starting value it clamped or snapped to a step.
const vLiveValue = useLiveValue(model, (range) => range.valueAsNumber)
const id = (attrs.id as string | undefined) ?? useComponentId('dial')
const input = useTemplateRef<HTMLInputElement>('input')
const face = useTemplateRef<HTMLElement>('face')
// Set once the dial runs in the browser; until then dial.css hides the face.
const live = ref(false)
onMounted(() => (live.value = true))

/** What the face draws round its edge: the ramp's blocks, the arc's track, or tick marks. */
const marks = computed<'ramp' | 'arc' | 'ticks'>(() => {
  if (ramp) return 'ramp'
  if (variant === 'arc') return 'arc'
  return 'ticks'
})
/** The ramp's blocks, in as many colours as dial.css gives the ramp: 3 for heat, 6 for cool. */
const blocks = computed(() => rampBlocks(ramp === 'heat' ? 3 : 6))

/** Whether a drag is under way. */
const dragging = ref(false)
/** The range's value when the drag began, to tell on release whether it changed. */
let valueAtDragStart = ''

/**
 * The page's attributes: `class` and `style` for the outermost div (`outer`), the rest for the range
 * (`inner`). `value` is left out, as the model holds it, and so is `id`, which the range always has.
 */
function pageAttrs() {
  const { value, id: pageId, ...rest } = attrs
  return splitAttrs(rest)
}

/** Where the dial points for the value. */
function angle() {
  const { min, max } = limits()
  return valueToAngle(model.value!, min, max)
}

/** How far round the dial the value is, from 0 to 1. */
function fraction() {
  const { min, max } = limits()
  return (model.value! - min) / (max - min)
}

/** Sets the range's value, which the browser snaps to a step, and fires `input` if it changed. */
function setValue(value: number) {
  const field = input.value!
  const before = field.value
  field.value = String(value)
  if (field.value !== before) field.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * Sets the value from where the pointer is round the dial's centre. In the gap at the bottom, it
 * holds at the nearer end, so a drag past either end doesn't jump to the other.
 */
function setValueFromPointer(event: PointerEvent) {
  const box = face.value!.getBoundingClientRect()
  const pointer = pointToAngle(
    event.clientX - (box.left + box.width / 2),
    event.clientY - (box.top + box.height / 2),
  )
  const { min, max } = limits()
  if (Math.abs(pointer) <= END_ANGLE) setValue(angleToValue(pointer, min, max))
  else setValue(input.value!.valueAsNumber > (min + max) / 2 ? max : min)
}

function grab(event: PointerEvent) {
  const field = input.value!
  if (field.disabled || event.button !== 0) return
  face.value!.setPointerCapture(event.pointerId)
  field.focus({ preventScroll: true })
  valueAtDragStart = field.value
  dragging.value = true
  setValueFromPointer(event)
}

function drag(event: PointerEvent) {
  if (dragging.value) setValueFromPointer(event)
}

/** Fires `change` once at the end of a drag, as a native range does on release. */
function release() {
  if (!dragging.value) return
  dragging.value = false
  const field = input.value!
  if (field.value !== valueAtDragStart) field.dispatchEvent(new Event('change', { bubbles: true }))
}

/** Steps the value while the range has focus, so an unfocused dial never traps page scrolling. */
function wheel(event: WheelEvent) {
  const field = input.value!
  if (document.activeElement !== field || event.deltaY === 0) return
  event.preventDefault()
  const before = field.value
  if (event.deltaY < 0) field.stepUp()
  else field.stepDown()
  if (field.value === before) return
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <div
    :class="[
      'rkui-dial',
      `rkui-dial--${variant}`,
      { 'rkui-dial--ramp': ramp, 'rkui-dial--ramp-heat': ramp === 'heat' },
    ]"
    :data-rkui-live="live ? '' : undefined"
    :data-dragging="dragging ? '' : undefined"
    v-bind="pageAttrs().outer"
    @wheel="wheel"
  >
    <label :for="id">{{ label }}</label>
    <!-- @mousedown.prevent: a mousedown on the face would otherwise move focus off the range. -->
    <div
      ref="face"
      class="rkui-dial-face"
      aria-hidden="true"
      :style="faceStyle(angle())"
      @pointerdown="grab"
      @pointermove="drag"
      @lostpointercapture="release"
      @mousedown.prevent
    >
      <svg :viewBox="`0 0 ${VIEWBOX} ${VIEWBOX}`">
        <text class="rkui-dial-limit" :x="MIN_LABEL.x" :y="MIN_LABEL.y">{{ limits().min }}</text>
        <text class="rkui-dial-limit" :x="MAX_LABEL.x" :y="MAX_LABEL.y">{{ limits().max }}</text>
        <template v-if="marks === 'ramp'">
          <path
            v-for="(block, i) in blocks"
            :key="i"
            class="rkui-dial-block"
            :d="block.d"
            :style="{ '--rkui-dial-block-fill': block.fill }"
            :data-lit="isBlockLit(i, fraction()) ? '' : undefined"
          />
        </template>
        <template v-else-if="marks === 'arc'">
          <path class="rkui-dial-track-outline" :d="TRACK" />
          <path class="rkui-dial-track" :d="TRACK" />
          <path class="rkui-dial-fill" :d="arcPath(TRACK_RADIUS, START_ANGLE, angle())" />
        </template>
        <template v-else>
          <line
            v-for="(tick, i) in TICKS"
            :key="i"
            class="rkui-dial-tick"
            :x1="tick.x1"
            :y1="tick.y1"
            :x2="tick.x2"
            :y2="tick.y2"
          />
        </template>
      </svg>
      <span v-if="variant === 'arc'" class="rkui-dial-thumb"></span>
      <span v-else class="rkui-dial-knob"><span class="rkui-dial-notch"></span></span>
    </div>
    <input
      ref="input"
      v-live-value
      v-model.number="model"
      :id
      class="rkui-range"
      type="range"
      min="0"
      max="100"
      step="1"
      v-bind="pageAttrs().inner"
    />
    <output class="rkui-output" :for="id">{{ model }}</output>
  </div>
</template>
