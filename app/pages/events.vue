<script setup lang="ts">
import type { Event, EventCategory } from '#shared/types/content'
import { eventFaqs } from '~/data/faqs'

import { useEventAvailability } from '~/features/events/composables/useEventAvailability'

const { upcoming, categoryLabels } = await useEvents()
const { availability, forSlug, refresh } = await useEventAvailability()
const route = useRoute()

const selectedSlug = ref('')

const queryEvent = route.query.event
if (typeof queryEvent === 'string' && upcoming.value.some((event) => event.slug === queryEvent)) {
  selectedSlug.value = queryEvent
}

watch(
  () => route.query.event,
  (value) => {
    if (typeof value === 'string') selectedSlug.value = value
  },
)

function registerFor(slug: string) {
  selectedSlug.value = slug
  nextTick(() => {
    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function isOpen(event: Event) {
  return forSlug(event.slug)?.open ?? offlinePlacesLeft(event) > 0
}

function seatsLabel(event: Event) {
  const live = forSlug(event.slug)

  if (!live) return `${offlinePlacesLeft(event)} of ${event.capacity} places left`

  return live.remaining === 0 ? 'Fully booked' : `${live.remaining} of ${live.capacity} places left`
}

function categoryTone(category: EventCategory) {
  switch (category) {
    case 'session':
      return 'bg-clay-100 text-clay-800'
    case 'training':
      return 'bg-gold-100 text-gold-800'
    case 'workshop':
      return 'bg-brand-100 text-brand-700'
    case 'devotion':
      return 'bg-sand-200 text-ink-soft'
    case 'outreach':
      return 'bg-clay-50 text-clay-700 ring-1 ring-clay-200'
    default:
      return 'bg-brand-900 text-sand-50'
  }
}

useSeo({
  title: 'Events',
  description:
    'Upcoming Cross-Love Movement events — Cross Sessions, the People Like You symposium, and programme days. Register free online and see live places remaining.',
  path: '/events',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="Events"
      title="Come and stand in the room."
      description="Cross Sessions, the People Like You symposium, and programme days. Everything here is free to attend — registration just helps us plan well."
    >
      <BaseButton href="#upcoming" variant="inverse">
        See what’s on
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton href="#register" variant="inverseGhost">Register</BaseButton>
    </PageHero>

    <!-- Upcoming events -->
    <section id="upcoming" class="container-page scroll-mt-24 py-16 sm:py-20">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Upcoming"
          title="What’s next."
          description="We keep the calendar small on purpose — every event is one we can run well."
        />
        <p class="text-sm font-semibold text-ink-soft">
          {{ upcoming.length }} {{ upcoming.length === 1 ? 'event' : 'events' }} scheduled
        </p>
      </div>

      <div v-if="upcoming.length" class="mt-10 border-y border-sand-200">
        <article
          v-for="event in upcoming"
          :key="event.slug"
          class="grid gap-5 border-b border-sand-200 py-7 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-8"
        >
          <div
            class="flex w-20 flex-col items-center rounded-2xl border border-sand-200 bg-white py-3 shadow-soft"
          >
            <span class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-clay-700">
              {{ eventDateParts(event.startsAt).month }}
            </span>
            <span class="font-display text-3xl leading-none text-ink">
              {{ eventDateParts(event.startsAt).day }}
            </span>
            <span
              class="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-ink-soft/70"
            >
              {{ eventDateParts(event.startsAt).weekday }}
            </span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                :class="categoryTone(event.category)"
              >
                {{ categoryLabels[event.category] }}
              </span>
              <span
                v-if="event.featured"
                class="rounded-full border border-gold-300 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-gold-700"
              >
                Featured
              </span>
              <span
                v-if="!isOpen(event)"
                class="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-clay-700"
              >
                Registration closed
              </span>
            </div>

            <h3 class="mt-2 text-xl text-ink sm:text-2xl">{{ event.title }}</h3>
            <p class="mt-1.5 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
              {{ event.summary }}
            </p>

            <dl class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
              <div class="flex items-center gap-1.5">
                <Icon name="clock" :size="14" class="text-clay-600" />
                <dt class="sr-only">Time</dt>
                <dd>{{ formatEventTime(event.startsAt, event.endsAt) }}</dd>
              </div>
              <div class="flex items-center gap-1.5">
                <Icon name="pin" :size="14" class="text-clay-600" />
                <dt class="sr-only">Venue</dt>
                <dd>{{ event.venue }}, {{ event.city }}</dd>
              </div>
              <div class="flex items-center gap-1.5">
                <Icon name="users" :size="14" class="text-clay-600" />
                <dt class="sr-only">Availability</dt>
                <dd>{{ seatsLabel(event) }}</dd>
              </div>
            </dl>
          </div>

          <div class="sm:text-right">
            <BaseButton size="sm" :disabled="!isOpen(event)" @click="registerFor(event.slug)">
              {{ isOpen(event) ? 'Register' : 'Closed' }}
            </BaseButton>
            <p v-if="event.registrationDeadline" class="mt-2 text-[0.68rem] text-ink-soft/70">
              Closes {{ formatEventDate(event.registrationDeadline) }}
            </p>
          </div>
        </article>
      </div>

      <p
        v-else
        class="mt-10 rounded-2xl border border-sand-200 bg-white p-8 text-center text-ink-soft"
      >
        No events are scheduled right now. Join the newsletter in the footer, or
        <NuxtLink to="/contact" class="font-semibold text-clay-700 underline">
          ask us what is coming up</NuxtLink
        >.
      </p>
    </section>

    <!-- Registration -->
    <section id="register" class="scroll-mt-24 border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Register"
            title="Save your place."
            description="Registration is free. It is also how we know how many chairs, meals, and printed materials to prepare."
          />

          <ul class="mt-8 space-y-3">
            <li
              v-for="point in [
                'You will receive an email confirmation and a reminder before the day.',
                'If your plans change, tell us — someone else can take the place.',
                'Access needs, children, or group bookings? Note them in the form.',
              ]"
              :key="point"
              class="flex gap-3 text-[0.95rem] leading-relaxed text-ink-soft"
            >
              <span class="mt-0.5 text-clay-600">
                <Icon name="check" :size="17" :stroke-width="2.4" />
              </span>
              {{ point }}
            </li>
          </ul>

          <div class="mt-8 rounded-2xl bg-white p-5 ring-1 ring-sand-200">
            <p class="text-sm font-semibold text-ink">Running a group?</p>
            <p class="mt-1 text-sm leading-relaxed text-ink-soft">
              Choose how many people are coming and we will hold that many places. For a large
              group, email us and we will handle it directly.
            </p>
            <NuxtLink
              to="/contact"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 hover:text-clay-900"
            >
              Contact the events team
              <Icon name="arrow-right" :size="15" />
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
          <EventRegistrationForm
            :initial-event="selectedSlug"
            :availability="availability"
            @registered="refresh()"
          />
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container-page py-20 sm:py-24">
      <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="Before you come."
          description="A few practical things people usually ask."
        >
          <template #actions>
            <BaseButton to="/volunteer" variant="secondary" size="sm"
              >Volunteer at events</BaseButton
            >
          </template>
        </SectionHeading>
        <FaqList :items="eventFaqs" />
      </div>
    </section>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Beyond the calendar"
        title="The work continues after the last song."
        description="Give towards an event, host a Cross Session at your church, or volunteer on the day."
        primary-label="Donate"
        primary-to="/donate"
        secondary-label="Partner with us"
        secondary-to="/partnership"
        tone="clay"
      />
    </div>
  </div>
</template>
