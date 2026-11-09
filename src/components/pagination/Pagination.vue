<!--
  Pagination around the page's content, with no JavaScript: a link to every page, with ‹ › links
  to the previous and next pages (`steps`). The current page is marked `aria-current="page"`. The
  slot is the page's content. `class`, `style` and other attributes go on the outer div.

  As folder tabs (the default) the links stand on a sheet holding the content, on any side of it
  (`placement`); on the left and right they stack down its edge, upright. As tiles, round page
  tiles sit between Previous and Next buttons, above or below the content.

  The links never wrap. With `overflow="collapse"` (the default), folder-enhance.js shows as many as
  fit: the first and last pages, the current one and its neighbours, and more pages around it as
  there is room, with "…" for the rest. On a narrow screen the links go to their small size, then
  leave out the first and last pages, showing ‹ current › and as many pages around it as fit, and
  scroll only if even ‹ current › doesn't fit. Without the script they scroll. With
  `overflow="scroll"` the strip links the pages near the current one and scrolls; folder-enhance.js
  puts a thin bar on its outer side while it doesn't fit.

  @example
  <Pagination :current="2" :total="9" :href="(page) => `/posts/${page}/`">
    <p>Posts 11 to 20.</p>
  </Pagination>
-->
<script setup lang="ts">
import { computed } from 'vue'
import CaretLeftIcon from '@oneonefour/rkui/icons/caret-left.vue'
import CaretRightIcon from '@oneonefour/rkui/icons/caret-right.vue'
import Button from '../button/Button.vue'

interface Props {
  /** The current page, counting from 1. */
  current: number
  /** How many pages there are. */
  total: number
  /** Where a page's link goes. */
  href: (page: number) => string
  /** The nav's accessible name; "Pagination" when left out. */
  label?: string
  /** A sheet in the selected tint, for folder tabs; the raised surface when left out. */
  tinted?: boolean
  /**
   * 'folder' (tabs on a sheet) or 'tiles' (tiles between buttons); 'folder' when left out.
   * Open, see DECISIONS ("Pagination").
   */
  variant?: 'folder' | 'tiles'
  /**
   * The side of the content the links go on; 'top' when left out. Tiles go only on the top or the
   * bottom.
   */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /**
   * When the links don't fit: 'collapse' (as many pages as fit) or 'scroll' (the pages near the
   * current one, in a strip that scrolls); 'collapse' when left out.
   */
  overflow?: 'collapse' | 'scroll'
  /** The ‹ › links to the previous and next pages; shown when left out. */
  steps?: boolean
  /**
   * The look of the dots at the ends of a strip of links that scrolls (on the top or the bottom),
   * written as `data-rkui-dots` on the outer div: 'plain', or 'pill' for dots in a raised pill; the
   * page's setting when left out.
   */
  dots?: 'plain' | 'pill'
}

const {
  current,
  total,
  href,
  label = 'Pagination',
  tinted,
  variant = 'folder',
  placement = 'top',
  overflow = 'collapse',
  steps = true,
  dots,
} = defineProps<Props>()

if (variant === 'tiles' && (placement === 'left' || placement === 'right')) {
  throw new Error(`Pagination: tiles go on the top or the bottom, not the ${placement}.`)
}

/** How many pages either side of the current one a scrolling strip links. */
const SCROLL_REACH = 3

/**
 * One entry in the strip: a page, with whether a "…" may show beside it, or a gap of left-out
 * pages.
 */
interface Entry {
  page: number | null
  gapBefore?: boolean
  gapAfter?: boolean
}

/**
 * Every page when collapsing, and the first page may show a "…" after it, and the last one before
 * it, for the pages folder-enhance.js hides. When scrolling, the first and last pages and those
 * within SCROLL_REACH of the current one, with a gap (page null) where pages are left out, never
 * for a single page.
 */
const entries = computed(() => {
  const near = (page: number) => overflow === 'collapse' || Math.abs(page - current) <= SCROLL_REACH
  const entries: Entry[] = []
  for (let page = 1; page <= total; page++) {
    const lone = (page === 2 && near(3)) || (page === total - 1 && near(total - 2))
    if (page === 1 || page === total || near(page) || lone) {
      entries.push({ page })
    } else if (entries.at(-1)?.page !== null) {
      entries.push({ page: null })
    }
  }
  if (overflow === 'collapse' && entries.length > 2) {
    entries[0].gapAfter = true
    ;(entries.at(-1) as Entry).gapBefore = true
  }
  return entries
})

/** The page before and after the current one, or null at either end. */
const previous = computed(() => (current > 1 ? current - 1 : null))
const next = computed(() => (current < total ? current + 1 : null))

