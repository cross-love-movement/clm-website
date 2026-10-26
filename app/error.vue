<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error?.statusCode === 404)
</script>

<template>
  <div
    class="flex min-h-dvh flex-col items-center justify-center bg-sand-50 px-6 py-20 text-center"
  >
    <NuxtLink to="/" aria-label="Cross-Love Movement — home">
      <BrandMark class="text-brand-700" :size="52" />
    </NuxtLink>

    <p class="eyebrow mt-7">
      {{ isNotFound ? 'Page not found' : 'Something went wrong' }}
    </p>

    <h1 class="mt-3 max-w-xl text-4xl leading-tight sm:text-5xl">
      {{ isNotFound ? 'This page has wandered off.' : 'We could not load that page.' }}
    </h1>

    <p class="mt-4 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
      {{
        isNotFound
          ? 'The link may be old, or the page may have moved. The work, however, is still here.'
          : 'An unexpected error stopped us. Please try again, or head back home while we look into it.'
      }}
    </p>

    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <BaseButton size="lg" @click="clearError({ redirect: '/' })">
        Back home
        <template #icon><Icon name="arrow-right" :size="17" /></template>
      </BaseButton>
      <BaseButton to="/projects" variant="secondary" size="lg">See our projects</BaseButton>
    </div>

    <p class="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-ink-soft/50">
      Error {{ error?.statusCode ?? 500 }}
    </p>
  </div>
</template>
