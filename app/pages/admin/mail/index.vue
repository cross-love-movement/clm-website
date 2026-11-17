<script setup lang="ts">
import type { MailMessage, MailStatus, MailSummary } from '#shared/types/mail'

definePageMeta({ middleware: ['admin', 'mail-manager'], layout: 'admin' })

const status = ref<'all' | MailStatus>('all')
const search = ref('')

const query = computed(() => ({
  ...(status.value === 'all' ? {} : { status: status.value }),
  ...(search.value.trim() ? { search: search.value.trim() } : {}),
}))

const { data, pending, refresh } = await useFetch<{
  rows: MailMessage[]
  summary: MailSummary
}>('/api/admin/mail', {
  key: 'admin-mail',
  query,
  default: () => ({
    rows: [],
    summary: { pending: 0, sent: 0, failed: 0 },
  }),
})

watch(query, () => refresh(), { deep: true })

const filters = computed(() => [
  { value: 'all' as const, label: 'All' },
  { value: 'pending' as const, label: 'Pending' },
  { value: 'sent' as const, label: 'Sent' },
  { value: 'failed' as const, label: 'Failed' },
])

const actingId = ref('')
const flash = ref<{ tone: 'success' | 'error'; message: string } | null>(null)

function statusTone(value: MailStatus) {
  switch (value) {
    case 'sent':
      return 'bg-brand-100 text-brand-800'
    case 'pending':
      return 'bg-gold-100 text-gold-800'
    case 'failed':
      return 'bg-red-50 text-red-700 ring-1 ring-red-200'
    default:
      return 'bg-sand-200 text-ink-soft'
  }
}

function kindLabel(kind: string) {
  return kind.replace(/-/g, ' ').replace(/^\w/, (character) => character.toUpperCase())
}

function errorMessage(caught: unknown) {
  const payload = (caught as { data?: { statusMessage?: string; message?: string } }).data

  return payload?.statusMessage || payload?.message || 'That did not work. Please try again.'
}

async function retry(message: MailMessage) {
  if (actingId.value) return

  actingId.value = message.id
  flash.value = null

  try {
    await $fetch(`/api/admin/mail/${message.id}/retry`, { method: 'POST' })
    flash.value = {
      tone: 'success',
      message: `Queued again for ${message.toEmail}. The worker sends it within a few minutes.`,
    }
    await refresh()
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    actingId.value = ''
  }
}

useSeo({
  title: 'Mail outbox',
  description: 'Queued, sent, and failed email from the website.',
  path: '/admin/mail',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Mail outbox</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Every message the website has queued, newest first. A failed row shows the reason from
          Resend and can be sent again. The worker retries pending rows every 20 seconds.
        </p>
      </div>

      <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
    </div>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/80">Pending</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ data.summary.pending }}</p>
        <p class="mt-1 text-xs text-ink-soft">Waiting for the worker</p>
      </div>
      <div class="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/80">Sent</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ data.summary.sent }}</p>
        <p class="mt-1 text-xs text-ink-soft">Accepted by Resend</p>
      </div>
      <div class="rounded-3xl border border-sand-200 bg-white p-5 shadow-soft">
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/80">Failed</p>
        <p class="mt-2 font-display text-3xl text-ink">{{ data.summary.failed }}</p>
        <p class="mt-1 text-xs text-ink-soft">Gave up after five attempts</p>
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
        <span class="sr-only">Search mail</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search a recipient, subject, or kind…"
          class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/75 focus:border-brand-400 focus:outline-none"
        />
      </label>
    </div>

    <AlertBox v-if="flash" :tone="flash.tone" class="mt-6">
      {{ flash.message }}
    </AlertBox>

    <div v-if="pending && !data.rows.length" class="mt-6 text-sm text-ink-soft">
      Loading messages…
    </div>

    <div
      v-else-if="!data.rows.length"
      class="mt-6 rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-10 text-center"
    >
      <Icon name="mail" :size="28" class="mx-auto text-clay-600" />
      <h2 class="mt-3 text-lg text-ink">Nothing queued.</h2>
      <p class="mt-2 text-sm text-ink-soft">
        Form submissions and event messages appear here as soon as they are written to the outbox.
      </p>
    </div>

    <div
      v-else
      class="relative mt-6 overflow-x-auto rounded-3xl border border-sand-200 bg-white shadow-soft"
    >
      <table class="w-full min-w-[64rem] text-left text-sm">
        <thead class="bg-sand-100 text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">
          <tr>
            <th scope="col" class="px-4 py-3">Date</th>
            <th scope="col" class="px-4 py-3">Kind</th>
            <th scope="col" class="px-4 py-3">Recipient</th>
            <th scope="col" class="px-4 py-3">Subject</th>
            <th scope="col" class="px-4 py-3">Status</th>
            <th scope="col" class="px-4 py-3">Tries</th>
            <th scope="col" class="px-4 py-3">Last error</th>
            <th scope="col" class="px-4 py-3"><span class="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-sand-200">
          <tr v-for="message in data.rows" :key="message.id" class="align-top hover:bg-sand-50">
            <td class="whitespace-nowrap px-4 py-4 text-ink-soft">
              {{ formatDateTime(message.sentAt ?? message.createdAt) }}
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-ink-soft">{{ kindLabel(message.kind) }}</td>
            <td class="px-4 py-4">
              <p class="font-semibold text-ink">{{ message.toEmail }}</p>
            </td>
            <td class="px-4 py-4">
              <p class="max-w-[18rem] text-ink">{{ message.subject }}</p>
            </td>
            <td class="whitespace-nowrap px-4 py-4">
              <span
                class="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide"
                :class="statusTone(message.status)"
              >
                {{ message.status }}
              </span>
            </td>
            <td class="whitespace-nowrap px-4 py-4 text-ink-soft">{{ message.attempts }}</td>
            <td class="px-4 py-4">
              <p
                v-if="message.lastError"
                class="max-w-[18rem] truncate text-xs text-red-700"
                :title="message.lastError"
              >
                {{ message.lastError }}
              </p>
              <span v-else class="text-ink-soft/60">—</span>
            </td>
            <td class="whitespace-nowrap px-4 py-4">
              <button
                v-if="message.status !== 'sent'"
                type="button"
                class="rounded-full border border-sand-300 px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-brand-400 hover:text-ink disabled:opacity-50"
                :disabled="actingId === message.id"
                @click="retry(message)"
              >
                {{ actingId === message.id ? 'Queueing…' : 'Retry' }}
              </button>
              <span v-else class="text-ink-soft/60">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="mt-5 text-xs leading-relaxed text-ink-soft/80">
      Retrying clears the attempt count and last error. A message that has already been sent is
      refused, so a retry cannot duplicate a delivery.
    </p>
  </section>
</template>
