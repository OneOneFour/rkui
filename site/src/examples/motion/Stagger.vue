<script setup>
import Motion from '@oneonefour/rkui/components/motion/Motion.vue'
</script>

<template>
  <Motion>
    <div class="row">
      <span class="block" style="--rkui-i: 0; --rkui-block-fill: var(--rkui-teal)"></span>
      <span class="block" style="--rkui-i: 1; --rkui-block-fill: var(--rkui-yellow)"></span>
      <span class="block" style="--rkui-i: 2; --rkui-block-fill: var(--rkui-navy)"></span>
      <span class="block" style="--rkui-i: 3; --rkui-block-fill: var(--rkui-green)"></span>
      <span class="block" style="--rkui-i: 4; --rkui-block-fill: var(--rkui-coral)"></span>
    </div>
  </Motion>
</template>

<style scoped>
.row {
  display: flex;
  gap: var(--rkui-space-3);
  margin-block-start: var(--rkui-space-4);
  padding-block: var(--rkui-space-2);
}

/* Each block enters in reading order, holds, then leaves in the same order, over one loop. The
   colour shadow casts each block's shadow in its own fill, darkened (shadow-color.css). */
.block {
  --rkui-shade-of: var(--rkui-block-fill);
  --rkui-extrusion: var(--rkui-shade);

  box-sizing: border-box;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-radius: calc(var(--rkui-radius) / 2);
  background: var(--rkui-block-fill);
  box-shadow: var(--rkui-shadow);
  opacity: 0;
  animation: enter var(--rkui-loop-panel) var(--rkui-ease-snap)
    calc(var(--rkui-i) * var(--rkui-stagger)) infinite backwards;
}

@keyframes enter {
  0% {
    opacity: 0;
    translate: 0 0.75rem;
  }

  6%,
  75% {
    opacity: 1;
    translate: 0 0;
  }

  85%,
  100% {
    opacity: 0;
    translate: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .block {
    opacity: 1;
    animation: none;
  }
}
</style>
