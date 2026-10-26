<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    label: string
    name: string
    options: { value: string; label: string }[]
    placeholder?: string
    error?: string
    hint?: string
    required?: boolean
  }>(),
  { placeholder: 'Please choose…' },
)
</script>

<template>
  <FieldWrapper
    v-slot="{ id, describedBy, invalid }"
    :label="label"
    :error="error"
    :hint="hint"
    :required="required"
  >
    <div class="relative">
      <select
        :id="id"
        v-model="model"
        :name="name"
        :required="required"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        :class="[controlClass(invalid), 'appearance-none pr-10']"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <Icon
        name="chevron-down"
        :size="18"
        class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/70"
      />
    </div>
  </FieldWrapper>
</template>
