<script setup lang="ts">
import type { DonationStatus, DonationSummary, DonationTotals } from '#shared/types/donations'

definePageMeta({ middleware: ['admin', 'donation-manager'], layout: 'admin' })

const status = ref<'all' | DonationStatus>('all')
const search = ref('')

const query = computed(() => ({
  ...(status.value === 'all' ? {} : { status: status.value }),
  ...(search.value.trim() ? { search: search.value.trim() } : {}),
}))

const { data, pending, refresh } = await useFetch<{
  donations: DonationSummary[]
  totals: DonationTotals
}>('/api/admin/donations', {
  key: 'admin-donations',
  query,
  default: () => ({
    donations: [],
    totals: { succeededPesewas: 0, succeededCount: 0, pendingCount: 0 },
  }),
})

watch(query, () => refresh(), { deep: true })

const csvHref = computed(() => {
  const params = new URLSearchParams()

  if (status.value !== 'all') params.set('status', status.value)
  if (search.value.trim()) params.set('search', search.value.trim())
  params.set('format', 'csv')

  return `/api/admin/donations?${params.toString()}`
})

const filters = computed(() => [
  { value: 'all' as const, label: 'All' },
  { value: 'succeeded' as const, label: 'Succeeded' },
  { value: 'pending' as const, label: 'Pending' },
  { value: 'failed' as const, label: 'Failed' },
])

function money(pesewas: number, currency = 'GHS') {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(pesewas / 100)
}

function channelLabel(channel: string | null) {
  switch (channel) {
    case 'card':
      return 'Card'
    case 'mobile_money':
      return 'Mobile money'
    case 'bank':
      return 'Bank'
    default:
      return '—'
  }
}

function statusTone(value: DonationStatus) {
  switch (value) {
    case 'succeeded':
      return 'bg-brand-100 text-brand-800'
    case 'pending':
      return 'bg-gold-100 text-gold-800'
    case 'failed':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200'
    default:
      return 'bg-sand-200 text-ink-soft'
  }
}

useSeo({
  title: 'Donations',
  description: 'Gifts received through the website.',
  path: '/admin/donations',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Donations</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Every gift started on the website, with what Paystack confirmed. Paystack settles to the
          organisation's account; its fee is not charged to the donor.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
        <BaseButton :href="csvHref" variant="secondary" size="sm">
          Export CSV
          <template #icon><Icon name="download" :size="16" /></template>
        </BaseButton>
      </div>
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/70">Settled</p>
        <p class="mt-2 font-display text-3xl text-ink">
          {{ money(data.totals.succeededPesewas) }}
        </p>
        <p class="mt-1 text-xs text-ink-soft">
          {{ data.totals.succeededCount }}
          {{ data.totals.succeededCount === 1 ? 'gift' : 'gifts' }}
        </p>
      </div>
      <div class="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/70">Pending</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ data.totals.pendingCount }}</p>
        <p class="mt-1 text-xs text-ink-soft">Not confirmed by Paystack yet</p>
      </div>
      <div class="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/70">Records</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ data.donations.length }}</p>
        <p class="mt-1 text-xs text-ink-soft">In this view</p>
      </div>
    </div>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition"
          :class="
            status === option.value
              ? 'border-brand-900 bg-brand-900 text-sand-50'
              : 'border-sand-300 bg-white text-ink-soft hover:border-brand-400 hover:text-ink'
          "
          :aria-pressed="status === option.value"
          @click="status = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <label class="sm:ml-auto sm:w-72">
        <span class="sr-only">Search donations</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search a donor, email, or reference…"
          class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400 focus:outline-none"
        />
      </label>
    </div>

    <div v-if="pending && !data.donations.length" class="mt-6 text-sm text-ink-soft">
      Loading donations…
    </div>

    <div
      v-else-if="!data.donations.length"
      class="mt-6 rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-10 text-center"
    >
      <Icon name="gift" :size="28" class="mx-auto text-clay-600" />
      <h2 class="mt-3 text-lg text-ink">No gifts yet.</h2>
      <p class="mt-2 text-sm text-ink-soft">
        Payments started on the donate page appear here as soon as Paystack confirms them.
      </p>
    </div>

    <div
      v-else
      class="relative mt-6 overflow-x-auto rounded-3xl border border-sand-200 bg-white shadow-soft"
    >
      <table class="w-full min-w-[52rem] text-left text-sm">
        <thead class="bg-sand-100 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">
          <tr>
            <th scope="col" class="px-4 py-3">Date</th>
            <th scope="col" class="px-4 py-3">Donor</th>
            <th scope="col" class="px-4 py-3">Amount</th>
            <th scope="col" class="px-4 py-3">Frequency</th>
            <th scope="col" class="px-4 py-3">Method</th>
            <th scope="col" class="px-4 py-3">Status</th>
            <th scope="col" class="px-4 py-3">Reference</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-sand-200">
          <tr
            v-for="donation in data.donations"
            :key="donation.id"
            class="align-top hover:bg-sand-50"
          >
            <td class="whitespace-nowrap px-4 py-4 text-ink-soft">
              {{ formatDateShort(donation.paidAt ?? donation.createdAt) }}
            </td>
            <td class="px-4 py-4">
              <p class="font-semibold text-ink">{{ donation.donorName }}</p>
              <p class="text-xs text-ink-soft">{{ donation.donorEmail }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-4 font-semibold text-ink">
              {{ money(donation.amountPesewas, donation.currency) }}
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-ink-soft">
              {{ donation.frequency === 'monthly' ? 'Monthly' : 'One-time' }}
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-ink-soft">
              {{ channelLabel(donation.channel) }}
            </td>
            <td class="whitespace-nowrap px-4 py-4">
              <span
                class="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide"
                :class="statusTone(donation.status)"
              >
                {{ donation.status }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-4 font-mono text-xs text-ink-soft">
              {{ donation.reference }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-5 text-xs leading-relaxed text-ink-soft/80">
      A gift is only marked succeeded from a verified Paystack response, either on the thank-you
      page or by webhook. Monthly renewals arrive with a Paystack reference of their own and are
      recorded the same way.
    </p>
  </section>
</template>
