<script setup lang="ts">
import type { SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'volunteer', layout: 'portal' })

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)

useSeo({
  title: 'Volunteer portal',
  description: 'Your Cross-Love Movement account.',
  path: '/portal',
})
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <p class="eyebrow">Volunteer portal</p>
    <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">
      Welcome back, {{ current?.name || 'friend' }}.
    </h1>
    <p class="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
      This is the volunteer account area. Event registration is currently open without an account,
      so your reference code is emailed to you; linking bookings to this account is next.
    </p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2">
      <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <h2 class="text-lg text-ink">Your registrations</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Nothing listed yet. Register for an event from the public calendar — your reference code
          is sent to {{ current?.email }}. Once bookings are tied to accounts, they will appear here
          automatically.
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
      </article>
    </div>
  </section>
</template>
