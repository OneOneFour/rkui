<script setup>
import CodeBlock from '@oneonefour/rkui/components/code/CodeBlock.vue'
import { siPython } from 'simple-icons'
import LanguageLogo from '../../components/LanguageLogo.vue'

const code = `def lorenz(x, y, z, sigma=10.0, rho=28.0, beta=8 / 3):
    return sigma * (y - x), x * (rho - z) - y, x * y - beta * z`
</script>

<template>
  <CodeBlock lang="python" label="Python">
    <template #logo><LanguageLogo :icon="siPython" /></template>
    {{ code }}
  </CodeBlock>
</template>
