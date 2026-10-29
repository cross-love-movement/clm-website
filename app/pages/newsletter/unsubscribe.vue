<script setup lang="ts">
const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const state = ref<'checking' | 'done' | 'error'>('checking')
const message = ref('')

useSeo({
  title: 'Unsubscribe',
  description: 'Manage your Cross-Love Movement newsletter subscription.',
  path: '/newsletter/unsubscribe',
})

useSeoMeta({ robots: 'noindex, nofollow' })

onMounted(async () => {
  if (!token.value) {
    state.value = 'error'
    message.value =
      'That link is missing its token. Reply to any newsletter and we will remove you.'
    return
  }

  try {
    const result = await $fetch<{ message: string }>('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: { token: token.value },
    })

    message.value = result.message
    state.value = 'done'
  } catch (caught) {
    const payload = (caught as { data?: { data?: { message?: string }; message?: string } }).data

    message.value =
      payload?.data?.message ||
      payload?.message ||
      'We could not process that link. Reply to any newsletter and we will remove you.'
    state.value = 'error'
  }
})
</script>

<template>
  <section class="container-page flex min-h-[60vh] items-center justify-center py-20">
    <div
      class="w-full max-w-lg rounded-4xl border border-sand-200 bg-white p-8 text-center shadow-soft sm:p-10"
    >
      <NuxtLink to="/" class="inline-flex" aria-label="Cross-Love Movement — home">
        <BrandLockup :size="40" />
      </NuxtLink>

      <p class="eyebrow mt-7">Newsletter</p>

      <h1 class="mt-3 text-3xl leading-tight">
        {{ state === 'done' ? 'You are unsubscribed.' : 'Newsletter preferences' }}
      </h1>

      <p v-if="state === 'checking'" class="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
        Removing this address from the monthly note…
      </p>

      <p v-else class="mt-4 text-[0.98rem] leading-relaxed text-ink-soft">
        {{ message }}
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <BaseButton to="/" variant="secondary">Back to the site</BaseButton>
        <BaseButton v-if="state === 'error'" to="/contact">Contact us</BaseButton>
        <BaseButton v-else to="/news">Read the news</BaseButton>
      </div>
    </div>
  </section>
</template>
