<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title: string
    description?: string
    align?: 'left' | 'center'
    tone?: 'dark' | 'light'
  }>(),
  { align: 'left', tone: 'dark' },
)
</script>

<template>
  <div
    class="flex flex-col gap-4"
    :class="align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'"
  >
    <p v-if="eyebrow" class="eyebrow" :class="tone === 'light' ? 'text-gold-300' : 'text-clay-600'">
      {{ eyebrow }}
    </p>
    <h2
      class="text-3xl leading-[1.12] sm:text-4xl lg:text-[2.7rem]"
      :class="tone === 'light' ? 'text-sand-50' : 'text-ink'"
    >
      {{ title }}
    </h2>
    <p
      v-if="description"
      class="text-lg leading-relaxed"
      :class="tone === 'light' ? 'text-sand-200/85' : 'text-ink-soft'"
    >
      {{ description }}
    </p>
    <slot />
    <div
      v-if="$slots.actions"
      class="mt-2 flex flex-wrap items-center gap-3"
      :class="align === 'center' ? 'justify-center' : ''"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
