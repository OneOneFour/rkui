<!--
  A settable clock: a labelled time input under a clock face, with a day and night ring, a sun and
  a moon, and two hands to drag. The hour hand goes round once a day. Dragging a hand sets the
  input, snapping the minutes to its `step` (in seconds), and fires `input` and, on release,
  `change`; the minute hand carries into the hour as it passes 12. The input stays the control for
  keys, screen readers and forms. In an Astro page it needs `client:visible`; without it the face
  stays hidden, holding its place, and the input works on its own. `class` and `style` go on the
  outermost div; other attributes (name, step, disabled, ...) go on the input. In a `.vue` file,
  `v-model` is the input's value, "HH:MM". Without one, `value` is the starting time.

  @example
  <Clock client:visible label="Wake up" value="07:30" />
  <Clock v-model="wakeUp" label="Wake up" />
-->
<script setup lang="ts">
import { ref, useAttrs, useTemplateRef, watch } from 'vue'
import SunIcon from '@oneonefour/rkui/icons/sun.vue'
import MoonIcon from '@oneonefour/rkui/icons/moon.vue'
import { useComponentId } from '../../shared/component-id'
import { useLiveValue } from '../../shared/live-value'
import { useLive } from '../../shared/live'
import { splitAttrs } from '../../shared/split-attrs'
import {
  FACE_STYLE,
  RING,
  TICKS,
  clockHandAngles,
  draggedTime,
  formatTime,
  handLength,
  nearestHand,
  parseTime,
  twoDigits,
} from '../../shared/clock-face.js'
import { CENTRE, VIEWBOX, pointToAngle, wrap } from '../../shared/dial-geometry.js'

defineOptions({ inheritAttrs: false })

interface Props {
  /** The clock's visible label, which is also its accessible name. */
  label: string
}

const { label } = defineProps<Props>()

const attrs = useAttrs()
/** The input's value (`v-model`), "HH:MM"; the page's `value` attribute when left out. */
const model = defineModel<string>()
if (model.value === undefined) model.value = attrs.value as string | undefined
// In the browser, what was typed before the clock woke up wins.
const vLiveValue = useLiveValue(model)
const id = (attrs.id as string | undefined) ?? useComponentId('clock')
const input = useTemplateRef<HTMLInputElement>('input')
const face = useTemplateRef<HTMLElement>('face')
// Set once the clock runs in the browser; until then clock.css hides the face.
const live = useLive()

/** The time the hands show: the input's, kept while the input is empty. */
const shown = ref(parseTime(model.value ?? ''))
/** Where the hands point, in degrees; past 360 or below 0, so each turns the short way. */
const angles = ref(clockHandAngles(shown.value.hours, shown.value.minutes))
watch(model, (value) => {
  if (!value) return
  shown.value = parseTime(value)
  angles.value = clockHandAngles(shown.value.hours, shown.value.minutes, angles.value)
})

/** The hand being dragged, if any. */
const grabbed = ref<'hour' | 'minute'>()
/** The input's value when the drag began, to tell on release whether it changed. */
let valueAtDragStart = ''

/**
 * The page's attributes: `class` and `style` for the outermost div (`outer`), the rest for the
 * input (`inner`). `value` is left out, as the model holds it, and so is `id`, which the input
 * always has.
 */
function pageAttrs() {
  const { value, id: pageId, ...rest } = attrs
  return splitAttrs(rest)
}

/** A hand's length and angle, for CSS. */
function handStyle(hand: 'hour' | 'minute') {
  return { '--rkui-hand-length': handLength(hand), '--rkui-hand-angle': `${angles.value[hand]}deg` }
}

/** The pointer's place on the face, in the face's SVG units. */
function pointOnFace(event: PointerEvent) {
  const box = face.value!.getBoundingClientRect()
  return {
    x: ((event.clientX - box.left) / box.width) * VIEWBOX,
    y: ((event.clientY - box.top) / box.height) * VIEWBOX,
  }
}

