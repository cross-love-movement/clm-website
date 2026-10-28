<script setup lang="ts">
/**
 * The official lockup: mark plus the registered name over two lines, both in
 * the brand red. Sizes scale from `size` so the same component works in the
 * header, the portals, and the footer without hand-tuned classes.
 */
const props = withDefaults(
  defineProps<{
    /** Height of the mark in pixels. Text scales with it. */
    size?: number
    /** Light text for dark backgrounds (the footer). */
    onDark?: boolean
    /** Cream tile behind the mark — needed on dark backgrounds. */
    tile?: boolean
    /** Hide the "Limited By Guarantee" line where space is tight. */
    legal?: boolean
  }>(),
  { size: 40, onDark: false, tile: false, legal: true },
)

const nameSize = computed(() => `${Math.round(props.size * 0.33)}px`)
const legalSize = computed(() => `${Math.max(8, Math.round(props.size * 0.22))}px`)
</script>

<template>
  <span class="flex items-center gap-2.5">
    <BrandMark :size="size" :tile="tile" class="shrink-0" />
    <span class="flex min-w-0 flex-col leading-none">
      <span
        class="whitespace-nowrap font-extrabold uppercase tracking-[0.02em]"
        :class="onDark ? 'text-sand-50' : 'text-clay-600'"
        :style="{ fontSize: nameSize }"
      >
        Cross-Love Movement
      </span>
      <span
        v-if="legal"
        class="mt-[3px] whitespace-nowrap font-bold uppercase tracking-[0.07em]"
        :class="onDark ? 'text-sand-200/70' : 'text-clay-600'"
        :style="{ fontSize: legalSize }"
      >
        Limited By Guarantee
      </span>
    </span>
  </span>
</template>
