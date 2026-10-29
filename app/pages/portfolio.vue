<script setup lang="ts">
import type { PortfolioCategory, PortfolioItem } from '#shared/types/content'

import { heroImages } from '~/data/heroes'

const { items, byCategory, categories, categoryLabels } = await usePortfolio()

const active = ref<'all' | PortfolioCategory>('all')
const filtered = computed(() => byCategory(active.value))

const dialog = ref<HTMLDialogElement | null>(null)
const selected = ref<PortfolioItem | null>(null)

function open(item: PortfolioItem) {
  selected.value = item
  nextTick(() => dialog.value?.showModal())
}

function close() {
  dialog.value?.close()
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

watch(selected, (item) => {
  if (!import.meta.client) return
  document.body.style.overflow = item ? 'hidden' : ''
})

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})

function countFor(category: 'all' | PortfolioCategory) {
  return category === 'all' ? items.value.length : byCategory(category).length
}

useSeo({
  title: 'Portfolio',
  description:
    'Selected work from Cross-Love Movement — performances, recordings, outreach, youth empowerment, and church support across Ghana.',
  path: '/portfolio',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="Portfolio"
      title="The work, in pictures and sound."
      description="Performances, recordings, outreach days, and the quiet practical work of supporting churches — a selected record of what we have been part of."
      :image="heroImages.portfolio"
    >
      <BaseButton href="#work" variant="inverse">
        See the work
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton to="/contact" variant="inverseGhost">Work with us</BaseButton>
    </PageHero>

    <section id="work" class="container-page scroll-mt-24 py-16 sm:py-20">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Selected work"
          title="Programmes, performances, and the days between."
          description="A portfolio is only honest if it includes the unglamorous parts. This one does."
        />
        <p class="text-sm font-semibold text-ink-soft">
          {{ items.length }} pieces · {{ categories.length - 1 }} categories
        </p>
      </div>

      <div class="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter portfolio by category">
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

      <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="item in filtered"
          :key="item.slug"
          type="button"
          class="group relative block overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift"
          @click="open(item)"
        >
          <span class="block aspect-[4/3] overflow-hidden">
            <img
              :src="item.image"
              :alt="item.imageAlt"
              loading="lazy"
              class="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
            />
          </span>

          <span
            class="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent"
            aria-hidden="true"
          />

          <span
            class="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-sand-50/90 text-brand-900 opacity-0 transition group-hover:opacity-100"
            aria-hidden="true"
          >
            <Icon name="arrow-up-right" :size="16" />
          </span>

          <span class="absolute inset-x-0 bottom-0 block p-5 text-sand-50">
            <span class="block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-gold-300">
              {{ categoryLabels[item.category] }} · {{ item.year }}
            </span>
            <span class="mt-1 block text-lg font-semibold leading-snug">{{ item.title }}</span>
            <span class="mt-1 block text-xs text-sand-100/75">{{ item.location }}</span>
          </span>
        </button>
      </div>
    </section>

    <!-- Detail dialog -->
    <dialog
      ref="dialog"
      aria-labelledby="portfolio-dialog-title"
      class="m-auto w-[min(94vw,60rem)] rounded-4xl bg-sand-50 p-0 text-left shadow-lift backdrop:bg-brand-950/70 backdrop:backdrop-blur-sm"
      @close="selected = null"
      @click="onBackdropClick"
    >
      <div v-if="selected" class="max-h-[90dvh] overflow-y-auto">
        <div class="relative">
          <img
            :src="selected.image"
            :alt="selected.imageAlt"
            class="h-56 w-full object-cover sm:h-72"
          />
          <button
            type="button"
            class="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-sand-50/90 text-brand-900 transition hover:bg-white"
            aria-label="Close"
            @click="close"
          >
            <Icon name="close" :size="18" />
          </button>
        </div>

        <div class="p-6 sm:p-9">
          <p class="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-clay-700">
            {{ categoryLabels[selected.category] }} · {{ selected.year }} · {{ selected.location }}
          </p>
          <h2 id="portfolio-dialog-title" class="mt-2 text-3xl leading-tight">
            {{ selected.title }}
          </h2>
          <p class="mt-3 text-lg leading-relaxed text-ink-soft">{{ selected.summary }}</p>

          <div class="mt-5 space-y-4 text-[0.98rem] leading-relaxed text-ink-soft">
            <p v-for="(paragraph, index) in selected.description" :key="index">{{ paragraph }}</p>
          </div>

          <ul class="mt-6 flex flex-wrap gap-2">
            <li
              v-for="tag in selected.tags"
              :key="tag"
              class="rounded-full bg-sand-100 px-3 py-1.5 text-xs font-semibold text-ink-soft"
            >
              {{ tag }}
            </li>
          </ul>

          <div class="mt-8 flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
            <NuxtLink
              v-if="selected.link"
              :to="selected.link.to"
              class="inline-flex items-center gap-2 rounded-full bg-clay-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-clay-700"
              @click="close"
            >
              {{ selected.link.label }}
              <Icon name="arrow-right" :size="16" />
            </NuxtLink>

            <BaseButton variant="secondary" @click="close">Close</BaseButton>
          </div>
        </div>
      </div>
    </dialog>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Your space, your story"
        title="Have a stage, a studio, or a community that needs this?"
        description="We are always looking for host churches, producers, schools, and volunteers who want to be part of the next piece of work."
        primary-label="Talk to us"
        primary-to="/contact"
        secondary-label="Partner with us"
        secondary-to="/partnership"
      />
    </div>
  </div>
</template>
