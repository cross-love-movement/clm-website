<script setup lang="ts">
import { postCategoryLabels } from '~/data/news'

const route = useRoute()
const { related } = await useNews()
const { site } = useSite()
const { public: config } = useRuntimeConfig()

const { data: post } = await useAsyncData(`news-${route.path}`, () =>
  queryCollection('news').path(route.path).first(),
)

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Story not found',
    fatal: true,
  })
}

const others = computed(() => related(route.path, 3))

useSeo({
  title: computed(() => post.value?.title ?? 'Story'),
  description: computed(() => post.value?.excerpt ?? ''),
  path: computed(() => post.value?.path ?? ''),
  type: 'article',
})

useHead(() => {
  const current = post.value
  if (!current) return {}

  return {
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: current.title,
          description: current.excerpt,
          datePublished: current.publishedAt,
          dateModified: current.publishedAt,
          author: { '@type': 'Person', name: current.author },
          publisher: {
            '@type': 'Organization',
            name: 'Cross-Love Movement',
            logo: {
              '@type': 'ImageObject',
              url: `${config.siteUrl}/images/clm-mark.png`,
            },
          },
          mainEntityOfPage: `${config.siteUrl}${current.path}`,
        }),
      },
    ],
  }
})
</script>

<template>
  <div v-if="post">
    <article class="container-page pt-8 pb-16 sm:pt-10 sm:pb-20">
      <nav aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft">
          <li><NuxtLink to="/" class="hover:text-clay-700">Home</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li><NuxtLink to="/news" class="hover:text-clay-700">News</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" class="text-clay-800">{{ post.title }}</li>
        </ol>
      </nav>

      <header class="mx-auto mt-8 max-w-3xl">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-full bg-clay-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-clay-800"
          >
            {{ postCategoryLabels[post.category] }}
          </span>
          <span class="text-xs font-semibold text-ink-soft">
            {{ post.readingMinutes }} min read
          </span>
        </div>

        <h1 class="mt-5 text-4xl leading-[1.08] sm:text-5xl">{{ post.title }}</h1>
        <p class="mt-5 text-lg leading-relaxed text-ink-soft sm:text-xl">{{ post.excerpt }}</p>

        <div class="mt-7 flex items-center gap-3 border-y border-sand-200 py-4">
          <span
            class="flex size-10 items-center justify-center rounded-full bg-brand-100 font-display text-sm font-semibold text-brand-800"
          >
            {{ post.author.slice(0, 1) }}
          </span>
          <div class="text-sm">
            <p class="font-semibold text-ink">{{ post.author }}</p>
            <p class="text-ink-soft">{{ formatDateLong(post.publishedAt) }}</p>
          </div>
        </div>
      </header>

      <div class="mx-auto mt-10 max-w-4xl overflow-hidden rounded-4xl border border-sand-200">
        <img
          :src="post.image"
          :alt="post.imageAlt"
          width="1200"
          height="750"
          class="h-full w-full object-cover"
        />
      </div>

      <div class="article-body mx-auto mt-12 max-w-3xl">
        <ContentRenderer :value="post" />
      </div>

      <div
        class="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-sand-200 pt-6"
      >
        <NuxtLink
          to="/news"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 hover:text-clay-900"
        >
          <Icon name="arrow-right" :size="15" class="rotate-180" />
          All news & stories
        </NuxtLink>

        <a
          :href="`mailto:${site.email}?subject=${encodeURIComponent(`About the story: ${post.title}`)}`"
          class="text-sm font-semibold text-ink-soft hover:text-ink"
        >
          Something to add? Write to us
        </a>
      </div>
    </article>

    <section v-if="others.length" class="border-y border-sand-200 bg-sand-100 py-16 sm:py-20">
      <div class="container-page">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <h2 class="text-2xl sm:text-3xl">More from the newsroom</h2>
          <NuxtLink
            to="/news"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 hover:text-clay-900"
          >
            All stories
            <Icon name="arrow-right" :size="16" />
          </NuxtLink>
        </div>
        <div class="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PostCard v-for="item in others" :key="item.path" :post="item" />
        </div>
      </div>
    </section>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Be part of the next story"
        title="Stories start with someone showing up."
        description="Join an event, volunteer a few hours, or give towards the work that makes the next post possible."
        primary-label="See upcoming events"
        primary-to="/events"
        secondary-label="Support the work"
        secondary-to="/donate"
      />
    </div>
  </div>
</template>
