<script setup lang="ts">
definePageMeta({ middleware: ['admin', 'programme-manager'], layout: 'admin' })

useSeo({
  title: 'New programme',
  description: 'Create a Cross-Love Movement volunteer programme.',
  path: '/admin/programmes/new',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-12 sm:py-16">
    <p class="eyebrow">Staff portal</p>

    <div class="mt-3 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h1 class="text-3xl leading-tight sm:text-4xl">New programme</h1>
        <p class="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">
          Start with the programme itself. You will add volunteer roles on the next screen.
        </p>
      </div>

      <NuxtLink
        to="/admin/programmes"
        class="text-sm font-semibold text-clay-700 hover:text-clay-900"
      >
        Back to programmes
      </NuxtLink>
    </div>

    <div class="mt-8 rounded-4xl border border-sand-200 bg-white p-6 shadow-soft sm:p-8">
      <ProgrammeForm mode="create" />
    </div>
  </section>
</template>
