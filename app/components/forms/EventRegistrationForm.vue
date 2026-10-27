<script setup lang="ts">
const props = defineProps<{ initialEvent?: string }>()

const { upcoming } = await useEvents()

const initialSlug = props.initialEvent || upcoming.value[0]?.slug || ''

const { values, errors, message, isSubmitting, isSuccess, submit, reset } = useForm(
  '/api/events/register',
  {
    eventSlug: initialSlug,
    name: '',
    email: '',
    phone: '',
    attendees: '1',
    notes: '',
    consent: false,
    company: '',
  },
)

watch(
  () => props.initialEvent,
  (slug) => {
    if (slug) values.eventSlug = slug
  },
)

const eventOptions = computed(() =>
  upcoming.value.map((event) => ({
    value: event.slug,
    label: `${event.title} — ${formatEventDate(event.startsAt)}`,
  })),
)

const attendeeOptions = [1, 2, 3, 4, 5, 6].map((count) => ({
  value: String(count),
  label: count === 1 ? 'Just me' : `${count} people`,
}))

const selectedEvent = computed(
  () => upcoming.value.find((event) => event.slug === values.eventSlug) ?? null,
)

const selectedWhen = computed(() => {
  const event = selectedEvent.value
  if (!event) return ''

  return `${formatEventDateLong(event.startsAt)} · ${formatEventTime(event.startsAt, event.endsAt)}`
})
</script>

<template>
  <div>
    <AlertBox v-if="isSuccess" tone="success" title="You are registered">
      <p class="mt-1">{{ message }}</p>
      <button
        type="button"
        class="mt-3 text-sm font-semibold text-brand-800 underline underline-offset-2"
        @click="reset"
      >
        Register someone else
      </button>
    </AlertBox>

    <form v-else novalidate class="space-y-5" @submit.prevent="submit">
      <SelectField
        v-model="values.eventSlug"
        label="Which event?"
        name="eventSlug"
        :options="eventOptions"
        placeholder="Choose an event"
        required
        :error="errors.eventSlug"
      />

      <div v-if="selectedEvent" class="rounded-2xl border border-sand-200 bg-sand-100 p-4">
        <p class="text-sm font-semibold text-ink">{{ selectedWhen }}</p>
        <p class="mt-1 text-sm text-ink-soft">
          {{ selectedEvent.venue }} · {{ selectedEvent.address }}, {{ selectedEvent.city }}
        </p>
      </div>

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
          placeholder="Optional"
          :error="errors.phone"
        />
        <SelectField
          v-model="values.attendees"
          label="How many are coming?"
          name="attendees"
          :options="attendeeOptions"
          placeholder="Choose a number"
          required
          :error="errors.attendees"
        />
      </div>

      <TextareaField
        v-model="values.notes"
        label="Anything we should know?"
        name="notes"
        :rows="3"
        placeholder="Optional — access needs, bringing children, group details…"
        :error="errors.notes"
      />

      <div>
        <label class="flex items-start gap-3 text-sm leading-relaxed text-ink-soft">
          <input
            v-model="values.consent"
            name="consent"
            type="checkbox"
            class="mt-0.5 size-4 shrink-0 accent-clay-600"
          />
          <span>I agree that Cross-Love Movement may contact me about this event.</span>
        </label>
        <p v-if="errors.consent" class="mt-1.5 text-sm font-medium text-red-700">
          {{ errors.consent }}
        </p>
      </div>

      <p v-if="message && !isSuccess" class="text-sm font-medium text-red-700">{{ message }}</p>

      <div class="flex flex-wrap items-center gap-4">
        <BaseButton type="submit" size="lg" :disabled="isSubmitting || !eventOptions.length">
          {{ isSubmitting ? 'Registering…' : 'Register' }}
          <template #icon><Icon name="calendar" :size="17" /></template>
        </BaseButton>
        <p class="text-xs text-ink-soft">We will email a confirmation and a reminder.</p>
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
