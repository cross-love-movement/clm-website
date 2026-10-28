<script setup lang="ts">
const email = ref('')
const message = ref('')
const error = ref('')
const submitting = ref(false)

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  message.value = ''
  error.value = ''

  try {
    const response = await $fetch<{ message: string }>('/api/auth/reset-request', {
      method: 'POST',
      body: { email: email.value },
    })

    message.value = response.message
  } catch (caught) {
    const payload = (caught as { data?: { data?: { message?: string } } }).data?.data
    error.value = payload?.message ?? 'We could not send that just now. Please try again.'
  } finally {
    submitting.value = false
  }
}

useSeo({
  title: 'Reset your password',
  description: 'Request a password reset link for your Cross-Love Movement account.',
  path: '/forgot-password',
})
</script>

<template>
  <section class="container-page flex min-h-[70vh] items-center py-16 sm:py-20">
    <div class="mx-auto w-full max-w-md">
      <p class="eyebrow">Account</p>
      <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Reset your password</h1>
      <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
        Enter the email on your account and we will send a link to choose a new password.
      </p>

      <AlertBox v-if="message" tone="success" title="Check your inbox" class="mt-6">
        <p class="mt-1">{{ message }}</p>
      </AlertBox>

      <form v-else class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
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

        <p v-if="error" class="text-sm font-medium text-red-700">{{ error }}</p>

        <BaseButton type="submit" size="lg" block :disabled="submitting">
          {{ submitting ? 'Sending…' : 'Send reset link' }}
        </BaseButton>
      </form>

      <p class="mt-6 text-sm text-ink-soft">
        <NuxtLink to="/login" class="font-semibold text-clay-700 hover:text-clay-900">
          Back to sign in
        </NuxtLink>
      </p>
    </div>
  </section>
</template>
