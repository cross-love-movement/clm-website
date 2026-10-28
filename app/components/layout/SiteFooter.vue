<script setup lang="ts">
import { isStaffRole, portalPathFor, type SessionUser } from '#shared/types/auth'

const { site, footerNav, socials } = useSite()
const { loggedIn, user } = useUserSession()
const year = new Date().getFullYear()

const accountLink = computed(() => {
  if (!loggedIn.value) return { to: '/login', label: 'Sign in' }

  const role = (user.value as SessionUser | null)?.role

  return {
    to: portalPathFor(role),
    label: isStaffRole(role) ? 'Staff portal' : 'Volunteer portal',
  }
})
</script>

<template>
  <footer class="mt-24 bg-brand-950 text-sand-100">
    <div class="container-page pt-16 pb-10">
      <div class="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div class="lg:col-span-5">
          <NuxtLink to="/" class="flex items-center">
            <BrandLockup :size="46" tile on-dark />
          </NuxtLink>
          <p class="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-sand-200/75">
            {{ site.description }}
          </p>

          <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            <a
              v-for="social in socials"
              :key="social.label"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm font-semibold text-sand-100 transition hover:text-gold-300"
            >
              {{ social.label }}
              <Icon name="arrow-up-right" :size="13" />
            </a>
          </div>
        </div>

        <div v-for="group in footerNav" :key="group.heading" class="lg:col-span-2">
          <h2 class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-300">
            {{ group.heading }}
          </h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in group.links" :key="link.to">
              <NuxtLink
                :to="link.to"
                class="text-sm text-sand-200/80 transition hover:text-sand-50"
              >
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="lg:col-span-3">
          <h2 class="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-gold-300">
            Stay close
          </h2>
          <p class="mt-4 text-sm leading-relaxed text-sand-200/75">
            A short monthly note from the field. No noise.
          </p>
          <div class="mt-4">
            <NewsletterForm />
          </div>

          <div class="mt-8 space-y-2 text-sm text-sand-200/80">
            <a :href="`mailto:${site.email}`" class="flex items-start gap-2 hover:text-sand-50">
              <Icon name="mail" :size="16" class="mt-0.5 shrink-0 text-gold-300" />
              {{ site.email }}
            </a>
            <a :href="`tel:${site.phoneHref}`" class="flex items-start gap-2 hover:text-sand-50">
              <Icon name="phone" :size="16" class="mt-0.5 shrink-0 text-gold-300" />
              {{ site.phone }}
            </a>
            <p class="flex items-start gap-2">
              <Icon name="pin" :size="16" class="mt-0.5 shrink-0 text-gold-300" />
              <span>
                {{ site.address.line1 }}<br />
                {{ site.address.line2 }}<br />
                {{ site.address.city }}, {{ site.address.country }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div
        class="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-sand-200/55 sm:flex-row sm:items-center sm:justify-between"
      >
        <p>© {{ year }} Cross-Love Movement. Registered company limited by guarantee in Ghana.</p>
        <p class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>Registration CG041650523 · TIN C0062926586</span>
          <NuxtLink :to="accountLink.to" class="font-semibold text-sand-100/80 hover:text-sand-50">
            {{ accountLink.label }}
          </NuxtLink>
        </p>
      </div>
    </div>
  </footer>
</template>
