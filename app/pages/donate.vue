<script setup lang="ts">
import { givingPriorities } from '~/data/involve'
import { donateFaqs } from '~/data/faqs'

const { site } = useSite()

useSeo({
  title: 'Donate',
  description:
    'Give to Cross-Love Movement — help equip churches, fund youth empowerment programmes, and support young creatives in Ghana. Every gift is acknowledged and reported.',
  path: '/donate',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="Donate"
      title="Your gift becomes an instrument, a stage, a trained volunteer."
      description="Not a campaign. Not a one-off photograph. Steady support that lets a small Ghanaian team keep showing up in the same churches and communities."
      tone="clay"
    >
      <BaseButton href="#give" variant="inverse">
        Choose an amount
        <template #icon><Icon name="heart" :size="17" /></template>
      </BaseButton>
      <p class="text-sm text-sand-100/80">Every gift acknowledged within two working days.</p>
    </PageHero>

    <!-- Give -->
    <section id="give" class="container-page scroll-mt-24 py-16 sm:py-20">
      <div class="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div class="rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
          <h2 class="text-2xl">Make a gift</h2>
          <p class="mt-2 text-sm text-ink-soft">
            Choose a one-time or monthly gift. We will email verified transfer details and a
            receipt.
          </p>
          <div class="mt-7">
            <DonateForm />
          </div>
        </div>

        <aside class="space-y-5">
          <!-- Transfer -->
          <div class="rounded-3xl bg-brand-950 p-6 text-sand-50 sm:p-7">
            <p class="eyebrow text-gold-300">Give by transfer</p>
            <h2 class="mt-2 text-xl">Bank transfer or mobile money</h2>
            <p class="mt-3 text-sm leading-relaxed text-sand-200/80">
              We do not publish account details that can go stale. Write to us and we will send
              verified bank or mobile-money details together with a reference for your gift.
            </p>

            <a
              :href="`mailto:${site.email}?subject=Giving%20details%20request`"
              class="mt-5 inline-flex items-center gap-2 rounded-full bg-sand-50 px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:bg-white"
            >
              Request giving details
              <Icon name="arrow-up-right" :size="14" />
            </a>

            <p class="mt-4 text-xs leading-relaxed text-sand-200/60">
              Tell us the amount and frequency you have in mind, and we will reply with the correct
              route and a receipt schedule.
            </p>
          </div>

          <!-- Trust -->
          <div class="rounded-3xl border border-sand-200 bg-white p-6">
            <h2 class="text-lg text-ink">Why you can trust the giving</h2>
            <ul class="mt-4 space-y-3">
              <li class="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span class="mt-0.5 text-clay-600"><Icon name="shield" :size="17" /></span>
                A company limited by guarantee — RGD {{ site.registration.number }}.
              </li>
              <li class="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span class="mt-0.5 text-clay-600"><Icon name="check" :size="17" /></span>
                Ghana Revenue Authority TIN {{ site.registration.tin }}.
              </li>
              <li class="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span class="mt-0.5 text-clay-600"><Icon name="check" :size="17" /></span>
                Restricted gifts are ring-fenced and reported separately.
              </li>
              <li class="flex gap-3 text-sm leading-relaxed text-ink-soft">
                <span class="mt-0.5 text-clay-600"><Icon name="check" :size="17" /></span>
                No card details are collected or stored on this website.
              </li>
            </ul>
          </div>

          <div class="rounded-3xl border border-sand-200 bg-gold-50 p-6">
            <p class="text-sm font-semibold text-gold-800">Giving from abroad?</p>
            <p class="mt-1 text-sm leading-relaxed text-ink-soft">
              We can receive international transfers and will advise on the best route for your
              currency. Write to us and we will send the right details.
            </p>
            <NuxtLink
              to="/contact"
              class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 hover:text-clay-900"
            >
              Contact the giving team
              <Icon name="arrow-right" :size="15" />
            </NuxtLink>
          </div>
        </aside>
      </div>
    </section>

    <!-- What giving supports -->
    <section class="border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <SectionHeading
          eyebrow="Open books"
          title="What your giving supports."
          description="Gifts are allocated to the objectives in our constitution. Restrict a gift to one programme and we report on it separately."
        />

        <div class="space-y-1">
          <div
            v-for="priority in givingPriorities"
            :key="priority.title"
            class="flex gap-4 border-b border-sand-200 py-5 first:pt-0 last:border-b-0 last:pb-0"
          >
            <span
              class="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-clay-700 shadow-soft"
            >
              <Icon :name="priority.icon" :size="21" />
            </span>
            <div>
              <h3 class="text-lg text-ink">{{ priority.title }}</h3>
              <p class="mt-1 text-sm leading-relaxed text-ink-soft">{{ priority.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Monthly giving -->
    <section class="container-page py-20 sm:py-24">
      <div
        class="grid items-center gap-10 rounded-4xl bg-brand-900 p-8 text-sand-50 sm:p-12 lg:grid-cols-2"
      >
        <div>
          <p class="eyebrow text-gold-300">Monthly giving</p>
          <h2 class="mt-3 text-3xl leading-tight sm:text-4xl">
            A season of sessions does not fit into one generous afternoon.
          </h2>
          <p class="mt-4 text-[1rem] leading-relaxed text-sand-200/80">
            Monthly gifts let us plan a season of Cross Sessions, keep instruments in churches that
            need them, and pay for training materials before a workshop rather than after it. They
            are the least dramatic and most useful gifts we receive.
          </p>
        </div>

        <ul class="space-y-3">
          <li
            v-for="amount in [
              {
                value: 'GH₵100 / month',
                label: 'Print CSL evangelism tracts for an outreach',
              },
              { value: 'GH₵300 / month', label: 'Help place an instrument in a missionary church' },
              { value: 'GH₵1,000 / month', label: 'Support a Cross Sessions outreach event' },
            ]"
            :key="amount.value"
            class="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4"
          >
            <span class="font-display text-lg text-gold-300">{{ amount.value }}</span>
            <span class="max-w-[55%] text-right text-xs leading-relaxed text-sand-200/75">
              {{ amount.label }}
            </span>
          </li>
        </ul>
      </div>
    </section>

    <!-- FAQ -->
    <section class="pb-4">
      <div class="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="Giving, answered plainly."
          description="If anything is still unclear, write to us — we would rather explain than have you guess."
        >
          <template #actions>
            <BaseButton to="/contact" variant="secondary" size="sm">Contact us</BaseButton>
          </template>
        </SectionHeading>
        <FaqList :items="donateFaqs" />
      </div>
    </section>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Not able to give?"
        title="Time is just as needed as money."
        description="Young creatives, media volunteers, mentors, and prayer partners keep these programmes alive. There is a role for what you already know."
        primary-label="Volunteer with us"
        primary-to="/volunteer"
        secondary-label="Partner with us"
        secondary-to="/partnership"
        tone="clay"
      />
    </div>
  </div>
</template>
