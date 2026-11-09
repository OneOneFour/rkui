<template>
  <div class="dark" data-shadow="color">
    <div class="panel">A panel with the hard shadow</div>
    <div class="panel panel--coral">A coral panel that joins the colour shadow</div>
  </div>
</template>

<style scoped>
/* A dark page inside this one, with the colour shadow. */
.dark {
  display: flex;
  flex-wrap: wrap;
  gap: var(--rkui-space-5);
  padding: var(--rkui-space-5);
  border-radius: var(--rkui-radius);
  color-scheme: dark;
  background: var(--rkui-surface);
  color: var(--rkui-fg);
}

.panel {
  max-inline-size: 14rem;
  padding: var(--rkui-space-4);
  border: var(--rkui-outline-width) solid var(--rkui-line);
  border-radius: var(--rkui-radius);
  background: var(--rkui-raised);
  box-shadow: var(--rkui-shadow);
}

/* Its shade, mixed from its fill, is its extrusion: the colour shadow casts it. */
.panel--coral {
  --rkui-shade-of: var(--rkui-coral);
  --rkui-extrusion: var(--rkui-shade);

  background: var(--rkui-coral);
  color: var(--rkui-on-coral);
}
</style>
