<script setup lang="ts">
import type { ProjectCategory } from '#shared/types/content'

const { projects, categories } = await useProjects()

const active = ref<'all' | ProjectCategory>('all')

const filtered = computed(() =>
  active.value === 'all'
    ? projects.value
    : projects.value.filter((project) => project.category === active.value),
)

const countFor = (category: 'all' | ProjectCategory) =>
  category === 'all'
    ? projects.value.length
    : projects.value.filter((project) => project.category === category).length

useSeo({
  title: 'Our projects',
  description:
    'Explore Cross-Love Movement’s Christian Mission Projects with local churches and Youth Empowerment Programmes across Ghana.',
  path: '/projects',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="Our projects"
      title="Work measured in seasons, not campaigns."
      description="Two classes of work: Christian Mission Projects with local churches, and Youth Empowerment Programmes for the next generation."
    >
      <BaseButton to="/donate" variant="inverse">
        Fund a programme
        <template #icon><Icon name="heart" :size="17" /></template>
      </BaseButton>
    </PageHero>

    <section class="container-page py-16 sm:py-20">
      <div
        class="flex flex-col gap-6 border-b border-sand-200 pb-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="eyebrow">Browse</p>
          <h2 class="mt-2 text-2xl text-ink sm:text-3xl">
            {{ filtered.length }}
            {{ filtered.length === 1 ? 'programme' : 'programmes' }}
          </h2>
        </div>

        <div class="flex flex-wrap gap-2" role="group" aria-label="Filter projects by focus area">
          <button
            v-for="category in categories"
            :key="category.value"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
            :class="
              active === category.value
                ? 'border-brand-700 bg-brand-700 text-sand-50'
                : 'border-sand-300 bg-white text-ink-soft hover:border-brand-300 hover:text-brand-800'
            "
            :aria-pressed="active === category.value"
            @click="active = category.value"
          >
            {{ category.label }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold"
              :class="
                active === category.value ? 'bg-white/20 text-sand-50' : 'bg-sand-100 text-ink-soft'
              "
            >
              {{ countFor(category.value) }}
            </span>
          </button>
        </div>
      </div>

      <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectCard v-for="project in filtered" :key="project.path" :project="project" />
      </div>

      <p
        v-if="filtered.length === 0"
        class="mt-10 rounded-2xl bg-white p-8 text-center text-ink-soft"
      >
        No projects in this area yet. Try another filter or
        <NuxtLink to="/contact" class="font-semibold text-brand-700 underline">
          ask us what is coming next</NuxtLink
        >.
      </p>
    </section>

    <section class="container-page pb-4">
      <div
        class="grid gap-5 rounded-4xl border border-sand-200 bg-white p-8 shadow-soft sm:grid-cols-3 sm:p-10"
      >
        <div>
          <p class="eyebrow">How we choose</p>
          <h2 class="mt-2 text-xl text-ink">Projects start with a conversation.</h2>
        </div>
        <p class="text-[0.95rem] leading-relaxed text-ink-soft sm:col-span-2">
          Every programme begins with a host church or community asking for it. We start small, stay
          close to the people doing the work, and only scale once what we are doing is actually
          useful. We would rather be slow and trusted than fast and forgotten.
        </p>
      </div>
    </section>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Put your hands to something"
        title="These programmes run on people like you."
        description="Young creatives, media volunteers, mentors, prayer partners — and donors who make the work possible."
        primary-label="Volunteer"
        primary-to="/volunteer"
        secondary-label="Partner with us"
        secondary-to="/partnership"
      />
    </div>
  </div>
</template>
