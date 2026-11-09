<script setup>
import StickyNote from '@oneonefour/rkui/components/sticky-note/StickyNote.vue'
</script>

<template>
  <div class="notes">
    <StickyNote as="callout" title="Note">
      <p>A note callout is sky by default. <a href="#">A link</a>.</p>
    </StickyNote>
    <StickyNote as="callout" kind="warning" title="Warning">
      <p>A warning callout is tangerine by default. <a href="#">A link</a>.</p>
    </StickyNote>
    <StickyNote as="callout" hue="yellow">
      <p>A callout in another hue, without a title.</p>
    </StickyNote>
  </div>
</template>

<style scoped>
.notes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  align-items: start;
  gap: var(--rkui-space-6);
  inline-size: 100%;
  padding-block: var(--rkui-space-3);
}
</style>
