<script setup lang="ts">
import type { Opportunity, Programme } from '#shared/types/volunteers'
import { OPPORTUNITY_STATUSES } from '#shared/types/volunteers'

const route = useRoute()
const id = String(route.params.id)

definePageMeta({ middleware: ['admin', 'programme-manager'], layout: 'admin' })

const {
  data: programme,
  error,
  pending,
  refresh,
} = await useFetch<Programme>(`/api/admin/programmes/${id}`, {
  key: `admin-programme-${id}`,
})

const opportunityForm = reactive({
  title: '',
  commitment: '',
  location: '',
  slots: '',
  requirements: '',
  description: '',
  status: 'open',
})

const opportunityErrors = ref<Record<string, string>>({})
const opportunityMessage = ref('')
const addingOpportunity = ref(false)
const togglingId = ref('')

async function addOpportunity() {
  if (addingOpportunity.value) return

  addingOpportunity.value = true
  opportunityErrors.value = {}
  opportunityMessage.value = ''

  try {
    await $fetch(`/api/admin/programmes/${id}/opportunities`, {
      method: 'POST',
      body: {
        title: opportunityForm.title,
        commitment: opportunityForm.commitment,
        location: opportunityForm.location,
        slots: opportunityForm.slots === '' ? null : Number(opportunityForm.slots),
        requirements: opportunityForm.requirements
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        description: opportunityForm.description,
        status: opportunityForm.status,
      },
    })

    opportunityForm.title = ''
    opportunityForm.commitment = ''
    opportunityForm.location = ''
    opportunityForm.slots = ''
    opportunityForm.requirements = ''
    opportunityForm.description = ''
    opportunityForm.status = 'open'
    await refresh()
  } catch (caught) {
    const payload = (
      caught as { data?: { data?: { message?: string; errors?: Record<string, string> } } }
    ).data?.data

    opportunityErrors.value = payload?.errors ?? {}
    opportunityMessage.value = payload?.message ?? 'We could not add that role.'
  } finally {
    addingOpportunity.value = false
  }
}

async function toggleOpportunity(opportunity: Opportunity) {
  togglingId.value = opportunity.id

  try {
    await $fetch(`/api/admin/opportunities/${opportunity.id}`, {
      method: 'PATCH',
      body: {
        title: opportunity.title,
        description: opportunity.description,
        commitment: opportunity.commitment,
        requirements: opportunity.requirements,
        slots: opportunity.slots,
        location: opportunity.location,
        status: opportunity.status === 'open' ? 'closed' : 'open',
      },
    })

    await refresh()
  } finally {
    togglingId.value = ''
  }
}

const statusOptions = OPPORTUNITY_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

