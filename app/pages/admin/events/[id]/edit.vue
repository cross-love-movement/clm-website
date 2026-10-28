<script setup lang="ts">
import type { AdminEventDetail } from '#shared/types/content'
import { hasPermission, type SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const { user } = useUserSession()
const canEdit = computed(() => hasPermission(user.value as SessionUser | null, 'canEdit'))

const { data: event, error } = await useFetch<AdminEventDetail>(`/api/admin/events/${id}`, {
  key: `admin-event-edit-${id}`,
})

useSeo({
  title: event.value ? `Edit ${event.value.title}` : 'Edit event',
  description: 'Edit a Cross-Love Movement event.',
  path: `/admin/events/${id}/edit`,
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <div class="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <NuxtLink to="/admin/events" class="hover:text-ink">Events</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink v-if="event" :to="`/admin/events/${event.id}`" class="hover:text-ink">
        {{ event.title }}
      </NuxtLink>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load this event" class="mt-6">
      <p class="mt-1">{{ error.statusMessage || 'The event may have been removed.' }}</p>
      <NuxtLink
        to="/admin/events"
        class="mt-3 inline-block text-sm font-semibold underline underline-offset-2"
      >
        Back to all events
      </NuxtLink>
    </AlertBox>

    <template v-else-if="event">
      <div class="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="eyebrow">Edit event</p>
          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">{{ event.title }}</h1>
          <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
            Changes apply to the public calendar as soon as you save. Bookings are untouched.
          </p>
        </div>

        <NuxtLink
          :to="`/admin/events/${event.id}`"
          class="text-sm font-semibold text-clay-700 hover:text-clay-900"
        >
          Back to event
        </NuxtLink>
      </div>

      <div v-if="!canEdit" class="mt-8">
        <AlertBox tone="info" title="Read-only access">
          Your role can view events but not change them. Ask an admin if you need editing access.
        </AlertBox>
      </div>

      <div v-else class="mt-8 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
        <EventForm mode="edit" :event="event" />
      </div>
    </template>
  </section>
</template>
