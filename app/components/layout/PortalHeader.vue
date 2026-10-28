<script setup lang="ts">
import type { SessionUser } from '#shared/types/auth'

withDefaults(
  defineProps<{
    label: string
    links?: { label: string; to: string }[]
  }>(),
  { links: () => [] },
)

const route = useRoute()
const { user, clear } = useUserSession()
const current = computed(() => user.value as SessionUser | null)
const signingOut = ref(false)

const initials = computed(() => {
  const name = current.value?.name?.trim()
  if (!name) return '—'

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
})

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'

  return route.path === to || route.path.startsWith(`${to}/`)
}

async function signOut() {
  if (signingOut.value) return

  signingOut.value = true

  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    clear()
    await navigateTo('/')
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-sand-200 bg-white/90 backdrop-blur-md">
    <div class="container-page py-3">
      <div class="flex min-h-10 items-center justify-between gap-4">
        <div class="flex min-w-0 items-center gap-3">
          <NuxtLink to="/" class="flex items-center" aria-label="Cross-Love Movement — home">
            <BrandMark :size="32" class="sm:hidden" />
            <span class="hidden sm:inline-flex">
              <BrandLockup :size="32" />
            </span>
          </NuxtLink>

          <span
            class="rounded-full bg-clay-50 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-clay-800 ring-1 ring-clay-200"
          >
            {{ label }}
          </span>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <span class="hidden items-center gap-2.5 md:flex">
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[0.65rem] font-bold text-brand-800"
              aria-hidden="true"
            >
              {{ initials }}
            </span>
            <span class="leading-tight">
              <span class="block text-sm font-semibold text-ink">{{ current?.name }}</span>
              <span class="block text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-soft">
                {{ current?.role }}
              </span>
            </span>
          </span>

          <NuxtLink
            to="/"
            class="hidden text-sm font-semibold text-ink-soft hover:text-ink sm:inline"
          >
            View site
          </NuxtLink>

          <button
            type="button"
            class="rounded-full border border-sand-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-ink-soft transition hover:border-brand-400 hover:text-ink disabled:opacity-60"
            :disabled="signingOut"
            @click="signOut"
          >
            {{ signingOut ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
      </div>

      <nav
        v-if="links.length"
        class="mt-2 flex gap-1 overflow-x-auto pb-0.5"
        aria-label="Portal navigation"
      >
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition"
          :class="
            isActive(link.to)
              ? 'bg-brand-900 text-sand-50'
              : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
          "
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
