<!--
  Motion: a Pause button before the slot's animated content. While Pause is on, every CSS
  animation inside this Motion is paused; animations elsewhere on the page keep running. Pause is
  a toggle Button, so it works with no JavaScript. `class`, `style` and other attributes go on the
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
