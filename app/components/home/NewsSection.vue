<script setup lang="ts">
const { latest, categoryLabels } = await useNews()

const next = computed(() => latest.value.slice(0, 3))
</script>

<template>
  <section v-if="next.length" class="container-page py-16 sm:py-20">
    <div class="flex flex-wrap items-end justify-between gap-6">
      <SectionHeading
        eyebrow="News"
        title="Latest from the newsroom."
        description="Stories, updates, and reflections between the events."
      />
      <BaseButton to="/news" variant="ghost" size="sm">
        All stories
        <template #icon><Icon name="arrow-right" :size="15" /></template>
      </BaseButton>
    </div>

    <div class="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-3">
      <NuxtLink
        v-for="post in next"
        :key="post.path"
        :to="post.path"
        class="group border-t border-sand-300 pt-5"
      >
        <p class="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-clay-700">
          {{ categoryLabels[post.category] }} ·
          <span class="text-ink-soft/70">{{ formatDateShort(post.publishedAt) }}</span>
        </p>
        <h3 class="mt-2 text-xl leading-snug text-ink transition group-hover:text-clay-700">
          {{ post.title }}
        </h3>
        <p class="mt-2 text-sm leading-relaxed text-ink-soft">{{ post.excerpt }}</p>
        <span
          class="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-700 transition group-hover:gap-2.5"
        >
          Read the story
          <Icon name="arrow-right" :size="15" />
        </span>
      </NuxtLink>
    </div>
  </section>
</template>
