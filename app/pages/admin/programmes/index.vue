<script setup lang="ts">
import type { ProgrammeSummary } from '#shared/types/volunteers'

definePageMeta({ middleware: ['admin', 'programme-manager'], layout: 'admin' })

const {
  data: programmes,
  error,
  pending,
  refresh,
} = await useFetch<ProgrammeSummary[]>('/api/admin/programmes', {
  key: 'admin-programmes',
  default: () => [],
})

useSeo({
  title: 'Programmes',
  description: 'Manage Cross-Love Movement volunteer programmes.',
  path: '/admin/programmes',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Programmes</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Set up the work volunteers can join and the roles inside each programme. Volunteers see
          open programmes on the public volunteer page.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
        <BaseButton to="/admin/programmes/new" size="sm">
          New programme
          <template #icon><Icon name="arrow-right" :size="16" /></template>
        </BaseButton>
      </div>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load programmes" class="mt-8">
      <p class="mt-1">{{ error.statusMessage || 'Try refreshing the page.' }}</p>
    </AlertBox>

    <div
      v-else-if="!pending && !programmes.length"
      class="mt-8 rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-10 text-center"
    >
      <Icon name="sprout" :size="28" class="mx-auto text-clay-600" />
      <h2 class="mt-3 text-lg text-ink">No programmes yet.</h2>
      <p class="mt-2 text-sm text-ink-soft">
        Create one, then add the roles volunteers can apply for.
      </p>
      <BaseButton to="/admin/programmes/new" size="sm" class="mt-5">Create a programme</BaseButton>
    </div>

    <div v-else class="mt-8 grid gap-5 lg:grid-cols-2">
      <article
        v-for="programme in programmes"
        :key="programme.id"
        class="flex flex-col rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
            :class="programmeStatusTone(programme.status)"
          >
            {{ programme.status }}
          </span>
          <span class="text-xs font-semibold text-ink-soft">
            {{ programmeTypeLabels[programme.type] }}
          </span>
        </div>

        <h2 class="mt-3 text-xl text-ink">{{ programme.title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          {{ programme.summary || 'No summary yet.' }}
        </p>

        <dl class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft">
          <div v-if="programme.startsAt">
            <dt class="sr-only">Starts</dt>
            <dd>{{ formatDateShort(programme.startsAt) }}</dd>
          </div>
          <div v-if="programme.location">
            <dt class="sr-only">Location</dt>
            <dd>{{ programme.location }}</dd>
          </div>
          <div>
            <dt class="sr-only">Roles</dt>
            <dd>{{ programme.opportunityCount }} roles</dd>
          </div>
          <div>
            <dt class="sr-only">Volunteers</dt>
            <dd>{{ programme.volunteerCount }} placed</dd>
          </div>
        </dl>

        <BaseButton
          :to="`/admin/programmes/${programme.id}`"
          variant="secondary"
          size="sm"
          class="mt-5 self-start"
        >
          Open programme
        </BaseButton>
      </article>
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
