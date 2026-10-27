<script setup lang="ts">
import { categoryLabels, statusLabels } from '~/data/projects'

const route = useRoute()
const { projects } = await useProjects()

const { data: project } = await useAsyncData(`project-${route.path}`, () =>
  queryCollection('projects').path(route.path).first(),
)

if (!project.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Project not found',
    fatal: true,
  })
}

const related = computed(() => {
  const current = project.value
  if (!current) return []

  const sameCategory = projects.value.filter(
    (item) => item.path !== current.path && item.category === current.category,
  )
  const others = projects.value.filter(
    (item) => item.path !== current.path && item.category !== current.category,
  )

  return [...sameCategory, ...others].slice(0, 2)
})

const impactLabel = computed(() =>
  project.value?.status === 'upcoming' ? 'What we are building towards' : 'Reported impact',
)

useSeo({
  title: computed(() => project.value?.title ?? 'Project'),
  description: computed(() => project.value?.summary ?? ''),
  path: computed(() => project.value?.path ?? ''),
})
</script>

<template>
  <div v-if="project">
    <section class="container-page pt-8 pb-14 sm:pt-10 sm:pb-16">
      <nav aria-label="Breadcrumb">
        <ol class="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-soft">
          <li><NuxtLink to="/" class="hover:text-brand-700">Home</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li><NuxtLink to="/projects" class="hover:text-brand-700">Projects</NuxtLink></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" class="text-brand-800">{{ project.title }}</li>
        </ol>
      </nav>

      <div class="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800"
            >
              {{ categoryLabels[project.category] }}
            </span>
            <span
              class="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide"
              :class="
                project.status === 'active'
                  ? 'bg-clay-100 text-clay-800'
                  : project.status === 'completed'
                    ? 'bg-sand-200 text-ink-soft'
                    : 'bg-gold-100 text-gold-800'
              "
            >
              {{ statusLabels[project.status] }}
            </span>
          </div>

          <h1 class="mt-5 text-4xl leading-[1.05] sm:text-5xl">{{ project.title }}</h1>
          <p class="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">{{ project.summary }}</p>

          <dl
            class="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 border-y border-sand-200 py-5 sm:grid-cols-3"
          >
            <div>
              <dt class="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-soft/70">
                Where
              </dt>
              <dd class="mt-1 text-sm font-semibold text-ink">{{ project.location }}</dd>
            </div>
            <div>
              <dt class="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-soft/70">
                Timeframe
              </dt>
              <dd class="mt-1 text-sm font-semibold text-ink">{{ project.timeframe }}</dd>
            </div>
            <div>
              <dt class="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-soft/70">
                Focus
              </dt>
              <dd class="mt-1 text-sm font-semibold text-ink">
                {{ categoryLabels[project.category] }}
              </dd>
            </div>
          </dl>

          <div class="mt-7 flex flex-wrap gap-3">
            <BaseButton to="/donate" size="lg">
              Support this project
              <template #icon><Icon name="heart" :size="17" /></template>
            </BaseButton>
            <BaseButton to="/volunteer" variant="secondary" size="lg">Volunteer</BaseButton>
          </div>
        </div>

        <div class="overflow-hidden rounded-4xl border border-sand-200 shadow-soft">
          <img
            :src="project.image"
            :alt="project.imageAlt"
            width="1200"
            height="750"
            class="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>

    <section class="border-y border-sand-200 bg-sand-100 py-12">
      <div class="container-page">
        <p class="eyebrow">{{ impactLabel }}</p>
        <div class="mt-5">
          <StatGrid :stats="project.impact" />
        </div>
      </div>
    </section>

    <section class="container-page py-16 sm:py-20">
      <div class="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <h2 class="text-3xl leading-tight">The story</h2>
          <div class="article-body mt-5">
            <ContentRenderer :value="project" />
          </div>

          <h2 class="mt-12 text-2xl">What we set out to do</h2>
          <ul class="mt-5 space-y-4">
            <li v-for="goal in project.goals" :key="goal" class="flex gap-3">
              <span
                class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"
              >
                <Icon name="check" :size="14" :stroke-width="2.5" />
              </span>
              <span class="text-[1rem] leading-relaxed text-ink-soft">{{ goal }}</span>
            </li>
          </ul>
        </div>

        <aside class="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 class="text-lg text-ink">What this project needs</h2>
            <ul class="mt-4 flex flex-wrap gap-2">
              <li
                v-for="need in project.needs"
                :key="need"
                class="rounded-full bg-sand-100 px-3 py-1.5 text-sm font-medium text-ink-soft"
              >
                {{ need }}
              </li>
            </ul>
            <p class="mt-4 text-sm leading-relaxed text-ink-soft">
              Time, skills, or supplies — all of it moves the work forward.
            </p>
            <BaseButton to="/contact" variant="secondary" block class="mt-5">
              Offer support
            </BaseButton>
          </div>

          <div class="rounded-3xl bg-brand-900 p-6 text-sand-50">
            <p class="eyebrow text-gold-300">Give directly</p>
            <p class="mt-2 font-display text-2xl leading-snug">
              Keep a programme like this one moving.
            </p>
            <p class="mt-3 text-sm leading-relaxed text-sand-200/80">
              Give once or monthly. Restricted gifts are ring-fenced to the programme you choose and
              reported separately.
            </p>
            <BaseButton to="/donate" variant="inverse" block class="mt-5">
              Donate
              <template #icon><Icon name="arrow-right" :size="16" /></template>
            </BaseButton>
          </div>
        </aside>
      </div>
    </section>

    <section v-if="related.length" class="border-t border-sand-200 bg-sand-100 py-16 sm:py-20">
      <div class="container-page">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <h2 class="text-2xl sm:text-3xl">Keep exploring</h2>
          <NuxtLink
            to="/projects"
            class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            All projects
            <Icon name="arrow-right" :size="16" />
          </NuxtLink>
        </div>
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          <ProjectCard v-for="item in related" :key="item.path" :project="item" />
        </div>
      </div>
    </section>
  </div>
</template>
