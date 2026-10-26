<template>
  <section class="relative overflow-hidden">
    <div
      class="pointer-events-none absolute -left-48 -top-48 size-[34rem] rounded-full bg-clay-50 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-32 top-1/3 size-80 rounded-full bg-gold-100/50 blur-3xl"
      aria-hidden="true"
    />

    <div
      class="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-24"
    >
      <div>
        <p
          class="inline-flex items-center gap-2.5 rounded-full border border-clay-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-clay-800"
        >
          <span class="relative flex size-2">
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-gold-400 opacity-70"
            />
            <span class="relative inline-flex size-2 rounded-full bg-clay-600" />
          </span>
          A movement of musicians and patriots
        </p>

        <h1 class="mt-6 text-[2.75rem] leading-[1.03] sm:text-6xl lg:text-[4.05rem]">
          Faith in Christ.
          <em class="font-display italic text-clay-600">Music for change.</em>
        </h1>

        <p class="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Cross-Love Movement is a Ghanaian NGO using music and community engagement to share the
          Gospel, support gospel artistes, and care for people and the planet.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3">
          <BaseButton to="/donate" size="lg">
            Give today
            <template #icon><Icon name="arrow-right" :size="18" /></template>
          </BaseButton>
          <BaseButton to="/projects" variant="secondary" size="lg">See our work</BaseButton>
        </div>

        <dl class="mt-10 flex flex-wrap gap-x-9 gap-y-4 border-t border-sand-200 pt-6">
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/70">
              Established
            </dt>
            <dd class="mt-1 font-display text-xl text-ink">2023</dd>
          </div>
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/70">Based in</dt>
            <dd class="mt-1 font-display text-xl text-ink">Accra, Ghana</dd>
          </div>
          <div>
            <dt class="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft/70">
              Registered
            </dt>
            <dd class="mt-1 font-display text-xl text-ink">RGD · CG041650523</dd>
          </div>
        </dl>
      </div>

      <div class="relative mx-auto w-full max-w-md lg:max-w-none">
        <div
          class="relative overflow-hidden rounded-4xl border border-brand-800/60 bg-brand-900 shadow-lift"
        >
          <img
            src="/images/hero.svg"
            width="900"
            height="1100"
            alt="Illustration of a sound waveform moving through a red heart"
            class="h-full w-full object-cover"
            fetchpriority="high"
          />
        </div>

        <div
          class="absolute -left-3 bottom-6 flex items-center gap-3 rounded-2xl border border-white/70 bg-sand-50/95 px-4 py-3 shadow-lift backdrop-blur sm:-left-6"
        >
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-gold-300"
          >
            <Icon name="shield" :size="20" />
          </span>
          <div>
            <p class="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-clay-600">
              Open books
            </p>
            <p class="text-sm font-semibold text-ink">Registered & accountable</p>
          </div>
        </div>

        <div
          class="absolute -right-2 top-5 hidden rounded-2xl border border-white/70 bg-sand-50/95 px-4 py-3 text-center shadow-lift backdrop-blur sm:block"
        >
          <p class="font-display text-2xl leading-none text-brand-900">12</p>
          <p class="mt-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-soft">
            constitutional aims
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
