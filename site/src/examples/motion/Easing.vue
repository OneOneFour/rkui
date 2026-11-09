<script setup>
import Motion from '@oneonefour/rkui/components/motion/Motion.vue'
</script>

<template>
  <Motion>
    <div class="easings">
      <figure>
        <div class="track"><span class="block" style="--hop-ease: ease"></span></div>
        <figcaption>ease: input responses</figcaption>
      </figure>
      <figure>
        <div class="track">
          <span class="block" style="--hop-ease: var(--rkui-ease-spring)"></span>
        </div>
        <figcaption>--rkui-ease-spring: recovering from a squash or press</figcaption>
      </figure>
      <figure>
        <div class="track">
          <span class="block" style="--hop-ease: var(--rkui-ease-snap)"></span>
        </div>
        <figcaption>--rkui-ease-snap: a jump to a new place</figcaption>
      </figure>
    </div>
  </Motion>
</template>

<style scoped>
.easings {
  display: grid;
  gap: var(--rkui-space-4);
  margin-block-start: var(--rkui-space-4);
}

figure {
  display: grid;
  gap: var(--rkui-space-2);
  inline-size: min(100%, 24rem);
  margin: 0;
}

figcaption {
  color: var(--rkui-muted);
  font-size: var(--rkui-step--1);
}

.track {
  box-sizing: border-box;
  padding: var(--rkui-space-1);
  container-type: inline-size;
  border: var(--rkui-outline-width) solid var(--rkui-line-unfilled);
  border-radius: var(--rkui-radius);
}

/* Hold, move, hold and move back over one loop; each move takes 15% of it. The colour shadow
   casts the shadow in the fill, darkened (shadow-color.css). */
.block {
  --rkui-shade-of: var(--rkui-yellow);
  --rkui-extrusion: var(--rkui-shade);

  display: block;
  box-sizing: border-box;
  inline-size: 1.5rem;
  block-size: 1.5rem;
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-radius: calc(var(--rkui-radius) / 2);
  background: var(--rkui-yellow);
  box-shadow: var(--rkui-shadow);
  animation: hop var(--rkui-loop-medium) var(--hop-ease) infinite;
}

@keyframes hop {
  0%,
  35% {
    translate: 0 0;
  }

  50%,
  85% {
    translate: calc(100cqi - 100%) 0;
  }

  100% {
    translate: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .block {
    animation: rkui-spinner-fade var(--rkui-loop-medium) ease-in-out infinite alternate;
  }
}
</style>
