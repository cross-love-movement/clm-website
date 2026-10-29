<script setup lang="ts">
import type { AdminEventDetail, AdminRegistration } from '#shared/types/content'
import { hasPermission, type SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)
const canEdit = computed(() => hasPermission(current.value, 'canEdit'))
const canManageRegistrations = computed(() =>
  hasPermission(current.value, 'canManageRegistrations'),
)

const {
  data: event,
  error: eventError,
  pending: eventPending,
  refresh: refreshEvent,
} = await useFetch<AdminEventDetail>(`/api/admin/events/${id}`, {
  key: `admin-event-${id}`,
})

const slug = event.value?.slug ?? ''

const {
  data: registrations,
  error: registrationsError,
  pending: registrationsPending,
  refresh: refreshRegistrations,
} = await useFetch<AdminRegistration[]>('/api/admin/events/registrations', {
  key: `admin-registrations-${id}`,
  query: { event: slug },
  default: () => [],
  immediate: Boolean(slug) && canManageRegistrations.value,
})

const search = ref('')
const status = ref<'all' | AdminRegistration['status']>('all')

const checkedInSeats = computed(() =>
  registrations.value
    .filter((row) => row.status === 'confirmed' && row.checkedInAt)
    .reduce((total, row) => total + row.attendees, 0),
)

const statusCounts = computed(() => ({
  all: registrations.value.length,
  confirmed: registrations.value.filter((row) => row.status === 'confirmed').length,
  waitlisted: registrations.value.filter((row) => row.status === 'waitlisted').length,
  cancelled: registrations.value.filter((row) => row.status === 'cancelled').length,
}))

const visible = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return registrations.value.filter((row) => {
    if (status.value !== 'all' && row.status !== status.value) return false
    if (!needle) return true

    return [row.reference, row.name, row.email, row.phone].some((value) =>
      value.toLowerCase().includes(needle),
    )
  })
})

const csvHref = computed(() => `/api/admin/events/registrations?event=${slug}&format=csv`)

const actingId = ref('')
const confirmCancelId = ref('')
const flash = ref<{ tone: 'success' | 'error'; message: string } | null>(null)

function errorMessage(caught: unknown) {
  const payload = (caught as { data?: { statusMessage?: string; message?: string } }).data

  return payload?.statusMessage || payload?.message || 'That did not work. Please try again.'
}

async function checkIn(row: AdminRegistration) {
  if (actingId.value) return

  actingId.value = row.id
  flash.value = null

  try {
    await $fetch(`/api/admin/events/registrations/${row.id}/check-in`, { method: 'POST' })
    flash.value = { tone: 'success', message: `${row.name} is checked in.` }
    await Promise.all([refreshRegistrations(), refreshEvent()])
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    actingId.value = ''
  }
}

async function cancel(row: AdminRegistration) {
  if (confirmCancelId.value !== row.id) {
    confirmCancelId.value = row.id
    return
  }

  if (actingId.value) return

  actingId.value = row.id
  flash.value = null

  try {
    const result = await $fetch<{ promoted: number }>(`/api/admin/events/registrations/${row.id}`, {
      method: 'DELETE',
    })

    flash.value = {
      tone: 'success',
      message: result.promoted
        ? `${row.name}'s booking is cancelled. ${result.promoted} waitlisted ${
            result.promoted === 1 ? 'guest was' : 'guests were'
          } promoted into the freed ${result.promoted === 1 ? 'place' : 'places'}.`
        : `${row.name}'s booking is cancelled.`,
    }

    await Promise.all([refreshRegistrations(), refreshEvent()])
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    actingId.value = ''
    confirmCancelId.value = ''
  }
}

/* ── Whole-event cancellation ─────────────────────────────────────────── */

const isCancelled = computed(() => event.value?.status === 'cancelled')
const confirmCancelEvent = ref(false)
const cancellingEvent = ref(false)

