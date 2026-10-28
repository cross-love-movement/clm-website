/**
 * Optional Resend-hosted templates.
 *
 * Each mail kind can be switched to a dashboard template by setting its env var
 * to the template id **or alias** (aliases survive across accounts, so staging
 * and production can share one value). Leaving the var empty keeps the HTML
 * rendered by this app, which is the default and always works.
 *
 * The `variables` list is the contract: Resend rejects a send when a variable
 * used by the template is missing, so `tests/email.test.ts` checks that every
 * composer supplies exactly these keys.
 */
export interface ResendTemplate {
  /** Environment variable holding the template id or alias. */
  env: string
  /** Variables the template must define. */
  variables: string[]
}

export const RESEND_TEMPLATES: Record<string, ResendTemplate> = {
  'event-registration': {
    env: 'RESEND_TEMPLATE_EVENT_REGISTRATION',
    variables: ['NAME', 'EVENT_TITLE', 'REFERENCE', 'WHEN', 'WHERE', 'PLACES', 'EVENT_URL'],
  },
  'event-waitlist': {
    env: 'RESEND_TEMPLATE_EVENT_WAITLIST',
    variables: ['NAME', 'EVENT_TITLE', 'REFERENCE', 'WHEN', 'WHERE', 'PLACES', 'EVENT_URL'],
  },
  'event-promoted': {
    env: 'RESEND_TEMPLATE_EVENT_PROMOTED',
    variables: ['NAME', 'EVENT_TITLE', 'REFERENCE', 'WHEN', 'WHERE', 'PLACES', 'EVENT_URL'],
  },
  'event-cancelled': {
    env: 'RESEND_TEMPLATE_EVENT_CANCELLED',
    variables: ['NAME', 'EVENT_TITLE', 'REFERENCE', 'WHEN', 'WHERE', 'PLACES', 'EVENT_URL'],
  },
  'auth-invite': {
    env: 'RESEND_TEMPLATE_AUTH_INVITE',
    variables: ['NAME', 'ACTION_URL', 'EXPIRES'],
  },
  'auth-reset': {
    env: 'RESEND_TEMPLATE_AUTH_RESET',
    variables: ['NAME', 'ACTION_URL', 'EXPIRES'],
  },
  'volunteer-application': {
    env: 'RESEND_TEMPLATE_VOLUNTEER_APPLICATION',
    variables: [
      'APPLICANT_NAME',
      'APPLICANT_EMAIL',
      'PHONE',
      'CITY',
      'AVAILABILITY',
      'PROGRAMME',
      'ROLE',
      'INTEREST',
      'EXPERIENCE',
      'MESSAGE',
      'CONSENT_AT',
      'REVIEW_URL',
    ],
  },
}

/** The configured template for a mail kind, if any. */
export function resendTemplateId(kind: string | undefined) {
  if (!kind) return undefined

  const template = RESEND_TEMPLATES[kind]
  if (!template) return undefined

  return process.env[template.env]?.trim() || undefined
}

/**
 * Resend caps a string variable at 2,000 characters. Truncate rather than let
 * the whole send fail because someone pasted an essay into the form.
 */
export function take(value: string, max = 2_000) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}
