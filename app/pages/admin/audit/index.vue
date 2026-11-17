<script setup lang="ts">
import { AUDIT_ENTITIES, type AuditEntity, type AuditEntry } from '#shared/types/audit'

definePageMeta({ middleware: ['admin', 'manager'], layout: 'admin' })

const entity = ref<'all' | AuditEntity>('all')
const search = ref('')
const page = ref(1)

const query = computed(() => ({
  page: page.value,
  ...(entity.value === 'all' ? {} : { entity: entity.value }),
  ...(search.value.trim() ? { search: search.value.trim() } : {}),
}))

const { data, pending, refresh } = await useFetch<{
  entries: AuditEntry[]
  page: number
  pageSize: number
  total: number
  pageCount: number
}>('/api/admin/audit', {
  key: 'admin-audit',
  query,
  default: () => ({ entries: [], page: 1, pageSize: 50, total: 0, pageCount: 1 }),
})

// A narrower filter can drop below the current page, so start over at the top.
watch([entity, search], () => {
  page.value = 1
})

watch(query, () => refresh(), { deep: true })

const filters = computed(() => [
  { value: 'all' as const, label: 'Everything' },
  ...AUDIT_ENTITIES.map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1),
  })),
])

function actionTone(action: string) {
  if (action.includes('refund') || action.includes('cancel') || action.includes('delet')) {
    return 'bg-red-50 text-red-700 ring-1 ring-red-200'
  }
  if (action.includes('sent') || action.includes('messaged')) {
    return 'bg-gold-100 text-gold-800'
  }

  return 'bg-sand-200 text-ink-soft'
}

useSeo({
  title: 'Activity',
  description: 'Who changed what in the Cross-Love Movement staff portal.',
  path: '/admin/audit',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Activity</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Every consequential change, newest first: refunds, cancellations, volunteer decisions,
          access changes, and bulk mail. Entries are written by the action itself and cannot be
          edited here.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
        <BaseButton to="/admin/users" variant="secondary" size="sm">People</BaseButton>
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
            entity === option.value
              ? 'border-brand-900 bg-brand-900 text-sand-50'
              : 'border-sand-300 bg-white text-ink-soft hover:border-brand-400 hover:text-ink'
          "
          :aria-pressed="entity === option.value"
          @click="entity = option.value"
        >
          {{ option.label }}
        </button>
      </div>

      <label class="sm:ml-auto sm:w-72">
        <span class="sr-only">Search activity</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search a person, action, or subject…"
          class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/75 focus:border-brand-400 focus:outline-none"
        />
      </label>
    </div>

    <div v-if="pending && !data.entries.length" class="mt-6 text-sm text-ink-soft">
      Loading activity…
    </div>

    <div
      v-else-if="!data.entries.length"
      class="mt-6 rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-10 text-center"
    >
      <Icon name="book" :size="28" class="mx-auto text-clay-600" />
      <h2 class="mt-3 text-lg text-ink">Nothing recorded yet.</h2>
      <p class="mt-2 text-sm text-ink-soft">
        Refunds, cancellations, volunteer decisions, and bulk sends appear here as they happen.
      </p>
    </div>

    <div
      v-else
      class="mt-6 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft"
    >
      <div class="relative overflow-x-auto">
        <table class="w-full min-w-[56rem] text-left text-sm">
          <thead class="border-b border-sand-200 bg-sand-100">
            <tr class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              <th scope="col" class="px-4 py-3">When</th>
              <th scope="col" class="px-4 py-3">Who</th>
              <th scope="col" class="px-4 py-3">What happened</th>
              <th scope="col" class="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-sand-200">
            <tr v-for="entry in data.entries" :key="entry.id" class="align-top hover:bg-sand-50">
              <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                {{ formatDateTime(entry.createdAt) }}
              </td>
              <td class="px-4 py-4">
                <p class="font-semibold text-ink">{{ entry.actorName || 'Removed account' }}</p>
                <p class="text-xs text-ink-soft">{{ entry.actorEmail }}</p>
              </td>
              <td class="px-4 py-4 text-ink">
                {{ entry.summary }}
              </td>
              <td class="whitespace-nowrap px-4 py-4">
                <span
                  class="rounded-full px-2.5 py-1 font-mono text-[0.65rem]"
                  :class="actionTone(entry.action)"
                >
                  {{ entry.action }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <PaginationBar
      :page="data.page"
      :page-size="data.pageSize"
      :total="data.total"
      :page-count="data.pageCount"
      :busy="pending"
      label="Activity"
      @update:page="page = $event"
    />
  </section>
</template>
