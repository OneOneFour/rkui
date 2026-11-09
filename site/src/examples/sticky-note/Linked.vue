<script setup>
import StickyNote from '@oneonefour/rkui/components/sticky-note/StickyNote.vue'
import ImageIcon from '@oneonefour/rkui/icons/image.vue'
</script>

<template>
  <div class="notes">
    <StickyNote title="Linked note" href="#" meta="Meta line">
      <p>Body text.</p>
    </StickyNote>
    <StickyNote title="With an image" href="#" meta="Meta line" color="green">
      <template #image>
        <div class="rkui-card-image placeholder">
          <ImageIcon class="rkui-icon" />
        </div>
      </template>
      <p>Body text.</p>
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

.placeholder {
  display: grid;
  place-items: center;
  background: var(--rkui-teal-tint);
  --rkui-icon-fill: var(--rkui-teal);
}

.placeholder .rkui-icon {
  inline-size: 3rem;
  block-size: 3rem;
}
</style>
