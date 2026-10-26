<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'success' | 'error' | 'info'
    title?: string
  }>(),
  { tone: 'info' },
)
</script>

<template>
  <div
    class="flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed"
    :class="{
      'border-brand-200 bg-brand-50 text-brand-900': tone === 'success',
      'border-red-200 bg-red-50 text-red-900': tone === 'error',
      'border-sand-300 bg-sand-100 text-ink': tone === 'info',
    }"
    :role="tone === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <span
      class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
      :class="{
        'bg-brand-600 text-white': tone === 'success',
        'bg-red-600 text-white': tone === 'error',
        'bg-ink/80 text-white': tone === 'info',
      }"
      aria-hidden="true"
    >
      <Icon :name="tone === 'error' ? 'close' : 'check'" :size="12" :stroke-width="2.5" />
    </span>
    <div>
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>