async function cancelEvent() {
  if (!event.value) return

  if (!confirmCancelEvent.value) {
    confirmCancelEvent.value = true
    return
  }

  if (cancellingEvent.value) return

  cancellingEvent.value = true
  flash.value = null

  try {
    const result = await $fetch<{ notified: number }>(
      `/api/admin/events/${event.value.id}/cancel`,
      {
        method: 'POST',
      },
    )

    flash.value = {
      tone: 'success',
      message: result.notified
        ? `Event cancelled. Every booking was released and ${result.notified} ${
            result.notified === 1 ? 'guest was' : 'guests were'
          } emailed.`
        : 'Event cancelled. There were no guests to email.',
    }

    await Promise.all([refreshEvent(), refreshRegistrations()])
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    cancellingEvent.value = false
    confirmCancelEvent.value = false
  }
}

/* ── Message guests ───────────────────────────────────────────────────── */

const broadcast = reactive({
  subject: '',
  body: '',
  audience: 'confirmed' as 'confirmed' | 'all',
})

const broadcastErrors = ref<Record<string, string>>({})
const sendingMessage = ref(false)

/** One address counts once, matching what the server queues. */
function recipientCount(audience: 'confirmed' | 'all') {
  return new Set(
    registrations.value
      .filter(
        (row) => row.status === 'confirmed' || (audience === 'all' && row.status === 'waitlisted'),
      )
      .map((row) => row.email.trim().toLowerCase()),
  ).size
}

const recipientCounts = computed(() => ({
  confirmed: recipientCount('confirmed'),
  all: recipientCount('all'),
}))

async function sendMessage() {
  if (!event.value || sendingMessage.value) return

  sendingMessage.value = true
  broadcastErrors.value = {}
  flash.value = null

  try {
    const result = await $fetch<{ recipients: number }>(
      `/api/admin/events/${event.value.id}/message`,
      {
        method: 'POST',
        body: {
          subject: broadcast.subject,
          body: broadcast.body,
          audience: broadcast.audience,
        },
      },
    )

    flash.value = {
      tone: 'success',
      message: result.recipients
        ? `Message queued for ${result.recipients} ${
            result.recipients === 1 ? 'guest' : 'guests'
          }. It goes out within a few minutes.`
        : 'No guests matched that audience, so nothing was sent.',
    }

    if (result.recipients) {
      broadcast.subject = ''
      broadcast.body = ''
    }

    await refreshRegistrations()
  } catch (caught) {
    const payload = (caught as { data?: { data?: { errors?: Record<string, string> } } }).data?.data

    broadcastErrors.value = payload?.errors ?? {}
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    sendingMessage.value = false
  }
}

