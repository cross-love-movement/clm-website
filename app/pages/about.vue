<script setup lang="ts">
import { mission, vision, values, stats, milestones, team, governance } from '~/data/about'

const { site } = useSite()
const { testimonials } = useTestimonials()

useSeo({
  title: 'About us',
  description:
    'Cross-Love Movement is a Ghanaian company limited by guarantee, formed in 2023 by musicians using music and community engagement to share the Gospel and serve communities.',
  path: '/about',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="Who we are"
      title="Musicians and patriots, in the same room."
      description="Cross-Love Movement is a Ghanaian company limited by guarantee, formed in 2023 by musicians who wanted faith, music, and community engagement to do more than entertain."
    >
      <BaseButton to="/volunteer" variant="inverse">
        Serve with us
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton to="/projects" variant="inverseGhost">See our projects</BaseButton>
    </PageHero>

    <!-- Story -->
    <section class="container-page py-20 sm:py-24">
      <div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <p class="eyebrow">Our story</p>
          <h2 class="mt-3 text-3xl leading-tight sm:text-4xl">
            It began with a trained engineer asking what his gift was for.
          </h2>

          <blockquote class="mt-8 rounded-2xl border-l-4 border-clay-500 bg-clay-50 p-6">
            <p class="font-display text-xl italic leading-snug text-brand-900">
              “After I close my toolbox and hang up my coat, can I use this talent outside my work —
              not for money, but to create a lasting impact on others’ lives?”
            </p>
            <footer class="mt-3 text-sm font-semibold text-ink-soft">
              The question that began Cross-Love Movement
            </footer>
          </blockquote>
        </div>

        <div class="space-y-5 text-[1.05rem] leading-relaxed text-ink-soft">
          <p>
            A young man who had grown up loving music and writing, but trained as a mechanical
            engineer, asked himself what to do with a talent that did not fit his profession. He
            could let it go, or he could use it after hours, with others who felt the same, for
            something other than money. That question became Cross-Love Movement in 2018.
          </p>
          <p>
            The name carries two mandates. The vertical one — faith in action — comes from the love
            and sacrifice of Christ on the cross, and pushes belief beyond the pew into sacrificial
            service. The horizontal one — faith beyond boundaries — bridges social, cultural, and
            denominational lines so young people can be resourced to live to their full potential.
          </p>
          <p>
            Today we are a Christian, non-denominational network of young corporate creatives and
            youthful advocates, formally registered as a company limited by guarantee in 2023. Our
            projects fall into two classes: Christian Mission Projects with local churches, and
            Youth Empowerment Programmes for the generation coming after us.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission and vision -->
    <section class="border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-5 md:grid-cols-2">
        <article class="rounded-3xl bg-brand-900 p-8 text-sand-50 sm:p-10">
          <p class="eyebrow text-gold-300">Our mission</p>
          <h2 class="mt-3 text-2xl leading-snug sm:text-[1.6rem]">{{ mission }}</h2>
        </article>
        <article class="rounded-3xl border border-sand-200 bg-white p-8 shadow-soft sm:p-10">
          <p class="eyebrow">Our vision</p>
          <h2 class="mt-3 text-2xl leading-snug text-ink sm:text-[1.6rem]">{{ vision }}</h2>
        </article>
      </div>

      <div class="container-page mt-12">
        <StatGrid :stats="stats" />
      </div>
    </section>

    <!-- Values -->
    <section class="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="What we hold"
        title="Five things we will not trade away."
        description="These are not wall posters. They are the tests we apply when a decision is difficult."
        align="center"
      />

      <div
        class="mt-12 grid gap-px overflow-hidden rounded-3xl bg-sand-200 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article v-for="value in values" :key="value.title" class="bg-white p-7">
          <span
            class="flex size-10 items-center justify-center rounded-xl bg-clay-50 text-clay-700"
          >
            <Icon :name="value.icon" :size="20" />
          </span>
          <h3 class="mt-4 text-lg text-ink">{{ value.title }}</h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{{ value.description }}</p>
        </article>
      </div>
    </section>

    <!-- Timeline -->
    <section class="border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="The road so far"
          title="Young, registered, and already working."
          description="We would rather show you what is documented than what we hope you will assume."
        />

        <ol class="relative space-y-8 border-l border-sand-300 pl-8">
          <li v-for="(milestone, index) in milestones" :key="index" class="relative">
            <span
              class="absolute -left-[2.28rem] top-1 flex size-4 items-center justify-center rounded-full border-2 border-clay-600 bg-sand-50"
              aria-hidden="true"
            />
            <p class="font-display text-lg text-clay-700">{{ milestone.year }}</p>
            <h3 class="mt-0.5 text-lg text-ink">{{ milestone.title }}</h3>
            <p class="mt-1.5 text-[0.95rem] leading-relaxed text-ink-soft">
              {{ milestone.description }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Voices -->
    <TestimonialsSection
      v-if="testimonials.length"
      :items="testimonials"
      description="Volunteers, artistes, church partners, and the people who host us."
    />

    <!-- Leadership -->
    <section class="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Leadership"
        title="A small leadership, a wide circle."
        description="CLM is carried by musicians, volunteers, and partner churches. The team that holds it together is deliberately lean."
      />

      <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="member in team"
          :key="member.name"
          class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
        >
          <span
            class="flex size-14 items-center justify-center rounded-2xl bg-clay-100 font-display text-xl font-semibold text-clay-800"
          >
            {{ initials(member.name) }}
          </span>
          <h3 class="mt-5 text-lg text-ink">{{ member.name }}</h3>
          <p class="text-sm font-semibold text-clay-700">{{ member.role }}</p>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">{{ member.bio }}</p>
        </article>

        <div class="rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-6">
          <span
            class="flex size-14 items-center justify-center rounded-2xl bg-white text-brand-600 ring-1 ring-sand-200"
          >
            <Icon name="users" :size="24" />
          </span>
          <h3 class="mt-5 text-lg text-ink">A volunteer movement</h3>
          <p class="mt-3 text-sm leading-relaxed text-ink-soft">
            Young creatives, media volunteers, mentors, and prayer partners do the work alongside
            the leadership. A full list of officers is available on request.
          </p>
          <a
            :href="`mailto:${site.email}?subject=CLM%20officers%20and%20registration`"
            class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 hover:text-clay-900"
          >
            Request details
            <Icon name="arrow-up-right" :size="14" />
          </a>
        </div>
      </div>
    </section>

    <!-- Governance -->
    <section class="container-page pb-20 sm:pb-24">
      <div class="rounded-4xl bg-brand-950 px-6 py-12 text-sand-50 sm:px-12">
        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p class="eyebrow text-gold-300">Accountability</p>
            <h2 class="mt-3 text-3xl leading-tight">Registered in Ghana, answerable to the law.</h2>
            <p class="mt-4 max-w-md text-[0.98rem] leading-relaxed text-sand-200/80">
              Cross-Love Movement is a company limited by guarantee, not an informal association.
              Our registration, tax identification, and constitutional objectives are available to
              any supporter or partner who asks.
            </p>

            <dl class="mt-6 space-y-2 text-sm">
              <div class="flex flex-wrap gap-x-2">
                <dt class="text-sand-200/60">Registration</dt>
                <dd class="font-semibold text-sand-50">{{ site.registration.number }}</dd>
              </div>
              <div class="flex flex-wrap gap-x-2">
                <dt class="text-sand-200/60">TIN</dt>
                <dd class="font-semibold text-sand-50">{{ site.registration.tin }}</dd>
              </div>
              <div class="flex flex-wrap gap-x-2">
                <dt class="text-sand-200/60">Registered</dt>
                <dd class="font-semibold text-sand-50">{{ site.registration.date }}</dd>
              </div>
            </dl>

            <a
              :href="`mailto:${site.email}?subject=Registration%20documents%20request`"
              class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold-300 hover:text-gold-200"
            >
              Request our registration documents
              <Icon name="arrow-up-right" :size="15" />
            </a>
          </div>

          <div class="space-y-3">
            <div
              v-for="item in governance"
              :key="item.title"
              class="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
            >
              <span class="mt-0.5 text-gold-300"><Icon :name="item.icon" :size="22" /></span>
              <div>
                <h3 class="text-base font-semibold text-sand-50">{{ item.title }}</h3>
                <p class="mt-1 text-sm leading-relaxed text-sand-200/75">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <CtaBanner
      eyebrow="Come and see"
      title="The best way to understand the work is to stand in it."
      description="Join a Cross Session, help on a feeding day, or sit with us and talk about what you can offer."
      primary-label="Volunteer with us"
      primary-to="/volunteer"
      secondary-label="Get in touch"
      secondary-to="/contact"
      tone="clay"
    />
  </div>
</template>
