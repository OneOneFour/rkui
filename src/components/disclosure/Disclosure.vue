<!--
  An rkui disclosure: a `<details>` under a dashed rule, its summary a line in the link colour with
  a caret that turns as it opens, its body in the small step. The slot is the body. It needs no
  JavaScript. `class`, `style` and other attributes go on the `<details>`: `open` starts it open,
  and disclosures sharing a `name` open one at a time. Inside a Callout it drops its rule.

  @example
  <Disclosure summary="Where this comes from"><p>Daily readings from three stations.</p></Disclosure>
-->
<script setup lang="ts">
interface Props {
  /** The summary line, which opens and closes it. */
  summary: string
}

const { summary } = defineProps<Props>()
</script>

<template>
  <details class="rkui-disclosure">
    <summary>{{ summary }}</summary>
    <slot />
  </details>
</template>
