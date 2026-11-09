<script setup>
import SidebarGroup from '@oneonefour/rkui/components/sidebar/SidebarGroup.vue'
import SidebarLink from '@oneonefour/rkui/components/sidebar/SidebarLink.vue'
</script>

<template>
  <SidebarGroup heading="Start">
    <SidebarLink href="#">Getting started</SidebarLink>
    <SidebarLink href="#">Install</SidebarLink>
    <SidebarLink href="#">Colours</SidebarLink>
    <SidebarLink href="#">Typography</SidebarLink>
    <SidebarLink href="#">Motion</SidebarLink>
  </SidebarGroup>
  <SidebarGroup heading="Form controls">
    <SidebarLink href="#">Button</SidebarLink>
    <SidebarLink href="#">Checkbox</SidebarLink>
    <SidebarLink href="#">Radio</SidebarLink>
    <SidebarLink href="#">Switch</SidebarLink>
    <SidebarLink href="#">Input</SidebarLink>
    <SidebarLink href="#">Select</SidebarLink>
    <SidebarLink href="#">Range</SidebarLink>
    <SidebarLink href="#" current>Segmented</SidebarLink>
  </SidebarGroup>
  <SidebarGroup heading="Navigation">
    <SidebarLink href="#">Breadcrumbs</SidebarLink>
    <SidebarLink href="#">Tabs</SidebarLink>
    <SidebarLink href="#">Pagination</SidebarLink>
    <SidebarLink href="#">Scroll</SidebarLink>
    <SidebarLink href="#">Sidebar</SidebarLink>
  </SidebarGroup>
  <SidebarGroup heading="Feedback">
    <SidebarLink href="#">Badge</SidebarLink>
    <SidebarLink href="#">Spinner</SidebarLink>
    <SidebarLink href="#">Progress</SidebarLink>
    <SidebarLink href="#">Tooltip</SidebarLink>
  </SidebarGroup>
  <SidebarGroup heading="Containers">
    <SidebarLink href="#">Card</SidebarLink>
    <SidebarLink href="#">Sticky note</SidebarLink>
    <SidebarLink href="#">Code block</SidebarLink>
  </SidebarGroup>
</template>
