<script setup lang="ts">
import type { SessionUser } from '#shared/types/auth'
import type { Assignment, VolunteerSummary } from '#shared/types/volunteers'

interface PortalResponse {
  volunteer: VolunteerSummary
  assignments: Assignment[]
}

definePageMeta({ middleware: 'volunteer', layout: 'portal' })

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)

const {
  data: portal,
  error,
  pending,
} = await useFetch<PortalResponse | null>('/api/portal/assignments', { key: 'portal-assignments' })

useSeo({
  title: 'Volunteer portal',
  description: 'Your Cross-Love Movement volunteer profile and placements.',
  path: '/portal',
})
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <p class="eyebrow">Volunteer portal</p>
    <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">
      Welcome back, {{ current?.name || 'friend' }}.
    </h1>
    <p class="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
      Your volunteer profile, placements, and account. Event registration is still open without an
      account, so reference codes continue to arrive by email.
    </p>

    <AlertBox v-if="error" tone="error" title="Could not load your volunteer profile" class="mt-8">
      <p class="mt-1">{{ error.statusMessage || 'Try refreshing the page.' }}</p>
    </AlertBox>

    <div v-else-if="pending && !portal" class="mt-8 text-sm text-ink-soft">Loading…</div>

    <div
      v-else-if="!portal"
      class="mt-8 rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
    >
      <h2 class="text-xl text-ink">No volunteer profile linked yet</h2>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        This account is active, but it is not connected to a volunteer application. Send us an
        application and we will link it after review.
      </p>
      <BaseButton to="/volunteer" variant="secondary" size="sm" class="mt-4">
        Apply to volunteer
      </BaseButton>
    </div>

    <template v-else>
      <div class="mt-8 grid gap-5 sm:grid-cols-3">
        <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
          <h2 class="text-lg text-ink">Your profile</h2>
          <dl class="mt-3 space-y-2 text-sm text-ink-soft">
            <div class="flex justify-between gap-4">
              <dt>Status</dt>
              <dd>
                <span
                  class="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                  :class="volunteerStatusTone(portal.volunteer.status)"
                >
                  {{ portal.volunteer.status }}
                </span>
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt>Based in</dt>
              <dd class="font-semibold text-ink">{{ portal.volunteer.city || '—' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt>Email</dt>
              <dd class="font-semibold text-ink">{{ current?.email }}</dd>
            </div>
          </dl>
        </article>

        <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
          <h2 class="text-lg text-ink">Your account</h2>
          <dl class="mt-3 space-y-2 text-sm text-ink-soft">
            <div class="flex justify-between gap-4">
              <dt>Name</dt>
              <dd class="font-semibold text-ink">{{ current?.name }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt>Role</dt>
              <dd class="font-semibold capitalize text-ink">{{ current?.role }}</dd>
            </div>
          </dl>
        </article>

        <article class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
          <h2 class="text-lg text-ink">Events</h2>
          <p class="mt-2 text-sm leading-relaxed text-ink-soft">
            Browse the public calendar. Registration does not need an account.
          </p>
          <BaseButton to="/events" variant="secondary" size="sm" class="mt-4">
            See upcoming events
          </BaseButton>
        </article>
      </div>

      <div class="mt-6 rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <h2 class="text-xl text-ink">Your placements</h2>

        <div v-if="!portal.assignments.length" class="mt-3 text-sm text-ink-soft">
          You are not placed in a programme yet. We will email you when a role opens.
        </div>

        <div v-else class="mt-4 grid gap-4 sm:grid-cols-2">
          <article
            v-for="assignment in portal.assignments"
            :key="assignment.id"
            class="rounded-2xl border border-sand-200 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-semibold text-ink">
                {{
                  assignment.opportunityTitle || assignment.roleTitle || assignment.programmeTitle
                }}
              </h3>
              <span
                class="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                :class="assignmentStatusTone(assignment.status)"
              >
                {{ assignment.status }}
              </span>
            </div>
            <p class="mt-1 text-xs text-ink-soft">{{ assignment.programmeTitle }}</p>
            <p v-if="assignment.startsOn || assignment.endsOn" class="mt-1 text-xs text-ink-soft">
              {{ assignment.startsOn || '—' }} → {{ assignment.endsOn || '—' }}
            </p>
            <p v-if="assignment.notes" class="mt-2 text-sm leading-relaxed text-ink-soft">
              {{ assignment.notes }}
            </p>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>
