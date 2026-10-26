<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Rendered height in pixels. */
    size?: number
    /** Put the mark on a cream tile — needed on dark backgrounds. */
    tile?: boolean
  }>(),
  { size: 40, tile: false },
)
</script>

<template>
  <span
    v-if="tile"
    class="inline-flex shrink-0 items-center justify-center rounded-2xl bg-sand-50 p-1.5"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <img
      src="/images/clm-mark.png"
      alt=""
      aria-hidden="true"
      class="h-full w-full object-contain"
    />
  </span>
  <img
    v-else
    src="/images/clm-mark.png"
    alt=""
    aria-hidden="true"
    :style="{ height: `${size}px`, width: 'auto' }"
    class="shrink-0 object-contain"
  />
</template>
