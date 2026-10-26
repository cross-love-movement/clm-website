import type { FieldErrors } from '#shared/types/content'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface ApiErrorBody {
  message?: string
  data?: {
    message?: string
    errors?: FieldErrors
  }
  errors?: FieldErrors
}

/**
 * Small wrapper around a server route so forms share one predictable
 * submit/error/success lifecycle.
 */
export function useForm<T extends Record<string, unknown>>(endpoint: string, initial: T) {
  const values = reactive({ ...initial }) as T
  const errors = ref<FieldErrors>({})
  const status = ref<FormStatus>('idle')
  const message = ref('')

  const isSubmitting = computed(() => status.value === 'submitting')
  const isSuccess = computed(() => status.value === 'success')
  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  async function submit() {
    if (status.value === 'submitting') return false

    status.value = 'submitting'
    errors.value = {}
    message.value = ''

    try {
      const response = await $fetch<{ message: string }>(endpoint, {
        method: 'POST',
        body: values,
      })

      status.value = 'success'
      message.value = response?.message ?? 'Thank you — your message has been received.'
      return true
    } catch (error) {
      const body = (error as { data?: ApiErrorBody }).data
      const payload = body?.data ?? body

      errors.value = payload?.errors ?? {}
      message.value =
        payload?.message ??
        'We could not send that just now. Please check your connection and try again, or email us directly.'
      status.value = 'error'
      return false
    }
  }

  function reset() {
    Object.assign(values, initial)
    errors.value = {}
    message.value = ''
    status.value = 'idle'
  }

  return {
    values,
    errors,
    status,
    message,
    isSubmitting,
    isSuccess,
    hasErrors,
    submit,
    reset,
  }
}
