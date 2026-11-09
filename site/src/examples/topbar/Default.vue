<script setup>
import BackToTop from '@oneonefour/rkui/components/topbar/BackToTop.vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'
import TopBar from '@oneonefour/rkui/components/topbar/TopBar.vue'
</script>

<template>
  <div class="page">
    <TopBar>
      <Button>Button</Button>
      <BackToTop />
    </TopBar>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
  </div>
  <div class="page">
    <TopBar flush>
      <Button>Button</Button>
      <BackToTop />
    </TopBar>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
  </div>
</template>

<style scoped>
.page {
  overflow: clip;
  border: 1px solid var(--rkui-muted);
  border-radius: var(--rkui-radius);
}

.page .rkui-topbar {
  position: static;
}

.page .rkui-topbar,
.page .rkui-back-to-top {
  animation: none;
}

p {
  margin: var(--rkui-space-4);
}
</style>
