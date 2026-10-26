<script setup lang="ts">
const model = defineModel<string>({ default: '' })

withDefaults(
  defineProps<{
    label: string
    name: string
    error?: string
    hint?: string
    required?: boolean
    placeholder?: string
    rows?: number
    maxlength?: number
  }>(),
  { rows: 5 },
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
    <textarea
      :id="id"
      v-model="model"
      :name="name"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :required="required"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
      :class="[controlClass(invalid), 'resize-y']"
    />
  </FieldWrapper>
</template>
