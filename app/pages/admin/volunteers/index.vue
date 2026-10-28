<script setup lang="ts">
import type { VolunteerStatus } from '#shared/types/volunteers'
import { VOLUNTEER_STATUSES } from '#shared/types/volunteers'

definePageMeta({ middleware: ['admin', 'volunteer-manager'], layout: 'admin' })

const {
  data: volunteers,
  error,
  pending,
  refresh,
} = await useFetch<
  {
    id: string
    userId: string | null
    name: string
    email: string
    phone: string
    city: string
    status: VolunteerStatus
    createdAt: string
  }[]
>('/api/admin/volunteers', { key: 'admin-volunteers', default: () => [] })

const search = ref('')
const statusFilter = ref<'all' | VolunteerStatus>('all')

const counts = computed(() => ({
  all: volunteers.value.length,
  applied: volunteers.value.filter((person) => person.status === 'applied').length,
  screening: volunteers.value.filter((person) => person.status === 'screening').length,
  active: volunteers.value.filter((person) => person.status === 'active').length,
}))

const filters = computed(() => [
  { value: 'all' as const, label: 'All', count: counts.value.all },
  { value: 'applied' as const, label: 'Applied', count: counts.value.applied },
  { value: 'screening' as const, label: 'Screening', count: counts.value.screening },
  { value: 'active' as const, label: 'Active', count: counts.value.active },
  {
    value: 'invited' as const,
    label: 'Invited',
    count: volunteers.value.filter((person) => person.status === 'invited').length,
  },
])

const visible = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return volunteers.value.filter((person) => {
    if (statusFilter.value !== 'all' && person.status !== statusFilter.value) return false
    if (!needle) return true

    return [person.name, person.email, person.city].some((value) =>
      value.toLowerCase().includes(needle),
    )
  })
})

useSeo({
  title: 'Volunteers',
  description: 'Manage Cross-Love Movement volunteer applications and placements.',
  path: '/admin/volunteers',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Volunteers</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Applications, safeguarding records, and placements. Approve someone, invite them, then
          assign them to a programme.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
        <BaseButton to="/admin/programmes" variant="secondary" size="sm">Programmes</BaseButton>
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
            statusFilter === option.value
              ? 'border-brand-900 bg-brand-900 text-sand-50'
              : 'border-sand-300 bg-white text-ink-soft hover:border-brand-400 hover:text-ink'
          "
          :aria-pressed="statusFilter === option.value"
          @click="statusFilter = option.value"
        >
          {{ option.label }}
          <span class="ml-1 text-xs font-bold opacity-70">{{ option.count }}</span>
        </button>
      </div>

      <label class="sm:ml-auto sm:w-64">
        <span class="sr-only">Search volunteers</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search name, email, city…"
          class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400 focus:outline-none"
        />
      </label>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load volunteers" class="mt-6">
      <p class="mt-1">{{ error.statusMessage || 'Try refreshing the page.' }}</p>
    </AlertBox>

    <div
      v-else-if="!pending && !visible.length"
      class="mt-6 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-8 text-center text-sm text-ink-soft"
    >
      {{ volunteers.length ? 'No volunteers match that filter.' : 'No applications yet.' }}
    </div>

    <div
      v-else
      class="mt-6 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft"
    >
      <div class="overflow-x-auto">
        <table class="w-full min-w-[48rem] text-left text-sm">
          <thead class="border-b border-sand-200 bg-sand-100">
            <tr class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              <th scope="col" class="px-4 py-3">Volunteer</th>
              <th scope="col" class="px-4 py-3">Status</th>
              <th scope="col" class="px-4 py-3">Based in</th>
              <th scope="col" class="px-4 py-3">Applied</th>
              <th scope="col" class="px-4 py-3"><span class="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-sand-200">
            <tr v-for="person in visible" :key="person.id" class="hover:bg-sand-50">
              <td class="px-4 py-4">
                <NuxtLink
                  :to="`/admin/volunteers/${person.id}`"
                  class="font-semibold text-ink hover:text-clay-700"
                >
                  {{ person.name }}
                </NuxtLink>
                <a
                  :href="`mailto:${person.email}`"
                  class="block text-xs text-clay-700 hover:text-clay-900"
                >
                  {{ person.email }}
                </a>
                <p v-if="person.phone" class="text-xs text-ink-soft">{{ person.phone }}</p>
              </td>
              <td class="px-4 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                  :class="volunteerStatusTone(person.status)"
                >
                  {{ person.status }}
                </span>
              </td>
              <td class="px-4 py-4 text-xs text-ink-soft">{{ person.city || '—' }}</td>
              <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                {{ formatDateShort(person.createdAt) }}
              </td>
              <td class="px-4 py-4 text-right">
                <NuxtLink
                  :to="`/admin/volunteers/${person.id}`"
                  class="text-sm font-semibold text-clay-700 hover:text-clay-900"
                >
                  Open
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <button
      type="button"
      class="mt-6 text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
      :disabled="pending"
      @click="refresh()"
    >
      {{ pending ? 'Refreshing…' : 'Refresh' }}
    </button>
  </section>
</template>
