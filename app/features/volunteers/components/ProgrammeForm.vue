<script setup lang="ts">
import type { Programme, ProgrammeSummary, Role } from '#shared/types/volunteers'
import { PROGRAMME_STATUSES, PROGRAMME_TYPES } from '#shared/types/volunteers'

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    programme?: Programme | ProgrammeSummary | null
    /** The role catalogue the programme can draw from. */
    roles?: Role[]
  }>(),
  { mode: 'create', programme: null, roles: () => [] },
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

/** One row per catalogue role, with the headcount this programme needs. */
const attached = new Map(
  ((props.programme as Programme | null)?.needs ?? []).map((need) => [need.id, need]),
)

const roleRows = ref(
  props.roles.map((role) => {
    const link = attached.get(role.id)

    return {
      id: role.id,
      title: role.title,
      status: role.status,
      selected: Boolean(link),
      places: link?.places === null || link?.places === undefined ? '' : String(link.places),
    }
  }),
)

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
    needs: roleRows.value
      .filter((row) => row.selected)
      .map((row) => ({
        opportunityId: row.id,
        places: row.places === '' ? null : Number(row.places),
      })),
  }

  try {
    const response = await $fetch<{ id: string }>(
      props.mode === 'edit' && props.programme
        ? `/api/admin/programmes/${props.programme.id}`
        : '/api/admin/programmes',
      { method: props.mode === 'edit' ? 'PATCH' : 'POST', body },
    )

    // Editing stays on this page, so the role cards below need the new data.
    if (props.mode === 'edit' && props.programme) {
      await refreshNuxtData(`admin-programme-${props.programme.id}`)
      await navigateTo(`/admin/programmes/${response.id}`)
      return
    }

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

    <fieldset class="rounded-3xl border border-sand-200 bg-sand-100/70 p-5">
      <legend class="px-2 text-sm font-semibold text-ink">Volunteer roles needed</legend>
      <p class="text-sm leading-relaxed text-ink-soft">
        Pick the roles this programme needs and how many people you need in each. Leave the number
        blank for no limit.
      </p>

      <div
        v-if="!roleRows.length"
        class="mt-4 rounded-2xl border border-dashed border-sand-300 bg-white p-4 text-sm text-ink-soft"
      >
        There are no roles in the catalogue yet.
        <NuxtLink
          to="/admin/roles#create-role"
          class="font-semibold text-clay-700 underline underline-offset-2"
        >
          Create a role first</NuxtLink
        >.
      </div>

      <ul v-else class="mt-4 divide-y divide-sand-200 rounded-2xl border border-sand-200 bg-white">
        <li
          v-for="row in roleRows"
          :key="row.id"
          class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <label class="flex flex-1 items-start gap-3">
            <input
              v-model="row.selected"
              type="checkbox"
              class="mt-0.5 size-4 shrink-0 accent-brand-700"
            />
            <span>
              <span class="block text-sm font-semibold text-ink">{{ row.title }}</span>
              <span v-if="row.status === 'closed'" class="text-xs text-ink-soft">
                Closed — hidden publicly even when selected
              </span>
            </span>
          </label>

          <label class="sm:w-44">
            <span class="sr-only">People needed for {{ row.title }}</span>
            <input
              v-model="row.places"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="No limit"
              :disabled="!row.selected"
              class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/75 focus:border-brand-400 focus:outline-none disabled:bg-sand-100 disabled:text-ink-soft/60"
            />
          </label>
        </li>
      </ul>

      <p v-if="errors.roles" class="mt-3 text-sm font-medium text-red-700">{{ errors.roles }}</p>
    </fieldset>

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
