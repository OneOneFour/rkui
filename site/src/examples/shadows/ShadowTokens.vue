<script setup>
/** The shadow tokens, each on a block, at normal depth and deep. */
const SHADOWS = [
  '--rkui-shadow',
  '--rkui-shadow-hover',
  '--rkui-shadow-pressed',
  '--rkui-shadow-inset',
  '--rkui-shadow-recess',
]
</script>

<template>
  <div v-for="depth in ['normal', 'deep']" :key="depth" class="row" :data-depth="depth">
    <p class="depth">{{ depth }}</p>
    <figure v-for="shadow in SHADOWS" :key="shadow" class="specimen">
      <div class="block" :style="{ boxShadow: `var(${shadow})` }" />
      <figcaption>
        <code>{{ shadow }}</code>
      </figcaption>
    </figure>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: start;
  gap: var(--rkui-space-5);
}

.depth {
  inline-size: 4rem;
  margin: 0;
  color: var(--rkui-muted);
}

.specimen {
  display: grid;
  gap: var(--rkui-space-3);
  margin: 0;
}

/* The recess is mixed from the block's own fill. */
.block {
  --rkui-recess-floor: var(--rkui-panel);

  inline-size: var(--rkui-space-8);
  block-size: var(--rkui-space-7);
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-radius: var(--rkui-radius);
  background: var(--rkui-panel);
}

figcaption {
  font-size: var(--rkui-step--1);
}
</style>
