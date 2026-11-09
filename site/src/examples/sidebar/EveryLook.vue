<script setup>
import Sidebar from '@oneonefour/rkui/components/sidebar/Sidebar.vue'
import SectionLinks from './SectionLinks.vue'
</script>

<template>
  <Sidebar label="Plain, slab" slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Card, slab" variant="card" slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Folders, slab" variant="folders" slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Deck, slab" variant="deck" slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
  <Sidebar label="Note, slab" variant="note" slab style="inline-size: 12rem">
    <SectionLinks />
  </Sidebar>
</template>
