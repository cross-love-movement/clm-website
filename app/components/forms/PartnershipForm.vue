<script setup lang="ts">
import { partnerTiers } from '~/data/involve'

const { values, errors, message, isSubmitting, isSuccess, submit, reset } = useForm(
  '/api/partnership',
  {
    organisation: '',
    contactName: '',
    email: '',
    phone: '',
    type: '',
    message: '',
    consent: false,
    company: '',
  },
)

const typeOptions = [
  ...partnerTiers.map((tier) => ({ value: tier.name, label: tier.name })),
  { value: 'Not sure yet', label: 'Not sure yet — let’s talk' },
]
</script>

<template>
  <div>
    <AlertBox v-if="isSuccess" tone="success" title="Enquiry received">
      <p class="mt-1">{{ message }}</p>
      <button
        type="button"
        class="mt-3 text-sm font-semibold text-brand-800 underline underline-offset-2"
        @click="reset"
      >
        Send another enquiry
      </button>
    </AlertBox>

    <form v-else novalidate class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-5 sm:grid-cols-2">
        <TextField
          v-model="values.organisation"
          label="Organisation"
          name="organisation"
          autocomplete="organization"
          placeholder="Company, foundation, church, or school"
          required
          :error="errors.organisation"
        />
        <TextField
          v-model="values.contactName"
          label="Your name"
          name="contactName"
          autocomplete="name"
          placeholder="Ama Mensah"
          required
          :error="errors.contactName"
        />
        <TextField
          v-model="values.email"
          label="Work email"
          name="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="you@organisation.org"
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
      </div>

      <SelectField
        v-model="values.type"
        label="What kind of partnership are you considering?"
        name="type"
        :options="typeOptions"
        placeholder="Choose a partnership type"
        required
        :error="errors.type"
      />

      <TextareaField
        v-model="values.message"
        label="Tell us about your goals"
        name="message"
        placeholder="What would you like this partnership to achieve?"
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
          {{ isSubmitting ? 'Sending…' : 'Start the conversation' }}
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
