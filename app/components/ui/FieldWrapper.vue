<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    hint?: string
    required?: boolean
    labelHidden?: boolean
  }>(),
  { labelHidden: false },
)

const id = useId()

const describedBy = computed(() => {
  if (props.error) return `${id}-error`
  if (props.hint) return `${id}-hint`
  return undefined
})

const invalid = computed(() => Boolean(props.error))

defineSlots<{
  default(props: { id: string; describedBy?: string; invalid: boolean }): unknown
}>()
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="id"
      class="mb-1.5 block text-sm font-semibold text-ink"
      :class="labelHidden ? 'sr-only' : ''"
    >
      {{ label }}
      <span v-if="required" class="text-clay-600" aria-hidden="true">*</span>
      <span v-if="required" class="sr-only">(required)</span>
    </label>

    <slot :id="id" :described-by="describedBy" :invalid="invalid" />

    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-sm font-medium text-red-700">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-hint`" class="mt-1.5 text-sm text-ink-soft/80">
      {{ hint }}
    </p>
  </div>
</template>
