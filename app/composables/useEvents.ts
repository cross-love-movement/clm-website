import type { Event } from '#shared/types/content'

import { eventCategoryLabels } from '~/data/events'

/**
 * Published events with live capacity, from the operations database.
 * `useFetch` shares one key, so the page, the form, and the home strip all
 * read the same payload and refresh together.
 */
export async function useEvents() {
  const { data, refresh } = await useFetch<Event[]>('/api/events', {
    key: 'events',
    default: () => [],
  })

  const events = computed(() => data.value ?? [])

  const upcoming = computed(() =>
    events.value
      .filter((event) => isUpcoming(event.startsAt))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  )

  const featured = computed(() => upcoming.value.filter((event) => event.featured).slice(0, 2))

  function bySlug(slug: string) {
    return events.value.find((event) => event.slug === slug) ?? null
  }

  return { events, upcoming, featured, bySlug, refresh, categoryLabels: eventCategoryLabels }
}
