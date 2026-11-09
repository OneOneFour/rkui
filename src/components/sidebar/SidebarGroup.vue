<!--
  One group of a Sidebar: a heading over a list of SidebarLinks. `class`, `style` and other
  attributes go on the `<section>`.

  @example
  <SidebarGroup heading="Form controls">
    <SidebarLink href="/button/">Button</SidebarLink>
  </SidebarGroup>
-->
<script setup lang="ts">
interface Props {
  /** The group's heading. */
  heading: string
}

const { heading } = defineProps<Props>()
</script>

<template>
  <section class="rkui-sidebar-group">
    <h2 class="rkui-sidebar-heading">
      <span>{{ heading }}</span>
    </h2>
    <ul class="rkui-sidebar-list">
      <slot />
    </ul>
  </section>
</template>
