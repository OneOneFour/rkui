<script setup>
import Sidebar from '@oneonefour/rkui/components/sidebar/Sidebar.vue'
import SectionLinks from './SectionLinks.vue'
</script>

<template>
  <Sidebar label="Plain, selected slab" selected-slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Card, selected slab" variant="card" selected-slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar
    label="Folders, selected slab"
    variant="folders"
    selected-slab
    style="inline-size: 12rem"
  >
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Deck, selected slab" variant="deck" selected-slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Note, selected slab" variant="note" selected-slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
</template>
