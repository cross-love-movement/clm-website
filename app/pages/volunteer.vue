<script setup lang="ts">
import { volunteerRoles } from '~/data/involve'
import { volunteerFaqs } from '~/data/faqs'

const selectedRole = ref('')

function applyFor(roleTitle: string) {
  selectedRole.value = roleTitle
  nextTick(() => {
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

useSeo({
  title: 'Volunteer',
  description:
    'Volunteer with Cross-Love Movement — mentor a young person, help run Cross Sessions, design CSL tracts, or film the work in Tema, Accra, and Bawku.',
  path: '/volunteer',
})

const expectations = [
  {
    title: 'No experience needed, mostly',
    description:
      'Music mentors and outreach volunteers complete a short briefing. Recycling educators complete CLM’s training before teaching anyone else.',
    icon: 'sprout' as const,
  },
  {
    title: 'We ask for consistency',
    description:
      'Children notice when you miss a week. We would rather you commit to something small and keep it than something large you drop.',
    icon: 'calendar' as const,
  },
  {
    title: 'You will not be dropped in',
    description:
      'Every volunteer is paired with a team lead, briefed before the first day, and never sent alone into a community.',
    icon: 'shield' as const,
  },
]

const steps = [
  'Send the form — it takes two minutes.',
  'We call you for a short, friendly conversation.',
  'You attend a safeguarding and role briefing.',
  'You join your first programme day with a team lead.',
]
</script>

<template>
  <div>
    <PageHero
      eyebrow="Volunteer"
      title="Give a few hours. Change what is possible."
      description="Our programmes are carried by volunteers — musicians, media people, students, retirees — who give time they did not know they had."
    >
      <BaseButton href="#apply" variant="inverse">
        Apply to volunteer
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton href="#roles" variant="inverseGhost"> See open roles </BaseButton>
    </PageHero>

    <!-- Expectations -->
    <section class="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Before you apply"
        title="What volunteering here actually looks like."
        description="Honest expectations, so that both you and the people we serve get what they need."
      />

      <div class="mt-12 grid gap-5 md:grid-cols-3">
        <article
          v-for="item in expectations"
          :key="item.title"
          class="rounded-3xl border border-sand-200 bg-white p-7 shadow-soft"
        >
          <span
            class="flex size-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
          >
            <Icon :name="item.icon" :size="21" />
          </span>
          <h3 class="mt-5 text-xl text-ink">{{ item.title }}</h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <!-- Roles -->
    <section id="roles" class="scroll-mt-24 border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page">
        <SectionHeading
          eyebrow="Open roles"
          title="Six ways to be useful."
          description="Pick the one that fits your life. If you are unsure, choose the role closest to what you already enjoy."
        />

        <div class="mt-12 grid gap-5 lg:grid-cols-2">
          <article
            v-for="role in volunteerRoles"
            :key="role.title"
            class="flex flex-col rounded-3xl border border-sand-200 bg-white p-7 shadow-soft transition hover:border-brand-200"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <h3 class="text-xl text-ink">{{ role.title }}</h3>
              <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                {{ role.commitment }}
              </span>
            </div>

            <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{{ role.description }}</p>

            <ul class="mt-5 flex-1 space-y-2">
              <li
                v-for="requirement in role.requirements"
                :key="requirement"
                class="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
              >
                <span
                  class="mt-1.5 size-1.5 shrink-0 rounded-full bg-clay-400"
                  aria-hidden="true"
                />
                {{ requirement }}
              </li>
            </ul>

            <div class="mt-6 flex items-center justify-between gap-3 border-t border-sand-200 pt-5">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
                @click="applyFor(role.title)"
              >
                Apply for this role
                <Icon name="arrow-right" :size="15" />
              </button>
              <span class="text-xs text-ink-soft/70">Training provided</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Application -->
    <section id="apply" class="container-page scroll-mt-24 py-20 sm:py-24">
      <div class="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Application"
            title="Let’s find your place."
            description="Fill this in and a real person will call you. No automated funnel, no obligation."
          />

          <ol class="mt-8 space-y-4">
            <li v-for="(step, index) in steps" :key="step" class="flex gap-3.5">
              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800"
              >
                {{ index + 1 }}
              </span>
              <span class="text-[0.95rem] leading-relaxed text-ink-soft">{{ step }}</span>
            </li>
          </ol>

          <div class="mt-8 rounded-2xl bg-clay-50 p-5">
            <p class="text-sm font-semibold text-clay-800">Under 18?</p>
            <p class="mt-1 text-sm leading-relaxed text-ink-soft">
              You can serve through a school or family service day with a guardian present. Email us
              and we will arrange it.
            </p>
          </div>
        </div>

        <div class="rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
          <VolunteerForm :initial-area="selectedRole" />
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="border-t border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="The things people usually ask."
          description="If yours is not here, just send it — we would rather answer than guess."
        >
          <template #actions>
            <BaseButton to="/contact" variant="secondary" size="sm">Ask us directly</BaseButton>
          </template>
        </SectionHeading>

        <FaqList :items="volunteerFaqs" />
      </div>
    </section>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Not able to volunteer?"
        title="Giving keeps the instruments tuned and the sessions on the road."
        description="A monthly gift is the most useful kind of support we receive — it lets us plan a season of sessions instead of a single afternoon."
        primary-label="Donate instead"
        primary-to="/donate"
        secondary-label="Partner with us"
        secondary-to="/partnership"
        tone="clay"
      />
    </div>
  </div>
</template>
