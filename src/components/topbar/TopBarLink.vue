<!--
  One link in a TopBarNav, in its own list item. The slot is the link text. `current` marks the
  page the reader is on (or the one it belongs under) with `aria-current="page"`; the page says
  which, so it can count a page as belonging under a link. `class` and `style` go on the `<li>`;
  other attributes (`rel`, `target`, `download`, ...) go on the `<a>`.

  @example
  <TopBarLink href="/notes/" current>Notes</TopBarLink>
-->
<script setup lang="ts">
import { useAttrs } from 'vue'
import { splitAttrs } from '../../shared/split-attrs'

defineOptions({ inheritAttrs: false })

interface Props {
  /** Where the link goes. */
  href: string
  /** Marks the link as the current page; false when left out. */
  current?: boolean
}

const { href, current } = defineProps<Props>()
const attrs = useAttrs()

/** The page's attributes: `class` and `style` for the `<li>` (`outer`), the rest for the `<a>`. */
function pageAttrs() {
  return splitAttrs(attrs)
}
</script>

<template>
  <li v-bind="pageAttrs().outer">
    <a
      class="rkui-topbar-link"
      :href="href"
      :aria-current="current ? 'page' : undefined"
      v-bind="pageAttrs().inner"
    >
      <slot />
    </a>
  </li>
</template>
