<script setup lang="ts">
import type { Post, PostCategory } from '#shared/types/content'

import { postCategoryLabels } from '~/data/posts'

defineProps<{ post: Post }>()

function categoryTone(category: PostCategory) {
  switch (category) {
    case 'update':
      return 'bg-clay-100 text-clay-800'
    case 'reflection':
      return 'bg-gold-100 text-gold-800'
    case 'event':
      return 'bg-brand-900 text-sand-50'
    default:
      return 'bg-brand-100 text-brand-700'
  }
}
</script>

<template>
  <NuxtLink
    :to="`/news/${post.slug}`"
    class="group flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-clay-200 hover:shadow-lift"
  >
    <div class="relative aspect-[16/10] overflow-hidden bg-sand-200">
      <img
        :src="post.image"
        :alt="post.imageAlt"
        loading="lazy"
        class="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
      />
      <span
        class="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur"
        :class="categoryTone(post.category)"
      >
        {{ postCategoryLabels[post.category] }}
      </span>
    </div>

    <div class="flex flex-1 flex-col p-6">
      <p class="text-xs font-semibold text-ink-soft">
        {{ formatDateShort(post.publishedAt) }} · {{ post.readingMinutes }} min read
      </p>

      <h3 class="mt-2 text-xl leading-snug text-ink">{{ post.title }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ post.excerpt }}</p>

      <span
        class="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-clay-700 transition group-hover:gap-2.5"
      >
        Read the story
        <Icon name="arrow-right" :size="16" />
      </span>
    </div>
  </NuxtLink>
</template>
