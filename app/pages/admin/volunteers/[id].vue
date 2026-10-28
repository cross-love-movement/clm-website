<script setup lang="ts">
import type {
  Assignment,
  AssignmentStatus,
  BackgroundCheckStatus,
  Opportunity,
  Programme,
  ProgrammeSummary,
  VolunteerDetail,
  VolunteerStatus,
} from '#shared/types/volunteers'
import {
  ASSIGNMENT_STATUSES,
  BACKGROUND_CHECK_STATUSES,
  VOLUNTEER_STATUSES,
} from '#shared/types/volunteers'

const route = useRoute()
const id = String(route.params.id)

definePageMeta({ middleware: ['admin', 'volunteer-manager'], layout: 'admin' })

const {
  data: volunteer,
  error,
  pending,
  refresh,
} = await useFetch<VolunteerDetail>(`/api/admin/volunteers/${id}`, {
  key: `admin-volunteer-${id}`,
})

const { data: programmes } = await useFetch<ProgrammeSummary[]>('/api/admin/programmes', {
  key: 'admin-programmes',
  default: () => [],
})

const flash = ref<{ tone: 'success' | 'error'; message: string } | null>(null)
const savingStatus = ref(false)
const inviting = ref(false)
const savingSafeguarding = ref(false)

const safeguarding = reactive({
  dateOfBirth: volunteer.value?.dateOfBirth ?? '',
  emergencyContactName: volunteer.value?.emergencyContactName ?? '',
  emergencyContactPhone: volunteer.value?.emergencyContactPhone ?? '',
  backgroundCheckStatus: (volunteer.value?.backgroundCheckStatus ?? 'not_required') as string,
  safeguardingBriefingAt: toDateInput(volunteer.value?.safeguardingBriefingAt),
  notes: volunteer.value?.notes ?? '',
})

function toDateInput(iso?: string | null) {
  return iso ? iso.slice(0, 10) : ''
}

const statusOptions = VOLUNTEER_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

const backgroundOptions = BACKGROUND_CHECK_STATUSES.map((status) => ({
  value: status,
  label: backgroundCheckLabels[status],
}))

async function changeStatus(event: Event) {
  const status = (event.target as HTMLSelectElement).value as VolunteerStatus

  if (savingStatus.value) return

  savingStatus.value = true
  flash.value = null

  try {
    await $fetch(`/api/admin/volunteers/${id}`, { method: 'PATCH', body: { status } })
    flash.value = { tone: 'success', message: `Status changed to ${status}.` }
    await refresh()
  } catch (caught) {
    flash.value = {
      tone: 'error',
      message:
        (caught as { data?: { statusMessage?: string } }).data?.statusMessage ??
        'Could not update.',
    }
    await refresh()
  } finally {
    savingStatus.value = false
  }
}

async function sendInvite() {
  if (inviting.value) return

  inviting.value = true
  flash.value = null

  try {
    const response = await $fetch<{ message: string }>(`/api/admin/volunteers/${id}/invite`, {
      method: 'POST',
    })

    flash.value = { tone: 'success', message: response.message }
    await refresh()
  } catch (caught) {
    flash.value = {
      tone: 'error',
      message:
        (caught as { data?: { statusMessage?: string } }).data?.statusMessage ??
        'Could not invite this volunteer.',
    }
  } finally {
    inviting.value = false
  }
}

async function saveSafeguarding() {
  if (savingSafeguarding.value) return

  savingSafeguarding.value = true
  flash.value = null

  try {
    await $fetch(`/api/admin/volunteers/${id}`, {
      method: 'PATCH',
      body: {
        dateOfBirth: safeguarding.dateOfBirth || null,
        emergencyContactName: safeguarding.emergencyContactName,
        emergencyContactPhone: safeguarding.emergencyContactPhone,
        backgroundCheckStatus: safeguarding.backgroundCheckStatus as BackgroundCheckStatus,
        safeguardingBriefingAt: safeguarding.safeguardingBriefingAt
          ? new Date(`${safeguarding.safeguardingBriefingAt}T00:00:00Z`).toISOString()
          : null,
        notes: safeguarding.notes,
      },
    })

    flash.value = { tone: 'success', message: 'Safeguarding record saved.' }
    await refresh()
  } catch (caught) {
    flash.value = {
      tone: 'error',
      message:
        (caught as { data?: { statusMessage?: string } }).data?.statusMessage ??
        'Could not save the record.',
    }
  } finally {
    savingSafeguarding.value = false
  }
}

