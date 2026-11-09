<!--
  A Pause button above a group of animations (the slot). While Pause is pressed, every CSS
  animation in the group pauses; the rest of the page keeps moving. It works without JavaScript,
  so an Astro page gives it no `client:` directive. `class`, `style` and other attributes go on the
  div.

  @example
  <Motion><Spinner /><Dots /></Motion>
-->
<script setup lang="ts">
import PauseIcon from '@oneonefour/rkui/icons/pause.vue'
import Button from '../button/Button.vue'
</script>

<template>
  <div class="rkui-motion">
    <Button toggle small class="rkui-motion-pause">
      <PauseIcon class="rkui-icon" />
      Pause
    </Button>
    <slot />
  </div>
</template>
