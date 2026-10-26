<script setup lang="ts">
const { site, primaryNav } = useSite()
const route = useRoute()
const mobileOpen = ref(false)

const isActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`)

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  },
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') mobileOpen.value = false
}

watch(mobileOpen, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => window.addEventListener('keydown', onKeydown))

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-md supports-[backdrop-filter]:bg-sand-50/70"
  >
    <div class="container-page flex h-[4.75rem] items-center justify-between gap-4">
      <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="Cross-Love Movement — home">
        <BrandMark :size="42" />
        <span class="flex flex-col leading-none">
          <span class="font-display text-[1.15rem] font-semibold tracking-tight text-brand-900">
            Cross-Love
          </span>
          <span class="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-clay-600">
            Movement
          </span>
        </span>
      </NuxtLink>

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
        <NuxtLink
          v-for="link in primaryNav"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-3.5 py-2 text-sm font-semibold transition"
          :class="
            isActive(link.to)
              ? 'bg-brand-100/80 text-brand-900'
              : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
          "
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <BaseButton to="/donate" variant="clay" size="sm" class="hidden sm:inline-flex">
          Donate
          <template #icon><Icon name="heart" :size="15" /></template>
        </BaseButton>

        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-full border border-sand-300 text-brand-800 transition hover:bg-sand-100 lg:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-navigation"
          aria-label="Open menu"
          @click="mobileOpen = true"
        >
          <Icon name="menu" :size="20" />
        </button>
      </div>
    </div>

    <Transition name="mobile-nav">
      <div v-if="mobileOpen" class="fixed inset-0 z-50 lg:hidden">
        <div
          class="absolute inset-0 bg-brand-950/45 backdrop-blur-sm"
          @click="mobileOpen = false"
        />

        <div
          id="mobile-navigation"
          class="mobile-nav-panel absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto rounded-b-4xl bg-sand-50 p-5 pb-8 shadow-lift"
        >
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center gap-2.5" @click="mobileOpen = false">
              <BrandMark :size="36" />
              <span class="font-display text-lg font-semibold text-brand-900"
                >Cross-Love Movement</span
              >
            </NuxtLink>
            <button
              type="button"
              class="inline-flex size-10 items-center justify-center rounded-full border border-sand-300 text-brand-800"
              aria-label="Close menu"
              @click="mobileOpen = false"
            >
              <Icon name="close" :size="20" />
            </button>
          </div>

          <nav class="mt-6 flex flex-col" aria-label="Mobile navigation">
            <NuxtLink
              v-for="link in primaryNav"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between border-b border-sand-200 py-3.5 text-lg font-semibold"
              :class="isActive(link.to) ? 'text-brand-700' : 'text-ink'"
              @click="mobileOpen = false"
            >
              {{ link.label }}
              <Icon name="arrow-up-right" :size="18" class="text-brand-500" />
            </NuxtLink>
          </nav>

          <div class="mt-6 flex flex-col gap-2.5">
            <BaseButton to="/donate" variant="clay" size="lg" block @click="mobileOpen = false">
              Donate
            </BaseButton>
            <BaseButton
              to="/volunteer"
              variant="secondary"
              size="lg"
              block
              @click="mobileOpen = false"
            >
              Volunteer with us
            </BaseButton>
          </div>

          <div class="mt-6 space-y-1.5 text-sm text-ink-soft">
            <a :href="`mailto:${site.email}`" class="flex items-center gap-2 font-medium">
              <Icon name="mail" :size="16" class="text-brand-600" />
              {{ site.email }}
            </a>
            <a :href="`tel:${site.phoneHref}`" class="flex items-center gap-2 font-medium">
              <Icon name="phone" :size="16" class="text-brand-600" />
              {{ site.phone }}
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition: opacity 0.2s ease;
}

.mobile-nav-enter-active .mobile-nav-panel,
.mobile-nav-leave-active .mobile-nav-panel {
  transition: transform 0.24s ease;
}

.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
}

.mobile-nav-enter-from .mobile-nav-panel,
.mobile-nav-leave-to .mobile-nav-panel {
  transform: translateY(-10px);
}
</style>
