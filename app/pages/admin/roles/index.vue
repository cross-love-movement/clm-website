<script setup lang="ts">
import type { AdminRole, OpportunityStatus } from '#shared/types/volunteers'

definePageMeta({ middleware: ['admin', 'programme-manager'], layout: 'admin' })

const {
  data: roles,
  error,
  pending,
  refresh,
} = await useFetch<AdminRole[]>('/api/admin/opportunities', {
  key: 'admin-roles',
  default: () => [],
})

const route = useRoute()
const router = useRouter()

const status = ref<'all' | OpportunityStatus>('all')
const search = ref('')
const actingId = ref('')
const confirmDeleteId = ref('')
const flash = ref<{ tone: 'success' | 'error'; message: string } | null>(null)

/** Set after creating a role, so the list confirms it instead of looking unchanged. */
watch(
  () => route.query.created,
  (value) => {
    if (typeof value !== 'string' || !value) return

    flash.value = {
      tone: 'success',
      message: `${value} created. Attach it to a programme from that programme’s page.`,
    }

    router.replace({ path: route.path, query: {} })
  },
  { immediate: true },
)

const filters = computed(() => [
  { value: 'all' as const, label: 'All', count: roles.value.length },
  {
    value: 'open' as const,
    label: 'Open',
    count: roles.value.filter((role) => role.status === 'open').length,
  },
  {
    value: 'closed' as const,
    label: 'Closed',
    count: roles.value.filter((role) => role.status === 'closed').length,
  },
])

const visible = computed(() => {
  const needle = search.value.trim().toLowerCase()

  return roles.value.filter((role) => {
    if (status.value !== 'all' && role.status !== status.value) return false
    if (!needle) return true

    return [role.title, role.location].some((value) => value.toLowerCase().includes(needle))
  })
})

function errorMessage(caught: unknown) {
  const payload = (caught as { data?: { statusMessage?: string; message?: string } }).data

  return payload?.statusMessage || payload?.message || 'That did not work. Please try again.'
}

async function toggle(role: AdminRole) {
  if (actingId.value) return

  actingId.value = role.id
  flash.value = null

  try {
    await $fetch(`/api/admin/opportunities/${role.id}`, {
      method: 'PATCH',
      body: {
        title: role.title,
        description: role.description,
        commitment: role.commitment,
        requirements: role.requirements,
        location: role.location,
        status: role.status === 'open' ? 'closed' : 'open',
      },
    })

    flash.value = {
      tone: 'success',
      message:
        role.status === 'open'
          ? `${role.title} is closed and hidden from the public form.`
          : `${role.title} is open again.`,
    }
    await refresh()
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    actingId.value = ''
  }
}

async function remove(role: AdminRole) {
  if (confirmDeleteId.value !== role.id) {
    confirmDeleteId.value = role.id
    return
  }

  if (actingId.value) return

  actingId.value = role.id
  flash.value = null

  try {
    await $fetch(`/api/admin/opportunities/${role.id}`, { method: 'DELETE' })
    flash.value = {
      tone: 'success',
      message: `${role.title} is deleted. Past applications keep the role name.`,
    }
    await refresh()
  } catch (caught) {
    flash.value = { tone: 'error', message: errorMessage(caught) }
  } finally {
    actingId.value = ''
    confirmDeleteId.value = ''
  }
}

