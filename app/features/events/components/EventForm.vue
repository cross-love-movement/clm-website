<script setup lang="ts">
import type { AdminEventDetail } from '#shared/types/content'

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    event?: AdminEventDetail | null
  }>(),
  { mode: 'create', event: null },
)

const form = reactive({
  title: props.event?.title ?? '',
  slug: props.event?.slug ?? '',
  category: props.event?.category ?? 'workshop',
  status: props.event?.status ?? 'draft',
  summary: props.event?.summary ?? '',
  description: props.event?.description ?? '',
  startsAt: toLocalInput(props.event?.startsAt),
  endsAt: toLocalInput(props.event?.endsAt),
  venue: props.event?.venue ?? '',
  address: props.event?.address ?? '',
  city: props.event?.city ?? 'Tema',
  capacity: String(props.event?.capacity ?? 100),
  registrationDeadline: toLocalInput(props.event?.registrationDeadline),
  featured: props.event?.featured ?? false,
  image: props.event?.image ?? '/images/portfolio-stage.svg',
  imageAlt: props.event?.imageAlt ?? '',
})

const errors = ref<Record<string, string>>({})
const message = ref('')
const submitting = ref(false)
const slugTouched = ref(Boolean(props.event?.slug))

function toLocalInput(iso?: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

/**
 * The input value has no zone, so the browser reads it as local time. Send an
 * absolute timestamp instead, otherwise the server would interpret it in its
 * own timezone.
 */
function toIso(value: string) {
  if (!value) return null

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

watch(
  () => form.title,
  (title) => {
    if (!slugTouched.value) form.slug = slugify(title)
  },
)

function onSlugInput() {
  slugTouched.value = true
  form.slug = slugify(form.slug)
}

const categoryOptions = [
  { value: 'session', label: 'Session' },
  { value: 'training', label: 'Training' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'devotion', label: 'Devotion' },
  { value: 'outreach', label: 'Outreach' },
  { value: 'showcase', label: 'Showcase' },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
  { value: 'cancelled', label: 'Cancelled' },
]

const cancelTo = computed(() =>
  props.mode === 'edit' && props.event ? `/admin/events/${props.event.id}` : '/admin/events',
)

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  errors.value = {}
  message.value = ''

  const body = {
    ...form,
    capacity: Number(form.capacity),
    startsAt: toIso(form.startsAt),
    endsAt: toIso(form.endsAt),
    registrationDeadline: toIso(form.registrationDeadline),
  }

  try {
    const response = await $fetch<{ id: string }>(
      props.mode === 'edit' && props.event
        ? `/api/admin/events/${props.event.id}`
        : '/api/admin/events',
      { method: props.mode === 'edit' ? 'PATCH' : 'POST', body },
    )

    await navigateTo(`/admin/events/${response.id}`)
  } catch (caught) {
    const payload = (
      caught as { data?: { data?: { message?: string; errors?: Record<string, string> } } }
    ).data?.data

    errors.value = payload?.errors ?? {}
    message.value = payload?.message ?? 'We could not save that event. Please check the fields.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="onSubmit">
    <div class="grid gap-5 sm:grid-cols-2">
      <TextField
        v-model="form.title"
        label="Event title"
        name="title"
        required
        :error="errors.title"
        class="sm:col-span-2"
      />
      <TextField
        v-model="form.slug"
        label="URL slug"
        name="slug"
        hint="Used in links. Changing it after publishing breaks existing links."
        required
        :error="errors.slug"
        @input="onSlugInput"
      />
      <SelectField
        v-model="form.category"
        label="Type"
        name="category"
        :options="categoryOptions"
        :error="errors.category"
      />
      <SelectField
        v-model="form.status"
        label="Status"
        name="status"
        hint="Setting Cancelled here does not email guests. Use Cancel event on the event page."
        :options="statusOptions"
        :error="errors.status"
      />
      <TextField
        v-model="form.capacity"
        label="Capacity"
        name="capacity"
        type="number"
        inputmode="numeric"
        :min="0"
        required
        :error="errors.capacity"
      />
      <TextField
        v-model="form.startsAt"
        label="Starts"
        name="startsAt"
        type="datetime-local"
        required
        :error="errors.startsAt"
      />
      <TextField
        v-model="form.endsAt"
        label="Ends"
        name="endsAt"
        type="datetime-local"
        required
        :error="errors.endsAt"
      />
      <TextField
        v-model="form.registrationDeadline"
        label="Registration closes"
        name="registrationDeadline"
        type="datetime-local"
        hint="Optional."
        :error="errors.registrationDeadline"
      />
      <TextField v-model="form.venue" label="Venue" name="venue" required :error="errors.venue" />
      <TextField v-model="form.address" label="Address" name="address" :error="errors.address" />
      <TextField v-model="form.city" label="City" name="city" required :error="errors.city" />
    </div>

    <TextareaField
      v-model="form.summary"
      label="Summary"
      name="summary"
      :rows="3"
      hint="One or two sentences, shown on cards and in the carousel."
      required
      :error="errors.summary"
    />

    <TextareaField
      v-model="form.description"
      label="Description"
      name="description"
      :rows="6"
      hint="Markdown. Optional."
      :error="errors.description"
    />

    <div class="grid gap-5 sm:grid-cols-2">
      <TextField
        v-model="form.image"
        label="Image path"
        name="image"
        hint="For example /images/portfolio-stage.svg"
        :error="errors.image"
      />
      <TextField
        v-model="form.imageAlt"
        label="Image description"
        name="imageAlt"
        hint="Describe the image for screen readers."
        :error="errors.imageAlt"
      />
    </div>

    <label class="flex items-start gap-3 text-sm text-ink-soft">
      <input
        v-model="form.featured"
        type="checkbox"
        class="mt-0.5 size-4 shrink-0 accent-clay-600"
      />
      <span>Feature this event on the homepage carousel</span>
    </label>

    <p v-if="message" class="text-sm font-medium text-red-700">{{ message }}</p>

    <div class="flex flex-wrap items-center gap-4">
      <BaseButton type="submit" size="lg" :disabled="submitting">
        {{ submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create event' }}
      </BaseButton>
      <NuxtLink :to="cancelTo" class="text-sm font-semibold text-clay-700 hover:text-clay-900">
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>
