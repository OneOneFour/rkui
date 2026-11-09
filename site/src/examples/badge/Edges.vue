<script setup>
import Badge from '@oneonefour/rkui/components/badge/Badge.vue'
import BadgeHost from '@oneonefour/rkui/components/badge/BadgeHost.vue'
import ImageIcon from '@oneonefour/rkui/icons/image.vue'
</script>

<template>
  <BadgeHost round>
    <span class="picture" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge color="coral" corner hiddenLabel="new">3</Badge>
  </BadgeHost>
  <BadgeHost round>
    <span class="picture" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge color="coral" corner edge="ring" hiddenLabel="new">3</Badge>
  </BadgeHost>
  <BadgeHost round>
    <span class="picture" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge color="coral" corner edge="sticker" hiddenLabel="new">3</Badge>
  </BadgeHost>
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