useSeo({
  title: 'Volunteer roles',
  description: 'Manage Cross-Love Movement volunteer roles.',
  path: '/admin/roles',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p class="eyebrow">Staff portal</p>
        <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Volunteer roles</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          A shared catalogue of roles. Write each one once, then attach it to programmes and set how
          many people each programme needs. A role on no programme is offered as a general volunteer
          role. Closing hides a role everywhere.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <BaseButton to="/admin" variant="secondary" size="sm">Back to overview</BaseButton>
        <BaseButton to="/admin/programmes" variant="secondary" size="sm">Programmes</BaseButton>
      </div>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load roles" class="mt-8">
      <p class="mt-1">{{ error.statusMessage || 'Try refreshing the page.' }}</p>
    </AlertBox>

    <AlertBox
      v-if="flash"
      :tone="flash.tone"
      :title="flash.tone === 'success' ? 'Updated' : 'Something went wrong'"
      class="mt-6"
    >
      <p class="mt-1">{{ flash.message }}</p>
    </AlertBox>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in filters"
          :key="option.value"
          type="button"
          class="rounded-full border px-3.5 py-1.5 text-sm font-semibold transition"
          :class="
            status === option.value
              ? 'border-brand-900 bg-brand-900 text-sand-50'
              : 'border-sand-300 bg-white text-ink-soft hover:border-brand-400 hover:text-ink'
          "
          :aria-pressed="status === option.value"
          @click="status = option.value"
        >
          {{ option.label }}
          <span class="ml-1 text-xs font-bold opacity-70">{{ option.count }}</span>
        </button>
      </div>

      <label class="sm:ml-auto sm:w-64">
        <span class="sr-only">Search roles</span>
        <input
          v-model="search"
          type="search"
          placeholder="Search a role or place…"
          class="w-full rounded-full border border-sand-300 bg-white px-4 py-2 text-sm text-ink placeholder:text-ink-soft/75 focus:border-brand-400 focus:outline-none"
        />
      </label>
    </div>

    <div v-if="pending && !roles.length" class="mt-6 text-sm text-ink-soft">Loading roles…</div>

    <div
      v-else-if="!visible.length"
      class="mt-6 rounded-3xl border border-dashed border-sand-300 bg-sand-100 p-10 text-center"
    >
      <Icon name="users" :size="28" class="mx-auto text-clay-600" />
      <h2 class="mt-3 text-lg text-ink">
        {{ roles.length ? 'No roles match that filter.' : 'No roles yet.' }}
      </h2>
      <p class="mt-2 text-sm text-ink-soft">
        Create the first role below. It appears on the public volunteer page as soon as it is open —
        as a general role until a programme needs it.
      </p>
    </div>

    <div v-else class="mt-6 grid gap-4 lg:grid-cols-2">
      <article
        v-for="role in visible"
        :key="role.id"
        class="flex flex-col rounded-3xl border border-sand-200 bg-white p-6 shadow-soft"
        :class="{ 'opacity-70': role.status === 'closed' }"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-ink">{{ role.title }}</h2>
            <p class="mt-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-clay-700">
              <template v-if="role.needCount">
                {{ role.needCount }} {{ role.needCount === 1 ? 'opening' : 'openings' }}
              </template>
              <template v-else>General volunteer role</template>
            </p>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide"
            :class="
              role.status === 'open' ? 'bg-brand-100 text-brand-800' : 'bg-sand-200 text-ink-soft'
            "
          >
            {{ role.status }}
          </span>
        </div>

        <dl class="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft">
          <div v-if="role.commitment">
            <dt class="sr-only">Commitment</dt>
            <dd>{{ role.commitment }}</dd>
          </div>
          <div v-if="role.location">
            <dt class="sr-only">Location</dt>
            <dd>{{ role.location }}</dd>
          </div>
          <div>
            <dt class="sr-only">Placed</dt>
            <dd>{{ role.filled }} placed</dd>
          </div>
        </dl>

        <div class="mt-auto flex flex-wrap items-center gap-4 border-t border-sand-200 pt-4">
          <NuxtLink
            :to="`/admin/roles/${role.id}`"
            class="text-sm font-semibold text-brand-800 hover:text-brand-950"
          >
            Edit role
          </NuxtLink>

          <button
            type="button"
            class="text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
            :disabled="actingId === role.id"
            @click="toggle(role)"
          >
            {{ role.status === 'open' ? 'Close' : 'Reopen' }}
          </button>

          <template v-if="confirmDeleteId === role.id">
            <button
              type="button"
              class="text-sm font-semibold text-red-700 hover:text-red-900 disabled:opacity-50"
              :disabled="actingId === role.id"
              @click="remove(role)"
            >
              {{ actingId === role.id ? 'Deleting…' : 'Confirm delete' }}
            </button>
            <button
              type="button"
              class="text-sm font-semibold text-ink-soft hover:text-ink"
              :disabled="actingId === role.id"
              @click="confirmDeleteId = ''"
            >
              Keep
            </button>
          </template>
          <button
            v-else
            type="button"
            class="ml-auto text-sm font-semibold text-ink-soft hover:text-red-700 disabled:opacity-50"
            :disabled="actingId === role.id"
            @click="remove(role)"
          >
            Delete
          </button>
        </div>
      </article>
    </div>

    <div
      id="create-role"
      class="mt-12 scroll-mt-24 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8"
    >
      <h2 class="text-xl text-ink">Create a role</h2>
      <p class="mt-1 text-sm text-ink-soft">
        Roles stand on their own here. Attach one to a programme — and set how many people it needs
        — from the programme's own page. Until then it is offered as a general volunteer role.
      </p>
      <div class="mt-6">
        <RoleForm mode="create" />
      </div>
    </div>
  </section>
</template>
