import { events, categoryLabels } from '#shared/data/events'

export function useEvents() {
  const upcoming = computed(() =>
    events
      .filter((event) => isUpcoming(event.startsAt))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  )

  const featured = computed(() => upcoming.value.filter((event) => event.featured).slice(0, 2))

  function bySlug(slug: string) {
    return events.find((event) => event.slug === slug) ?? null
  }

  return { events, upcoming, featured, categoryLabels, bySlug }
}
