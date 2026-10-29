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
const menuOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)
const menuTrigger = ref<HTMLButtonElement | null>(null)

function onPointerDown(event: PointerEvent) {
  if (!menuOpen.value) return

  const target = event.target as Node | null
  if (target && menuRoot.value && !menuRoot.value.contains(target)) menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !menuOpen.value) return

  menuOpen.value = false
  menuTrigger.value?.focus()
}

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
})

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
  },
)

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
  menuOpen.value = false

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

        <div class="flex items-center gap-2">
          <div ref="menuRoot" class="relative">
            <button
              ref="menuTrigger"
              type="button"
              class="flex items-center gap-2 rounded-full border border-transparent p-1 text-left transition hover:border-sand-200 hover:bg-sand-100/80"
              :aria-expanded="menuOpen"
              aria-controls="user-menu"
              :aria-label="`Account menu for ${current?.name || 'your account'}`"
              @click="menuOpen = !menuOpen"
            >
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[0.65rem] font-bold text-brand-800"
                aria-hidden="true"
              >
                {{ initials }}
              </span>
              <span class="hidden leading-tight md:block">
                <span class="block text-sm font-semibold text-ink">{{ current?.name }}</span>
                <span
                  class="block text-[0.62rem] font-bold uppercase tracking-[0.1em] text-ink-soft"
                >
                  {{ current?.role }}
                </span>
              </span>
              <Icon
                name="chevron-down"
                :size="14"
                class="shrink-0 text-ink-soft/70 transition-transform"
                :class="{ 'rotate-180': menuOpen }"
              />
            </button>

            <Transition name="user-menu">
              <div
                v-if="menuOpen"
                id="user-menu"
                class="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-lift"
              >
                <div class="border-b border-sand-200 px-4 py-3">
                  <p class="truncate text-sm font-semibold text-ink">{{ current?.name }}</p>
                  <p class="truncate text-xs text-ink-soft">{{ current?.email }}</p>
                  <p
                    class="mt-1.5 inline-flex rounded-full bg-clay-50 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-clay-800 ring-1 ring-clay-200"
                  >
                    {{ current?.role }}
                  </p>
                </div>

                <div class="p-1.5">
                  <NuxtLink
                    to="/"
                    class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-sand-100 hover:text-ink"
                    @click="menuOpen = false"
                  >
                    View site
                    <Icon name="arrow-up-right" :size="15" />
                  </NuxtLink>
                  <button
                    type="button"
                    class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
                    :disabled="signingOut"
                    @click="signOut"
                  >
                    {{ signingOut ? 'Signing out…' : 'Sign out' }}
                    <Icon name="logout" :size="15" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>
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

<style scoped>
.user-menu-enter-active,
.user-menu-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.user-menu-enter-from,
.user-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
