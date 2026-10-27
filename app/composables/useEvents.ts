import type { Event } from '#shared/types/content'

import { eventCategoryLabels } from '~/data/events'

export async function useEvents() {
  const { data } = await useAsyncData('events', () =>
    queryCollection('events').order('startsAt', 'ASC').all(),
  )

  const events = computed(() => (data.value ?? []) as unknown as Event[])

  const upcoming = computed(() =>
    events.value
      .filter((event) => isUpcoming(event.startsAt))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  )

  const featured = computed(() => upcoming.value.filter((event) => event.featured).slice(0, 2))

  function bySlug(slug: string) {
    return events.value.find((event) => event.slug === slug) ?? null
  }

  return { events, upcoming, featured, bySlug, categoryLabels: eventCategoryLabels }
}
