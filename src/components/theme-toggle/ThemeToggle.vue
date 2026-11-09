<!--
  The Light / Dark / System theme switch: a Segmented control with icons. Choosing an option sets
  `data-theme` on `<html>` (none for System) and stores the choice under `rkui-theme`, where
  `head-scripts/theme-init.js` reads it before the next page is drawn. Other toggles and tabs
  on the same site stay in sync. It needs `client:visible` in an Astro page; until it runs it is
  hidden, keeping its space. It takes no props; attributes go on the fieldset.

  @example
  <ThemeToggle client:visible />
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CircleHalfIcon from '@oneonefour/rkui/icons/circle-half.vue'
import MoonIcon from '@oneonefour/rkui/icons/moon.vue'
import SunIcon from '@oneonefour/rkui/icons/sun.vue'
import Segmented from '../segmented/Segmented.vue'
import SegmentedOption from '../segmented/SegmentedOption.vue'
import { afterSlide } from '../../shared/after-slide.js'

type ThemeChoice = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'rkui-theme'
/** Tells the other toggles on the page that the theme changed. */
const CHANGE_EVENT = 'rkui-theme-change'

// No option starts checked: the stored choice is checked once the toggle runs in the browser, so
// the sliding pill appears there instead of sliding from a default on every page load. The toggle
// shows from then on.
const choice = ref<ThemeChoice>()
const listeners = new AbortController()

function toChoice(value: unknown): ThemeChoice {
  return value === 'light' || value === 'dark' ? value : 'system'
}

/** The stored choice, or 'system' if there is none or storage is blocked. */
function readChoice(): ThemeChoice {
  try {
    return toChoice(localStorage.getItem(STORAGE_KEY))
  } catch {
    return 'system'
  }
}

function saveChoice(theme: ThemeChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage is blocked, so the choice lasts only until the page is left.
  }
}

function applyChoice(theme: ThemeChoice) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}

/** An option was chosen: store it, and restyle the page once the pill has slid there. */
function choose(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return
  const theme = toChoice(event.target.value)
  choice.value = theme
  saveChoice(theme)
  afterSlide(event.target, () => applyChoice(theme))
  document.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: theme }))
}

onMounted(() => {
  choice.value = readChoice()
  const { signal } = listeners
  // Another toggle on this page changed the theme.
  document.addEventListener(
    CHANGE_EVENT,
    (event) => {
      if (event instanceof CustomEvent) choice.value = toChoice(event.detail)
    },
    { signal },
  )
  // Another tab or site changed the theme. A null key means storage was cleared.
  window.addEventListener(
    'storage',
    (event) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return
      choice.value = toChoice(event.newValue)
      applyChoice(choice.value)
    },
    { signal },
  )
})
onBeforeUnmount(() => listeners.abort())
</script>

<template>
  <Segmented
    legend="Theme"
    class="rkui-theme-toggle"
    :data-rkui-live="choice ? '' : undefined"
    @change="choose"
  >
    <SegmentedOption value="light" :checked="choice === 'light'">
      <template #icon><SunIcon class="rkui-icon" /></template>
      Light
    </SegmentedOption>
    <SegmentedOption value="dark" :checked="choice === 'dark'">
      <template #icon><MoonIcon class="rkui-icon" /></template>
      Dark
    </SegmentedOption>
    <SegmentedOption value="system" :checked="choice === 'system'">
      <template #icon><CircleHalfIcon class="rkui-icon" /></template>
      System
    </SegmentedOption>
  </Segmented>
</template>
