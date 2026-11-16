<script setup lang="ts">
import type { AdminRole } from '#shared/types/volunteers'
import { OPPORTUNITY_STATUSES } from '#shared/types/volunteers'

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
    role?: AdminRole | null
  }>(),
  { mode: 'create', role: null },
)

const emit = defineEmits<{ saved: [] }>()

const form = reactive({
  title: props.role?.title ?? '',
  commitment: props.role?.commitment ?? '',
  location: props.role?.location ?? '',
  requirements: props.role?.requirements.join(', ') ?? '',
  description: props.role?.description ?? '',
  status: props.role?.status ?? 'open',
})

const errors = ref<Record<string, string>>({})
const message = ref('')
const submitting = ref(false)

function resetForm() {
  form.title = ''
  form.commitment = ''
  form.location = ''
  form.requirements = ''
  form.description = ''
  form.status = 'open'
  errors.value = {}
}

const statusOptions = OPPORTUNITY_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

async function onSubmit() {
  if (submitting.value) return

  submitting.value = true
  errors.value = {}
  message.value = ''

  const body = {
    title: form.title,
    commitment: form.commitment,
    location: form.location,
    requirements: form.requirements
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    description: form.description,
    status: form.status,
  }

  try {
    if (props.mode === 'edit' && props.role) {
      await $fetch(`/api/admin/opportunities/${props.role.id}`, { method: 'PATCH', body })
      emit('saved')
      return
    }

    await $fetch('/api/admin/opportunities', { method: 'POST', body })

    const created = form.title.trim()
    resetForm()

    // Back to the list with a confirmation, so creating never looks like an edit.
    await navigateTo({ path: '/admin/roles', query: { created } })
  } catch (caught) {
    const payload = (
      caught as { data?: { data?: { message?: string; errors?: Record<string, string> } } }
    ).data?.data

    errors.value = payload?.errors ?? {}
    message.value = payload?.message ?? 'We could not save that role. Please check the fields.'
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
        label="Role title"
        name="title"
        placeholder="Mentor"
        required
        :error="errors.title"
        class="sm:col-span-2"
      />

      <SelectField
        v-model="form.status"
        label="Status"
        name="status"
        :options="statusOptions"
        hint="Closed hides this role on every programme."
        :error="errors.status"
      />

      <TextField
        v-model="form.commitment"
        label="Commitment"
        name="commitment"
        placeholder="2–4 hours a month"
        :error="errors.commitment"
      />

      <TextField
        v-model="form.location"
        label="Location"
        name="location"
        placeholder="Tema or remote"
        :error="errors.location"
      />

      <TextField
        v-model="form.requirements"
        label="Requirements"
        name="requirements"
        placeholder="Comma-separated"
        :error="errors.requirements"
      />
    </div>

    <TextareaField
      v-model="form.description"
      label="Description"
      name="description"
      :rows="5"
      hint="What the volunteer will do, and what support they get."
      :error="errors.description"
    />

    <p v-if="message" class="text-sm font-medium text-red-700">{{ message }}</p>

    <div class="flex flex-wrap items-center gap-4">
      <BaseButton type="submit" size="lg" :disabled="submitting">
        {{ submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create role' }}
      </BaseButton>
      <NuxtLink to="/admin/roles" class="text-sm font-semibold text-clay-700 hover:text-clay-900">
        Cancel
      </NuxtLink>
    </div>
  </form>
</template>
