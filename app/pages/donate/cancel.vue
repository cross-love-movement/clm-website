<script setup lang="ts">
const route = useRoute()

const reference = computed(() =>
  typeof route.query.reference === 'string' ? route.query.reference.trim() : '',
)
const token = computed(() =>
  typeof route.query.token === 'string' ? route.query.token.trim() : '',
)

type State =
  | { status: 'working' }
  | { status: 'stopped'; amount?: string; already: boolean }
  | { status: 'error'; message: string }
  | { status: 'link' }

const state = ref<State>({ status: 'working' })

const givingTeamHref = computed(() => {
  const subject = reference.value ? `Monthly gift ${reference.value}` : 'Monthly gift'

  return `mailto:donations@crosslovemovement.org?subject=${encodeURIComponent(subject)}`
})

onMounted(async () => {
  if (!reference.value || !token.value) {
    state.value = { status: 'link' }
    return
  }

  try {
    const result = await $fetch<{ cancelled: boolean; already: boolean; amount?: string }>(
      '/api/donate/cancel',
      { method: 'POST', body: { reference: reference.value, token: token.value } },
    )

    state.value = { status: 'stopped', amount: result.amount, already: result.already }
  } catch (caught) {
    const payload = (caught as { data?: { data?: { message?: string }; statusMessage?: string } })
      .data

    state.value = {
      status: 'error',
      message:
        payload?.data?.message ||
        payload?.statusMessage ||
        'That did not work. Email donations@crosslovemovement.org and we will stop the gift by hand.',
    }
  }
})

useSeo({
  title: 'Manage your monthly gift',
  description: 'Stop a monthly gift to Cross-Love Movement.',
  path: '/donate/cancel',
})

useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <section class="container-page py-20 sm:py-28">
    <div class="mx-auto max-w-2xl">
      <div class="rounded-4xl border border-sand-200 bg-white p-7 shadow-soft sm:p-10">
        <div v-if="state.status === 'working'" class="text-center">
          <p class="eyebrow text-clay-700">One moment</p>
          <h1 class="mt-3 text-3xl leading-tight">Stopping your monthly gift…</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            We are telling Paystack to stop the next payment. Do not close this page.
          </p>
        </div>

        <div v-else-if="state.status === 'stopped'" class="text-center">
          <span
            class="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-100 text-brand-800"
          >
            <Icon name="check" :size="22" :stroke-width="2.5" />
          </span>
          <p class="mt-4 eyebrow text-clay-700">
            {{ state.already ? 'Already stopped' : 'Stopped' }}
          </p>
          <h1 class="mt-3 text-3xl leading-tight sm:text-4xl">
            {{
              state.already
                ? 'That monthly gift was already stopped.'
                : 'Your monthly gift is stopped.'
            }}
          </h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            <template v-if="state.amount && !state.already">
              No further payments of
              <strong class="font-semibold text-ink">{{ state.amount }}</strong>
              will be taken.
            </template>
            <template v-else>No further payments will be taken.</template>
            A confirmation is on its way to the email address you used.
          </p>
          <p v-if="reference" class="mt-4 text-xs text-ink-soft/80">Reference {{ reference }}</p>

          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <BaseButton to="/" variant="secondary">Back home</BaseButton>
            <BaseButton to="/donate" variant="secondary">Make a one-time gift</BaseButton>
          </div>
        </div>

        <div v-else-if="state.status === 'error'" class="text-center">
          <p class="eyebrow text-clay-700">Not stopped</p>
          <h1 class="mt-3 text-3xl leading-tight">We could not stop that gift.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{{ state.message }}</p>
          <p v-if="reference" class="mt-4 text-xs text-ink-soft/80">Reference {{ reference }}</p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <BaseButton :href="givingTeamHref">Email the giving team</BaseButton>
            <BaseButton to="/" variant="secondary">Back home</BaseButton>
          </div>
        </div>

        <div v-else class="text-center">
          <p class="eyebrow text-clay-700">Link incomplete</p>
          <h1 class="mt-3 text-3xl leading-tight">Use the link from your receipt.</h1>
          <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            The manage link carries a reference and a signature, and both have to be present. Open
            the newest receipt from donations@crosslovemovement.org and follow the link there — or
            write to us and we will stop the gift for you.
          </p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            <BaseButton href="mailto:donations@crosslovemovement.org">
              Email the giving team
            </BaseButton>
            <BaseButton to="/" variant="secondary">Back home</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
