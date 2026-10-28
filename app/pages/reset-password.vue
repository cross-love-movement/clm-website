<script setup lang="ts">
const route = useRoute()
const { fetch: refreshSession } = useUserSession()

const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const password = ref('')
const confirmation = ref('')
const error = ref('')
const submitting = ref(false)

async function onSubmit() {
  if (submitting.value) return

  error.value = ''

  if (password.value !== confirmation.value) {
    error.value = 'The two passwords do not match.'
    return
  }

  submitting.value = true

  try {
    const response = await $fetch<{ redirect: string }>('/api/auth/reset-confirm', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })

    await refreshSession()
    await navigateTo(response.redirect)
  } catch (caught) {
    const payload = (caught as { data?: { data?: { message?: string } } }).data?.data
    error.value = payload?.message ?? 'That link has expired or has already been used.'
  } finally {
    submitting.value = false
  }
}

useSeo({
  title: 'Choose a password',
  description: 'Set the password for your Cross-Love Movement account.',
  path: '/reset-password',
})
</script>

<template>
  <section class="container-page flex min-h-[70vh] items-center py-16 sm:py-20">
    <div class="mx-auto w-full max-w-md">
      <p class="eyebrow">Account</p>
      <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Choose a password</h1>
      <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
        Use at least 10 characters. This link works once.
      </p>

      <div v-if="!token" class="mt-6 rounded-2xl border border-sand-200 bg-white p-6">
        <p class="text-sm leading-relaxed text-ink-soft">
          This page needs a token from your email.
          <NuxtLink to="/forgot-password" class="font-semibold text-clay-700 hover:text-clay-900">
            Request a new link</NuxtLink
          >.
        </p>
      </div>

      <form v-else class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
        <TextField
          v-model="password"
          label="New password"
          name="password"
          type="password"
          autocomplete="new-password"
          required
        />
        <TextField
          v-model="confirmation"
          label="Confirm password"
          name="confirmation"
          type="password"
          autocomplete="new-password"
          required
        />

        <p v-if="error" class="text-sm font-medium text-red-700">{{ error }}</p>

        <BaseButton type="submit" size="lg" block :disabled="submitting">
          {{ submitting ? 'Saving…' : 'Save password and sign in' }}
        </BaseButton>
      </form>
    </div>
  </section>
</template>
