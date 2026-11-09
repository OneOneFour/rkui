<script setup>
import Badge from '@oneonefour/rkui/components/badge/Badge.vue'
import BadgeHost from '@oneonefour/rkui/components/badge/BadgeHost.vue'
import ImageIcon from '@oneonefour/rkui/icons/image.vue'
</script>

<template>
  <BadgeHost round>
    <span class="picture picture--round" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge color="green" corner dot bottom hiddenLabel="Online" />
  </BadgeHost>
  <BadgeHost>
    <span class="picture" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge color="coral" corner dot hiddenLabel="New" />
  </BadgeHost>
  <BadgeHost>
    <span class="picture" role="img" aria-label="Picture">
      <ImageIcon class="rkui-icon" />
    </span>
    <Badge color="coral" corner>99+</Badge>
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
  border-radius: var(--rkui-radius);
  background: var(--rkui-teal-tint);
}

.picture--round {
  border-radius: 50%;
}
</style>
