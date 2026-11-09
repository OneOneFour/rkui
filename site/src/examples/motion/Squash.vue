<script setup>
import Motion from '@oneonefour/rkui/components/motion/Motion.vue'
</script>

<template>
  <Motion>
    <div class="ground"><span class="ball"></span></div>
  </Motion>
</template>

<style scoped>
.ground {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  inline-size: 6rem;
  block-size: 4.5rem;
  margin-block-start: var(--rkui-space-4);
  border-block-end: var(--rkui-outline-width) solid var(--rkui-line-unfilled);
}

/* The library's rkui-squash keyframes: squash on landing, stretch in flight, settle. */
.ball {
  position: relative;
  box-sizing: border-box;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-radius: 50%;
  background: var(--rkui-coral);
  box-shadow: var(--rkui-shadow-pressed);
  transform-origin: 50% 100%;
  animation: rkui-squash var(--rkui-loop-short) infinite;
}

/* A glint on the side the light comes from, opposite the shadow. */
.ball::after {
  content: '';
  position: absolute;
  inset: 0;
  inline-size: 25%;
  block-size: 25%;
  margin: auto;
  border-radius: 50%;
  background: var(--rkui-glint);
  translate: calc(var(--rkui-shadow-dx) * -0.3rem) calc(var(--rkui-shadow-dy) * -0.3rem);
}

@media (prefers-reduced-motion: reduce) {
  .ball {
    animation: rkui-spinner-fade 1.8s ease-in-out infinite alternate;
  }
}
</style>
