<script setup>
import WidgetTab from '@oneonefour/rkui/components/folder/WidgetTab.vue'
import WidgetTabs from '@oneonefour/rkui/components/folder/WidgetTabs.vue'
</script>

<template>
  <WidgetTabs label="Narrow" class="narrow">
    <WidgetTab label="Tab one"><p>Panel one.</p></WidgetTab>
    <WidgetTab label="Tab two"><p>Panel two.</p></WidgetTab>
    <WidgetTab label="Tab three"><p>Panel three.</p></WidgetTab>
    <WidgetTab label="Tab four"><p>Panel four.</p></WidgetTab>
  </WidgetTabs>
</template>

<style scoped>
.narrow {
  max-inline-size: 16rem;
}
</style>
