import { getCollection, type CollectionEntry } from 'astro:content'

/** One docs page from src/content/docs/. */
export type DocsPage = CollectionEntry<'docs'>

/** A link to a path on this site, under its base: link('colors/') is '/rkui/colors/'. */
export function link(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${base}/${path}`
}

/** Every docs page, sorted by its `order`. */
export async function sortedPages(): Promise<DocsPage[]> {
  const pages = await getCollection('docs')
  return pages.sort((a, b) => a.data.order - b.data.order)
}

/** The page's address: index.mdx is the home page, colors.mdx is /rkui/colors/. */
export function pageUrl(page: DocsPage): string {
  return page.id === 'index' ? link() : link(`${page.id}/`)
}
