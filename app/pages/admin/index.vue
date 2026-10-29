<script setup lang="ts">
import { hasPermission, type SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin', layout: 'admin' })

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)
const canManageProgrammes = computed(() => hasPermission(current.value, 'canManageProgrammes'))
const canManageVolunteers = computed(() => hasPermission(current.value, 'canManageVolunteers'))
const canManageNewsletter = computed(() => hasPermission(current.value, 'canManageNewsletter'))

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
      Events, programmes, and volunteers live under their own tabs. People, roles, and access live
      under the People tab.
    </p>

    <div class="mt-10 grid gap-5 sm:grid-cols-2">
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

      <article
        v-if="canManageProgrammes"
        class="flex flex-col rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
      >
        <Icon name="sprout" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">Programmes</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Set up the work volunteers can join and the roles inside each programme.
        </p>
        <BaseButton to="/admin/programmes" variant="secondary" size="sm" class="mt-4 self-start">
          Manage programmes
        </BaseButton>
      </article>

      <article
        v-if="canManageVolunteers"
        class="flex flex-col rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
      >
        <Icon name="users" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">Volunteers</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          Review applications, invite approved volunteers, keep safeguarding records, and place
          people into programmes.
        </p>
        <BaseButton to="/admin/volunteers" variant="secondary" size="sm" class="mt-4 self-start">
          Manage volunteers
        </BaseButton>
      </article>

      <article
        v-if="canManageNewsletter"
        class="flex flex-col rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
      >
        <Icon name="mail" :size="22" class="text-clay-600" />
        <h2 class="mt-3 text-lg text-ink">Newsletter</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">
          See every address collected from the website, remove one at a request, and send the
          monthly note to the subscribed list.
        </p>
        <BaseButton to="/admin/newsletter" variant="secondary" size="sm" class="mt-4 self-start">
          Manage newsletter
        </BaseButton>
      </article>
    </div>
  </section>
</template>
