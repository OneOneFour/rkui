<!--
  A card or a callout drawn as a sticky note: it renders `Card` or `Callout` with the sticky-note
  classes added, so it takes their props and slots too (`title`, `href`, `meta`, `headingLevel` and
  the `image` slot for a card; `kind` and `title` for a callout). A separate component rather than
  a `note` prop on each, so Card and Callout stay free of it. `class`, `style` and other attributes
  go on the outer element.

  @example
  <StickyNote title="Remember" hue="grape" tilt hold="pin"><p>Bring the charger.</p></StickyNote>
  <StickyNote as="callout" kind="warning" hold="tape"><p>Back up first.</p></StickyNote>
  <StickyNote title="Steeper" tilt style="--rkui-note-tilt: 4deg"><p>A custom tilt.</p></StickyNote>
-->
<script setup lang="ts">
import { computed } from 'vue'
import Callout from '../callout/Callout.vue'
import Card from '../card/Card.vue'

/** The hues sticky-note.css has a paper colour for: every hue but navy and teal. */
type NoteHue = 'yellow' | 'sky' | 'tangerine' | 'green' | 'coral' | 'grape' | 'lilac' | 'apricot'

interface Props {
  /** 'card' or 'callout'; 'card' when left out. A card needs a `title`, or the build stops. */
  as?: 'card' | 'callout'
  /** The note's colour: yellow, but sky for a note callout and tangerine for a warning one. */
  hue?: NoteHue
  /** Turns the note slightly, by -2deg; set `--rkui-note-tilt` in `style` for another angle; upright when left out. */
  tilt?: boolean
  /** How the note is held to the page: 'tape' or 'pin'; neither when left out. */
  hold?: 'tape' | 'pin'
  /** The card's title (required for a card) or the callout's bold first line; none when left out. */
  title?: string
  /** A card's link target; a static note when left out. */
  href?: string
  /** A card's short line under the title; none when left out. */
  meta?: string
  /** A card title's heading level; 3 when left out. */
  headingLevel?: 2 | 3 | 4
  /** A callout's kind, 'note' or 'warning'; 'note' when left out. */
  kind?: 'note' | 'warning'
}

const { as = 'card', hue, tilt, hold, title, href, meta, headingLevel, kind } = defineProps<Props>()

/** The sticky-note classes, for whichever of Card or Callout is drawn. */
const noteClasses = computed(() => [
  'rkui-sticky-note',
  hue && `rkui-sticky-note--${hue}`,
  hold && `rkui-sticky-note--${hold}`,
  { 'rkui-sticky-note--tilt': tilt },
])

/** Throws, so the build stops, when a card has no title. */
function cardTitle(): string {
  if (!title) throw new Error('StickyNote: a card needs a `title` (or use as="callout")')
  return title
}
</script>

<template>
  <Callout v-if="as === 'callout'" :class="noteClasses" :title="title" :kind="kind">
    <slot />
  </Callout>
  <Card
    v-else
    :class="noteClasses"
    :title="cardTitle()"
    :href="href"
    :meta="meta"
    :heading-level="headingLevel"
  >
    <template v-if="$slots.image" #image><slot name="image" /></template>
    <slot />
  </Card>
</template>
