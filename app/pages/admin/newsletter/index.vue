<script setup lang="ts">
import type { NewsletterSubscriber, NewsletterSummary } from '#shared/types/content'
import { hasPermission, type SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const { user } = useUserSession()
const canManage = computed(() =>
  hasPermission(user.value as SessionUser | null, 'canManageNewsletter'),
)

const { data, error, pending, refresh } = await useFetch<{
  subscribers: NewsletterSubscriber[]
  summary: NewsletterSummary
}>('/api/admin/newsletter', {
  key: 'admin-newsletter',
  default: () => ({
    subscribers: [],
    summary: { subscribed: 0, unsubscribed: 0, total: 0 },
  }),
})

const search = ref('')
const status = ref<'all' | 'subscribed' | 'unsubscribed'>('all')

const filters = computed(() => [
  { value: 'all' as const, label: 'All', count: data.value.summary.total },
  { value: 'subscribed' as const, label: 'Subscribed', count: data.value.summary.subscribed },
  { value: 'unsubscribed' as const, label: 'Unsubscribed', count: data.value.summary.unsubscribed },
])

const visible = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return data.value.subscribers.filter((row) => {
    if (status.value !== 'all' && row.status !== status.value) return false
    if (!needle) return true

    return row.email.toLowerCase().includes(needle)
  })
})

const csvHref = '/api/admin/newsletter?format=csv'

const issue = reactive({ subject: '', body: '' })
const issueErrors = ref<Record<string, string>>({})
const sending = ref(false)
const confirmSend = ref(false)
const actingId = ref('')
const flash = ref<{ tone: 'success' | 'error'; message: string } | null>(null)

function errorMessage(caught: unknown) {
  const payload = (caught as { data?: { statusMessage?: string; message?: string } }).data

  return payload?.statusMessage || payload?.message || 'That did not work. Please try again.'
}

async function sendIssue() {
  if (sending.value) return

  if (!confirmSend.value) {
    confirmSend.value = true
    return
  }

  sending.value = true
  issueErrors.value = {}
  flash.value = null

  try {
    const result = await $fetch<{ recipients: number }>('/api/admin/newsletter/send', {
      method: 'POST',
      body: { subject: issue.subject, body: issue.body },
    })

    flash.value = {
      tone: 'success',
      message: result.recipients
        ? `Issue queued for ${result.recipients} ${
            result.recipients === 1 ? 'subscriber' : 'subscribers'
          }. It goes out within a few minutes.`
        : 'Nobody is subscribed yet, so nothing was sent.',
    }

    if (result.recipients) {
      issue.subject = ''
      issue.body = ''
    }
  } catch (caught) {
    const payload = (caught as { data?: { data?: { errors?: Record<string, string> } } }).data?.data

    issueErrors.value = payload?.errors ?? {}
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    sending.value = false
    confirmSend.value = false
  }
}

async function unsubscribe(row: NewsletterSubscriber) {
  if (actingId.value) return

  actingId.value = row.id
  flash.value = null

  try {
    await $fetch(`/api/admin/newsletter/${row.id}/unsubscribe`, { method: 'POST' })
    flash.value = { tone: 'success', message: `${row.email} is removed from the list.` }
    await refresh()
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    actingId.value = ''
  }
}

