<!--
  One tab of a `WidgetTabs`, directly inside it, in a `.vue` file. Its slot is the tab's panel.
  WidgetTabs builds the tab and its panel from this tab's props and slot (widget-tab-slot.ts), so
  a WidgetTab takes no other attributes (`class`, `id` and the rest are dropped), and never renders
  by itself: rendered alone, as Astro renders one written in MDX or .astro, it stops the build.

  @example
  <WidgetTab label="Two" selected><p>Panel two.</p></WidgetTab>
-->
<script setup lang="ts">
interface Props {
  /** The tab's text. */
  label: string
  /** The tab that starts selected when the WidgetTabs has no `v-model`; the first when none is. */
  selected?: boolean
}

defineProps<Props>()

throw new Error(
  'WidgetTab: put it directly inside a WidgetTabs, in a .vue file. ' +
    'In an Astro or MDX page, use <Tabs> and <Tab>.',
)
</script>
