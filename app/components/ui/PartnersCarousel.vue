<script setup lang="ts">
import { partners } from '~/data/partners'

const paused = ref(false)
</script>

<template>
  <section aria-labelledby="partners-heading" class="border-y border-sand-200 bg-sand-50 py-10">
    <div class="container-page flex flex-wrap items-center justify-between gap-4">
      <h2
        id="partners-heading"
        class="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-soft/70"
      >
        Churches, ministries &amp; partners
      </h2>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/partnership"
          class="text-xs font-semibold text-clay-700 transition hover:text-clay-900"
        >
          Become a partner →
        </NuxtLink>
        <button
          type="button"
          class="rounded-full border border-sand-300 px-3 py-1 text-[0.68rem] font-semibold text-ink-soft transition hover:border-clay-300 hover:text-clay-800"
          :aria-pressed="paused"
          :aria-label="paused ? 'Play partner carousel' : 'Pause partner carousel'"
          @click="paused = !paused"
        >
          {{ paused ? 'Play' : 'Pause' }}
        </button>
      </div>
    </div>

    <div class="marquee relative mt-6 overflow-hidden" :class="{ 'is-paused': paused }">
      <div class="marquee-track">
        <ul
          v-for="copy in 3"
          :key="copy"
          class="marquee-group"
          :aria-hidden="copy > 1 || undefined"
        >
          <PartnerWordmark v-for="partner in partners" :key="partner.slug" :partner="partner" />
        </ul>
      </div>

      <div
        class="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-sand-50 to-transparent sm:w-20"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-sand-50 to-transparent sm:w-20"
        aria-hidden="true"
      />
    </div>
  </section>
</template>

<style scoped>
.marquee-track {
  display: flex;
  width: max-content;
  animation: partner-marquee 45s linear infinite;
}

.marquee:hover .marquee-track,
.marquee:focus-within .marquee-track,
.marquee.is-paused .marquee-track {
  animation-play-state: paused;
}

.marquee-group {
  display: flex;
  gap: 0.75rem;
  padding-right: 0.75rem;
}

@keyframes partner-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-100% / 3));
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}
</style>
