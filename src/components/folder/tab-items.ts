/**
 * How a `Tab` hands its label and content to the `Tabs` or `Folder` around it. A Tab renders its
 * slot inside an `<rkui-tab-item>` that carries its label and whether it is selected. The group
 * renders its slot, finds those items with `readTabs`, and builds the tab strip and panels itself,
 * so all the tab markup is written in one place. Everything is copied through exactly as rendered;
 * only the `<rkui-tab-item>` tags themselves are looked for.
 */

/** One tab, as read back from the group's rendered slot. */
interface TabItem {
  label: string
  selected: boolean
  /** The tab's rendered slot: its panel in Tabs. */
  content: string
}

/** The attribute a Tab writes its label and selected state into (URI-encoded JSON). */
export function tabData(label: string, selected: boolean): string {
  return encodeURIComponent(JSON.stringify({ label, selected }))
}

// A Tab's opening tag (with its data) or closing tag. URI-encoding keeps quotes out of the data.
// The opening tag may carry more attributes after it: in dev, Astro adds data-astro-source-*.
const TAB_TAG = /<rkui-tab-item data-tab="([^"]*)"[^>]*>|<\/rkui-tab-item>/g

/**
 * Reads the tabs out of a group's rendered slot, in order, and everything outside them. Stops the
 * build with a clear message when a Tab sits inside another Tab rather than directly in the group.
 */
export function readTabs(
  html: string | undefined,
  group: string,
): { tabs: TabItem[]; outside: string } {
  const slot = html ?? ''
  const tabs: TabItem[] = []
  let outside = ''
  let tab: { label: string; selected: boolean; start: number } | undefined
  let afterLastTab = 0

  for (const match of slot.matchAll(TAB_TAG)) {
    const isOpening = match[1] !== undefined
    if (isOpening && tab) {
      throw new Error(`${group}: a Tab goes directly inside ${group}, not inside another Tab.`)
    }
    if (isOpening) {
      outside += slot.slice(afterLastTab, match.index)
      tab = { ...JSON.parse(decodeURIComponent(match[1])), start: match.index + match[0].length }
    } else if (tab) {
      tabs.push({
        label: tab.label,
        selected: tab.selected,
        content: slot.slice(tab.start, match.index),
      })
      afterLastTab = match.index + match[0].length
      tab = undefined
    }
  }
  outside += slot.slice(afterLastTab)
  return { tabs, outside }
}

/**
 * What's left of `outside` once the scripts and styles Astro may put at the front of a slot (to
 * start framework components) and HTML comments are taken out. Empty when the slot held only tabs.
 */
export function strayContent(outside: string): string {
  return outside
    .replaceAll(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '')
    .trim()
}
