<script setup lang="ts">
import type { Stat } from '#shared/types/content'

withDefaults(
  defineProps<{
    stats: Stat[]
    tone?: 'light' | 'dark'
  }>(),
  { tone: 'dark' },
)
</script>

<template>
  <dl
    class="grid grid-cols-1 gap-px overflow-hidden rounded-3xl sm:grid-cols-2 lg:grid-cols-4"
    :class="
      tone === 'light' ? 'bg-white/10 ring-1 ring-white/15' : 'bg-sand-200 ring-1 ring-sand-200'
    "
  >
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="flex flex-col gap-1.5 p-6 sm:p-7"
      :class="tone === 'light' ? 'bg-brand-950' : 'bg-white'"
    >
      <dt
        class="text-[0.7rem] font-bold uppercase tracking-[0.12em]"
        :class="tone === 'light' ? 'text-gold-300' : 'text-clay-600'"
      >
        {{ stat.label }}
      </dt>
      <dd>
        <span
          class="block font-display text-3xl leading-none sm:text-4xl"
          :class="tone === 'light' ? 'text-sand-50' : 'text-ink'"
        >
          {{ stat.value }}
        </span>
        <span
          v-if="stat.note"
          class="mt-1.5 block text-sm"
          :class="tone === 'light' ? 'text-sand-200/70' : 'text-ink-soft'"
        >
          {{ stat.note }}
        </span>
      </dd>
    </div>
  </dl>
</template>
