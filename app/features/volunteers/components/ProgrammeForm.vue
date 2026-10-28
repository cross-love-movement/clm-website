<script setup lang="ts">
import type { Programme, ProgrammeSummary } from '#shared/types/volunteers'
import { PROGRAMME_STATUSES, PROGRAMME_TYPES } from '#shared/types/volunteers'

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    programme?: Programme | ProgrammeSummary | null
  }>(),
  { mode: 'create', programme: null },
)

const form = reactive({
  title: props.programme?.title ?? '',
  slug: props.programme?.slug ?? '',
  type: props.programme?.type ?? 'other',
  status: props.programme?.status ?? 'planned',
  summary: props.programme?.summary ?? '',
  description: (props.programme as Programme | null)?.description ?? '',
  location: props.programme?.location ?? '',
  contentPath: props.programme?.contentPath ?? '',
  startsAt: toLocalInput(props.programme?.startsAt),
  endsAt: toLocalInput(props.programme?.endsAt),
})

const errors = ref<Record<string, string>>({})
const message = ref('')
const submitting = ref(false)
const slugTouched = ref(Boolean(props.programme?.slug))

function toLocalInput(iso?: string | null) {
  if (!iso) return ''
  const date = new Date(iso)
  const offset = date.getTimezoneOffset() * 60_000

  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

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

const typeOptions = PROGRAMME_TYPES.map((type) => ({
  value: type,
  label: programmeTypeLabels[type],
}))

const statusOptions = PROGRAMME_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

const cancelTo = computed(() =>
  props.mode === 'edit' && props.programme
    ? `/admin/programmes/${props.programme.id}`
    : '/admin/programmes',
)

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  errors.value = {}
  message.value = ''

  const body = {
    ...form,
    startsAt: toIso(form.startsAt),
    endsAt: toIso(form.endsAt),
  }

  try {
    const response = await $fetch<{ id: string }>(
      props.mode === 'edit' && props.programme
        ? `/api/admin/programmes/${props.programme.id}`
        : '/api/admin/programmes',
      { method: props.mode === 'edit' ? 'PATCH' : 'POST', body },
    )

    await navigateTo(`/admin/programmes/${response.id}`)
  } catch (caught) {
    const payload = (
      caught as { data?: { data?: { message?: string; errors?: Record<string, string> } } }
    ).data?.data

    errors.value = payload?.errors ?? {}
    message.value = payload?.message ?? 'We could not save that programme. Please check the fields.'
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
        label="Programme title"
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
        v-model="form.type"
        label="Type"
        name="type"
        :options="typeOptions"
        :error="errors.type"
      />
      <SelectField
        v-model="form.status"
        label="Status"
        name="status"
        :options="statusOptions"
        :error="errors.status"
      />
      <TextField
        v-model="form.location"
        label="Location"
        name="location"
        placeholder="Tema, Ghana"
        :error="errors.location"
      />
      <TextField
        v-model="form.contentPath"
        label="Public story path"
        name="contentPath"
        hint="Optional — e.g. /projects/people-like-you"
        :error="errors.contentPath"
      />
      <TextField
        v-model="form.startsAt"
        label="Starts"
        name="startsAt"
        type="datetime-local"
        :error="errors.startsAt"
      />
      <TextField
        v-model="form.endsAt"
        label="Ends"
        name="endsAt"
        type="datetime-local"
        :error="errors.endsAt"
      />
    </div>

    <TextareaField
      v-model="form.summary"
      label="Summary"
      name="summary"
      :rows="3"
      hint="One or two sentences, shown to volunteers."
      :error="errors.summary"
    />

    <TextareaField
      v-model="form.description"
      label="Description"
      name="description"
      :rows="5"
      hint="What the programme is and what volunteers will do."
      :error="errors.description"
    />

    <p v-if="message" class="text-sm font-medium text-red-700">{{ message }}</p>

    <div class="flex flex-wrap items-center gap-4">
      <BaseButton type="submit" size="lg" :disabled="submitting">
        {{ submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create programme' }}
      </BaseButton>
      <NuxtLink :to="cancelTo" class="text-sm font-semibold text-clay-700 hover:text-clay-900">
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>
