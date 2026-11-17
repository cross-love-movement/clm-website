<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    page: number
    pageSize: number
    total: number
    pageCount: number
    /** Plural noun for the screen-reader label, e.g. "Donations". */
    label: string
    busy?: boolean
  }>(),
  { busy: false },
)

const emit = defineEmits<{ 'update:page': [value: number] }>()

const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))

function go(target: number) {
  if (target < 1 || target > props.pageCount || target === props.page) return

  emit('update:page', target)
}
</script>

<template>
  <nav
    v-if="total > 0"
    class="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"
    :aria-label="`${label} pages`"
  >
    <p class="text-ink-soft">
      Showing <span class="font-semibold text-ink">{{ from }}–{{ to }}</span> of
      <span class="font-semibold text-ink">{{ total }}</span>
    </p>

    <div v-if="pageCount > 1" class="flex items-center gap-2">
      <button
        type="button"
        class="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-brand-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="page <= 1 || busy"
        @click="go(page - 1)"
      >
        Previous
      </button>

      <p class="px-1 text-xs font-semibold text-ink-soft" aria-live="polite">
        Page {{ page }} of {{ pageCount }}
      </p>

      <button
        type="button"
        class="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-brand-400 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="page >= pageCount || busy"
        @click="go(page + 1)"
      >
        Next
      </button>
    </div>
  </nav>
</template>
