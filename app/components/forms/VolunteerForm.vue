<script setup lang="ts">
import { volunteerAreas } from '~/data/involve'

const props = defineProps<{ initialArea?: string }>()

const { values, errors, message, isSubmitting, isSuccess, submit, reset } = useForm(
  '/api/volunteer',
  {
    name: '',
    email: '',
    phone: '',
    city: '',
    area: '',
    availability: '',
    experience: '',
    consent: false,
    company: '',
  },
)

const roleOptions = volunteerAreas.map((area) => ({ value: area, label: area }))

watch(
  () => props.initialArea,
  (area) => {
    if (area) values.area = area
  },
  { immediate: true },
)

const availabilityOptions = [
  { value: 'weekdays', label: 'Weekday daytime' },
  { value: 'evenings', label: 'Weekday evenings' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'flexible', label: 'Flexible / varies' },
]
</script>

<template>
  <div>
    <AlertBox v-if="isSuccess" tone="success" title="Application received">
      <p class="mt-1">{{ message }}</p>
      <button
        type="button"
        class="mt-3 text-sm font-semibold text-brand-800 underline underline-offset-2"
        @click="reset"
      >
        Submit another application
      </button>
    </AlertBox>

    <form v-else novalidate class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-5 sm:grid-cols-2">
        <TextField
          v-model="values.name"
          label="Full name"
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
          placeholder="So we can reach you on programme days"
          :error="errors.phone"
        />
        <TextField
          v-model="values.city"
          label="Where are you based?"
          name="city"
          autocomplete="address-level2"
          placeholder="Accra"
          required
          :error="errors.city"
        />
        <SelectField
          v-model="values.area"
          label="Which role interests you?"
          name="area"
          :options="roleOptions"
          placeholder="Choose a role"
          required
          :error="errors.area"
        />
        <SelectField
          v-model="values.availability"
          label="When are you usually free?"
          name="availability"
          :options="availabilityOptions"
          placeholder="Choose availability"
          required
          :error="errors.availability"
        />
      </div>

      <TextareaField
        v-model="values.experience"
        label="Relevant experience or skills"
        name="experience"
        :rows="4"
        placeholder="Optional — music, media, recycling education, outreach, administration…"
        hint="No experience is required for most roles. This just helps us place you well."
        :error="errors.experience"
      />

      <div>
        <label class="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input
            v-model="values.consent"
            name="consent"
            type="checkbox"
            class="mt-0.5 size-4 shrink-0 accent-brand-700"
          />
          <span>
            I agree to be contacted about volunteering and to complete the required safeguarding
            briefing before serving with children or vulnerable adults.
          </span>
        </label>
        <p v-if="errors.consent" class="mt-1.5 text-sm font-medium text-red-700">
          {{ errors.consent }}
        </p>
      </div>

      <p v-if="message && !isSuccess" class="text-sm font-medium text-red-700">{{ message }}</p>

      <div class="flex flex-wrap items-center gap-4">
        <BaseButton type="submit" size="lg" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending…' : 'Apply to volunteer' }}
          <template #icon><Icon name="heart" :size="17" /></template>
        </BaseButton>
        <p class="text-xs text-ink-soft">We respond within two working days.</p>
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
