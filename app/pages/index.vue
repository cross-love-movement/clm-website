<script setup lang="ts">
import { howToHelp } from '~/data/involve'
import { pillars, stats, vision } from '~/data/about'

const { site } = useSite()
const { featured } = useProjects()
const { featured: featuredTestimonials } = useTestimonials()

useSeo({
  title: 'Faith in Christ. Music for change.',
  description: site.description,
  path: '/',
})
</script>

<template>
  <div>
    <HeroSection />

    <!-- Facts -->
    <section class="container-page">
      <StatGrid :stats="stats" />
    </section>

    <PartnersCarousel class="mt-14 sm:mt-16" />

    <!-- Focus areas -->
    <section class="container-page py-20 sm:py-24">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="What we do"
          title="Three commitments, one movement."
          description="Music, faith, and care for creation — the three strands our constitution keeps bringing us back to."
        />
        <BaseButton to="/about" variant="ghost" size="md" class="self-start lg:self-auto">
          More about us
          <template #icon><Icon name="arrow-right" :size="17" /></template>
        </BaseButton>
      </div>

      <div class="mt-12 grid gap-5 md:grid-cols-3">
        <article
          v-for="(pillar, index) in pillars"
          :key="pillar.title"
          class="group relative overflow-hidden rounded-3xl border border-sand-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-clay-200 hover:shadow-lift"
        >
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-clay-50 text-clay-700 transition group-hover:bg-clay-600 group-hover:text-white"
          >
            <Icon :name="pillar.icon" :size="24" />
          </span>
          <p class="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-gold-700">
            0{{ index + 1 }}
          </p>
          <h3 class="mt-2 text-2xl text-ink">{{ pillar.title }}</h3>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{{ pillar.description }}</p>
        </article>
      </div>
    </section>

    <!-- Featured programmes -->
    <section class="border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Our projects"
            title="The work, up close."
            description="Sessions in churches, stages for emerging artistes, and volunteers teaching their own communities to waste less."
          />
          <BaseButton to="/projects" variant="secondary" class="self-start lg:self-auto">
            All projects
            <template #icon><Icon name="arrow-right" :size="17" /></template>
          </BaseButton>
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProjectCard v-for="project in featured" :key="project.slug" :project="project" />
        </div>
      </div>
    </section>

    <EventsSection />

    <NewsSection />

    <!-- Vision -->
    <section class="container-page py-20 sm:py-24">
      <figure class="relative mx-auto max-w-4xl text-center">
        <span
          class="mx-auto flex size-12 items-center justify-center rounded-full bg-gold-100 text-gold-700"
        >
          <Icon name="quote" :size="22" />
        </span>
        <blockquote
          class="mt-7 font-display text-2xl leading-snug text-ink sm:text-[2rem] sm:leading-[1.3]"
        >
          “{{ vision }}”
        </blockquote>
        <figcaption class="mt-6 text-sm">
          <span class="font-semibold text-ink">Our vision</span>
          <span class="text-ink-soft"> · Cross-Love Movement</span>
        </figcaption>
      </figure>
    </section>

    <!-- Ways to help -->
    <section class="container-page pb-4">
      <SectionHeading
        eyebrow="Get involved"
        title="There is a place for you here."
        description="You do not need to be able to do everything. You only need to be willing to do one thing."
        align="center"
      />

      <div class="mt-12 grid gap-5 md:grid-cols-3">
        <NuxtLink
          v-for="option in howToHelp"
          :key="option.title"
          :to="option.to"
          class="group flex flex-col rounded-3xl border border-sand-200 bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-clay-300 hover:shadow-lift"
        >
          <span
            class="flex size-11 items-center justify-center rounded-full bg-clay-50 text-clay-700"
          >
            <Icon :name="option.icon" :size="21" />
          </span>
          <h3 class="mt-5 text-xl text-ink">{{ option.title }}</h3>
          <p class="mt-2 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">
            {{ option.description }}
          </p>
          <span
            class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 transition group-hover:gap-2.5"
          >
            {{ option.cta }}
            <Icon name="arrow-right" :size="16" />
          </span>
        </NuxtLink>
      </div>
    </section>

    <TestimonialsSection
      :items="featuredTestimonials"
      title="Voices from the work."
      description="The people who host us, serve with us, and take the stage tell it better than we can."
    />

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Show up with us"
        title="A song can carry what a leaflet cannot."
        description="Help equip a church, train a recycling volunteer, or put a young gospel artiste in a studio for a day."
        primary-label="Donate today"
        primary-to="/donate"
        secondary-label="Talk to us"
        secondary-to="/contact"
      />
    </div>
  </div>
</template>
