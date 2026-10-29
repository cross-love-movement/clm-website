<script setup lang="ts">
const { upcoming } = await useEvents()

const next = computed(() => upcoming.value.slice(0, 2))
</script>

<template>
  <section v-if="next.length" class="bg-brand-950 py-16 text-sand-50 sm:py-20">
    <div class="container-page">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="eyebrow text-gold-300">Events</p>
          <h2 class="mt-2 text-3xl leading-tight sm:text-4xl">What’s coming up.</h2>
        </div>
        <BaseButton to="/events" variant="inverse" size="sm">
          All events
          <template #icon><Icon name="arrow-right" :size="15" /></template>
        </BaseButton>
      </div>

      <div class="mt-8 grid gap-3 md:grid-cols-2">
        <NuxtLink
          v-for="event in next"
          :key="event.slug"
          :to="{ path: '/events', query: { event: event.slug }, hash: '#register' }"
          class="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-gold-400/40 hover:bg-white/[0.07]"
        >
          <div
            class="flex w-16 shrink-0 flex-col items-center rounded-xl border border-white/10 bg-white/5 py-2"
          >
            <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-gold-300">
              {{ eventDateParts(event.startsAt).month }}
            </span>
            <span class="font-display text-2xl leading-none text-sand-50">
              {{ eventDateParts(event.startsAt).day }}
            </span>
          </div>

          <div class="min-w-0">
            <p class="text-xs font-semibold text-gold-300">
              {{ formatEventDate(event.startsAt) }} ·
              {{ formatEventTime(event.startsAt, event.endsAt) }}
            </p>
            <h3 class="mt-1 truncate text-base font-semibold text-sand-50">{{ event.title }}</h3>
            <p class="mt-0.5 truncate text-xs text-sand-200/70">
              {{ event.venue }}, {{ event.city }}
            </p>
          </div>

          <span class="ml-auto shrink-0 text-sand-200/50 transition group-hover:text-gold-300">
            <Icon name="arrow-up-right" :size="18" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