/** Below and right of the content, the links come after it, as they are read. */
const parts = computed(() =>
  placement === 'bottom' || placement === 'right' ? ['content', 'strip'] : ['strip', 'content'],
)
</script>

<template>
  <div
    v-if="variant === 'folder'"
    :class="[
      'rkui-folder',
      `rkui-folder--${overflow}`,
      { [`rkui-folder--${placement}`]: placement !== 'top', 'rkui-folder--tinted': tinted },
    ]"
    :data-rkui-dots="dots"
  >
    <template v-for="part in parts" :key="part">
      <nav v-if="part === 'strip'" class="rkui-folder-strip" :aria-label="label">
        <div
          class="rkui-folder-scrollbar rkui-scroll rkui-scroll--bar"
          aria-hidden="true"
          tabindex="-1"
          hidden
        >
          <div></div>
        </div>
        <ol
          :class="[
            'rkui-folder-tabs',
            'rkui-scroll',
            { 'rkui-scroll--bar': placement === 'left' || placement === 'right' },
          ]"
        >
          <li v-if="steps" class="rkui-folder-step rkui-folder-step--previous">
            <a
              :class="['rkui-folder-tab', { 'rkui-folder-tab--off': !previous }]"
              :href="previous ? href(previous) : undefined"
              :rel="previous ? 'prev' : undefined"
              :aria-hidden="previous ? undefined : 'true'"
            >
              <CaretLeftIcon class="rkui-icon rkui-icon--small" />
              <span v-if="previous" class="rkui-visually-hidden">Previous page</span>
            </a>
          </li>
          <template v-for="(entry, i) in entries" :key="entry.page ?? `gap-${i}`">
            <li v-if="entry.page === null">…</li>
            <li v-else class="rkui-strip-item">
              <span v-if="entry.gapBefore" class="rkui-strip-gap">…</span>
              <a
                class="rkui-folder-tab"
                :href="href(entry.page)"
                :aria-current="entry.page === current ? 'page' : undefined"
              >
                <span class="rkui-pagination-number">{{ entry.page }}</span>
              </a>
              <span v-if="entry.gapAfter" class="rkui-strip-gap">…</span>
            </li>
          </template>
          <li v-if="steps" class="rkui-folder-step rkui-folder-step--next">
            <a
              :class="['rkui-folder-tab', { 'rkui-folder-tab--off': !next }]"
              :href="next ? href(next) : undefined"
              :rel="next ? 'next' : undefined"
              :aria-hidden="next ? undefined : 'true'"
            >
              <CaretRightIcon class="rkui-icon rkui-icon--small" />
              <span v-if="next" class="rkui-visually-hidden">Next page</span>
            </a>
          </li>
        </ol>
      </nav>
      <div v-else class="rkui-folder-sheet">
        <slot />
      </div>
    </template>
  </div>
  <div
    v-else
    :class="[
      'rkui-pagination-tiles',
      `rkui-pagination-tiles--${overflow}`,
      { 'rkui-pagination-tiles--bottom': placement === 'bottom' },
    ]"
    :data-rkui-dots="dots"
  >
    <template v-for="part in parts" :key="part">
      <nav v-if="part === 'strip'" class="rkui-pagination" :aria-label="label">
        <Button
          v-if="steps"
          small
          :href="previous ? href(previous) : undefined"
          :disabled="!previous"
          :rel="previous ? 'prev' : undefined"
        >
          <CaretLeftIcon class="rkui-icon rkui-icon--small" />
          <span class="rkui-pagination-word">Previous</span>
        </Button>
        <div class="rkui-pagination-pages">
          <ol class="rkui-tiles rkui-tiles--compact rkui-scroll">
            <template v-for="(entry, i) in entries" :key="entry.page ?? `gap-${i}`">
              <li v-if="entry.page === null">…</li>
              <li v-else class="rkui-strip-item">
                <span v-if="entry.gapBefore" class="rkui-strip-gap">…</span>
                <a
                  class="rkui-tile"
                  :href="href(entry.page)"
                  :aria-current="entry.page === current ? 'page' : undefined"
                >
                  {{ entry.page }}
                </a>
                <span v-if="entry.gapAfter" class="rkui-strip-gap">…</span>
              </li>
            </template>
          </ol>
        </div>
        <Button
          v-if="steps"
          small
          :href="next ? href(next) : undefined"
          :disabled="!next"
          :rel="next ? 'next' : undefined"
        >
          <span class="rkui-pagination-word">Next</span>
          <CaretRightIcon class="rkui-icon rkui-icon--small" />
        </Button>
      </nav>
      <div v-else>
        <slot />
      </div>
    </template>
  </div>
</template>
