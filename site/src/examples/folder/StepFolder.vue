<script setup>
import { ref } from 'vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'
import Folder from '@oneonefour/rkui/components/folder/Folder.vue'
import Tab from '@oneonefour/rkui/components/folder/Tab.vue'

const steps = ['One', 'Two', 'Three']
const step = ref(0)
</script>

<template>
  <div class="widget">
    <Folder v-model="step" label="Steps">
      <Tab v-for="(name, i) in steps" :key="name" :label="name">
        <p>Step {{ i + 1 }} of {{ steps.length }}.</p>
      </Tab>
    </Folder>
    <p class="buttons">
      <Button small :disabled="step === 0" @click="step--">Back</Button>
      <Button small :disabled="step === steps.length - 1" @click="step++">Next</Button>
    </p>
  </div>
</template>

<style scoped>
.widget {
  display: grid;
  gap: var(--rkui-space-4);
}

.buttons {
  display: flex;
  gap: var(--rkui-space-3);
  margin: 0;
}
</style>
