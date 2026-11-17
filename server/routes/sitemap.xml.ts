import { queryCollection } from '@nuxt/content/server'

import { hasDatabase } from '../database/client'
import { siteUrl } from '../emails/catalog'
import { listPublishedEvents } from '../features/events/repository'

/** Public pages that are not backed by a content collection. */
const STATIC_PATHS = [
  '/',
  '/about',
  '/projects',
  '/events',
  '/news',
  '/volunteer',
  '/partnership',
  '/contact',
  '/donate',
]

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface Entry {
  loc: string
  lastmod?: string
}

/**
 * GET /sitemap.xml
 *
 * Generated from the static routes plus the Nuxt Content database, so a new
 * project or article is included without editing this file.
 */
export default defineEventHandler(async (event) => {
  const base = siteUrl()

  const [projects, news] = await Promise.all([
    queryCollection(event, 'projects').select('path').all(),
    queryCollection(event, 'news').select('path', 'publishedAt').all(),
  ])

  let eventEntries: Entry[] = []

  if (hasDatabase()) {
    try {
      const events = await listPublishedEvents()
      eventEntries = events.map((item) => ({ loc: `${base}/events/${item.slug}` }))
    } catch (error) {
      console.warn('[sitemap] events unavailable:', error)
    }
  }

  const entries: Entry[] = [
    ...STATIC_PATHS.map((path) => ({ loc: `${base}${path}` })),
    ...projects.map((project) => ({ loc: `${base}${project.path}` })),
    ...news.map((article) => ({
      loc: `${base}${article.path}`,
      lastmod: article.publishedAt,
    })),
    ...eventEntries,
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((entry) =>
      [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    ),
    '</urlset>',
  ].join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600, s-maxage=86400')

  return body
})
