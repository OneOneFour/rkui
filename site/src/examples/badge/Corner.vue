<script setup>
import Badge from '@oneonefour/rkui/components/badge/Badge.vue'
import BadgeHost from '@oneonefour/rkui/components/badge/BadgeHost.vue'
import Button from '@oneonefour/rkui/components/button/Button.vue'
import ImageIcon from '@oneonefour/rkui/icons/image.vue'
import EnvelopeIcon from '@oneonefour/rkui/icons/envelope-simple.vue'
</script>

<template>
  <BadgeHost round>
    <span class="picture" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge hue="coral" corner hiddenLabel="new">3</Badge>
  </BadgeHost>
  <Button hue="teal" class="rkui-badge-host">
    <EnvelopeIcon class="rkui-icon" />
    <span class="rkui-visually-hidden">Messages</span>
    <Badge hue="coral" corner hiddenLabel="new">12</Badge>
  </Button>
</template>

<style scoped>
/* A stand-in for a photo or avatar. */
.picture {
  --rkui-icon-fill: var(--rkui-teal);

  display: grid;
  place-items: center;
  inline-size: 4rem;
  block-size: 4rem;
  border-radius: 50%;
  background: var(--rkui-teal-tint);
}
</style>
