<script setup>
import Chip from '@oneonefour/rkui/components/chip/Chip.vue'
import ChipGroup from '@oneonefour/rkui/components/chip/ChipGroup.vue'
import HeaderBand from '@oneonefour/rkui/components/header-band/HeaderBand.vue'
import Sidebar from '@oneonefour/rkui/components/sidebar/Sidebar.vue'
import SidebarGroup from '@oneonefour/rkui/components/sidebar/SidebarGroup.vue'
import SidebarLink from '@oneonefour/rkui/components/sidebar/SidebarLink.vue'
import Camera from '@oneonefour/rkui/icons/camera.vue'
import Flask from '@oneonefour/rkui/icons/flask.vue'
import House from '@oneonefour/rkui/icons/house.vue'
import IdCard from '@oneonefour/rkui/icons/identification-card.vue'
import PenNib from '@oneonefour/rkui/icons/pen-nib.vue'
import Rocket from '@oneonefour/rkui/icons/rocket.vue'
</script>

<template>
  <div
    class="site"
    style="--rkui-section: var(--rkui-coral-solid); --rkui-on-section: var(--rkui-on-coral)"
  >
    <div class="shell">
      <Sidebar label="Example site" variant="sections">
        <template #header>
          <strong class="site-name">Site name</strong>
          <span>A short tagline</span>
        </template>
        <SidebarGroup>
          <SidebarLink href="#" color="sky"><House class="rkui-icon" /> Home</SidebarLink>
          <SidebarLink href="#" color="coral" current>
            <PenNib class="rkui-icon" /> Notes
          </SidebarLink>
          <SidebarLink href="#" color="navy"><Flask class="rkui-icon" /> Papers</SidebarLink>
          <SidebarLink href="#" color="teal"><Rocket class="rkui-icon" /> Projects</SidebarLink>
          <SidebarLink href="#" color="yellow"><Camera class="rkui-icon" /> Photos</SidebarLink>
          <SidebarLink href="#" color="green"><IdCard class="rkui-icon" /> About</SidebarLink>
        </SidebarGroup>
      </Sidebar>
      <div class="page">
        <HeaderBand kicker="Notes · 5 min read">
          <h2>A page title, in its section's colour</h2>
        </HeaderBand>
        <div class="page-body">
          <p>
            The page sets its section hue once. The header band, the current link and the chosen
            chip all take it, so the colour says which part of the site this is.
          </p>
          <ChipGroup legend="Topic">
            <Chip value="all" checked>All</Chip>
            <Chip value="one">One</Chip>
            <Chip value="two">Two</Chip>
          </ChipGroup>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The site's own frame: the nav column beside the page, stacked above it when narrow. The
   frame's colour shows through the gap between them as the rule. */
.site {
  container-type: inline-size;
}

.shell {
  display: grid;
  gap: var(--rkui-outline-width);
  overflow: clip;
  border: var(--rkui-outline-width) solid var(--rkui-line-unfilled);
  border-radius: var(--rkui-radius);
  background: var(--rkui-line-unfilled);
}

@container (width >= 40rem) {
  .shell {
    grid-template-columns: 15rem minmax(0, 1fr);
  }
}

.site-name {
  font-family: var(--rkui-font-display);
  font-size: var(--rkui-step-1);
  font-weight: 800;
}

.page {
  min-inline-size: 0;
  background: var(--rkui-surface);
}

.page-body {
  display: grid;
  gap: var(--rkui-space-4);
  padding: var(--rkui-space-5) clamp(var(--rkui-space-4), 5vw, var(--rkui-space-6));
}

.page-body p {
  margin: 0;
  max-inline-size: 60ch;
}
</style>
