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

/** The word's length in letters, which sets its size (definition.css). */
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
