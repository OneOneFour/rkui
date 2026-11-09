<script setup>
import StickyNote from '@oneonefour/rkui/components/sticky-note/StickyNote.vue'
</script>

<template>
  <div class="notes">
    <StickyNote title="Yellow">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Sky" color="sky">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Tangerine" color="tangerine">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Green" color="green">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Coral" color="coral">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Grape" color="grape">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Lilac" color="lilac">
      <p>Pack my box with five dozen liquor jugs.</p>
    </StickyNote>
    <StickyNote title="Apricot" color="apricot">
      <p>Pack my box with five dozen liquor jugs.</p>
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
