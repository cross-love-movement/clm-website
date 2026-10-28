<script setup lang="ts">
import type { SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin' })

const { user, clear } = useUserSession()
const current = computed(() => user.value as SessionUser | null)

async function signOut() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  clear()
  await navigateTo('/')
}

useSeo({
  title: 'Staff portal',
  description: 'Cross-Love Movement staff portal.',
  path: '/admin',
})
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <p class="eyebrow">Staff portal</p>
    <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">
      Welcome back, {{ current?.name || 'team' }}.
    </h1>
    <p class="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
      Events, registrations, and people will be managed from here. The database and accounts are in
      place; the management screens are next.
    </p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article class="rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-6">
        <Icon name="calendar" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">Events</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Create, publish, and archive events. Registration counts and the waitlist live here.
        </p>
        <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
          Coming next
        </p>
      </article>

      <article class="rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-6">
        <Icon name="users" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">Registrations</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Search by reference, check people in, cancel and release seats, export a spreadsheet.
        </p>
        <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-soft/70">
          Coming next
        </p>
      </article>

      <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <Icon name="shield" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">People</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Invite members and staff, change roles, suspend access. Restricted to admins.
        </p>
        <dl class="mt-3 space-y-1 text-sm text-ink-soft">
          <div class="flex justify-between gap-4">
            <dt>Signed in as</dt>
            <dd class="font-semibold text-ink">{{ current?.email }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt>Role</dt>
            <dd class="font-semibold capitalize text-ink">{{ current?.role }}</dd>
          </div>
        </dl>
        <button
          type="button"
          class="mt-4 text-sm font-semibold text-clay-700 underline underline-offset-2 hover:text-clay-900"
          @click="signOut"
        >
          Sign out
        </button>
      </article>
    </div>
  </section>
</template>
