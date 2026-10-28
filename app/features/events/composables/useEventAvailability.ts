import type { EventAvailability } from '#shared/types/content'

/**
 * Live event capacity for the whole collection, fetched once per page render
 * and refreshable after a registration.
 */
export async function useEventAvailability() {
  const { data, refresh } = await useFetch<EventAvailability[]>('/api/events/availability', {
    key: 'event-availability',
  })

  const availability = computed(() => data.value ?? [])
  const bySlug = computed(
    () => new Map(availability.value.map((item) => [item.slug, item] as const)),
  )

  function forSlug(slug: string) {
    return bySlug.value.get(slug) ?? null
  }

  return { availability, forSlug, refresh }
}
