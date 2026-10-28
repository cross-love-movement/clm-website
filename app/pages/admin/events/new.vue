<script setup lang="ts">
import { canEditContent, type SessionUser } from '#shared/types/auth'

definePageMeta({ middleware: 'admin' })

const { user } = useUserSession()
const canEdit = computed(() => canEditContent((user.value as SessionUser | null)?.role))

useSeo({
  title: 'New event',
  description: 'Create a Cross-Love Movement event.',
  path: '/admin/events/new',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-16 sm:py-20">
    <p class="eyebrow">Staff portal</p>

    <div class="mt-3 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 class="text-3xl leading-tight sm:text-4xl">New event</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Save it as a draft first. Publishing puts it on the public calendar and opens
          registration, unless the deadline has already passed.
        </p>
      </div>

      <NuxtLink to="/admin/events" class="text-sm font-semibold text-clay-700 hover:text-clay-900">
        Back to events
      </NuxtLink>
    </div>

    <div v-if="!canEdit" class="mt-8">
      <AlertBox tone="info" title="Read-only access">
        Your role can view events but not create them. Ask an admin if you need editing access.
      </AlertBox>
    </div>

    <div v-else class="mt-8 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
      <EventForm mode="create" />
    </div>
  </section>
</template>
