<!--
  A dictionary entry: one word set across its column in the slab serif, its pronunciation and its
  part of speech on two lines under it, and the slot as its meaning. `class`, `style` and other
  attributes go on the outer `<div>`. It needs no JavaScript.

  @example
  <Definition word="toon" ipa="/tuːn/" kind="noun"><p>A cartoon character.</p></Definition>
-->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** The word, set as large as the column allows. */
  word: string
  /** How it is said, in IPA, such as '/tuːn/'; none when left out. */
  ipa?: string
  /** Its part of speech, such as 'noun' or 'verb'; none when left out. */
  kind?: string
}

const { word, ipa, kind } = defineProps<Props>()

/** The word's length in letters, which sets its size (the styles below). */
const vars = computed(() => ({ '--rkui-definition-letters': [...word].length }))
</script>

<template>
  <div class="rkui-definition" :style="vars">
    <p class="rkui-definition-word">
      <dfn>{{ word }}</dfn>
    </p>
    <p v-if="ipa" class="rkui-definition-ipa">{{ ipa }}</p>
    <p v-if="kind" class="rkui-definition-kind">{{ kind }}</p>
    <div class="rkui-definition-meaning">
      <slot />
    </div>
  </div>
</template>

<style>
/* Definition: a dictionary entry on a panel, like a quote. The word is as large as fits the
   column: its letters (--rkui-definition-letters, from the component) each take about
   --rkui-definition-letter-width of an em, so the word's size is the column's width shared
   between them. */

.rkui-definition {
  /* Roboto Slab's lowercase letters at weight 800 are about this wide on average, in ems */
  --rkui-definition-letter-width: 0.58;

  container-type: inline-size;
  margin: var(--rkui-space-5) 0;
  padding: var(--rkui-space-4);
  border-radius: var(--rkui-radius);
  background: var(--rkui-panel);
  color: var(--rkui-fg);
}

.rkui-definition > *,
.rkui-definition-meaning > * {
  margin: 0;
}

.rkui-definition-word {
  font-family: var(--rkui-font-display);
  font-size: calc(100cqi / (var(--rkui-definition-letters) * var(--rkui-definition-letter-width)));
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.rkui-definition-word dfn {
  font-style: normal;
}

.rkui-definition-ipa,
.rkui-definition-kind {
  color: var(--rkui-muted);
  font-family: var(--rkui-font-body);
}

.rkui-definition-ipa {
  margin-block-start: var(--rkui-space-2);
}

.rkui-definition-kind {
  font-style: italic;
}

.rkui-definition-meaning {
  display: grid;
  gap: var(--rkui-space-3);
  margin-block-start: var(--rkui-space-4);
  font-family: var(--rkui-font-display);
}
</style>
