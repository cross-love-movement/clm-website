<script setup lang="ts">
import type { HomeSlide } from '#shared/types/content'

const props = defineProps<{ slides: HomeSlide[] }>()

const index = ref(0)
const paused = ref(false)
const holding = ref(false)
const reducedMotion = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const hasMany = computed(() => props.slides.length > 1)
const current = computed(() => props.slides[index.value])
const running = computed(
  () => hasMany.value && !paused.value && !holding.value && !reducedMotion.value,
)

function goTo(target: number) {
  const count = props.slides.length
  if (count === 0) return
  index.value = (target + count) % count
}

const next = () => goTo(index.value + 1)
const prev = () => goTo(index.value - 1)

function stopTimer() {
  if (timer) clearInterval(timer)
  timer = undefined
}

function startTimer() {
  stopTimer()
  if (running.value) timer = setInterval(next, 7000)
}

watch(running, startTimer)

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  startTimer()
})

onBeforeUnmount(stopTimer)

function onKeydown(event: KeyboardEvent) {
  if (!hasMany.value) return

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  }
}
</script>

<template>
  <section
    v-if="current"
    class="relative isolate overflow-hidden bg-brand-950 text-sand-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gold-300"
    aria-roledescription="carousel"
    aria-label="Events at Cross-Love Movement"
    tabindex="0"
    @keydown="onKeydown"
    @mouseenter="holding = true"
    @mouseleave="holding = false"
    @focusin="holding = true"
    @focusout="holding = false"
  >
    <div class="relative h-[30rem] w-full sm:h-[34rem] lg:h-[38rem]">
      <div
        v-for="(slide, slideIndex) in slides"
        :key="slide.title"
        role="group"
        aria-roledescription="slide"
        :aria-label="`${slideIndex + 1} of ${slides.length}`"
        :aria-hidden="slideIndex !== index"
        class="absolute inset-0"
        :class="[
          slideIndex === index ? 'z-10 opacity-100' : 'pointer-events-none opacity-0',
          reducedMotion ? 'transition-none' : 'transition-opacity duration-700',
        ]"
      >
        <img
          :src="slide.image"
          :alt="slide.imageAlt"
          width="2400"
          height="1350"
          decoding="async"
          :fetchpriority="slideIndex === 0 ? 'high' : 'low'"
          class="absolute inset-0 size-full object-cover"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/75 to-brand-950/20 sm:bg-gradient-to-r sm:from-brand-950/95 sm:via-brand-950/65 sm:to-brand-950/5"
        />
      </div>

      <div class="container-page relative z-20 flex h-full flex-col justify-end pb-24 sm:pb-20">
        <div class="max-w-2xl" aria-live="polite">
          <p class="eyebrow text-gold-300">{{ current.eyebrow }}</p>
          <h2 class="mt-3 text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">{{ current.title }}</h2>
          <p class="mt-4 max-w-xl text-base leading-relaxed text-sand-100/85 sm:text-lg">
            {{ current.caption }}
          </p>
          <BaseButton :to="current.to" variant="inverse" size="lg" class="mt-7">
            {{ current.cta }}
            <template #icon><Icon name="arrow-right" :size="17" /></template>
          </BaseButton>
        </div>
      </div>

      <div v-if="hasMany" class="absolute inset-x-0 bottom-6 z-30">
        <div class="container-page flex items-center justify-between gap-4">
          <div class="flex items-center gap-2" role="group" aria-label="Choose a slide">
            <button
              v-for="(slide, slideIndex) in slides"
              :key="slide.title"
              type="button"
              class="h-2.5 rounded-full transition-all"
              :class="
                slideIndex === index ? 'w-8 bg-gold-300' : 'w-2.5 bg-sand-50/40 hover:bg-sand-50/70'
              "
              :aria-label="`Show slide ${slideIndex + 1}: ${slide.title}`"
              :aria-current="slideIndex === index ? 'true' : undefined"
              @click="goTo(slideIndex)"
            />
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full border border-sand-50/25 bg-brand-950/40 text-sand-50 backdrop-blur transition hover:border-sand-50/50 hover:bg-brand-950/70"
              :aria-label="paused ? 'Play slideshow' : 'Pause slideshow'"
              :aria-pressed="paused"
              @click="paused = !paused"
            >
              <Icon :name="paused ? 'play' : 'pause'" :size="16" />
            </button>
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full border border-sand-50/25 bg-brand-950/40 text-sand-50 backdrop-blur transition hover:border-sand-50/50 hover:bg-brand-950/70"
              aria-label="Previous slide"
              @click="prev"
            >
              <Icon name="arrow-right" :size="16" class="rotate-180" />
            </button>
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full border border-sand-50/25 bg-brand-950/40 text-sand-50 backdrop-blur transition hover:border-sand-50/50 hover:bg-brand-950/70"
              aria-label="Next slide"
              @click="next"
            >
              <Icon name="arrow-right" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
