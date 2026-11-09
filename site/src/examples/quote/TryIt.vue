<script setup>
import { computed, ref } from 'vue'
import Input from '@oneonefour/rkui/components/input/Input.vue'
import Quote from '@oneonefour/rkui/components/quote/Quote.vue'
import Switch from '@oneonefour/rkui/components/switch/Switch.vue'
import Textarea from '@oneonefour/rkui/components/input/Textarea.vue'

const text = ref(
  'The Analytical Engine weaves algebraical patterns just as the Jacquard-loom weaves flowers and leaves.',
)
const by = ref('Ada Lovelace, 1843')
const italic = ref(false)

/** One paragraph for each block of text between blank lines. */
const paragraphs = computed(() =>
  text.value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
)
</script>

<template>
  <Textarea v-model="text" label="Quote" hint="A blank line starts a new paragraph" rows="4" />
  <Input v-model="by" label="Attribution" />
  <Switch v-model="italic">Italic</Switch>
  <Quote :by="by" :slant="italic ? 'italic' : 'upright'">
    <p v-for="(paragraph, i) in paragraphs" :key="i">{{ paragraph }}</p>
  </Quote>
</template>
