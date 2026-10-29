<script setup lang="ts">
import {
  INVITABLE_ROLES,
  PERMISSIONS,
  USER_ROLES,
  defaultPermissions,
  type AdminUser,
  type Permission,
  type SessionUser,
  type UserRole,
  type UserStatus,
} from '#shared/types/auth'

definePageMeta({ middleware: ['admin', 'manager'], layout: 'admin' })

const { user } = useUserSession()
const current = computed(() => user.value as SessionUser | null)
const isSuperadmin = computed(() => current.value?.role === 'superadmin')

const {
  data: people,
  error,
  pending,
  refresh,
} = await useFetch<AdminUser[]>('/api/admin/users', {
  key: 'admin-users',
  default: () => [],
})

const search = ref('')
const statusFilter = ref<'all' | UserStatus>('all')

const counts = computed(() => ({
  all: people.value.length,
  staff: people.value.filter((person) => person.role !== 'volunteer').length,
  volunteers: people.value.filter((person) => person.role === 'volunteer').length,
  invited: people.value.filter((person) => person.status === 'invited').length,
}))

const filters = computed(() => [
  { value: 'all' as const, label: 'All', count: counts.value.all },
  {
    value: 'active' as const,
    label: 'Active',
    count: people.value.filter((person) => person.status === 'active').length,
  },
  { value: 'invited' as const, label: 'Invited', count: counts.value.invited },
  {
    value: 'suspended' as const,
    label: 'Suspended',
    count: people.value.filter((person) => person.status === 'suspended').length,
  },
])

const visible = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return people.value.filter((person) => {
    if (statusFilter.value !== 'all' && person.status !== statusFilter.value) return false
    if (!needle) return true

    return [person.name, person.email].some((value) => value.toLowerCase().includes(needle))
  })
})

const assignableRoles = computed(() => {
  const roles: UserRole[] = isSuperadmin.value ? [...INVITABLE_ROLES] : ['volunteer']

  return roles.map((role) => ({ value: role, label: userRoleLabel(role) }))
})

/* Invite -------------------------------------------------------------- */

const inviteValues = reactive({
  name: '',
  email: '',
  role: 'volunteer',
  permissions: [] as Permission[],
})
const inviteErrors = ref<Record<string, string>>({})
const inviteFeedback = ref<{ tone: 'success' | 'error'; message: string } | null>(null)
const inviting = ref(false)

watch(
  () => inviteValues.role,
  (role) => {
    inviteValues.permissions = role === 'admin' ? defaultPermissions('admin') : []
  },
)

async function sendInvite() {
  if (inviting.value) return

  inviting.value = true
  inviteErrors.value = {}
  inviteFeedback.value = null

  try {
    const response = await $fetch<{ message: string }>('/api/admin/users/invite', {
      method: 'POST',
      body: inviteValues,
    })

    inviteFeedback.value = { tone: 'success', message: response.message }
    inviteValues.name = ''
    inviteValues.email = ''
    inviteValues.role = 'volunteer'
    inviteValues.permissions = []
    await refresh()
  } catch (caught) {
    const payload = (
      caught as { data?: { data?: { message?: string; errors?: Record<string, string> } } }
    ).data?.data

    inviteErrors.value = payload?.errors ?? {}
    inviteFeedback.value = {
      tone: 'error',
      message: payload?.message ?? 'We could not send that invite. Please try again.',
    }
  } finally {
    inviting.value = false
  }
}

/* Role and status changes --------------------------------------------- */

const savingId = ref('')
const flash = ref<{ tone: 'success' | 'error'; message: string } | null>(null)

function errorMessage(caught: unknown) {
  const payload = (caught as { data?: { statusMessage?: string; message?: string } }).data

  return payload?.statusMessage || payload?.message || 'That did not work. Please try again.'
}

async function patchPerson(
  person: AdminUser,
  body: { role?: UserRole; status?: UserStatus; permissions?: Permission[] },
  success: string,
) {
  if (savingId.value) return

  savingId.value = person.id
  flash.value = null

  try {
    await $fetch(`/api/admin/users/${person.id}`, { method: 'PATCH', body })
    flash.value = { tone: 'success', message: success }
    await refresh()
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
    // Re-read so a controlled select snaps back to the stored value.
    await refresh()
  } finally {
    savingId.value = ''
  }
}

function onRoleChange(person: AdminUser, event: Event) {
  const value = (event.target as HTMLSelectElement).value as UserRole

  if (value === person.role) return

  const permissions = value === 'admin' ? defaultPermissions('admin') : []

  patchPerson(
    person,
    { role: value, permissions },
    `${person.name} is now ${userRoleLabel(value)}.`,
  )
}

function toggleStatus(person: AdminUser) {
  const next: UserStatus = person.status === 'suspended' ? 'active' : 'suspended'

  patchPerson(
    person,
    { status: next },
    next === 'suspended'
      ? `${person.name} is suspended and can no longer sign in.`
      : `${person.name} can sign in again.`,
  )
}

