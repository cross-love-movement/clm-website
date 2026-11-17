<script setup lang="ts">
import type { Event } from '#shared/types/content'
import { heroImages } from '~/data/heroes'

const route = useRoute()
const config = useRuntimeConfig()

const {
  data: event,
  error,
  refresh,
} = await useFetch<Event>(() => `/api/events/${route.params.slug}`)

if (error.value || !event.value) {
  throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true })
}

const current = computed(() => event.value ?? null)

useSeo({
  title: computed(() => current.value?.title ?? 'Event'),
  description: computed(() => current.value?.summary ?? ''),
  path: computed(() => `/events/${current.value?.slug ?? route.params.slug}`),
  image: computed(() => current.value?.image),
  imageAlt: computed(() => current.value?.imageAlt),
})

useHead(() => {
  const item = current.value
  if (!item) return {}

  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: item.title,
          description: item.summary,
          startDate: item.startsAt,
          endDate: item.endsAt,
          eventStatus: 'https://schema.org/EventScheduled',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          image: item.image ? [item.image] : undefined,
          url: `${config.public.siteUrl}/events/${item.slug}`,
          location: {
            '@type': 'Place',
            name: item.venue,
            address: {
              '@type': 'PostalAddress',
              streetAddress: item.address,
              addressLocality: item.city,
              addressCountry: 'GH',
            },
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'GHS',
            availability: item.availability.open
              ? 'https://schema.org/InStock'
              : 'https://schema.org/SoldOut',
            url: `${config.public.siteUrl}/events/${item.slug}#register`,
          },
        }).replace(/</g, '\\u003c'),
      },
    ],
  }
})

const paragraphs = computed(() =>
  (current.value?.description ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean),
)

const when = computed(() => {
  const item = current.value
  if (!item) return ''

  return `${formatEventDateLong(item.startsAt)} · ${formatEventTime(item.startsAt, item.endsAt)}`
})

const seatsLabel = computed(() => {
  const item = current.value
  if (!item) return ''

  return item.availability.remaining === 0
    ? 'Fully booked — registration adds you to the waitlist'
    : `${item.availability.remaining} of ${item.availability.capacity} places left`
})

const hasPassed = computed(() => {
  const item = current.value
  return item ? new Date(item.endsAt).getTime() < Date.now() : false
})
</script>

<template>
  <div v-if="current">
    <PageHero
      :eyebrow="`${formatEventDate(current.startsAt)} · ${current.city}`"
      :title="current.title"
      :description="current.summary"
      :image="current.image || heroImages.events"
    >
      <BaseButton v-if="!hasPassed" href="#register" variant="inverse">
        Save your place
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton v-else to="/events" variant="inverse">See upcoming events</BaseButton>
      <BaseButton to="/events" variant="inverseGhost">All events</BaseButton>
    </PageHero>

    <section class="container-page py-16 sm:py-20">
      <div class="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div class="space-y-8">
          <div v-if="paragraphs.length">
            <p class="eyebrow text-clay-700">The details</p>
            <h2 class="mt-3 text-3xl leading-tight">About this event</h2>
            <div class="mt-5 space-y-4 text-[1rem] leading-relaxed text-ink-soft">
              <p v-for="(paragraph, index) in paragraphs" :key="index" class="whitespace-pre-line">
                {{ paragraph }}
              </p>
            </div>
          </div>

          <dl
            class="grid gap-5 rounded-3xl border border-sand-200 bg-white p-6 shadow-soft sm:grid-cols-2"
          >
            <div>
              <dt class="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft/80">When</dt>
              <dd class="mt-1 text-sm font-semibold text-ink">{{ when }}</dd>
            </div>
            <div>
              <dt class="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft/80">Where</dt>
              <dd class="mt-1 text-sm text-ink">
                {{ current.venue }}
                <span v-if="current.address" class="block text-ink-soft">
                  {{ current.address }}, {{ current.city }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft/80">Places</dt>
              <dd class="mt-1 text-sm font-semibold text-ink">{{ seatsLabel }}</dd>
            </div>
            <div v-if="current.registrationDeadline">
              <dt class="text-xs font-bold uppercase tracking-[0.1em] text-ink-soft/80">
                Registration closes
              </dt>
              <dd class="mt-1 text-sm font-semibold text-ink">
                {{ formatEventDate(current.registrationDeadline) }}
              </dd>
            </div>
          </dl>

          <div class="rounded-3xl border border-sand-200 bg-sand-100 p-6">
            <p class="text-sm font-semibold text-ink">Want to help run the day?</p>
            <p class="mt-2 text-sm leading-relaxed text-ink-soft">
              We need volunteers for events across the year — media, logistics, registration, and
              more.
            </p>
            <BaseButton to="/volunteer" variant="secondary" size="sm" class="mt-4">
              Volunteer with us
            </BaseButton>
          </div>
        </div>

        <div
          id="register"
          class="scroll-mt-24 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8"
        >
          <p class="eyebrow text-clay-700">Register</p>
          <h2 class="mt-2 text-2xl leading-tight">Save your place</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">
            Free to attend. We email your reference as soon as the booking is confirmed.
          </p>

          <div
            v-if="hasPassed"
            class="mt-5 rounded-2xl border border-sand-300 bg-sand-100 p-4 text-sm leading-relaxed text-ink-soft"
          >
            This event has ended. Browse the
            <NuxtLink to="/events" class="font-semibold text-clay-700 hover:text-clay-900">
              upcoming events</NuxtLink
            >
            instead.
          </div>

          <EventRegistrationForm
            v-else
            :event="current"
            lock-event
            class="mt-6"
            @registered="refresh"
          />
        </div>
      </div>
    </section>
  </div>
</template>