/* Assignments --------------------------------------------------------- */

const assignmentForm = reactive({
  programmeId: '',
  opportunityId: 'none',
  roleTitle: '',
  status: 'planned',
  startsOn: '',
  endsOn: '',
  notes: '',
})

const opportunities = ref<Opportunity[]>([])
const loadingOpportunities = ref(false)
const addingAssignment = ref(false)
const assignmentMessage = ref('')

watch(
  () => assignmentForm.programmeId,
  async (programmeId) => {
    assignmentForm.opportunityId = 'none'
    opportunities.value = []

    if (!programmeId) return

    loadingOpportunities.value = true

    try {
      const data = await $fetch<Programme>(`/api/admin/programmes/${programmeId}`)
      opportunities.value = data.opportunities.filter((item) => item.status === 'open')
    } finally {
      loadingOpportunities.value = false
    }
  },
)

const programmeOptions = computed(() =>
  programmes.value.map((programme) => ({ value: programme.id, label: programme.title })),
)

const opportunityOptions = computed(() => [
  { value: 'none', label: 'No specific role' },
  ...opportunities.value.map((opportunity) => ({
    value: opportunity.id,
    label: opportunity.title,
  })),
])

const assignmentStatusOptions = ASSIGNMENT_STATUSES.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}))

async function addAssignment() {
  if (!assignmentForm.programmeId || addingAssignment.value) return

  addingAssignment.value = true
  assignmentMessage.value = ''

  try {
    await $fetch('/api/admin/assignments', {
      method: 'POST',
      body: {
        volunteerId: id,
        programmeId: assignmentForm.programmeId,
        opportunityId:
          assignmentForm.opportunityId === 'none' ? null : assignmentForm.opportunityId,
        roleTitle: assignmentForm.roleTitle,
        status: assignmentForm.status as AssignmentStatus,
        startsOn: assignmentForm.startsOn || null,
        endsOn: assignmentForm.endsOn || null,
        notes: assignmentForm.notes,
      },
    })

    assignmentForm.opportunityId = 'none'
    assignmentForm.roleTitle = ''
    assignmentForm.startsOn = ''
    assignmentForm.endsOn = ''
    assignmentForm.notes = ''
    assignmentForm.status = 'planned'
    await refresh()
  } catch (caught) {
    assignmentMessage.value =
      (caught as { data?: { statusMessage?: string; data?: { message?: string } } }).data?.data
        ?.message ??
      (caught as { data?: { statusMessage?: string } }).data?.statusMessage ??
      'Could not add that assignment.'
  } finally {
    addingAssignment.value = false
  }
}

async function setAssignmentStatus(assignment: Assignment, status: AssignmentStatus) {
  assignmentMessage.value = ''

  try {
    await $fetch(`/api/admin/assignments/${assignment.id}`, {
      method: 'PATCH',
      body: { status },
    })

    await refresh()
  } catch (caught) {
    assignmentMessage.value =
      (caught as { data?: { statusMessage?: string } }).data?.statusMessage ??
      'Could not update the assignment.'
  }
}

