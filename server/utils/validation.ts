import type { ZodType } from 'zod'
import type { FieldErrors } from '#shared/types/content'

/**
 * Validates a request body and throws a 400 carrying field-level errors that
 * `useForm` on the client knows how to render.
 */
export function parseOrThrow<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body ?? {})

  if (result.success) return result.data

  const errors: FieldErrors = {}

  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : 'form'
    if (!errors[key]) errors[key] = issue.message
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Validation failed',
    data: {
      message: 'Please check the highlighted fields and try again.',
      errors,
    },
  })
}

/**
 * Hidden honeypot field. Bots fill it in; humans never see it.
 */
export function isBot(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const value = (body as { company?: unknown }).company
  return typeof value === 'string' && value.trim().length > 0
}
