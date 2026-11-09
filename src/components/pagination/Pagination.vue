<!--
  Pagination as folder tabs over the page's sheet, with no JavaScript. The links are previous, the
  first and last pages, the current one and its neighbours, and next, with "…" for the gaps; the
  current page is marked `aria-current="page"`. When the tabs don't fit, the strip scrolls sideways
  (by touch, trackpad, wheel or keyboard), with dots at the edge that has more, and
  pagination-enhance.js puts a scrollbar above it, in room kept for it. The sheet, the page's
  content, is the slot. `class`, `style` and other attributes go on the outer div.

  @example
  <Pagination :current="2" :total="9" :href="(page) => `/posts/${page}/`">
    <p>Posts 11 to 20.</p>
  </Pagination>
-->
<script setup lang="ts">
import { computed } from 'vue'
import CaretLeftIcon from '@oneonefour/rkui/icons/caret-left.vue'
import CaretRightIcon from '@oneonefour/rkui/icons/caret-right.vue'

interface Props {
  /** The current page, counting from 1. */
  current: number
  /** How many pages there are. */
  total: number
  /** Where a page's link goes. */
  href: (page: number) => string
  /** The nav's accessible name; "Pagination" when left out. */
  label?: string
  /** A sheet in the selected tint; the raised surface when left out. */
  tinted?: boolean
}

const { current, total, href, label = 'Pagination', tinted } = defineProps<Props>()

/** The page numbers to link, with null where pages are left out. */
const pages = computed(() => {
  const pages: (number | null)[] = []
  for (let page = 1; page <= total; page++) {
    if (page === 1 || page === total || Math.abs(page - current) <= 1) {
      pages.push(page)
    } else if (pages.at(-1) !== null) {
      pages.push(null)
    }
  }
  return pages
})
</script>

<template>
  <div :class="['rkui-folder', { 'rkui-folder--tinted': tinted }]">
    <nav :aria-label="label">
      <ol class="rkui-folder-tabs rkui-scroll">
        <li v-if="current > 1">
          <a class="rkui-folder-tab" :href="href(current - 1)" rel="prev">
            <CaretLeftIcon class="rkui-icon rkui-icon--small" />
            <span class="rkui-visually-hidden">Previous page</span>
          </a>
        </li>
        <li v-for="(page, i) in pages" :key="i">
          <template v-if="page === null">…</template>
          <a
            v-else
            class="rkui-folder-tab"
            :href="href(page)"
            :aria-current="page === current ? 'page' : undefined"
          >
            {{ page }}
          </a>
        </li>
        <li v-if="current < total">
          <a class="rkui-folder-tab" :href="href(current + 1)" rel="next">
            <CaretRightIcon class="rkui-icon rkui-icon--small" />
            <span class="rkui-visually-hidden">Next page</span>
          </a>
        </li>
      </ol>
    </nav>
    <div class="rkui-folder-sheet">
      <slot />
    </div>
  </div>
</template>
