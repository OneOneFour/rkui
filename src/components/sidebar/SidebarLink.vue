<!--
  One link in a SidebarGroup, in its own list item. The slot is the link text. `class`, `style`
  and other attributes go on the `<li>`.

  @example
  <SidebarLink href="/button/" current>Button</SidebarLink>
-->
<script setup lang="ts">
interface Props {
  /** Where the link goes. */
  href: string
  /** Marks the link as the current page; false when left out. */
  current?: boolean
}

const { href, current } = defineProps<Props>()
</script>

<template>
  <li>
    <a class="rkui-sidebar-link" :href="href" :aria-current="current ? 'page' : undefined">
      <slot />
    </a>
  </li>
</template>
