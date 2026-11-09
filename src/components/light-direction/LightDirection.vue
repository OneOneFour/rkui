<!--
  Turns the light for the whole page, to check every shadow: a slider for where the light comes
  from (degrees clockwise from the top) and a switch that makes it follow the time of day. It sets
  --rkui-shadow-dx and --rkui-shadow-dy on `<html>`. `class`, `style` and other attributes go on
  the div; the page lays out the two controls inside it.

  It runs in the browser, so in an Astro page it needs `client:visible`. Without it the controls
  show but turn nothing.

  @example
  <LightDirection client:visible />
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Field from '../field/Field.vue'
import Range from '../range/Range.vue'
import Switch from '../switch/Switch.vue'
import { useComponentId } from '../../shared/component-id'
import { DEFAULT_ANGLE, shadowOffsets, sunAngle } from '../../shared/light-angle.js'

/** How often the light moves while it follows the time of day. */
const CLOCK_INTERVAL_MS = 60_000

const id = useComponentId('light-direction')
/** Where the light comes from, in whole degrees, as the slider shows it. */
const angle = ref(DEFAULT_ANGLE)
/** Whether the light follows the time of day, which also disables the slider. */
const followsClock = ref(false)
let clockTimer: ReturnType<typeof setInterval> | undefined

/** Points every shadow on the page away from a light at `lightAngle`. */
function turnLight(lightAngle: number) {
  const { dx, dy } = shadowOffsets(lightAngle)
  document.documentElement.style.setProperty('--rkui-shadow-dx', dx)
  document.documentElement.style.setProperty('--rkui-shadow-dy', dy)
}

/** Moves the slider and the light to where the sun is now. */
function showTime() {
  angle.value = Math.round(sunAngle(new Date()))
}

onMounted(() => turnLight(angle.value))
watch(angle, turnLight)

watch(followsClock, (follow) => {
  clearInterval(clockTimer)
  if (follow) {
    showTime()
    clockTimer = setInterval(showTime, CLOCK_INTERVAL_MS)
  }
})

onBeforeUnmount(() => clearInterval(clockTimer))
</script>

<template>
  <div>
    <Field label="Light from (degrees clockwise from the top)" :for="id">
      <Range :id v-model="angle" min="0" max="359" :disabled="followsClock" />
    </Field>
    <Switch v-model="followsClock">Follow the time of day</Switch>
  </div>
</template>
