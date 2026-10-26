<script setup lang="ts">
const { values, errors, message, isSubmitting, isSuccess, submit, reset } = useForm(
  '/api/contact',
  {
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
    consent: false,
    company: '',
  },
)

const topics = [
  { value: 'general', label: 'General enquiry' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'donation', label: 'Donations & giving' },
  { value: 'media', label: 'Media & press' },
  { value: 'complaint', label: 'A complaint' },
]
</script>

<template>
  <div>
    <AlertBox v-if="isSuccess" tone="success" title="Message received">
      <p class="mt-1">{{ message }}</p>
      <button
        type="button"
        class="mt-3 text-sm font-semibold text-brand-800 underline underline-offset-2"
        @click="reset"
      >
        Send another message
      </button>
    </AlertBox>

    <form v-else novalidate class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-5 sm:grid-cols-2">
        <TextField
          v-model="values.name"
          label="Your name"
          name="name"
          autocomplete="name"
          placeholder="Ama Mensah"
          required
          :error="errors.name"
        />
        <TextField
          v-model="values.email"
          label="Email address"
          name="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          :error="errors.email"
        />
        <TextField
          v-model="values.phone"
          label="Phone number"
          name="phone"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="Optional"
          :error="errors.phone"
        />
        <SelectField
          v-model="values.topic"
          label="What is this about?"
          name="topic"
          :options="topics"
          placeholder="Choose a topic"
          required
          :error="errors.topic"
        />
      </div>

      <TextareaField
        v-model="values.message"
        label="Your message"
        name="message"
        placeholder="Tell us what is on your mind…"
        required
        :error="errors.message"
      />

      <div>
        <label class="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input
            v-model="values.consent"
            name="consent"
            type="checkbox"
            class="mt-0.5 size-4 shrink-0 accent-brand-700"
          />
          <span>I agree that Cross-Love Movement may contact me about this enquiry.</span>
        </label>
        <p v-if="errors.consent" class="mt-1.5 text-sm font-medium text-red-700">
          {{ errors.consent }}
        </p>
      </div>

      <p v-if="message && !isSuccess" class="text-sm font-medium text-red-700">{{ message }}</p>

      <div class="flex flex-wrap items-center gap-4">
        <BaseButton type="submit" size="lg" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending…' : 'Send message' }}
          <template #icon><Icon name="arrow-right" :size="17" /></template>
        </BaseButton>
        <p class="text-xs text-ink-soft">We reply within two working days.</p>
      </div>

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
  </div>
</template>
