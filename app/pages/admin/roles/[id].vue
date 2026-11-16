<script setup lang="ts">
import type { AdminRole } from '#shared/types/volunteers'

definePageMeta({ middleware: ['admin', 'programme-manager'], layout: 'admin' })

const route = useRoute()
const id = String(route.params.id)

const {
  data: role,
  error,
  refresh,
} = await useFetch<AdminRole>(`/api/admin/opportunities/${id}`, {
  key: `admin-role-${id}`,
})

const flash = ref<{ tone: 'success'; message: string } | null>(null)

async function onSaved() {
  flash.value = {
    tone: 'success',
    message: 'Role saved. Changes appear on the public volunteer page immediately.',
  }

  await refresh()
}

const usage = computed(() => {
  const count = role.value?.needCount ?? 0

  if (!count) return 'General volunteer role'

  return `Used in ${count} ${count === 1 ? 'opening' : 'openings'}`
})

const confirmingDelete = ref(false)
const deleting = ref(false)
const deleteError = ref('')

async function remove() {
  if (!confirmingDelete.value) {
    confirmingDelete.value = true
    return
  }

  if (deleting.value) return

  deleting.value = true
  deleteError.value = ''

  try {
    await $fetch(`/api/admin/opportunities/${id}`, { method: 'DELETE' })
    await navigateTo('/admin/roles')
  } catch (caught) {
    const payload = (caught as { data?: { statusMessage?: string; message?: string } }).data

    deleteError.value =
      payload?.statusMessage || payload?.message || 'We could not delete that role.'
  } finally {
    deleting.value = false
  }
}

useSeo({
  title: role.value ? `Edit ${role.value.title}` : 'Edit role',
  description: 'Edit a Cross-Love Movement volunteer role.',
  path: `/admin/roles/${id}`,
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <div class="flex items-center gap-2 text-sm font-semibold text-ink-soft">
      <NuxtLink to="/admin/roles" class="hover:text-ink">Volunteer roles</NuxtLink>
      <span aria-hidden="true">/</span>
      <span v-if="role" class="text-ink">{{ role.title }}</span>
    </div>

    <AlertBox v-if="error" tone="error" title="Could not load this role" class="mt-6">
      <p class="mt-1">{{ error.statusMessage || 'It may have been deleted.' }}</p>
      <NuxtLink
        to="/admin/roles"
        class="mt-3 inline-block text-sm font-semibold underline underline-offset-2"
      >
        Back to roles
      </NuxtLink>
    </AlertBox>

    <template v-else-if="role">
      <AlertBox v-if="flash" :tone="flash.tone" title="Updated" class="mt-6">
        <p class="mt-1">{{ flash.message }}</p>
      </AlertBox>

      <div class="mt-4 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
              :class="
                role.status === 'open' ? 'bg-brand-100 text-brand-800' : 'bg-sand-200 text-ink-soft'
              "
            >
              {{ role.status }}
            </span>
            <span class="text-xs font-semibold text-ink-soft">
              {{ usage }}
            </span>
          </div>
          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">{{ role.title }}</h1>
          <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
            {{ role.filled }} placed so far. Changes appear on the public volunteer page
            immediately.
          </p>
        </div>

        <NuxtLink to="/admin/roles" class="text-sm font-semibold text-clay-700 hover:text-clay-900">
          Back to roles
        </NuxtLink>
      </div>

      <div class="mt-8 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
        <RoleForm mode="edit" :role="role" @saved="onSaved" />
      </div>

      <div class="mt-10 rounded-3xl border border-red-200 bg-red-50/60 p-6">
        <h2 class="text-lg font-semibold text-red-900">Delete this role</h2>
        <p class="mt-1 text-sm leading-relaxed text-red-900/80">
          Deleting removes it from the staff list and from every programme that lists it. Past
          applications keep the role name, so the history stays readable. Close it instead if you
          only want to stop new applications.
        </p>

        <p v-if="deleteError" class="mt-3 text-sm font-medium text-red-800">{{ deleteError }}</p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
            :disabled="deleting"
            @click="remove"
          >
            {{ deleting ? 'Deleting…' : confirmingDelete ? 'Confirm delete' : 'Delete role' }}
          </button>
          <button
            v-if="confirmingDelete"
            type="button"
            class="text-sm font-semibold text-ink-soft hover:text-ink"
            :disabled="deleting"
            @click="confirmingDelete = false"
          >
            Keep role
          </button>
        </div>
      </div>
    </template>
  </section>
</template>
