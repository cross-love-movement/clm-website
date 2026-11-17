import { hasDatabase } from '../../database/client'
import { getPublishedEvent } from '../../features/events/repository'

/** Public event detail: one published event with live availability. */
export default defineEventHandler(async (event) => {
  if (!hasDatabase()) {
    throw createError({ statusCode: 503, statusMessage: 'Events are unavailable' })
  }

  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing event slug' })
  }

  const found = await getPublishedEvent(slug)

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return found
})
