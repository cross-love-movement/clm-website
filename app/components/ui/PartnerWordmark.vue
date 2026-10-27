<script setup lang="ts">
import type { Partner, PartnerType } from '#shared/types/content'

defineProps<{ partner: Partner }>()

const tones: Record<PartnerType, string> = {
  church: 'bg-clay-100 text-clay-800',
  ministry: 'bg-gold-100 text-gold-800',
  community: 'bg-brand-100 text-brand-700',
  school: 'bg-brand-100 text-brand-700',
  corporate: 'bg-brand-900 text-sand-50',
}
</script>

<template>
  <li
    class="flex min-w-[15rem] items-center gap-3 rounded-2xl border px-5 py-4"
    :class="
      partner.placeholder
        ? 'border-dashed border-sand-300 bg-transparent'
        : 'border-sand-200 bg-white shadow-soft'
    "
  >
    <img
      v-if="partner.logo"
      :src="partner.logo"
      :alt="partner.name"
      class="h-8 w-auto max-w-[7rem] object-contain"
    />
    <span
      v-else
      class="flex size-10 shrink-0 items-center justify-center rounded-xl text-[0.68rem] font-bold tracking-wide"
      :class="
        partner.placeholder
          ? 'border border-dashed border-sand-300 text-ink-soft'
          : tones[partner.type]
      "
    >
      {{ partner.mark }}
    </span>

    <span class="min-w-0">
      <span
        class="block truncate text-sm font-semibold"
        :class="partner.placeholder ? 'text-ink-soft' : 'text-ink'"
      >
        {{ partner.name }}
      </span>
      <span
        class="block truncate text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-ink-soft/70"
      >
        {{ partner.detail }}
      </span>
    </span>
  </li>
</template>
