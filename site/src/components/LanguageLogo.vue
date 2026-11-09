<!--
  A language's logo from Simple Icons, as an inline SVG for CodeBlock's "logo" slot. It has no
  fill of its own, so CodeBlock draws it in the caption's flat grey. Only brands whose logo may be
  shown in one colour go here; THIRD_PARTY_NOTICES.md lists the ones the docs use.

  @example
  <LanguageLogo slot="logo" icon={siPython} />
-->
<script setup lang="ts">
import type { SimpleIcon } from 'simple-icons'

interface Props {
  /** The icon, imported from `simple-icons` (e.g. `siPython`). */
  icon: SimpleIcon
}

const { icon } = defineProps<Props>()
</script>

<template>
  <svg class="rkui-icon rkui-icon--small" viewBox="0 0 24 24" aria-hidden="true">
    <path :d="icon.path" />
  </svg>
</template>
