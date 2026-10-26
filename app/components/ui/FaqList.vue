<script setup lang="ts">
import type { FaqItem } from '#shared/types/content'

withDefaults(
  defineProps<{
    items: FaqItem[]
    tone?: 'light' | 'dark'
  }>(),
  { tone: 'dark' },
)
</script>

<template>
  <div class="divide-y" :class="tone === 'light' ? 'divide-white/15' : 'divide-sand-200'">
    <details v-for="item in items" :key="item.question" class="group py-5">
      <summary
        class="flex cursor-pointer list-none items-start justify-between gap-6 text-left [&::-webkit-details-marker]:hidden"
        :class="tone === 'light' ? 'text-sand-50' : 'text-ink'"
      >
        <span class="text-base font-semibold leading-snug">{{ item.question }}</span>
        <span
          class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border transition group-open:rotate-180"
          :class="
            tone === 'light'
              ? 'border-white/25 text-sand-100 group-hover:border-white/50'
              : 'border-sand-300 text-brand-700 group-hover:border-brand-300'
          "
          aria-hidden="true"
        >
          <Icon name="chevron-down" :size="15" />
        </span>
      </summary>
      <p
        class="mt-3 max-w-2xl pr-10 text-[0.95rem] leading-relaxed"
        :class="tone === 'light' ? 'text-sand-200/80' : 'text-ink-soft'"
      >
        {{ item.answer }}
      </p>
    </details>
  </div>
</template>