useSeo({
  title: programme.value ? programme.value.title : 'Programme',
  description: 'Manage a Cross-Love Movement volunteer programme.',
  path: `/admin/programmes/${id}`,
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <NuxtLink to="/admin" class="hover:text-ink">Staff portal</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/programmes" class="hover:text-ink">Programmes</NuxtLink>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load this programme" class="mt-6">
      <p class="mt-1">{{ error.statusMessage || 'It may have been removed.' }}</p>
    </AlertBox>

    <div v-else-if="pending && !programme" class="mt-6 text-sm text-ink-soft">
      Loading programme…
    </div>

    <template v-else-if="programme">
      <div class="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
              :class="programmeStatusTone(programme.status)"
            >
              {{ programme.status }}
            </span>
            <span class="text-xs font-semibold text-ink-soft">
              {{ programmeTypeLabels[programme.type] }}
            </span>
          </div>
          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">{{ programme.title }}</h1>
          <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
            {{ programme.summary || 'No summary yet.' }}
          </p>
        </div>

        <NuxtLink
          to="/admin/volunteers"
          class="text-sm font-semibold text-clay-700 hover:text-clay-900"
        >
          All volunteers
        </NuxtLink>
      </div>

      <div class="mt-8 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
        <h2 class="text-xl text-ink">Programme details</h2>
        <div class="mt-5">
          <ProgrammeForm mode="edit" :programme="programme" />
        </div>
      </div>

      <div class="mt-10">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl text-ink">Volunteer roles</h2>
            <p class="mt-1 text-sm text-ink-soft">
              These are the roles volunteers apply for. Closing a role hides it from the public
              form.
            </p>
          </div>
        </div>

        <div
          v-if="!programme.opportunities.length"
          class="mt-5 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-6 text-sm text-ink-soft"
        >
          No roles yet. Add the first one below.
        </div>

        <div v-else class="mt-5 grid gap-4 sm:grid-cols-2">
          <article
            v-for="opportunity in programme.opportunities"
            :key="opportunity.id"
            class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-semibold text-ink">{{ opportunity.title }}</h3>
              <span
                class="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                :class="
                  opportunity.status === 'open'
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-sand-200 text-ink-soft'
                "
              >
                {{ opportunity.status }}
              </span>
            </div>

            <p v-if="opportunity.commitment" class="mt-1 text-xs text-ink-soft">
              {{ opportunity.commitment }}
            </p>
            <p v-if="opportunity.location" class="text-xs text-ink-soft">
              {{ opportunity.location }}
            </p>
            <p class="mt-2 text-sm text-ink-soft">
              {{ opportunity.filled
              }}<template v-if="opportunity.slots !== null"> / {{ opportunity.slots }}</template>
              placed
            </p>

            <ul v-if="opportunity.requirements.length" class="mt-3 space-y-1">
              <li
                v-for="requirement in opportunity.requirements"
                :key="requirement"
                class="text-xs leading-relaxed text-ink-soft"
              >
                · {{ requirement }}
              </li>
            </ul>

            <button
              type="button"
              class="mt-4 text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
              :disabled="togglingId === opportunity.id"
              @click="toggleOpportunity(opportunity)"
            >
              {{
                togglingId === opportunity.id
                  ? 'Saving…'
                  : opportunity.status === 'open'
                    ? 'Close role'
                    : 'Reopen role'
              }}
            </button>
          </article>
        </div>

        <div class="mt-8 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft">
          <h3 class="text-xl text-ink">Add a role</h3>

          <form class="mt-5 space-y-4" novalidate @submit.prevent="addOpportunity">
            <div class="grid gap-4 sm:grid-cols-2">
              <TextField
                v-model="opportunityForm.title"
                label="Role title"
                name="title"
                placeholder="Mentor"
                required
                :error="opportunityErrors.title"
              />
              <TextField
                v-model="opportunityForm.commitment"
                label="Commitment"
                name="commitment"
                placeholder="2–4 hours a month"
                :error="opportunityErrors.commitment"
              />
              <TextField
                v-model="opportunityForm.location"
                label="Location"
                name="location"
                placeholder="Tema or remote"
                :error="opportunityErrors.location"
              />
              <TextField
                v-model="opportunityForm.slots"
                label="Places"
                name="slots"
                type="number"
                inputmode="numeric"
                :min="0"
                hint="Optional. Leave blank for unlimited."
                :error="opportunityErrors.slots"
              />
              <SelectField
                v-model="opportunityForm.status"
                label="Status"
                name="status"
                :options="statusOptions"
                :error="opportunityErrors.status"
              />
              <TextField
                v-model="opportunityForm.requirements"
                label="Requirements"
                name="requirements"
                placeholder="Comma-separated"
                :error="opportunityErrors.requirements"
              />
            </div>

            <TextareaField
              v-model="opportunityForm.description"
              label="Description"
              name="description"
              :rows="3"
              :error="opportunityErrors.description"
            />

            <p v-if="opportunityMessage" class="text-sm font-medium text-red-700">
              {{ opportunityMessage }}
            </p>

            <BaseButton type="submit" :disabled="addingOpportunity">
              {{ addingOpportunity ? 'Adding…' : 'Add role' }}
            </BaseButton>
          </form>
        </div>
      </div>
    </template>
  </section>
</template>