async function resendInvite(person: AdminUser) {
  if (savingId.value) return

  savingId.value = person.id
  flash.value = null

  try {
    const response = await $fetch<{ message: string }>('/api/admin/users/invite', {
      method: 'POST',
      body: {
        name: person.name,
        email: person.email,
        role: person.role,
        permissions: person.permissions,
      },
    })

    flash.value = { tone: 'success', message: response.message }
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    savingId.value = ''
  }
}

useSeo({
  title: 'People',
  description: 'Manage Cross-Love Movement accounts.',
  path: '/admin/users',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">People</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Invite volunteers and staff, assign what they can do, and suspend access. Accounts are
          invite-only.
        </p>
      </div>

      <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
    </div>

    <div class="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <h2 class="text-xl text-ink">Invite someone</h2>
        <p class="mt-1.5 text-sm leading-relaxed text-ink-soft">
          They receive an email with a link to set their password. Invites expire after seven days.
        </p>

        <form class="mt-5 space-y-4" novalidate @submit.prevent="sendInvite">
          <TextField
            v-model="inviteValues.name"
            label="Full name"
            name="name"
            autocomplete="off"
            placeholder="Ama Mensah"
            required
            :error="inviteErrors.name"
          />
          <TextField
            v-model="inviteValues.email"
            label="Email address"
            name="email"
            type="email"
            inputmode="email"
            autocomplete="off"
            placeholder="you@example.com"
            required
            :error="inviteErrors.email"
          />
          <SelectField
            v-model="inviteValues.role"
            label="Role"
            name="role"
            :options="assignableRoles"
            required
            :error="inviteErrors.role"
          />

          <fieldset
            v-if="inviteValues.role === 'admin'"
            class="rounded-2xl border border-sand-200 bg-sand-50 p-4"
          >
            <legend class="px-1 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Permissions
            </legend>
            <div class="mt-2 space-y-2">
              <label
                v-for="permission in PERMISSIONS"
                :key="permission"
                class="flex items-start gap-2.5 text-sm text-ink-soft"
              >
                <input
                  v-model="inviteValues.permissions"
                  type="checkbox"
                  :value="permission"
                  class="mt-0.5 size-4 shrink-0 accent-clay-600"
                />
                <span>{{ permissionLabel(permission) }}</span>
              </label>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-ink-soft/80">
              Admins start with all three. Uncheck anything they should not do.
            </p>
          </fieldset>

          <p v-if="!isSuperadmin" class="text-xs leading-relaxed text-ink-soft">
            Admins with people access can invite volunteers. A superadmin is needed to invite staff
            or change roles.
          </p>

          <BaseButton type="submit" :disabled="inviting">
            {{ inviting ? 'Sending invite…' : 'Send invite' }}
          </BaseButton>
        </form>

        <AlertBox
          v-if="inviteFeedback"
          :tone="inviteFeedback.tone"
          :title="inviteFeedback.tone === 'success' ? 'Invite sent' : 'Could not invite'"
          class="mt-5"
        >
          <p class="mt-1">{{ inviteFeedback.message }}</p>
        </AlertBox>
      </div>

      <div class="rounded-3xl border border-sand-200 bg-white p-6 shadow-soft">
        <h2 class="text-xl text-ink">What each role can do</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div>
            <dt class="font-semibold text-ink">Superadmin</dt>
            <dd class="text-ink-soft">
              Everything, plus changing roles, permissions, and suspending accounts.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-ink">Admin</dt>
            <dd class="text-ink-soft">
              Staff portal, with the permissions chosen at invite: edit events, manage
              registrations, manage people, and send the newsletter.
            </dd>
          </div>
          <div>
            <dt class="font-semibold text-ink">Volunteer</dt>
            <dd class="text-ink-soft">
              Account only, no staff access. Volunteers will be invited after an application is
              approved; their portal is on hold.
            </dd>
          </div>
        </dl>
      </div>
    </div>

    <div class="mt-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="text-2xl text-ink">Everyone</h2>
          <p class="mt-1 text-sm text-ink-soft">
            {{ counts.staff }} staff · {{ counts.volunteers }} volunteers · {{ counts.invited }}
            pending invites
          </p>
        </div>

        <button
          type="button"
          class="text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
          :disabled="pending"
          @click="refresh()"
        >
          {{ pending ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in filters"
            :key="option.value"
            type="button"
            class="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition"
            :class="
              statusFilter === option.value
                ? 'border-brand-900 bg-brand-900 text-sand-50'
                : 'border-sand-300 bg-white text-ink-soft hover:border-brand-400 hover:text-ink'
            "
            :aria-pressed="statusFilter === option.value"
            @click="statusFilter = option.value"
          >
            {{ option.label }}
            <span class="ml-1 text-xs font-bold opacity-70">{{ option.count }}</span>
          </button>
        </div>

        <label class="sm:ml-auto sm:w-64">
          <span class="sr-only">Search people</span>
          <input
            v-model="search"
            type="search"
            placeholder="Search name or email…"
            class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand-400 focus:outline-none"
          />
        </label>
      </div>

      <AlertBox v-if="flash" :tone="flash.tone" class="mt-5">
        <p class="mt-1">{{ flash.message }}</p>
      </AlertBox>

      <AlertBox v-if="error" tone="error" title="Could not load people" class="mt-5">
        <p class="mt-1">{{ error.statusMessage || 'Try refreshing the page.' }}</p>
      </AlertBox>

      <div
        v-else-if="!pending && !visible.length"
        class="mt-5 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-8 text-center text-sm text-ink-soft"
      >
        {{ people.length ? 'No accounts match that filter.' : 'No accounts yet.' }}
      </div>

      <div
        v-else
        class="mt-5 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-soft"
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-[62rem] text-left text-sm">
            <thead class="border-b border-sand-200 bg-sand-100">
              <tr class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                <th scope="col" class="px-4 py-3">Person</th>
                <th scope="col" class="px-4 py-3">Role</th>
                <th scope="col" class="px-4 py-3">Permissions</th>
                <th scope="col" class="px-4 py-3">Status</th>
                <th scope="col" class="px-4 py-3">Last sign-in</th>
                <th scope="col" class="px-4 py-3">Joined</th>
                <th scope="col" class="px-4 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-sand-200">
              <tr v-for="person in visible" :key="person.id" class="align-top hover:bg-sand-50">
                <td class="px-4 py-4">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="font-semibold text-ink">{{ person.name }}</p>
                    <span
                      v-if="person.id === current?.id"
                      class="rounded-full bg-sand-200 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-ink-soft"
                    >
                      You
                    </span>
                  </div>
                  <a
                    :href="`mailto:${person.email}`"
                    class="text-xs text-clay-700 hover:text-clay-900"
                  >
                    {{ person.email }}
                  </a>
                </td>

                <td class="px-4 py-4">
                  <select
                    v-if="isSuperadmin && person.id !== current?.id"
                    :value="person.role"
                    class="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink focus:border-brand-400 focus:outline-none disabled:opacity-60"
                    :disabled="savingId === person.id"
                    :aria-label="`Role for ${person.name}`"
                    @change="onRoleChange(person, $event)"
                  >
                    <option v-for="role in USER_ROLES" :key="role" :value="role">
                      {{ userRoleLabel(role) }}
                    </option>
                  </select>
                  <span v-else class="text-xs font-semibold text-ink">
                    {{ userRoleLabel(person.role) }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <p v-if="person.role === 'superadmin'" class="text-xs text-ink-soft">
                    All permissions
                  </p>
                  <div v-else-if="person.role === 'admin'" class="flex flex-wrap gap-1">
                    <span
                      v-for="permission in person.permissions"
                      :key="permission"
                      class="rounded-full bg-sand-200 px-2 py-0.5 text-[0.6rem] font-semibold text-ink-soft"
                    >
                      {{ permissionLabel(permission) }}
                    </span>
                    <span v-if="!person.permissions.length" class="text-xs text-ink-soft">
                      Read-only
                    </span>
                  </div>
                  <span v-else class="text-xs text-ink-soft">—</span>
                </td>

                <td class="px-4 py-4">
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
                    :class="userStatusTone(person.status)"
                  >
                    {{ person.status }}
                  </span>
                </td>

                <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                  {{ person.lastLoginAt ? formatDateTime(person.lastLoginAt) : 'Never' }}
                </td>

                <td class="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                  {{ formatDateShort(person.createdAt) }}
                </td>

                <td class="whitespace-nowrap px-4 py-4 text-right">
                  <button
                    v-if="person.status === 'invited'"
                    type="button"
                    class="text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
                    :disabled="savingId === person.id"
                    @click="resendInvite(person)"
                  >
                    {{ savingId === person.id ? 'Sending…' : 'Resend invite' }}
                  </button>
                  <button
                    v-else-if="isSuperadmin && person.id !== current?.id"
                    type="button"
                    class="text-sm font-semibold text-ink-soft hover:text-clay-700 disabled:opacity-50"
                    :disabled="savingId === person.id"
                    @click="toggleStatus(person)"
                  >
                    {{
                      savingId === person.id
                        ? 'Saving…'
                        : person.status === 'suspended'
                          ? 'Reactivate'
                          : 'Suspend'
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p class="mt-5 text-xs leading-relaxed text-ink-soft/80">
        Suspending blocks new sign-ins but keeps the account and its history. Only a superadmin can
        change roles or suspend an account. Changing a role resets permissions to that role's
        defaults.
      </p>
    </div>
  </section>
</template>
