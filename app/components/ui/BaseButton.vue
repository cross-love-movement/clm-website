<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverseGhost' | 'clay' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    type?: 'button' | 'submit' | 'reset'
    variant?: Variant
    size?: Size
    block?: boolean
    disabled?: boolean
    external?: boolean
  }>(),
  { type: 'button', variant: 'primary', size: 'md' },
)

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-700 text-sand-50 shadow-soft hover:bg-brand-800 hover:-translate-y-0.5 active:translate-y-0',
  secondary:
    'border border-brand-200 bg-white/70 text-brand-800 hover:border-brand-400 hover:bg-white',
  ghost: 'text-brand-800 hover:bg-brand-50',
  inverseGhost: 'text-sand-100 hover:bg-white/10 hover:text-white',
  clay: 'bg-clay-400 text-ink shadow-soft hover:bg-clay-300 hover:-translate-y-0.5 active:translate-y-0',
  inverse:
    'bg-sand-50 text-brand-900 shadow-soft hover:bg-white hover:-translate-y-0.5 active:translate-y-0',
}

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[0.95rem]',
  lg: 'px-6 py-3.5 text-base',
}

const classes = computed(() => [
  base,
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="classes">
    <slot />
    <slot name="icon" />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener noreferrer' : undefined"
    :class="classes"
  >
    <slot />
  </a>
  <button v-else :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
