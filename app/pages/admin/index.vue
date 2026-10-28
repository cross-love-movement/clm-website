<script setup lang="ts">
import type { SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)

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
      Events and their registrations live under the Events tab. People, roles, and access live under
      the People tab. Volunteer and project records come next.
    </p>

    <div class="mt-10 max-w-md">
      <article class="flex flex-col rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <Icon name="calendar" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">Events</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Create, publish, and archive events. Registration counts, check-in, the waitlist, and CSV
          export live inside each event.
        </p>
        <BaseButton to="/admin/events" variant="secondary" size="sm" class="mt-4 self-start">
          Manage events
        </BaseButton>
      </article>
    </div>
  </section>
</template>
