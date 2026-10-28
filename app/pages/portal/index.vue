<script setup lang="ts">
import type { SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'auth' })

const { user, clear } = useUserSession()
const current = computed(() => user.value as SessionUser | null)

async function signOut() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  clear()
  await navigateTo('/')
}

useSeo({
  title: 'Member portal',
  description: 'Your Cross-Love Movement account.',
  path: '/portal',
})
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <p class="eyebrow">Member portal</p>
    <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">
      Welcome back, {{ current?.name || 'friend' }}.
    </h1>
    <p class="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
      Your registrations and reference codes will appear here. Event booking is moving onto this
      account system next.
    </p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2">
      <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <h2 class="text-lg text-ink">Your registrations</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Nothing yet. Once you register for an event while signed in, it will be listed here with
          its reference code.
        </p>
        <BaseButton to="/events" variant="secondary" size="sm" class="mt-4">
          See upcoming events
        </BaseButton>
      </article>

      <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <h2 class="text-lg text-ink">Your account</h2>
        <dl class="mt-3 space-y-2 text-sm text-ink-soft">
          <div class="flex justify-between gap-4">
            <dt>Email</dt>
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
