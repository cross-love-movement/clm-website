<script setup lang="ts">
import { contactFaqs } from '~/data/faqs'

const { site } = useSite()

const mapQuery = encodeURIComponent(
  `${site.address.line1}, ${site.address.line2}, ${site.address.city}, ${site.address.country}`,
)

const details = [
  {
    label: 'Email',
    value: site.email,
    href: `mailto:${site.email}`,
    icon: 'mail' as const,
    note: 'We reply within two working days.',
  },
  {
    label: 'Phone',
    value: site.phone,
    href: `tel:${site.phoneHref}`,
    icon: 'phone' as const,
    note: 'Mon–Fri, 9:00–17:00 GMT.',
  },
  {
    label: 'Office',
    value: `${site.address.line1}, ${site.address.city}`,
    href: undefined,
    icon: 'pin' as const,
    note: `${site.address.line2}, ${site.address.country}`,
  },
  {
    label: 'Opening hours',
    value: site.hours,
    href: undefined,
    icon: 'clock' as const,
    note: 'Visits by arrangement — please book ahead.',
  },
]

useSeo({
  title: 'Contact',
  description:
    'Contact Cross-Love Movement in Tema, Accra — by email, phone, or the enquiry form. We reply within two working days.',
  path: '/contact',
})
</script>

<template>
  <div>
    <PageHero
      eyebrow="Contact"
      title="Say hello. Ask anything."
      description="Whether you want to give, serve, partner, or simply understand the work better — a real person on our small team will answer."
    >
      <BaseButton :href="`mailto:${site.email}`" variant="inverse">
        Email us directly
        <template #icon><Icon name="mail" :size="17" /></template>
      </BaseButton>
      <BaseButton :href="`tel:${site.phoneHref}`" variant="inverseGhost">
        {{ site.phone }}
      </BaseButton>
    </PageHero>

    <section class="container-page py-16 sm:py-20">
      <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <h2 class="text-2xl sm:text-3xl">Reach the office</h2>
          <p class="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-soft">
            Our office is small and busy, but the door is open. Use whichever route is easiest — the
            form goes to the same inbox.
          </p>

          <dl class="mt-8 grid gap-3 sm:grid-cols-2">
            <div
              v-for="detail in details"
              :key="detail.label"
              class="rounded-2xl border border-sand-200 bg-white p-5"
            >
              <dt
                class="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand-600"
              >
                <Icon :name="detail.icon" :size="14" />
                {{ detail.label }}
              </dt>
              <dd class="mt-2 text-sm font-semibold leading-snug text-ink">
                <a
                  v-if="detail.href"
                  :href="detail.href"
                  class="hover:text-brand-700 hover:underline"
                >
                  {{ detail.value }}
                </a>
                <template v-else>{{ detail.value }}</template>
                <span class="mt-1 block text-xs font-normal leading-relaxed text-ink-soft">
                  {{ detail.note }}
                </span>
              </dd>
            </div>
          </dl>

          <!-- Map placeholder -->
          <a
            :href="`https://www.google.com/maps/search/?api=1&query=${mapQuery}`"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative mt-5 flex h-56 items-center justify-center overflow-hidden rounded-3xl border border-brand-800 bg-brand-900"
          >
            <div
              class="absolute inset-0 opacity-15"
              style="
                background-image:
                  linear-gradient(to right, #fdfbf7 1px, transparent 1px),
                  linear-gradient(to bottom, #fdfbf7 1px, transparent 1px);
                background-size: 48px 48px;
              "
              aria-hidden="true"
            />
            <div
              class="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-clay-400/20 blur-2xl"
              aria-hidden="true"
            />
            <div class="relative flex flex-col items-center text-center">
              <span
                class="flex size-12 items-center justify-center rounded-full bg-clay-400 text-ink shadow-lift transition group-hover:-translate-y-1"
              >
                <Icon name="pin" :size="22" />
              </span>
              <p class="mt-4 font-display text-lg text-sand-50">Find us in Tema</p>
              <p class="mt-1 max-w-xs px-6 text-xs leading-relaxed text-sand-200/70">
                {{ site.address.line1 }}, {{ site.address.line2 }}, {{ site.address.city }}
              </p>
              <span class="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-clay-300">
                Open in Google Maps
                <Icon name="arrow-up-right" :size="12" />
              </span>
            </div>
          </a>
        </div>

        <div class="rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
          <h2 class="text-2xl">Send a message</h2>
          <p class="mt-2 text-sm text-ink-soft">
            Tell us what is on your mind. Fields marked
            <span class="text-clay-600">*</span> are required.
          </p>
          <div class="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>

    <section class="border-y border-sand-200 bg-sand-100 py-20 sm:py-24">
      <div class="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          eyebrow="Questions"
          title="Before you write."
          description="Some answers are quicker than a reply."
        />
        <FaqList :items="contactFaqs" />
      </div>
    </section>

    <div class="mt-20 sm:mt-24">
      <CtaBanner
        eyebrow="Visit the work"
        title="Come and see a programme day."
        description="With two weeks’ notice we can host you at a Cross Session, a Power-Point session, or a CSL outreach day. It is the most honest introduction there is."
        primary-label="Arrange a visit"
        primary-to="/contact"
        secondary-label="See our projects"
        secondary-to="/projects"
      />
    </div>
  </div>
</template>