useSeo({
  title: 'Newsletter',
  description: 'Manage Cross-Love Movement newsletter subscribers.',
  path: '/admin/newsletter',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <p class="eyebrow">Staff portal</p>

    <div class="mt-3 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 class="text-3xl leading-tight sm:text-4xl">Newsletter</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Every address collected from the website footer. Signups get a confirmation; staff send
          the monthly note from here.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Staff portal</BaseButton>
        <BaseButton v-if="canManage" :href="csvHref" variant="secondary" size="sm">
          Export CSV
          <template #icon><Icon name="download" :size="16" /></template>
        </BaseButton>
      </div>
    </div>

    <div v-if="!canManage" class="mt-8">
      <AlertBox tone="info" title="Read-only access">
        Your role can view this page but not change the list. Ask a superadmin for the Manage
        newsletter permission.
      </AlertBox>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load subscribers" class="mt-8">
      <p class="mt-1">{{ error.statusMessage || 'Try refreshing the page.' }}</p>
    </AlertBox>

    <AlertBox
      v-if="flash"
      :tone="flash.tone"
      :title="flash.tone === 'success' ? 'Updated' : 'Something went wrong'"
      class="mt-6"
    >
      <p class="mt-1">{{ flash.message }}</p>
    </AlertBox>

    <template v-if="canManage">
      <!-- Subscription counts -->
      <dl class="mt-8 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Subscribed</dt>
          <dd class="mt-1.5 text-2xl font-semibold text-ink">{{ data.summary.subscribed }}</dd>
          <dd class="text-sm text-ink-soft">currently receiving the note</dd>
        </div>
        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Unsubscribed</dt>
          <dd class="mt-1.5 text-2xl font-semibold text-ink">{{ data.summary.unsubscribed }}</dd>
          <dd class="text-sm text-ink-soft">kept for the record</dd>
        </div>
        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Total</dt>
          <dd class="mt-1.5 text-2xl font-semibold text-ink">{{ data.summary.total }}</dd>
          <dd class="text-sm text-ink-soft">addresses collected</dd>
        </div>
      </dl>

      <!-- Compose -->
      <div class="mt-10 rounded-3xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-xl text-ink">Send the monthly note</h2>
            <p class="mt-1 text-sm text-ink-soft">
              One email per subscribed address. A blank line starts a new paragraph. Every issue
              carries its own unsubscribe link.
            </p>
          </div>
          <p class="text-sm font-semibold text-ink-soft">
            {{ data.summary.subscribed }}
            {{ data.summary.subscribed === 1 ? 'recipient' : 'recipients' }}
          </p>
        </div>

        <form class="mt-6 space-y-5" novalidate @submit.prevent="sendIssue">
          <TextField
            v-model="issue.subject"
            label="Subject"
            name="subject"
            :maxlength="160"
            :error="issueErrors.subject"
            required
          />

          <TextareaField
            v-model="issue.body"
            label="Issue"
            name="body"
            :rows="10"
            :maxlength="20000"
            hint="Plain text. Links are not made clickable."
            :error="issueErrors.body"
            required
          />

          <div class="flex flex-wrap items-center gap-3">
            <BaseButton type="submit" :disabled="sending || !data.summary.subscribed">
              {{
                sending
                  ? 'Sending…'
                  : confirmSend
                    ? `Confirm send to ${data.summary.subscribed}`
                    : `Send to ${data.summary.subscribed}`
              }}
              <template #icon><Icon name="mail" :size="16" /></template>
            </BaseButton>
            <button
              v-if="confirmSend"
              type="button"
              class="text-sm font-semibold text-ink-soft hover:text-ink"
              :disabled="sending"
              @click="confirmSend = false"
            >
              Keep editing
            </button>
          </div>

          <p v-if="confirmSend" class="text-sm font-semibold text-clay-700">
            This will email {{ data.summary.subscribed }}
            {{ data.summary.subscribed === 1 ? 'person' : 'people' }}. Click once more to send.
          </p>
        </form>
      </div>

      <!-- Subscribers -->
      <div class="mt-12">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2 class="text-2xl text-ink">Subscribers</h2>
          <NuxtLink to="/news" class="text-sm font-semibold text-clay-700 hover:text-clay-900">
            See the public news page
          </NuxtLink>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
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
              <span class="ml-1 text-xs font-bold opacity-70">{{ option.count }}</span>
            </button>
          </div>

          <label class="sm:ml-auto sm:w-64">
            <span class="sr-only">Search subscribers</span>
            <input
              v-model="search"
              type="search"
              placeholder="Search an email address…"
              class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400 focus:outline-none"
            />
          </label>
        </div>

        <div v-if="pending && !data.subscribers.length" class="mt-6 text-sm text-ink-soft">
          Loading subscribers…
        </div>

        <div
          v-else-if="!visible.length"
          class="mt-6 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-8 text-center text-sm text-ink-soft"
        >
          {{
            data.subscribers.length
              ? 'No subscribers match that filter.'
              : 'No one has subscribed yet.'
          }}
        </div>

        <div
          v-else
          class="mt-6 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft"
        >
          <div class="relative overflow-x-auto">
            <table class="w-full min-w-[44rem] text-left text-sm">
              <thead class="border-b border-sand-200 bg-sand-100">
                <tr class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                  <th scope="col" class="px-4 py-3">Email</th>
                  <th scope="col" class="px-4 py-3">Status</th>
                  <th scope="col" class="px-4 py-3">Subscribed</th>
                  <th scope="col" class="px-4 py-3">Source</th>
                  <th scope="col" class="px-4 py-3"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-sand-200">
                <tr
                  v-for="row in visible"
                  :key="row.id"
                  class="align-top hover:bg-sand-50"
                  :class="{ 'opacity-60': row.status === 'unsubscribed' }"
                >
                  <td class="px-4 py-4">
                    <a
                      :href="`mailto:${row.email}`"
                      class="font-semibold text-ink hover:text-clay-700"
                    >
                      {{ row.email }}
                    </a>
                  </td>
                  <td class="whitespace-nowrap px-4 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                      :class="
                        row.status === 'subscribed'
                          ? 'bg-brand-100 text-brand-800'
                          : 'bg-clay-50 text-clay-700 ring-1 ring-clay-200'
                      "
                    >
                      {{ row.status }}
                    </span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                    {{ formatDateTime(row.subscribedAt) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                    {{ row.source }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-4 text-right">
                    <button
                      v-if="row.status === 'subscribed'"
                      type="button"
                      class="text-sm font-semibold text-ink-soft hover:text-clay-700 disabled:opacity-50"
                      :disabled="actingId === row.id"
                      @click="unsubscribe(row)"
                    >
                      {{ actingId === row.id ? 'Removing…' : 'Unsubscribe' }}
                    </button>
                    <span v-else class="text-xs text-ink-soft/70">
                      {{ row.unsubscribedAt ? formatDateTime(row.unsubscribedAt) : 'Removed' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="mt-5 text-xs leading-relaxed text-ink-soft/80">
          Unsubscribed addresses are kept so the history is visible, and are never emailed again. A
          signup for an address that was previously removed puts it back on the list.
        </p>
      </div>
    </template>
  </section>
</template>