/** Moves the grabbed hand to the pointer, and fires `input` when the time changed. */
function setTimeFromPointer(event: PointerEvent) {
  const field = input.value!
  const { x, y } = pointOnFace(event)
  const angle = wrap(pointToAngle(x - CENTRE, y - CENTRE), 360)
  const minuteStep = Math.max(1, Math.round(Number(field.step || 60) / 60))
  const { hours, minutes } = draggedTime(grabbed.value!, angle, parseTime(field.value), minuteStep)
  const value = formatTime(hours, minutes)
  if (value === field.value) return
  field.value = value
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

function grab(event: PointerEvent) {
  const field = input.value!
  if (field.disabled || event.button !== 0) return
  face.value!.setPointerCapture(event.pointerId)
  valueAtDragStart = field.value
  grabbed.value = nearestHand(pointOnFace(event), angles.value)
  setTimeFromPointer(event)
}

function drag(event: PointerEvent) {
  if (grabbed.value) setTimeFromPointer(event)
}

/** Fires `change` once at the end of a drag, as a native input does when it's committed. */
function release() {
  if (!grabbed.value) return
  grabbed.value = undefined
  const field = input.value!
  if (field.value !== valueAtDragStart) field.dispatchEvent(new Event('change', { bubbles: true }))
}
</script>

<template>
  <div class="rkui-clock" :data-rkui-live="live ? '' : undefined" v-bind="pageAttrs().outer">
    <label :for="id">{{ label }}</label>
    <div
      ref="face"
      class="rkui-clock-face"
      aria-hidden="true"
      :style="FACE_STYLE"
      @pointerdown="grab"
      @pointermove="drag"
      @lostpointercapture="release"
    >
      <svg :viewBox="`0 0 ${VIEWBOX} ${VIEWBOX}`">
        <path class="rkui-clock-day" :d="RING.day" :stroke-width="RING.width" />
        <path class="rkui-clock-night" :d="RING.night" :stroke-width="RING.width" />
        <circle class="rkui-clock-ring-edge" :cx="CENTRE" :cy="CENTRE" :r="RING.innerEdge" />
        <line
          v-for="(edge, i) in RING.edges"
          :key="i"
          class="rkui-clock-ring-edge"
          :x1="edge.x1"
          :y1="edge.y1"
          :x2="edge.x2"
          :y2="edge.y2"
        />
        <line
          v-for="(tick, i) in TICKS"
          :key="i"
          :class="['rkui-clock-tick', { 'rkui-clock-tick--quarter': tick.quarter }]"
          :x1="tick.line.x1"
          :y1="tick.line.y1"
          :x2="tick.line.x2"
          :y2="tick.line.y2"
        />
      </svg>
      <SunIcon class="rkui-icon rkui-clock-day-icon" />
      <MoonIcon class="rkui-icon rkui-clock-night-icon" />
      <span
        class="rkui-clock-hand rkui-clock-hand--hour"
        :style="handStyle('hour')"
        :data-grabbed="grabbed === 'hour' ? '' : undefined"
      >
        <span class="rkui-clock-tip">
          <span class="rkui-clock-tag">{{ twoDigits(shown.hours) }}</span>
        </span>
      </span>
      <span
        class="rkui-clock-hand rkui-clock-hand--minute"
        :style="handStyle('minute')"
        :data-grabbed="grabbed === 'minute' ? '' : undefined"
      >
        <span class="rkui-clock-tip">
          <span class="rkui-clock-tag">{{ twoDigits(shown.minutes) }}</span>
        </span>
      </span>
      <span class="rkui-clock-hub"></span>
    </div>
    <input
      ref="input"
      v-live-value
      v-model="model"
      :id
      class="rkui-input"
      type="time"
      step="300"
      v-bind="pageAttrs().inner"
    />
  </div>
</template>
