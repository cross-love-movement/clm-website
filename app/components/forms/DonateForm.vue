<script setup lang="ts">
import { donationOptions } from '~/data/involve'

const { values, errors, message, isSubmitting, isSuccess, submit, reset } = useForm('/api/donate', {
  name: '',
  email: '',
  amount: 300,
  frequency: 'one-time',
  note: '',
  company: '',
})

const choice = ref<number | 'custom'>(300)
const custom = ref('')

const activeAmount = computed(() => {
  if (choice.value === 'custom') {
    const parsed = Number.parseInt(custom.value.replace(/\D/g, ''), 10)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return choice.value
})

watch(activeAmount, (amount) => {
  values.amount = amount
})

function choosePreset(amount: number) {
  choice.value = amount
  custom.value = ''
}

function chooseCustom() {
  choice.value = 'custom'
}

const formatCedis = (amount: number) =>
  `GH₵${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

const frequencies: { value: 'one-time' | 'monthly'; label: string }[] = [
  { value: 'one-time', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' },
]
</script>

<template>
  <div>
    <AlertBox v-if="isSuccess" tone="success" title="Thank you — we have your pledge">
      <p class="mt-1">{{ message }}</p>
      <button
        type="button"
        class="mt-3 text-sm font-semibold text-brand-800 underline underline-offset-2"
        @click="reset"
      >
        Make another gift
      </button>
    </AlertBox>

    <form v-else novalidate class="space-y-6" @submit.prevent="submit">
      <fieldset>
        <legend class="text-sm font-semibold text-ink">How often would you like to give?</legend>
        <div class="mt-2.5 grid grid-cols-2 gap-1 rounded-full bg-sand-100 p-1">
          <button
            v-for="frequency in frequencies"
            :key="frequency.value"
            type="button"
            class="rounded-full px-4 py-2.5 text-sm font-semibold transition"
            :class="
              values.frequency === frequency.value
                ? 'bg-white text-brand-900 shadow-soft'
                : 'text-ink-soft hover:text-ink'
            "
            :aria-pressed="values.frequency === frequency.value"
            @click="values.frequency = frequency.value"
          >
            {{ frequency.label }}
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend class="text-sm font-semibold text-ink">Choose an amount</legend>

        <div class="mt-2.5 grid grid-cols-2 gap-2.5">
          <button
            v-for="option in donationOptions"
            :key="option.amount"
            type="button"
            class="rounded-2xl border p-4 text-left transition"
            :class="
              choice === option.amount
                ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20'
                : 'border-sand-300 bg-white hover:border-brand-300'
            "
            :aria-pressed="choice === option.amount"
            @click="choosePreset(option.amount)"
          >
            <span class="block font-display text-xl text-ink">{{ option.label }}</span>
            <span class="mt-1 block text-xs leading-relaxed text-ink-soft">
              {{ option.impact }}
            </span>
          </button>

          <button
            type="button"
            class="col-span-2 flex items-center justify-between rounded-2xl border p-4 text-left transition"
            :class="
              choice === 'custom'
                ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20'
                : 'border-sand-300 bg-white hover:border-brand-300'
            "
            :aria-pressed="choice === 'custom'"
            @click="chooseCustom"
          >
            <span>
              <span class="block text-sm font-semibold text-ink">Another amount</span>
              <span class="mt-0.5 block text-xs text-ink-soft">Any gift from GH₵50</span>
            </span>
            <span class="text-sm font-semibold text-brand-700">Choose</span>
          </button>
        </div>

        <div v-if="choice === 'custom'" class="mt-3">
          <label for="donation-custom" class="sr-only">Custom amount in Ghana cedis</label>
          <div class="relative">
            <span
              class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-soft"
            >
              GH₵
            </span>
            <input
              id="donation-custom"
              v-model="custom"
              type="text"
              inputmode="numeric"
              placeholder="1,000"
              class="w-full rounded-xl border border-sand-300 bg-white py-2.5 pl-16 pr-4 text-[0.95rem] text-ink transition focus:border-clay-500 focus:outline-none focus:ring-4 focus:ring-clay-500/15"
            />
          </div>
        </div>

        <p v-if="errors.amount" class="mt-2 text-sm font-medium text-red-700">
          {{ errors.amount }}
        </p>
        <p v-else class="mt-2 text-xs text-ink-soft">
          You are giving
          <strong class="font-semibold text-ink">{{ formatCedis(activeAmount) }}</strong>
          {{ values.frequency === 'monthly' ? 'each month' : 'once' }}.
        </p>
      </fieldset>

      <div class="grid gap-5 sm:grid-cols-2">
        <TextField
          v-model="values.name"
          label="Your name"
          name="name"
          autocomplete="name"
          placeholder="Ama Mensah"
          required
          :error="errors.name"
        />
        <TextField
          v-model="values.email"
          label="Email address"
          name="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
          :error="errors.email"
        />
      </div>

      <TextareaField
        v-model="values.note"
        label="Anything we should know?"
        name="note"
        :rows="3"
        placeholder="Optional — e.g. dedicate this gift to a project"
        :error="errors.note"
      />

      <p v-if="message && !isSuccess" class="text-sm font-medium text-red-700">{{ message }}</p>

      <BaseButton type="submit" size="lg" block :disabled="isSubmitting">
        {{ isSubmitting ? 'Sending…' : `Give ${formatCedis(activeAmount)}` }}
        <template #icon><Icon name="heart" :size="17" /></template>
      </BaseButton>

      <p class="text-center text-xs leading-relaxed text-ink-soft">
        We will email transfer details and a receipt within two working days. No card details are
        collected on this website.
      </p>

      <input
        v-model="values.company"
        type="text"
        name="company"
        tabindex="-1"
        autocomplete="off"
        class="hidden"
        aria-hidden="true"
      />
    </form>
  </div>
</template>
