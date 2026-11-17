<script setup lang="ts">
const route = useRoute()
const reference = computed(() =>
  typeof route.query.reference === 'string' ? route.query.reference.trim() : '',
)

interface Verification {
  status: 'succeeded' | 'pending' | 'failed' | 'abandoned' | 'refunded'
  reference: string
  amount?: string
  frequency?: 'one_time' | 'monthly'
}

const { data, error, pending, refresh } = await useFetch<Verification>('/api/donate/verify', {
  key: `donate-verify-${reference.value}`,
  query: { reference },
  immediate: Boolean(reference.value),
})

useSeo({
  title: 'Thank you',
  description: 'Your gift to Cross-Love Movement.',
  path: '/donate/complete',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-20 sm:py-28">
    <div class="mx-auto max-w-2xl">
      <div class="rounded-4xl border border-sand-200 bg-white p-7 shadow-soft sm:p-10">
        <div v-if="pending" class="text-center">
          <p class="eyebrow text-clay-700">Checking</p>
          <h1 class="mt-3 text-3xl leading-tight">Confirming your gift…</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            This takes a few seconds. Do not close this page.
          </p>
        </div>

        <div v-else-if="error" class="text-center">
          <p class="eyebrow text-clay-700">Not found</p>
          <h1 class="mt-3 text-3xl leading-tight">We could not find that payment.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            If you were charged, email
            <a
              href="mailto:donations@crosslovemovement.org"
              class="font-semibold text-brand-700 underline underline-offset-2"
            >
              donations@crosslovemovement.org</a
            >
            with the reference from your bank or mobile-money message and we will trace it.
          </p>
          <BaseButton to="/donate" class="mt-6">Back to giving</BaseButton>
        </div>

        <div v-else-if="data?.status === 'succeeded'" class="text-center">
          <span
            class="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-800"
          >
            <Icon name="check" :size="22" :stroke-width="2.5" />
          </span>
          <p class="mt-4 eyebrow text-clay-700">Received</p>
          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">Thank you — your gift is in.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            <template v-if="data.amount">
              We have received <strong class="font-semibold text-ink">{{ data.amount }}</strong>
              <template v-if="data.frequency === 'monthly'"> each month</template>.
            </template>
            A receipt is on its way to the email address you used.
          </p>

          <p class="mt-4 text-xs text-ink-soft/80">Reference {{ data.reference }}</p>

          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <BaseButton to="/" variant="secondary">Back home</BaseButton>
            <BaseButton to="/volunteer" variant="secondary">Volunteer with us</BaseButton>
          </div>
        </div>

        <div v-else-if="data?.status === 'pending'" class="text-center">
          <p class="eyebrow text-clay-700">Pending</p>
          <h1 class="mt-3 text-3xl leading-tight">We are confirming your payment.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            Mobile-money payments can take a minute to confirm. Your receipt will arrive by email as
            soon as the payment clears.
          </p>
          <p class="mt-4 text-xs text-ink-soft/80">Reference {{ data.reference }}</p>
          <BaseButton class="mt-6" variant="secondary" @click="refresh()">Check again</BaseButton>
        </div>

        <div v-else-if="data?.status === 'refunded'" class="text-center">
          <p class="eyebrow text-clay-700">Refunded</p>
          <h1 class="mt-3 text-3xl leading-tight">That gift has been sent back.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            <template v-if="data.amount">
              We have returned <strong class="font-semibold text-ink">{{ data.amount }}</strong>
              to the account you paid with.
            </template>
            <template v-else>We have returned your gift.</template>
            Banks and mobile-money providers can take five to ten working days. A confirmation is on
            its way to your inbox.
          </p>
          <p class="mt-4 text-xs text-ink-soft/80">Reference {{ data.reference }}</p>

          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <BaseButton to="/" variant="secondary">Back home</BaseButton>
            <BaseButton to="/contact" variant="secondary">Ask the giving team</BaseButton>
          </div>
        </div>

        <div v-else class="text-center">
          <p class="eyebrow text-clay-700">Not completed</p>
          <h1 class="mt-3 text-3xl leading-tight">That payment did not go through.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            Nothing has been charged. You can try again, or give by bank transfer instead.
          </p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <BaseButton to="/donate#give">Try again</BaseButton>
            <BaseButton to="/contact" variant="secondary">Ask the giving team</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
