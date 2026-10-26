<script setup lang="ts">
import type { Project } from '#shared/types/content'
import { categoryLabels, statusLabels } from '~/data/projects'

const props = defineProps<{ project: Project }>()

const statusTone = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'bg-brand-100 text-brand-800'
    case 'completed':
      return 'bg-sand-200 text-ink-soft'
    default:
      return 'bg-gold-100 text-gold-800'
  }
})
</script>

<template>
  <NuxtLink
    :to="`/projects/${project.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
  >
    <div class="relative aspect-[16/10] overflow-hidden bg-sand-200">
      <img
        :src="project.image"
        :alt="project.imageAlt"
        loading="lazy"
        class="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
      />
      <span
        class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold tracking-wide text-brand-900 backdrop-blur"
      >
        {{ categoryLabels[project.category] }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-6">
      <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft">
        <span class="rounded-full px-2.5 py-0.5" :class="statusTone">
          {{ statusLabels[project.status] }}
        </span>
        <span aria-hidden="true">·</span>
        <span>{{ project.location }}</span>
      </div>

      <h3 class="mt-3 text-xl leading-snug text-ink">{{ project.title }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ project.summary }}</p>

      <span
        class="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-700 transition group-hover:gap-2.5"
      >
        Read the project
        <Icon name="arrow-right" :size="16" />
      </span>
    </div>
  </NuxtLink>
</template>
