<script setup lang="ts">
import type { PostCategory } from '#shared/types/content'

import { postCategoryLabels } from '~/data/posts'

const { featured, latest, byCategory, categories } = useNews()

const active = ref<'all' | PostCategory>('all')

const filtered = computed(() => byCategory(active.value))
const showFeatured = computed(() => active.value === 'all' && Boolean(featured.value))

const gridPosts = computed(() => {
  if (!showFeatured.value || !featured.value) return filtered.value
  return filtered.value.filter((post) => post.slug !== featured.value?.slug)
})

function countFor(category: 'all' | PostCategory) {
  return category === 'all' ? latest.value.length : byCategory(category).length
}

useSeo({
  title: 'News & Stories',
  description:
    'Updates, reflections, and stories from Cross-Love Movement — worship nights, artiste development, creation care, and community outreach across Ghana.',
  path: '/news',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="News & stories"
      title="Notes from the work."
      description="Updates from our programmes, reflections on faith and music, and the stories behind the people we serve with."
    >
      <BaseButton href="#stories" variant="inverse">
        Read the latest
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton href="#subscribe" variant="inverseGhost">Get the monthly note</BaseButton>
    </PageHero>

    <!-- Featured -->
    <section v-if="showFeatured && featured" class="container-page pt-16 sm:pt-20">
      <NuxtLink
        :to="`/news/${featured.slug}`"
        class="group grid overflow-hidden rounded-4xl border border-sand-200 bg-white shadow-soft transition duration-300 hover:border-clay-200 hover:shadow-lift lg:grid-cols-2"
      >
        <div class="relative aspect-[16/10] overflow-hidden bg-sand-200 lg:aspect-auto">
          <img
            :src="featured.image"
            :alt="featured.imageAlt"
            class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <div class="flex flex-col p-7 sm:p-10">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full bg-clay-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-clay-800"
            >
              {{ postCategoryLabels[featured.category] }}
            </span>
            <span
              class="rounded-full border border-gold-300 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-gold-700"
            >
              Latest
            </span>
          </div>

          <p class="mt-5 text-xs font-semibold text-ink-soft">
            {{ formatDateShort(featured.publishedAt) }} · {{ featured.readingMinutes }} min read
          </p>

          <h2 class="mt-2 text-3xl leading-tight text-ink sm:text-4xl">{{ featured.title }}</h2>
          <p class="mt-4 text-[1rem] leading-relaxed text-ink-soft">{{ featured.excerpt }}</p>

          <p class="mt-5 text-sm font-semibold text-ink">By {{ featured.author }}</p>

          <span
            class="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-clay-700 transition group-hover:gap-2.5"
          >
            Read the story
            <Icon name="arrow-right" :size="16" />
          </span>
        </div>
      </NuxtLink>
    </section>

    <!-- All posts -->
    <section id="stories" class="container-page scroll-mt-24 py-16 sm:py-20">
      <div
        class="flex flex-col gap-6 border-b border-sand-200 pb-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="eyebrow">The archive</p>
          <h2 class="mt-2 text-2xl text-ink sm:text-3xl">
            {{ filtered.length }} {{ filtered.length === 1 ? 'post' : 'posts' }}
          </h2>
        </div>

        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter posts by category">
          <button
            v-for="category in categories"
            :key="category.value"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
            :class="
              active === category.value
                ? 'border-clay-600 bg-clay-600 text-white'
                : 'border-sand-300 bg-white text-ink-soft hover:border-clay-300 hover:text-clay-800'
            "
            :aria-pressed="active === category.value"
            @click="active = category.value"
          >
            {{ category.label }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold"
              :class="
                active === category.value ? 'bg-white/20 text-white' : 'bg-sand-100 text-ink-soft'
              "
            >
              {{ countFor(category.value) }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="gridPosts.length" class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PostCard v-for="post in gridPosts" :key="post.slug" :post="post" />
      </div>

      <p
        v-else
        class="mt-10 rounded-2xl border border-sand-200 bg-white p-8 text-center text-ink-soft"
      >
        No posts in this category yet. Try another filter, or
        <NuxtLink to="/contact" class="font-semibold text-clay-700 underline">
          tell us what you would like to read</NuxtLink
        >.
      </p>
    </section>

    <!-- Newsletter -->
    <section id="subscribe" class="scroll-mt-24 bg-brand-950 py-16 text-sand-50 sm:py-20">
      <div class="container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p class="eyebrow text-gold-300">Monthly note</p>
          <h2 class="mt-3 text-3xl leading-tight sm:text-4xl">One short letter from the field.</h2>
          <p class="mt-4 max-w-md text-[1rem] leading-relaxed text-sand-200/80">
            Stories, upcoming events, and an honest line about what we got wrong. No noise, and you
            can leave whenever you like.
          </p>
        </div>

        <div class="max-w-md lg:ml-auto lg:w-full">
          <NewsletterForm />
        </div>
      </div>
    </section>
  </div>
</template>
