<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    label: string
    name: string
    type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'datetime-local' | 'date'
    error?: string
    hint?: string
    required?: boolean
    placeholder?: string
    autocomplete?: string
    inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'decimal'
    maxlength?: number
    min?: number
    max?: number
    step?: number
  }>(),
  { type: 'text' },
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
    <input
      :id="id"
      v-model="model"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      :required="required"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
      :class="controlClass(invalid)"
    />
  </FieldWrapper>
</template>
