<script setup lang="ts">
import type { AdminEvent } from '#shared/types/content'
import { hasPermission, type SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)
const canEdit = computed(() => hasPermission(current.value, 'canEdit'))

const {
  data: events,
  pending,
  error,
  refresh,
} = await useFetch<AdminEvent[]>('/api/admin/events', {
  key: 'admin-events',
  default: () => [],
})

type Filter = 'all' | AdminEvent['status']

const filter = ref<Filter>('all')

const counts = computed(() => ({
  all: events.value.length,
  published: events.value.filter((event) => event.status === 'published').length,
  draft: events.value.filter((event) => event.status === 'draft').length,
  archived: events.value.filter((event) => event.status === 'archived').length,
}))

const filters = computed(() => [
  { value: 'all' as const, label: 'All', count: counts.value.all },
  { value: 'published' as const, label: 'Published', count: counts.value.published },
  { value: 'draft' as const, label: 'Drafts', count: counts.value.draft },
  { value: 'archived' as const, label: 'Archived', count: counts.value.archived },
])

/** Soonest upcoming first, then most recent past — the order staff work in. */
const sorted = computed(() =>
  [...events.value].sort((a, b) => {
    const aPast = !isUpcoming(a.startsAt)
    const bPast = !isUpcoming(b.startsAt)

    if (aPast !== bPast) return aPast ? 1 : -1

    return aPast ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt)
  }),
)

const visible = computed(() =>
  filter.value === 'all'
    ? sorted.value
    : sorted.value.filter((event) => event.status === filter.value),
)

useSeo({
  title: 'Events',
  description: 'Manage Cross-Love Movement events.',
  path: '/admin/events',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <p class="eyebrow">Staff portal</p>

    <div class="mt-3 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 class="text-3xl leading-tight sm:text-4xl">Events</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Create, publish, and archive the calendar. Registration counts and the waitlist update
          from live bookings.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Staff portal</BaseButton>
        <BaseButton v-if="canEdit" to="/admin/events/new" size="sm">
          New event
          <template #icon><Icon name="arrow-right" :size="16" /></template>
        </BaseButton>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap items-center gap-2">
      <button
        v-for="option in filters"
        :key="option.value"
        type="button"
        class="rounded-full border px-4 py-1.5 text-sm font-semibold transition"
        :class="
          filter === option.value
            ? 'border-brand-900 bg-brand-900 text-sand-50'
            : 'border-sand-300 bg-white text-ink-soft hover:border-brand-400 hover:text-ink'
        "
        :aria-pressed="filter === option.value"
        @click="filter = option.value"
      >
        {{ option.label }}
        <span class="ml-1.5 text-xs font-bold opacity-70">{{ option.count }}</span>
      </button>

      <button
        type="button"
        class="ml-auto text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
        :disabled="pending"
        @click="refresh()"
      >
        {{ pending ? 'Refreshing…' : 'Refresh' }}
      </button>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load events" class="mt-8">
      <p class="mt-1">
        {{ error.statusMessage || 'Check the database connection and try again.' }}
      </p>
    </AlertBox>

    <div
      v-else-if="!pending && !visible.length"
      class="mt-8 rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-10 text-center"
    >
      <Icon name="calendar" :size="28" class="mx-auto text-clay-600" />
      <h2 class="mt-3 text-lg text-ink">
        {{ filter === 'all' ? 'No events yet.' : `No ${filter} events.` }}
      </h2>
      <p class="mt-2 text-sm leading-relaxed text-ink-soft">
        {{
          canEdit
            ? 'Create the first event and it will appear here, ready to publish.'
            : 'Nothing here in this view yet.'
        }}
      </p>
      <BaseButton v-if="canEdit && filter === 'all'" to="/admin/events/new" size="sm" class="mt-5">
        Create an event
      </BaseButton>
    </div>

    <div
      v-else
      class="mt-8 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[56rem] text-left text-sm">
          <thead class="border-b border-sand-200 bg-sand-100">
            <tr class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              <th scope="col" class="px-5 py-3.5">Event</th>
              <th scope="col" class="px-5 py-3.5">When</th>
              <th scope="col" class="px-5 py-3.5">Status</th>
              <th scope="col" class="px-5 py-3.5">Places</th>
              <th scope="col" class="px-5 py-3.5">Waitlist</th>
              <th scope="col" class="px-5 py-3.5"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-sand-200">
            <tr v-for="event in visible" :key="event.id" class="align-top hover:bg-sand-50">
              <td class="px-5 py-4">
                <NuxtLink
                  :to="`/admin/events/${event.id}`"
                  class="font-semibold text-ink hover:text-clay-700"
                >
                  {{ event.title }}
                </NuxtLink>
                <p class="mt-1 text-xs text-ink-soft">{{ event.venue }}, {{ event.city }}</p>
                <p
                  v-if="event.featured"
                  class="mt-1 text-[0.68rem] font-bold uppercase tracking-wide text-gold-700"
                >
                  Featured on homepage
                </p>
              </td>

              <td class="whitespace-nowrap px-5 py-4 text-ink-soft">
                <p class="font-medium text-ink">{{ formatEventDate(event.startsAt) }}</p>
                <p class="mt-0.5 text-xs">{{ formatEventTime(event.startsAt, event.endsAt) }}</p>
                <p v-if="!isUpcoming(event.startsAt)" class="mt-1 text-xs text-ink-soft/70">
                  Past event
                </p>
              </td>

              <td class="px-5 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                  :class="publishTone(event.status)"
                >
                  {{ event.status }}
                </span>
              </td>

              <td class="px-5 py-4">
                <p class="font-semibold text-ink">
                  {{ event.registered }}<span class="text-ink-soft"> / {{ event.capacity }}</span>
                </p>
                <div class="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-sand-200">
                  <div
                    class="h-full rounded-full bg-clay-500"
                    :style="{ width: `${occupancyPercent(event.registered, event.capacity)}%` }"
                  />
                </div>
                <p
                  class="mt-1 text-xs"
                  :class="event.remaining === 0 ? 'font-semibold text-red-700' : 'text-ink-soft'"
                >
                  {{ event.remaining === 0 ? 'Full' : `${event.remaining} left` }}
                </p>
              </td>

              <td class="px-5 py-4">
                <p class="font-semibold text-ink">{{ event.waitlisted }}</p>
                <p class="mt-0.5 text-xs text-ink-soft">
                  {{ event.waitlisted === 1 ? 'guest' : 'guests' }}
                </p>
              </td>

              <td class="whitespace-nowrap px-5 py-4 text-right">
                <div class="flex justify-end gap-3">
                  <NuxtLink
                    :to="`/admin/events/${event.id}`"
                    class="text-sm font-semibold text-clay-700 hover:text-clay-900"
                  >
                    Manage
                  </NuxtLink>
                  <NuxtLink
                    v-if="canEdit"
                    :to="`/admin/events/${event.id}/edit`"
                    class="text-sm font-semibold text-ink-soft hover:text-ink"
                  >
                    Edit
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="mt-5 text-xs leading-relaxed text-ink-soft/80">
      Archived events stay out of the public calendar but keep their registrations. Deleting an
      event with bookings is blocked on purpose.
    </p>
  </section>
</template>
