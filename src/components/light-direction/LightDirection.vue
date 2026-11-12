<!--
  Turns the light for the whole page, to check every shadow: a compass to drag the sun round, for
  where the light comes from (degrees clockwise from the top), and a switch that makes it follow
  the time of day. A block in the middle of the compass casts the page's shadow. It sets
  --rkui-light-angle on `<html>`. An angle the reader chooses is stored under `rkui-light`, where
  the head script puts it back on the next page if the site lets readers switch the light; the
  time of day's is not. Other LightDirection controls, on the page and in other tabs, stay in
  step, and every switch on the page shares one clock. A range lies invisibly over the compass,
  for keys and screen readers; the arrows and PageUp and PageDown carry on round past 359 to 0.
  `class`, `style` and other attributes go on the outermost div, which stacks the compass over the
  switch.

  It runs in the browser, so in an Astro page it needs `client:visible`. Without it the compass
  shows its ring and the block, whose shadow falls from the page's light, with the sun hidden in
  its place; the switch shows but does nothing.

  @example
  <LightDirection client:visible />
-->
<script lang="ts">
import { ref } from 'vue'
import { sunAngle, wholeAngle } from '../../shared/light-angle.js'
import { applySetting, readSetting, showSetting, storedSetting } from '../../shared/settings.js'

/** How often the light moves while it follows the time of day. */
const CLOCK_INTERVAL_MS = 60_000

// The time of day is one clock for the whole page, shared by every LightDirection on it: each
// switch shows it, and one timer moves the light, so the controls never take turns overwriting it.
/** Whether the light follows the time of day, which also disables every control. */
const followsClock = ref(false)
/** The page's light when the clock was switched on, for when nothing is stored. */
let lightBeforeClock = ''
let clockTimer: ReturnType<typeof setInterval> | undefined
/** How many LightDirections are on the page, so the clock stops when the last one goes. */
let mountedCount = 0

/** Moves the light and every control to `lightAngle`, storing nothing. */
function showLight(lightAngle: number) {
  applySetting('light', String(lightAngle))
  showSetting('light', String(lightAngle))
}

/** Puts the light where the sun is now. */
function tick() {
  showLight(wholeAngle(sunAngle(new Date())))
}

/**
 * Switches the clock on or off for every control. Off goes back to the angle the reader last
 * chose, as a reload would show.
 */
function followClock(follow: boolean) {
  if (follow === followsClock.value) return
  followsClock.value = follow
  clearInterval(clockTimer)
  if (follow) {
    lightBeforeClock = readSetting('light')
    tick()
    clockTimer = setInterval(tick, CLOCK_INTERVAL_MS)
  } else {
    showLight(wholeAngle(storedSetting('light') ?? lightBeforeClock))
  }
}
</script>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import SunIcon from '@oneonefour/rkui/icons/sun.vue'
import Field from '../field/Field.vue'
import Switch from '../switch/Switch.vue'
import { useComponentId } from '../../shared/component-id'
import { useLive } from '../../shared/live'
import { useLiveValue } from '../../shared/live-value'
import { DEFAULT_ANGLE, directionName } from '../../shared/light-angle.js'
import { RING_RADIUS, TICKS, faceStyle } from '../../shared/light-face.js'
import { CENTRE, VIEWBOX, pointToAngle } from '../../shared/dial-geometry.js'
import { chooseSetting, onSettingChange } from '../../shared/settings.js'

/** The range's ends. */
const MIN = 0
const MAX = 359
/** How far PageUp and PageDown turn the compass: an eighth, from one tick to the next. */
const PAGE = 45

const id = useComponentId('light-direction')
const input = useTemplateRef<HTMLInputElement>('input')
const face = useTemplateRef<HTMLElement>('face')
// Set once the component runs in the browser; until then light-direction.css hides the sun.
const live = useLive()
/** Whether a drag is under way. */
const dragging = ref(false)
const listeners = new AbortController()

/** The page's clock switch (`v-model` of every LightDirection's Switch). */
const clockOn = computed({ get: () => followsClock.value, set: followClock })

/** Where the light comes from, in whole degrees from 0 to 359. */
const shownAngle = ref(DEFAULT_ANGLE)
/** Where the sun sits on the face, as its custom properties. */
const faceVars = computed(() => faceStyle(shownAngle.value))
/** The range's value (`v-model`): the angle. Setting it is the reader's choice, which is stored. */
const angle = computed({
  get: () => shownAngle.value,
  set: (value: number) => {
    shownAngle.value = wholeAngle(value)
    chooseSetting('light', String(shownAngle.value))
  },
})
// In the browser, what the reader moved the range to before the component woke up wins.
const vLiveValue = useLiveValue(angle)

