import { resendTemplateId } from '../emails/resend'
import type { TemplateVariables } from '../emails/types'

interface MailInput {
  subject: string
  text: string
  /** Branded HTML alternative. Omitted only for legacy outbox rows. */
  html?: string
  replyTo?: string
  /** Recipient. Defaults to the organisation inbox (form submissions). */
  to?: string
  /** Mail kind. Selects the Resend template (if configured) and labels dev logs. */
  tag?: string
  /** Values for the matching Resend template. */
  variables?: TemplateVariables
}

export interface MailPayload {
  from: string
  to: string[]
  subject: string
  reply_to?: string
  text?: string
  html?: string
  template?: { id: string; variables: TemplateVariables }
}

/**
 * Builds the Resend request body. Exported so the template rules are tested:
 * Resend rejects a payload that carries `html`, `text`, or `react` next to a
 * `template`, and rejects a template when a variable it uses is missing.
 */
export function buildMailPayload(input: {
  from: string
  to: string
  subject: string
  text: string
  html?: string
  replyTo?: string
  templateId?: string
  variables?: TemplateVariables
}): MailPayload {
  const payload: MailPayload = { from: input.from, to: [input.to], subject: input.subject }

  if (input.replyTo) payload.reply_to = input.replyTo

  if (input.templateId && input.variables) {
    payload.template = { id: input.templateId, variables: input.variables }

    return payload
  }

  payload.text = input.text
  if (input.html) payload.html = input.html

  return payload
}

/**
 * Sends mail through Resend over plain HTTP (no SDK required).
 *
 * Two delivery paths, chosen per mail kind:
 *  - no `RESEND_TEMPLATE_*` set: the branded HTML rendered by this app
 *  - a template configured: Resend's template id/alias plus variables
 *
 * Both paths send a plain-text alternative where Resend allows one; a template
 * renders its own body, so `html` and `text` must not be sent alongside it.
 *
 * Without `NUXT_RESEND_API_KEY` the message is logged to the server console,
 * so local development and form testing work without an account.
 */
export async function sendMail({ subject, text, html, replyTo, to, tag, variables }: MailInput) {
  const config = useRuntimeConfig()
  const recipient = to ?? config.mailTo
  const templateId = resendTemplateId(tag)
  const usingTemplate = Boolean(templateId && variables)

  if (!config.resendApiKey) {
    console.info(
      [
        '',
        '──────────── [mail:dev] ────────────',
        `Type:     ${tag ?? 'message'}`,
        `From:     ${config.mailFrom}`,
        `To:       ${recipient}`,
        `Reply-To: ${replyTo ?? '—'}`,
        `Subject:  ${subject}`,
        `Template: ${usingTemplate ? templateId : 'none — rendered HTML'}`,
        `HTML:     ${html ? `${html.length} bytes rendered` : 'none'}`,
        '',
        text,
        '────────────────────────────────────',
        '',
      ].join('\n'),
    )

    return { delivered: false as const }
  }

  const payload = buildMailPayload({
    from: config.mailFrom,
    to: recipient,
    subject,
    text,
    html,
    replyTo,
    templateId,
    variables,
  })

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    return { delivered: true as const }
  } catch (error) {
    console.error('[mail] delivery failed', error)

    throw createError({
      statusCode: 502,
      statusMessage: 'Mail delivery failed',
      data: {
        message:
          'We could not deliver that message just now. Please email us directly and we will pick it up.',
      },
    })
  }
}
