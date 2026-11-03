import { fileURLToPath } from 'node:url'
import * as pagefind from 'pagefind'

/**
 * Builds the Pagefind search index into dist/pagefind/ after `astro build`. Only the parts of a
 * page marked `data-pagefind-body` are indexed, so the top bar and sidebar stay out of results.
 * Code blocks and tab strips are left out too: code fences and each demo's Astro and HTML tabs
 * would fill results with code, and every demo's tabs say "Preview, Astro, HTML".
 * There is no index under `astro dev`; the search box says so.
 */
export default function pagefindIndex() {
  return {
    name: 'rkui-pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir)
        const { index, errors } = await pagefind.createIndex({
          excludeSelectors: ['.rkui-code', '[role="tablist"]'],
        })
        if (!index) throw new Error(`Pagefind: ${errors.join(', ')}`)

        const { page_count } = await index.addDirectory({ path: outDir })
        await index.writeFiles({ outputPath: `${outDir}pagefind` })
        await pagefind.close()
        logger.info(`Indexed ${page_count} pages for search`)
      },
    },
  }
}
