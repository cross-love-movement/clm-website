<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description: string
    primaryLabel: string
    primaryTo: string
    secondaryLabel?: string
    secondaryTo?: string
    tone?: 'brand' | 'clay'
  }>(),
  { tone: 'brand' },
)
</script>

<template>
  <section class="container-page">
    <div
      class="relative overflow-hidden rounded-4xl px-6 py-14 text-sand-50 sm:px-12 sm:py-16 lg:px-16"
      :class="tone === 'brand' ? 'bg-brand-800' : 'bg-clay-700'"
    >
      <div
        class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-30 blur-2xl"
        :class="tone === 'brand' ? 'bg-clay-400' : 'bg-brand-300'"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full opacity-20 blur-2xl"
        :class="tone === 'brand' ? 'bg-brand-300' : 'bg-clay-300'"
        aria-hidden="true"
      />

      <div class="relative max-w-2xl">
        <p v-if="eyebrow" class="eyebrow text-gold-300">{{ eyebrow }}</p>
        <h2 class="mt-3 text-3xl leading-tight sm:text-4xl">{{ title }}</h2>
        <p class="mt-4 text-lg leading-relaxed text-sand-100/85">{{ description }}</p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <BaseButton :to="primaryTo" variant="inverse" size="lg">
            {{ primaryLabel }}
            <template #icon><Icon name="arrow-right" :size="18" /></template>
          </BaseButton>
          <BaseButton
            v-if="secondaryLabel && secondaryTo"
            :to="secondaryTo"
            variant="inverseGhost"
            size="lg"
          >
            {{ secondaryLabel }}
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>
