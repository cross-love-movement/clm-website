<script setup lang="ts">
import type { NeedWithRole, Programme, Role } from '#shared/types/volunteers'

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

const { data: roles } = await useFetch<Role[]>('/api/admin/opportunities', {
  key: 'admin-roles',
  default: () => [],
})

const togglingId = ref('')

async function toggleRole(role: NeedWithRole) {
  togglingId.value = role.id

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

    await refresh()
  } finally {
    togglingId.value = ''
  }
}

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
        <p class="mt-1 text-sm text-ink-soft">
          Tick the roles this programme needs and give each one a headcount, then save.
        </p>
        <div class="mt-5">
          <ProgrammeForm mode="edit" :programme="programme" :roles="roles" />
        </div>
      </div>

      <div class="mt-10">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="text-2xl text-ink">Roles on this programme</h2>
            <p class="mt-1 text-sm text-ink-soft">
              Closing a role type hides it on every programme, not just this one.
            </p>
          </div>

          <NuxtLink
            to="/admin/roles"
            class="text-sm font-semibold text-clay-700 hover:text-clay-900"
          >
            Manage role types
          </NuxtLink>
        </div>

        <div
          v-if="!programme.needs.length"
          class="mt-5 rounded-2xl border border-dashed border-sand-300 bg-sand-100 p-6 text-sm text-ink-soft"
        >
          No roles yet. Tick the ones this programme needs in the form above, or
          <NuxtLink
            to="/admin/roles#create-role"
            class="font-semibold text-clay-700 underline underline-offset-2"
          >
            add a new role type</NuxtLink
          >.
        </div>

        <div v-else class="mt-5 grid gap-4 sm:grid-cols-2">
          <article
            v-for="role in programme.needs"
            :key="role.needId"
            class="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h3 class="font-semibold text-ink">{{ role.title }}</h3>
              <span
                class="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                :class="
                  role.status === 'open'
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-sand-200 text-ink-soft'
                "
              >
                {{ role.status }}
              </span>
            </div>

            <p v-if="role.commitment" class="mt-1 text-xs text-ink-soft">
              {{ role.commitment }}
            </p>
            <p v-if="role.location" class="text-xs text-ink-soft">
              {{ role.location }}
            </p>
            <p class="mt-2 text-sm text-ink-soft">
              {{ role.filled }}
              <template v-if="role.places !== null"> / {{ role.places }}</template>
              placed<template v-if="role.places === null"> · no limit</template>
            </p>

            <ul v-if="role.requirements.length" class="mt-3 space-y-1">
              <li
                v-for="requirement in role.requirements"
                :key="requirement"
                class="text-xs leading-relaxed text-ink-soft"
              >
                · {{ requirement }}
              </li>
            </ul>

            <button
              type="button"
              class="mt-4 text-sm font-semibold text-clay-700 hover:text-clay-900 disabled:opacity-50"
              :disabled="togglingId === role.id"
              @click="toggleRole(role)"
            >
              {{
                togglingId === role.id
                  ? 'Saving…'
                  : role.status === 'open'
                    ? 'Close this role type'
                    : 'Reopen this role type'
              }}
            </button>
          </article>
        </div>
      </div>
    </template>
  </section>
</template>
