<script setup lang="ts">
import { partnerTiers } from '~/data/involve'
import { partnershipFaqs } from '~/data/faqs'
import { heroImages } from '~/data/heroes'

const { site } = useSite()

useSeo({
  title: 'Partnership',
  description:
    'Partner with Cross-Love Movement in Ghana through programme funding, corporate CSR, employee volunteering, church partnership, or in-kind support.',
  path: '/partnership',
})

const reasons = [
  {
    title: 'Outcomes you can report on',
    description:
      'Every partnership is tied to named programmes and specific numbers — sessions held, instruments supplied, volunteers trained, communities reached.',
    icon: 'activity' as const,
  },
  {
    title: 'A relationship, not a receipt',
    description:
      'You will know the team, visit the work, and hear honestly about what is hard. We do not do glossy distance.',
    icon: 'link' as const,
  },
  {
    title: 'Your people can take part',
    description:
      'Employee volunteering days, matched giving, and skills-based support that turn a logo into a real contribution.',
    icon: 'users' as const,
  },
]

const steps = [
  {
    title: 'Introductory call',
    description: 'Thirty minutes to understand what you want to achieve and what we actually need.',
  },
  {
    title: 'Programme fit',
    description:
      'We propose the specific work your support would fund — or tell you honestly if it is not a fit.',
  },
  {
    title: 'Agreement',
    description: 'A short, plain agreement covering scope, timeline, reporting, and recognition.',
  },
  {
    title: 'Together, then reported',
    description:
      'Programme begins, quarterly updates follow, and a written impact report closes the loop.',
  },
]
</script>

<template>
  <div>
    <PageHero
      eyebrow="Partnership"
      title="Build something that outlasts the announcement."
      description="We work with companies, foundations, schools, and congregations who want their support to become a lasting part of a community, not a photograph."
      :image="heroImages.partnership"
    >
      <BaseButton href="#enquire" variant="inverse">
        Start a conversation
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton href="#tiers" variant="inverseGhost"> See partnership options </BaseButton>
    </PageHero>

    <!-- Why partner -->
    <section class="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="Why partner with us"
        title="Small organisation. Serious accountability."
        description="We are deliberately close to the ground — which means your support reaches people quickly, and you can see exactly where it went."
      />

      <div class="mt-12 grid gap-5 md:grid-cols-3">
        <article
          v-for="reason in reasons"
          :key="reason.title"
          class="rounded-3xl border border-sand-200 bg-white p-7 shadow-soft"
        >
          <span
            class="flex size-11 items-center justify-center rounded-2xl bg-clay-50 text-clay-700"
          >
            <Icon :name="reason.icon" :size="21" />
          </span>
          <h3 class="mt-5 text-xl text-ink">{{ reason.title }}</h3>
          <p class="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{{ reason.description }}</p>
        </article>
      </div>
    </section>

    <!-- Tiers -->
    <section id="tiers" class="scroll-mt-24 border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page">
        <SectionHeading
          eyebrow="Ways to partner"
          title="Four doors in."
          description="Commitments range from a morning of staff volunteering to a multi-year programme grant. All of them matter."
        />

        <div class="mt-12 grid gap-5 md:grid-cols-2">
          <article
            v-for="tier in partnerTiers"
            :key="tier.name"
            class="relative flex flex-col rounded-3xl border bg-white p-7 shadow-soft sm:p-8"
            :class="
              tier.highlighted ? 'border-brand-600 ring-2 ring-brand-600/15' : 'border-sand-200'
            "
          >
            <span
              v-if="tier.highlighted"
              class="absolute -top-3 left-7 rounded-full bg-brand-700 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-sand-50"
            >
              Most common
            </span>

            <h3 class="text-2xl text-ink">{{ tier.name }}</h3>
            <p class="mt-1 text-sm font-semibold text-clay-700">{{ tier.commitment }}</p>
            <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{{ tier.description }}</p>

            <ul class="mt-5 flex-1 space-y-2.5">
              <li
                v-for="benefit in tier.benefits"
                :key="benefit"
                class="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
              >
                <span class="mt-0.5 text-brand-600">
                  <Icon name="check" :size="16" :stroke-width="2.5" />
                </span>
                {{ benefit }}
              </li>
            </ul>

            <BaseButton
              href="#enquire"
              :variant="tier.highlighted ? 'primary' : 'secondary'"
              block
              class="mt-7"
            >
              Discuss this option
            </BaseButton>
          </article>
        </div>

        <p class="mt-8 text-center text-sm text-ink-soft">
          Amounts are a guide, not a gate. Tell us what is possible and we will shape something
          honest around it.
        </p>
      </div>
    </section>

    <!-- Process -->
    <section class="container-page py-20 sm:py-24">
      <SectionHeading
        eyebrow="How it works"
        title="From first call to final report."
        description="Most partnerships are up and running within four to six weeks."
      />

      <ol class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          class="relative rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
        >
          <span class="font-display text-3xl text-brand-200">0{{ index + 1 }}</span>
          <h3 class="mt-2 text-lg text-ink">{{ step.title }}</h3>
          <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">{{ step.description }}</p>
        </li>
      </ol>
    </section>

    <!-- Enquiry -->
    <section id="enquire" class="scroll-mt-24 border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Enquire"
            title="Tell us what you have in mind."
            description="Even if the shape is not clear yet, a short conversation usually finds it."
          />

          <div class="mt-8 space-y-4">
            <a
              :href="`mailto:${site.email}?subject=Partnership%20enquiry`"
              class="flex items-start gap-3.5 rounded-2xl border border-sand-200 bg-white p-4 transition hover:border-brand-300"
            >
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"
              >
                <Icon name="mail" :size="18" />
              </span>
              <span>
                <span class="block text-sm font-semibold text-ink"
                  >Email the partnerships team</span
                >
                <span class="block text-sm text-ink-soft">{{ site.email }}</span>
              </span>
            </a>

            <a
              :href="`tel:${site.phoneHref}`"
              class="flex items-start gap-3.5 rounded-2xl border border-sand-200 bg-white p-4 transition hover:border-brand-300"
            >
              <span
                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"
              >
                <Icon name="phone" :size="18" />
              </span>
              <span>
                <span class="block text-sm font-semibold text-ink">Call the office</span>
                <span class="block text-sm text-ink-soft">{{ site.phone }}</span>
              </span>
            </a>
          </div>

          <p class="mt-6 text-sm leading-relaxed text-ink-soft">
            We do not accept funding that compromises the dignity of the people we serve, and we
            will say so plainly if a proposal is not a fit.
          </p>
        </div>

        <div class="rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
          <PartnershipForm />
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="container-page py-20 sm:py-24">
      <div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="Partnership, answered."
          description="A few things organisations usually want to know before the first call."
        />
        <FaqList :items="partnershipFaqs" />
      </div>
    </section>
  </div>
</template>
