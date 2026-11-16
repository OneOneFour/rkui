<!--
  The Light / Dark / System theme switch: a Segmented control with icons. Choosing an option sets
  `data-theme` on `<html>` (none for System) and stores the choice under `rkui-theme`, where
  the head script (`head-scripts/settings-init.js`) puts it back before the next page is drawn.
  Other toggles and tabs on the same site stay in sync. It needs `client:visible` in an Astro
  page; until it runs it is hidden, keeping its space. Attributes go on the fieldset. With
  `iconOnly` it shows only the icons; the words stay, visually hidden, so each option is still
  named for screen readers.

  @example
  <ThemeToggle client:visible />
  <ThemeToggle icon-only client:visible />
-->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CircleHalfIcon from '@oneonefour/rkui/icons/circle-half.vue'
import MoonIcon from '@oneonefour/rkui/icons/moon.vue'
import SunIcon from '@oneonefour/rkui/icons/sun.vue'
import Segmented from '../segmented/Segmented.vue'
import SegmentedOption from '../segmented/SegmentedOption.vue'
import { afterSlide } from '../../shared/after-slide.js'
import { applySetting, chooseSetting, onSettingChange, readSetting } from '../../shared/settings.js'

interface Props {
  /** Only the icons, with the words visually hidden; icons and words when left out. */
  iconOnly?: boolean
}

const { iconOnly } = defineProps<Props>()

// No option starts checked: the page's theme is checked once the toggle runs in the browser, so
// the sliding pill appears there instead of sliding from a default on every page load. The toggle
// shows from then on.
const choice = ref<string>()
const listeners = new AbortController()

/** An option was chosen: store it at once, and restyle the page once the pill has slid there. */
function choose(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) return
  const theme = event.target.value
  choice.value = theme
  chooseSetting('theme', theme)
  afterSlide(event.target, () => applySetting('theme', theme))
}

onMounted(() => {
  choice.value = readSetting('theme')
  // Another toggle on this page, or another tab, changed the theme.
  onSettingChange('theme', (theme) => (choice.value = theme), listeners.signal)
})
onBeforeUnmount(() => listeners.abort())
</script>

<template>
  <Segmented
    v-model="choice"
    legend="Theme"
    :class="['rkui-theme-toggle', { 'rkui-theme-toggle--icon-only': iconOnly }]"
    :data-rkui-live="choice ? '' : undefined"
    @change="choose"
  >
    <SegmentedOption value="light">
      <template #icon><SunIcon class="rkui-icon" /></template>
      <span :class="{ 'rkui-visually-hidden': iconOnly }">Light</span>
    </SegmentedOption>
    <SegmentedOption value="dark">
      <template #icon><MoonIcon class="rkui-icon" /></template>
      <span :class="{ 'rkui-visually-hidden': iconOnly }">Dark</span>
    </SegmentedOption>
    <SegmentedOption value="system">
      <template #icon><CircleHalfIcon class="rkui-icon" /></template>
      <span :class="{ 'rkui-visually-hidden': iconOnly }">System</span>
    </SegmentedOption>
  </Segmented>
</template>
