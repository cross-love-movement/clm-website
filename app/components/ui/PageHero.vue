<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    tone?: 'brand' | 'clay'
  }>(),
  { tone: 'brand' },
)
</script>

<template>
  <section class="relative overflow-hidden bg-brand-950 text-sand-50">
    <div
      class="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full opacity-60 blur-3xl"
      :class="tone === 'brand' ? 'bg-brand-700' : 'bg-clay-700/60'"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-brand-800 opacity-50 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.07]"
      style="
        background-image:
          linear-gradient(to right, currentColor 1px, transparent 1px),
          linear-gradient(to bottom, currentColor 1px, transparent 1px);
        background-size: 64px 64px;
      "
      aria-hidden="true"
    />

    <div class="container-page relative py-20 sm:py-24 lg:py-28">
      <div class="max-w-3xl">
        <p v-if="eyebrow" class="eyebrow text-gold-300">{{ eyebrow }}</p>
        <h1 class="mt-4 text-4xl leading-[1.06] text-balance sm:text-5xl lg:text-6xl">
          {{ title }}
        </h1>
        <p v-if="description" class="mt-6 max-w-2xl text-lg leading-relaxed text-sand-200/85">
          {{ description }}
        </p>
        <div v-if="$slots.default" class="mt-8 flex flex-wrap items-center gap-3">
          <slot />
        </div>
      </div>
    </div>
  </section>
</template>
