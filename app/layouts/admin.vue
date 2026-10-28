<script setup lang="ts">
import { hasPermission, type SessionUser } from '#shared/types/auth'

const { user } = useUserSession()

const links = computed(() => {
  const items = [
    { label: 'Overview', to: '/admin' },
    { label: 'Events', to: '/admin/events' },
  ]

  if (hasPermission(user.value as SessionUser | null, 'canManagePeople')) {
    items.push({ label: 'People', to: '/admin/users' })
  }

  if (hasPermission(user.value as SessionUser | null, 'canManageProgrammes')) {
    items.push({ label: 'Programmes', to: '/admin/programmes' })
  }

  if (hasPermission(user.value as SessionUser | null, 'canManageVolunteers')) {
    items.push({ label: 'Volunteers', to: '/admin/volunteers' })
  }

  return items
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-sand-50">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-800 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>

    <PortalHeader label="Staff portal" :links="links" />

    <main id="main" class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-sand-200 bg-white/60">
      <div
        class="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-ink-soft"
      >
        <p>Cross-Love Movement · Staff portal</p>
        <p class="text-ink-soft/70">Registered company limited by guarantee in Ghana</p>
      </div>
    </footer>
  </div>
</template>
