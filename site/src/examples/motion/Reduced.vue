<script setup>
import Motion from '@oneonefour/rkui/components/motion/Motion.vue'
</script>

<template>
  <Motion>
    <div class="fades">
      <figure>
        <div class="track"><span class="block"></span></div>
        <figcaption>The hop</figcaption>
      </figure>
      <figure>
        <div class="ground"><span class="ball"></span></div>
        <figcaption>The bounce</figcaption>
      </figure>
    </div>
  </Motion>
</template>

<style scoped>
.fades {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: var(--rkui-space-6);
  margin-block-start: var(--rkui-space-4);
}

figure {
  display: grid;
  gap: var(--rkui-space-2);
  margin: 0;
}

figcaption {
  color: var(--rkui-muted);
  font-size: var(--rkui-step--1);
}

.track {
  box-sizing: border-box;
  inline-size: min(100%, 16rem);
  padding: var(--rkui-space-1);
  border: var(--rkui-outline-width) solid var(--rkui-line-unfilled);
  border-radius: var(--rkui-radius);
}

.ground {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  inline-size: 6rem;
  block-size: 4.5rem;
  border-block-end: var(--rkui-outline-width) solid var(--rkui-line-unfilled);
}

/* What a state loop does under reduced motion: it stays in place and fades. The colour shadow
   casts the shadow in the fill, darkened (shadow-color.css). */
.block,
.ball {
  --rkui-extrusion: var(--rkui-shade);

  display: block;
  box-sizing: border-box;
  border: var(--rkui-outline-width) solid var(--rkui-line);
  animation: rkui-spinner-fade 1.8s ease-in-out infinite alternate;
}

.block {
  --rkui-shade-of: var(--rkui-yellow);

  inline-size: 1.5rem;
  block-size: 1.5rem;
  border-radius: calc(var(--rkui-radius) / 2);
  background: var(--rkui-yellow);
  box-shadow: var(--rkui-shadow);
}

.ball {
  --rkui-shade-of: var(--rkui-coral);

  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: 50%;
  background: var(--rkui-coral);
  box-shadow: var(--rkui-shadow-pressed);
}
</style>
