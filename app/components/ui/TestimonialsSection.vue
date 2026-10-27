<script setup lang="ts">
import type { Testimonial } from '#shared/types/content'

withDefaults(
  defineProps<{
    items: Testimonial[]
    eyebrow?: string
    title?: string
    description?: string
  }>(),
  {
    eyebrow: 'Voices',
    title: 'What people say when the cameras are gone.',
    description:
      'Volunteers, artistes, and church partners on what this work actually feels like from the inside.',
  },
)
</script>

<template>
  <section class="container-page py-20 sm:py-24">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <SectionHeading :eyebrow="eyebrow" :title="title" :description="description" />
      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </div>

    <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      <figure
        v-for="(item, index) in items"
        :key="`${item.name}-${index}`"
        class="flex flex-col rounded-3xl border border-sand-200 bg-white p-7 shadow-soft"
      >
        <div class="flex items-start justify-between gap-3">
          <span class="text-clay-600">
            <Icon name="quote" :size="24" />
          </span>
          <span
            v-if="item.programme"
            class="rounded-full bg-sand-100 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-ink-soft"
          >
            {{ item.programme }}
          </span>
        </div>

        <blockquote class="mt-4 flex-1 text-[0.98rem] leading-relaxed text-ink-soft">
          “{{ item.quote }}”
        </blockquote>

        <figcaption class="mt-6 flex items-center gap-3 border-t border-sand-200 pt-5">
          <span
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-clay-100 font-display text-sm font-semibold text-clay-800"
          >
            {{ initials(item.name) }}
          </span>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-ink">{{ item.name }}</p>
            <p class="text-xs leading-snug text-ink-soft">{{ item.role }}</p>
            <p class="text-xs leading-snug text-ink-soft/70">{{ item.location }}</p>
          </div>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