/** What a screen reader says for the range: "315 degrees, from the top left". */
const valueText = computed(
  () => `${shownAngle.value} degrees, from the ${directionName(shownAngle.value)}`,
)

/** Sets the range's value, as the reader would, so `v-model` stores it. */
function setValue(value: number) {
  const field = input.value!
  const before = field.value
  field.value = String(value)
  if (field.value !== before) field.dispatchEvent(new Event('input', { bubbles: true }))
}

/** Sets the value from where the pointer is round the compass's centre. */
function setValueFromPointer(event: PointerEvent) {
  const box = face.value!.getBoundingClientRect()
  const pointer = pointToAngle(
    event.clientX - (box.left + box.width / 2),
    event.clientY - (box.top + box.height / 2),
  )
  setValue(wholeAngle(pointer))
}

function grab(event: PointerEvent) {
  const field = input.value!
  if (field.disabled || event.button !== 0) return
  face.value!.setPointerCapture(event.pointerId)
  field.focus({ preventScroll: true })
  dragging.value = true
  setValueFromPointer(event)
}

function drag(event: PointerEvent) {
  if (dragging.value) setValueFromPointer(event)
}

function release() {
  dragging.value = false
}

/**
 * Keys the range can't do itself: PageUp and PageDown turn an eighth, and they and the arrows carry
 * on round past 359 to 0, and back.
 */
function keys(event: KeyboardEvent) {
  const value = input.value!.valueAsNumber
  if (event.key === 'PageUp') setValue(wholeAngle(value + PAGE))
  else if (event.key === 'PageDown') setValue(wholeAngle(value - PAGE))
  else if (['ArrowUp', 'ArrowRight'].includes(event.key) && value === MAX) setValue(MIN)
  else if (['ArrowDown', 'ArrowLeft'].includes(event.key) && value === MIN) setValue(MAX)
  else return
  event.preventDefault()
}

// Wherever the compass turns to, the light follows.
watch(shownAngle, (lightAngle) => applySetting('light', String(lightAngle)))

onMounted(() => {
  mountedCount++
  // The compass starts at the page's light.
  shownAngle.value = wholeAngle(readSetting('light'))
  // Another control on this page, or another tab, or the clock turned the light.
  onSettingChange(
    'light',
    (lightAngle) => (shownAngle.value = wholeAngle(lightAngle)),
    listeners.signal,
  )
})
onBeforeUnmount(() => {
  listeners.abort()
  mountedCount--
  if (mountedCount > 0) return
  clearInterval(clockTimer)
  followsClock.value = false
})
</script>

<template>
  <div class="rkui-light-direction" :data-rkui-live="live ? '' : undefined">
    <Field label="Light from (degrees clockwise from the top)" :for="id">
      <div class="rkui-light-direction-control" :data-dragging="dragging ? '' : undefined">
        <!-- @mousedown.prevent: a mousedown on the face would otherwise move focus off the range. -->
        <div
          ref="face"
          class="rkui-light-direction-face"
          aria-hidden="true"
          :style="faceVars"
          @pointerdown="grab"
          @pointermove="drag"
          @lostpointercapture="release"
          @mousedown.prevent
        >
          <svg :viewBox="`0 0 ${VIEWBOX} ${VIEWBOX}`">
            <circle
              class="rkui-light-direction-track-outline"
              :cx="CENTRE"
              :cy="CENTRE"
              :r="RING_RADIUS"
            />
            <circle class="rkui-light-direction-track" :cx="CENTRE" :cy="CENTRE" :r="RING_RADIUS" />
            <line
              v-for="(tick, i) in TICKS"
              :key="i"
              class="rkui-light-direction-tick"
              :x1="tick.x1"
              :y1="tick.y1"
              :x2="tick.x2"
              :y2="tick.y2"
            />
          </svg>
          <span class="rkui-light-direction-block"></span>
          <span class="rkui-light-direction-sun"><SunIcon class="rkui-icon" /></span>
        </div>
        <!-- autocomplete="off": the page's light, not a position the browser kept, starts it.
             dir="ltr": the compass is drawn the same way round on a right-to-left page. -->
        <input
          ref="input"
          v-live-value
          v-model.number="angle"
          :id
          class="rkui-range"
          type="range"
          dir="ltr"
          :min="MIN"
          :max="MAX"
          step="1"
          autocomplete="off"
          :aria-valuetext="valueText"
          :disabled="clockOn"
          @keydown="keys"
        />
      </div>
    </Field>
    <Switch v-model="clockOn">Follow the time of day</Switch>
  </div>
</template>