useSeo({
  title: event.value ? event.value.title : 'Event',
  description: 'Manage a Cross-Love Movement event.',
  path: `/admin/events/${id}`,
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <div class="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <NuxtLink to="/admin" class="hover:text-ink">Staff portal</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/events" class="hover:text-ink">Events</NuxtLink>
    </div>

    <AlertBox v-if="eventError" tone="error" title="Could not load this event" class="mt-6">
      <p class="mt-1">{{ eventError.statusMessage || 'The event may have been removed.' }}</p>
      <NuxtLink
        to="/admin/events"
        class="mt-3 inline-block text-sm font-semibold underline underline-offset-2"
      >
        Back to all events
      </NuxtLink>
    </AlertBox>

    <div v-else-if="eventPending && !event" class="mt-6 text-sm text-ink-soft">Loading event…</div>

    <template v-else-if="event">
      <div class="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
              :class="publishTone(event.status)"
            >
              {{ event.status }}
            </span>
            <span
              v-if="event.featured"
              class="rounded-full border border-gold-300 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-gold-700"
            >
              Featured
            </span>
          </div>

          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">{{ event.title }}</h1>
          <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
            {{ event.summary }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <BaseButton v-if="canEdit" :to="`/admin/events/${event.id}/edit`" size="sm">
            Edit event
          </BaseButton>
          <BaseButton v-if="canManageRegistrations" :href="csvHref" variant="secondary" size="sm">
            Export CSV
            <template #icon><Icon name="download" :size="16" /></template>
          </BaseButton>

          <template v-if="canEdit && !isCancelled">
            <button
              v-if="!confirmCancelEvent"
              type="button"
              class="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-50"
              @click="confirmCancelEvent = true"
            >
              Cancel event
            </button>
            <template v-else>
              <button
                type="button"
                class="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
                :disabled="cancellingEvent"
                @click="cancelEvent"
              >
                {{ cancellingEvent ? 'Cancelling…' : 'Confirm cancellation' }}
              </button>
              <button
                type="button"
                class="text-sm font-semibold text-ink-soft hover:text-ink"
                :disabled="cancellingEvent"
                @click="confirmCancelEvent = false"
              >
                Keep event
              </button>
            </template>
          </template>
        </div>
      </div>

      <dl class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">When</dt>
          <dd class="mt-1.5 font-semibold text-ink">{{ formatEventDate(event.startsAt) }}</dd>
          <dd class="text-sm text-ink-soft">
            {{ formatEventTime(event.startsAt, event.endsAt) }}
          </dd>
        </div>

        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Where</dt>
          <dd class="mt-1.5 font-semibold text-ink">{{ event.venue }}</dd>
          <dd class="text-sm text-ink-soft">
            {{ event.address ? `${event.address}, ${event.city}` : event.city }}
          </dd>
        </div>

        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Places taken</dt>
          <dd class="mt-1.5 font-semibold text-ink">
            {{ event.registered }} of {{ event.capacity }}
          </dd>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-200">
            <div
              class="h-full rounded-full bg-clay-500"
              :style="{ width: `${occupancyPercent(event.registered, event.capacity)}%` }"
            />
          </div>
          <dd class="mt-1 text-sm text-ink-soft">
            {{ event.remaining === 0 ? 'Fully booked' : `${event.remaining} left` }}
          </dd>
        </div>

        <div class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
          <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">On the day</dt>
          <dd v-if="canManageRegistrations" class="mt-1.5 font-semibold text-ink">
            {{ checkedInSeats }} checked in
          </dd>
          <dd class="text-sm text-ink-soft">{{ event.waitlisted }} waitlisted</dd>
        </div>
      </dl>

      <p v-if="event.registrationDeadline" class="mt-4 text-sm text-ink-soft">
        Registration {{ isUpcoming(event.registrationDeadline) ? 'closes' : 'closed' }}
        {{ formatDateTime(event.registrationDeadline) }}.
      </p>

      <AlertBox v-if="isCancelled" tone="info" title="This event is cancelled" class="mt-6">
        <p class="mt-1">
          It is hidden from the public calendar and its bookings are released. Set the status back
          to published from the edit page if it is going ahead after all.
        </p>
      </AlertBox>

      <AlertBox v-else-if="confirmCancelEvent" tone="error" title="Cancel this event?" class="mt-6">
        <p class="mt-1">
          It will disappear from the public calendar, every booking will be released, and each guest
          will be emailed the cancellation notice. This cannot be undone from here.
        </p>
      </AlertBox>

      <AlertBox
        v-if="flash"
        :tone="flash.tone"
        :title="flash.tone === 'success' ? 'Updated' : 'Something went wrong'"
        class="mt-6"
      >
        <p class="mt-1">{{ flash.message }}</p>
      </AlertBox>

      <!-- Registrations -->
      <div v-if="canManageRegistrations" class="mt-12">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl text-ink">Registrations</h2>
            <p class="mt-1 text-sm text-ink-soft">
              Search by reference, name, email, or phone. Reference codes are emailed to guests
              only.
            </p>
          </div>

          <NuxtLink
            v-if="!isCancelled"
            :to="`/events?event=${event.slug}`"
            class="text-sm font-semibold text-clay-700 hover:text-clay-900"
          >
            Open registration form
          </NuxtLink>
          <p v-else class="text-sm font-semibold text-ink-soft">Registration closed</p>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in [
                { value: 'all', label: 'All', count: statusCounts.all },
                { value: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
                { value: 'waitlisted', label: 'Waitlist', count: statusCounts.waitlisted },
                { value: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
              ] as const"
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
            <span class="sr-only">Search registrations</span>
            <input
              v-model="search"
              type="search"
              placeholder="Search reference or guest…"
              class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400 focus:outline-none"
            />
          </label>
        </div>

        <AlertBox
          v-if="registrationsError"
          tone="error"
          title="Could not load registrations"
          class="mt-6"
        >
          <p class="mt-1">
            {{ registrationsError.statusMessage || 'Try refreshing the page.' }}
          </p>
        </AlertBox>

        <div
          v-else-if="registrationsPending && !registrations.length"
          class="mt-6 text-sm text-ink-soft"
        >
          Loading registrations…
        </div>

        <div
          v-else-if="!visible.length"
          class="mt-6 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-8 text-center text-sm text-ink-soft"
        >
          {{
            registrations.length
              ? 'No registrations match that filter.'
              : 'No one has registered yet.'
          }}
        </div>

        <div
          v-else
          class="mt-6 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft"
        >
          <div class="relative overflow-x-auto">
            <table class="w-full min-w-[58rem] text-left text-sm">
              <thead class="border-b border-sand-200 bg-sand-100">
                <tr class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                  <th scope="col" class="px-4 py-3">Reference</th>
                  <th scope="col" class="px-4 py-3">Guest</th>
                  <th scope="col" class="px-4 py-3">Party</th>
                  <th scope="col" class="px-4 py-3">Status</th>
                  <th scope="col" class="px-4 py-3">Booked</th>
                  <th scope="col" class="px-4 py-3"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-sand-200">
                <tr
                  v-for="row in visible"
                  :key="row.id"
                  class="align-top hover:bg-sand-50"
                  :class="{ 'opacity-60': row.status === 'cancelled' }"
                >
                  <td class="whitespace-nowrap px-4 py-4">
                    <span class="font-mono text-xs font-semibold text-ink">{{
                      row.reference
                    }}</span>
                  </td>

                  <td class="px-4 py-4">
                    <p class="font-semibold text-ink">{{ row.name }}</p>
                    <a
                      :href="`mailto:${row.email}`"
                      class="text-xs text-clay-700 hover:text-clay-900"
                    >
                      {{ row.email }}
                    </a>
                    <p v-if="row.phone" class="text-xs text-ink-soft">{{ row.phone }}</p>
                    <p v-if="row.notes" class="mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
                      {{ row.notes }}
                    </p>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 font-semibold text-ink">
                    {{ row.attendees }}
                  </td>

                  <td class="whitespace-nowrap px-4 py-4">
                    <span
                      class="inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                      :class="bookingTone(row.status)"
                    >
                      {{ row.status }}
                    </span>
                    <p v-if="row.checkedInAt" class="mt-1 text-xs font-semibold text-brand-700">
                      Checked in
                    </p>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                    {{ formatDateTime(row.createdAt) }}
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 text-right">
                    <div
                      v-if="row.status !== 'cancelled'"
                      class="flex flex-wrap items-center justify-end gap-3"
                    >
                      <button
                        v-if="row.status === 'confirmed' && !row.checkedInAt"
                        type="button"
                        class="text-sm font-semibold text-brand-800 hover:text-brand-950 disabled:opacity-50"
                        :disabled="actingId === row.id"
                        @click="checkIn(row)"
                      >
                        {{ actingId === row.id ? 'Working…' : 'Check in' }}
                      </button>

                      <template v-if="confirmCancelId === row.id">
                        <button
                          type="button"
                          class="text-sm font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
                          :disabled="actingId === row.id"
                          @click="cancel(row)"
                        >
                          {{ actingId === row.id ? 'Cancelling…' : 'Confirm cancel' }}
                        </button>
                        <button
                          type="button"
                          class="text-sm font-semibold text-ink-soft hover:text-ink"
                          :disabled="actingId === row.id"
                          @click="confirmCancelId = ''"
                        >
                          Keep
                        </button>
                      </template>
                      <button
                        v-else
                        type="button"
                        class="text-sm font-semibold text-ink-soft hover:text-clay-700"
                        :disabled="actingId === row.id"
                        @click="cancel(row)"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p class="mt-5 text-xs leading-relaxed text-ink-soft/80">
          Cancelling frees the seats immediately and promotes waitlisted guests in the order they
          joined. They receive an email automatically.
        </p>

        <!-- Message guests -->
        <div
          v-if="recipientCounts.all > 0"
          id="message"
          class="mt-12 scroll-mt-24 rounded-3xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8"
        >
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 class="text-xl text-ink">Message guests</h3>
              <p class="mt-1 text-sm text-ink-soft">
                Sends one email per address on this event. A blank line starts a new paragraph.
              </p>
            </div>
            <p class="text-sm font-semibold text-ink-soft">
              {{ recipientCounts[broadcast.audience] }}
              {{ recipientCounts[broadcast.audience] === 1 ? 'recipient' : 'recipients' }}
            </p>
          </div>

          <form class="mt-6 space-y-5" novalidate @submit.prevent="sendMessage">
            <fieldset>
              <legend class="text-sm font-semibold text-ink">Who should receive it?</legend>
              <div class="mt-2.5 grid gap-2 sm:grid-cols-2">
                <button
                  v-for="option in [
                    {
                      value: 'confirmed',
                      label: 'Confirmed guests',
                      count: recipientCounts.confirmed,
                    },
                    { value: 'all', label: 'Confirmed and waitlist', count: recipientCounts.all },
                  ] as const"
                  :key="option.value"
                  type="button"
                  class="rounded-2xl border p-4 text-left transition"
                  :class="
                    broadcast.audience === option.value
                      ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20'
                      : 'border-sand-300 bg-white hover:border-brand-300'
                  "
                  :aria-pressed="broadcast.audience === option.value"
                  @click="broadcast.audience = option.value"
                >
                  <span class="block text-sm font-semibold text-ink">{{ option.label }}</span>
                  <span class="mt-0.5 block text-xs text-ink-soft">
                    {{ option.count }} {{ option.count === 1 ? 'email' : 'emails' }}
                  </span>
                </button>
              </div>
            </fieldset>

            <TextField
              v-model="broadcast.subject"
              label="Subject"
              name="subject"
              :maxlength="160"
              :error="broadcastErrors.subject"
              required
            />

            <TextareaField
              v-model="broadcast.body"
              label="Message"
              name="body"
              :rows="6"
              :maxlength="10000"
              hint="Plain text. Links are not made clickable."
              :error="broadcastErrors.body"
              required
            />

            <div class="flex flex-wrap items-center gap-4">
              <BaseButton
                type="submit"
                :disabled="sendingMessage || !recipientCounts[broadcast.audience]"
              >
                {{ sendingMessage ? 'Sending…' : `Send to ${recipientCounts[broadcast.audience]}` }}
                <template #icon><Icon name="mail" :size="16" /></template>
              </BaseButton>
              <p class="text-xs text-ink-soft">
                Queued immediately, delivered within a few minutes.
              </p>
            </div>
          </form>
        </div>
      </div>

      <div
        v-else
        class="mt-12 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-6 text-sm text-ink-soft"
      >
        Your account can view this event but not its registrations. Ask a superadmin if you need
        access.
      </div>
    </template>
  </section>
</template>
