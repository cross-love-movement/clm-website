<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    tone?: 'brand' | 'clay'
    /**
     * Optional background photograph. Pass an absolute URL (for example an R2
     * custom-domain URL). Omit it and the decorative charcoal treatment below
     * is used instead.
     */
    image?: string
  }>(),
  { tone: 'brand' },
)
</script>

<template>
  <section class="relative isolate overflow-hidden bg-brand-950 text-sand-50">
    <template v-if="image">
      <img
        :src="image"
        alt=""
        aria-hidden="true"
        class="absolute inset-0 -z-10 size-full object-cover"
        loading="eager"
        decoding="async"
        fetchpriority="high"
      />
      <!-- Two overlays: a base scrim for contrast anywhere, then a left-heavy
           gradient so the copy stays readable over a bright photograph. -->
      <div class="absolute inset-0 -z-10 bg-brand-950/65" aria-hidden="true" />
      <div
        class="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/95 via-brand-950/70 to-brand-950/20"
        aria-hidden="true"
      />
    </template>

    <template v-else>
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
    </template>

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
