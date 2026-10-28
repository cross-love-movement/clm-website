<script setup lang="ts">
const route = useRoute()
const { site } = useSite()
const { loggedIn, fetch: refreshSession } = useUserSession()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

const redirectTo = computed(() => {
  const target = route.query.redirect

  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : ''
})

onMounted(() => {
  if (loggedIn.value) navigateTo(redirectTo.value || '/portal')
})

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  error.value = ''

  try {
    const response = await $fetch<{ redirect: string }>('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    await refreshSession()
    await navigateTo(redirectTo.value || response.redirect)
  } catch (caught) {
    const payload = (caught as { data?: { data?: { message?: string } } }).data?.data
    error.value = payload?.message ?? 'We could not sign you in. Please try again.'
  } finally {
    submitting.value = false
  }
}

useSeo({
  title: 'Sign in',
  description: 'Sign in to the Cross-Love Movement member or staff portal.',
  path: '/login',
})
</script>

<template>
  <section class="container-page flex min-h-[70vh] items-center py-16 sm:py-20">
    <div class="mx-auto w-full max-w-md">
      <p class="eyebrow">Account</p>
      <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Sign in</h1>
      <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
        Members and staff use the same sign-in. You will land in the right portal automatically.
      </p>

      <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
        <TextField
          v-model="email"
          label="Email address"
          name="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
        <TextField
          v-model="password"
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />

        <p v-if="error" class="text-sm font-medium text-red-700">{{ error }}</p>

        <BaseButton type="submit" size="lg" block :disabled="submitting">
          {{ submitting ? 'Signing in…' : 'Sign in' }}
          <template #icon><Icon name="arrow-right" :size="17" /></template>
        </BaseButton>
      </form>

      <p class="mt-6 text-sm text-ink-soft">
        <NuxtLink to="/forgot-password" class="font-semibold text-clay-700 hover:text-clay-900">
          Forgot your password?
        </NuxtLink>
      </p>
      <p class="mt-2 text-sm text-ink-soft">
        Accounts are invite-only. If you need access, write to
        <a :href="`mailto:${site.email}`" class="font-semibold text-clay-700 hover:text-clay-900">
          {{ site.email }}</a
        >.
      </p>
    </div>
  </section>
</template>
