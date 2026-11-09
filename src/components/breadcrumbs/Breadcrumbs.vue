<!--
  Breadcrumbs: the trail of pages leading to this one, in a `<nav>` with an ordered list. The last
  item is the current page, marked `aria-current="page"`. `class`, `style` and other attributes go
  on the `<nav>`.

  @example
  <Breadcrumbs :items="[{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs/' }]" />
-->
<script setup lang="ts">
interface Item {
  label: string
  href: string
}

interface Props {
  /** The trail, each a label and the link's href. */
  items: Item[]
  /**
   * The look: 'chips' (each link a chip) or 'path' (one pill frame with slashes between the
   * links); 'plain' links when left out. Open, see DECISIONS ("Breadcrumbs").
   */
  variant?: 'plain' | 'chips' | 'path'
  /** The nav's accessible name; "Breadcrumb" when left out. */
  label?: string
}

const { items, variant = 'plain', label = 'Breadcrumb' } = defineProps<Props>()
</script>

<template>
  <nav
    :class="['rkui-breadcrumbs', { 'rkui-breadcrumbs--path': variant === 'path' }]"
    :aria-label="label"
  >
    <ol>
      <li v-for="(item, i) in items" :key="i">
        <a
          :class="variant === 'chips' ? 'rkui-chip' : undefined"
          :href="item.href"
          :aria-current="i === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </a>
      </li>
    </ol>
  </nav>
</template>
