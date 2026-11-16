<script setup lang="ts">
import type { PublicRole } from '#shared/types/volunteers'

const props = withDefaults(
  defineProps<{
    /** Pairing id from the public list: a role on a specific programme. */
    initialRoleId?: string
  }>(),
  { initialRoleId: '' },
)

const { data: roles } = await useFetch<PublicRole[]>('/api/volunteer/opportunities', {
  key: 'public-volunteer-roles',
  default: () => [],
})

const { values, errors, message, isSubmitting, isSuccess, submit, reset } = useForm(
  '/api/volunteer',
  {
    name: '',
    email: '',
    phone: '',
    city: '',
    availability: '',
    needId: 'none',
    opportunityId: 'none',
    message: '',
    experience: '',
    consent: false,
    company: '',
  },
)

/** The select binds to the opening id; the API wants the need and role separately. */
const selectedRoleId = ref('none')

const selectedRole = computed(
  () => roles.value.find((role) => role.id === selectedRoleId.value) ?? null,
)

function roleLabel(role: PublicRole) {
  const where = role.eventTitle
    ? `${role.eventTitle}${role.eventStartsAt ? ` · ${formatDateShort(role.eventStartsAt)}` : ''}`
    : (role.programmeTitle ?? 'General volunteer')

  return `${role.title} — ${where}${role.commitment ? ` · ${role.commitment}` : ''}`
}

const roleOptions = computed(() => [
  { value: 'none', label: 'No specific role — place me where I am needed' },
  ...roles.value.map((role) => ({ value: role.id, label: roleLabel(role) })),
])

watch(
  () => props.initialRoleId,
  (roleId) => {
    if (roleId) selectedRoleId.value = roleId
  },
  { immediate: true },
)

async function onSubmit() {
  values.needId = selectedRole.value?.needId ?? 'none'
  values.opportunityId = selectedRole.value?.roleId ?? 'none'

  await submit()
}

function resetForm() {
  selectedRoleId.value = props.initialRoleId || 'none'
  reset()
}

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
        @click="resetForm"
      >
        Submit another application
      </button>
    </AlertBox>

    <form v-else novalidate class="space-y-5" @submit.prevent="onSubmit">
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
          v-model="selectedRoleId"
          label="Role"
          name="role"
          :options="roleOptions"
          hint="Choose a role, or let us place you where you are needed."
          :error="errors.opportunityId"
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
        placeholder="Optional — music, media, mentoring, evangelism, administration…"
        hint="No experience is required for most roles. This just helps us place you well."
        :error="errors.experience"
      />

      <TextareaField
        v-model="values.message"
        label="Anything else we should know?"
        name="message"
        :rows="3"
        placeholder="Optional"
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