useSeo({
  title: volunteer.value ? volunteer.value.name : 'Volunteer',
  description: 'Manage a Cross-Love Movement volunteer.',
  path: `/admin/volunteers/${id}`,
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <NuxtLink to="/admin" class="hover:text-ink">Staff portal</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink to="/admin/volunteers" class="hover:text-ink">Volunteers</NuxtLink>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load this volunteer" class="mt-6">
      <p class="mt-1">{{ error.statusMessage || 'The record may have been removed.' }}</p>
    </AlertBox>

    <div v-else-if="pending && !volunteer" class="mt-6 text-sm text-ink-soft">
      Loading volunteer…
    </div>

    <template v-else-if="volunteer">
      <div class="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
              :class="volunteerStatusTone(volunteer.status)"
            >
              {{ volunteer.status }}
            </span>
            <span v-if="volunteer.userId" class="text-xs font-semibold text-brand-700">
              Account linked
            </span>
          </div>

          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">{{ volunteer.name }}</h1>
          <p class="mt-1 text-sm text-ink-soft">
            <a :href="`mailto:${volunteer.email}`" class="text-clay-700 hover:text-clay-900">
              {{ volunteer.email }}
            </a>
            <span v-if="volunteer.phone"> · {{ volunteer.phone }}</span>
            <span v-if="volunteer.city"> · {{ volunteer.city }}</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <select
            :value="volunteer.status"
            class="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:border-brand-400 focus:outline-none disabled:opacity-60"
            :disabled="savingStatus"
            aria-label="Volunteer status"
            @change="changeStatus"
          >
            <option v-for="status in VOLUNTEER_STATUSES" :key="status" :value="status">
              {{ status }}
            </option>
          </select>

          <BaseButton v-if="!volunteer.userId" size="sm" :disabled="inviting" @click="sendInvite">
            {{ inviting ? 'Sending…' : 'Invite to portal' }}
          </BaseButton>
        </div>
      </div>

      <AlertBox v-if="flash" :tone="flash.tone" class="mt-6">
        <p class="mt-1">{{ flash.message }}</p>
      </AlertBox>

      <div class="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-6">
          <div class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 class="text-xl text-ink">Applications</h2>

            <div v-if="!volunteer.applications.length" class="mt-3 text-sm text-ink-soft">
              No applications recorded.
            </div>

            <div v-else class="mt-4 space-y-4">
              <article
                v-for="application in volunteer.applications"
                :key="application.id"
                class="rounded-2xl border border-sand-200 p-4"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-ink">
                    {{
                      application.opportunityTitle ||
                      application.programmeTitle ||
                      application.area ||
                      'General application'
                    }}
                  </p>
                  <p class="text-xs text-ink-soft">
                    {{ formatDateTime(application.createdAt) }}
                  </p>
                </div>
                <p v-if="application.programmeTitle" class="mt-1 text-xs text-ink-soft">
                  {{ application.programmeTitle }}
                </p>
                <p class="mt-2 text-xs text-ink-soft">
                  Availability: {{ application.availability || '—' }}
                </p>
                <p v-if="application.experience" class="mt-2 text-sm leading-relaxed text-ink-soft">
                  {{ application.experience }}
                </p>
                <p v-if="application.message" class="mt-2 text-sm leading-relaxed text-ink-soft">
                  {{ application.message }}
                </p>
              </article>
            </div>
          </div>

          <div class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 class="text-xl text-ink">Placements</h2>

            <div v-if="!volunteer.assignments.length" class="mt-3 text-sm text-ink-soft">
              Not placed in a programme yet.
            </div>

            <div v-else class="mt-4 space-y-3">
              <article
                v-for="assignment in volunteer.assignments"
                :key="assignment.id"
                class="rounded-2xl border border-sand-200 p-4"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-ink">
                    {{
                      assignment.opportunityTitle ||
                      assignment.roleTitle ||
                      assignment.programmeTitle
                    }}
                  </p>
                  <span
                    class="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                    :class="assignmentStatusTone(assignment.status)"
                  >
                    {{ assignment.status }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-ink-soft">{{ assignment.programmeTitle }}</p>
                <p
                  v-if="assignment.startsOn || assignment.endsOn"
                  class="mt-1 text-xs text-ink-soft"
                >
                  {{ assignment.startsOn || '—' }} → {{ assignment.endsOn || '—' }}
                </p>

                <div class="mt-3 flex flex-wrap gap-3">
                  <button
                    v-if="assignment.status !== 'active'"
                    type="button"
                    class="text-xs font-semibold text-brand-800 hover:text-brand-950"
                    @click="setAssignmentStatus(assignment, 'active')"
                  >
                    Mark active
                  </button>
                  <button
                    v-if="assignment.status !== 'completed'"
                    type="button"
                    class="text-xs font-semibold text-ink-soft hover:text-ink"
                    @click="setAssignmentStatus(assignment, 'completed')"
                  >
                    Complete
                  </button>
                  <button
                    v-if="assignment.status !== 'cancelled'"
                    type="button"
                    class="text-xs font-semibold text-ink-soft hover:text-clay-700"
                    @click="setAssignmentStatus(assignment, 'cancelled')"
                  >
                    Cancel
                  </button>
                </div>
              </article>
            </div>

            <form
              class="mt-6 space-y-4 border-t border-sand-200 pt-5"
              novalidate
              @submit.prevent="addAssignment"
            >
              <h3 class="text-sm font-bold uppercase tracking-[0.12em] text-ink-soft">
                Add a placement
              </h3>

              <div class="grid gap-4 sm:grid-cols-2">
                <SelectField
                  v-model="assignmentForm.programmeId"
                  label="Programme"
                  name="programmeId"
                  :options="programmeOptions"
                  placeholder="Choose a programme"
                  required
                />
                <SelectField
                  v-model="assignmentForm.opportunityId"
                  label="Role"
                  name="opportunityId"
                  :options="opportunityOptions"
                  :placeholder="
                    loadingOpportunities
                      ? 'Loading roles…'
                      : assignmentForm.programmeId
                        ? 'Choose a role (optional)'
                        : 'Choose a programme first'
                  "
                />
                <TextField
                  v-model="assignmentForm.roleTitle"
                  label="Role label"
                  name="roleTitle"
                  placeholder="Optional — e.g. Team lead"
                />
                <SelectField
                  v-model="assignmentForm.status"
                  label="Status"
                  name="status"
                  :options="assignmentStatusOptions"
                />
                <TextField
                  v-model="assignmentForm.startsOn"
                  label="Starts"
                  name="startsOn"
                  type="date"
                />
                <TextField v-model="assignmentForm.endsOn" label="Ends" name="endsOn" type="date" />
              </div>

              <TextareaField v-model="assignmentForm.notes" label="Notes" name="notes" :rows="2" />

              <p v-if="assignmentMessage" class="text-sm font-medium text-red-700">
                {{ assignmentMessage }}
              </p>

              <BaseButton type="submit" :disabled="addingAssignment || !assignmentForm.programmeId">
                {{ addingAssignment ? 'Adding…' : 'Add placement' }}
              </BaseButton>
            </form>
          </div>
        </div>

        <div class="space-y-6">
          <form
            class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
            novalidate
            @submit.prevent="saveSafeguarding"
          >
            <h2 class="text-xl text-ink">Safeguarding & records</h2>

            <div class="mt-4 space-y-4">
              <TextField
                v-model="safeguarding.dateOfBirth"
                label="Date of birth"
                name="dateOfBirth"
                type="date"
              />
              <TextField
                v-model="safeguarding.emergencyContactName"
                label="Emergency contact"
                name="emergencyContactName"
                placeholder="Name"
              />
              <TextField
                v-model="safeguarding.emergencyContactPhone"
                label="Emergency phone"
                name="emergencyContactPhone"
                placeholder="+233…"
              />
              <SelectField
                v-model="safeguarding.backgroundCheckStatus"
                label="Background check"
                name="backgroundCheckStatus"
                :options="backgroundOptions"
              />
              <TextField
                v-model="safeguarding.safeguardingBriefingAt"
                label="Safeguarding briefing"
                name="safeguardingBriefingAt"
                type="date"
                hint="Date the briefing was completed."
              />
              <p class="text-xs text-ink-soft">
                Consent recorded:
                {{
                  volunteer.safeguardingConsentAt
                    ? formatDateTime(volunteer.safeguardingConsentAt)
                    : 'not yet'
                }}
              </p>

              <TextareaField
                v-model="safeguarding.notes"
                label="Internal notes"
                name="notes"
                :rows="4"
              />
            </div>

            <BaseButton type="submit" class="mt-4" :disabled="savingSafeguarding">
              {{ savingSafeguarding ? 'Saving…' : 'Save record' }}
            </BaseButton>
          </form>

          <div class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
            <h2 class="text-xl text-ink">Skills & availability</h2>
            <dl class="mt-4 space-y-2 text-sm">
              <div>
                <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                  Availability
                </dt>
                <dd class="text-ink">{{ volunteer.availability || '—' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Skills</dt>
                <dd class="text-ink">
                  {{ volunteer.skills.length ? volunteer.skills.join(', ') : '—' }}
                </dd>
              </div>
              <div>
                <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                  Experience
                </dt>
                <dd class="text-ink">{{ volunteer.experience || '—' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
