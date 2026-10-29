<script setup lang="ts">
const { values, errors, status, message, isSubmitting, isSuccess, submit } = useForm(
  '/api/newsletter',
  { email: '', company: '' },
)
</script>

<template>
  <div>
    <form v-if="!isSuccess" novalidate @submit.prevent="submit">
      <label for="newsletter-email" class="sr-only">Email address</label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          v-model="values.email"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'newsletter-error' : 'newsletter-note'"
          class="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-sand-50 placeholder:text-sand-200/50 transition focus:border-clay-300 focus:bg-white/15 focus:outline-none focus:ring-4 focus:ring-clay-400/20"
        />
        <BaseButton
          type="submit"
          variant="clay"
          size="sm"
          :disabled="isSubmitting"
          class="shrink-0"
        >
          {{ isSubmitting ? 'Joining…' : 'Join' }}
        </BaseButton>
      </div>

      <p v-if="errors.email" id="newsletter-error" class="mt-2 text-sm text-clay-300">
        {{ errors.email }}
      </p>
      <p v-else-if="status === 'error'" class="mt-2 text-sm text-clay-300">{{ message }}</p>
      <p v-else id="newsletter-note" class="mt-2 text-xs text-sand-200/55">
        One short update a month. Unsubscribe anytime.
      </p>

      <input
        v-model="values.company"
        type="text"
        name="company"
        tabindex="-1"
        autocomplete="off"
        class="hidden"
        aria-hidden="true"
      />
    </form>

    <p v-else role="status" class="text-sm text-sand-100">
      You’re in. Check your inbox for a confirmation — and thank you.
    </p>
  </div>
</template>
