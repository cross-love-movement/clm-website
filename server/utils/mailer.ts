import { loadTemplate, renderEmail, templateIdFor } from '../emails/catalog'
import type { TemplateVariables } from '../emails/types'

interface MailInput {
  subject: string
  text: string
  replyTo?: string
  /** Recipient. Defaults to the organisation inbox (form submissions). */
  to?: string
  /** Mail kind. Selects the template and labels dev logs. */
  tag?: string
  /** Values for the template placeholders. */
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
 * `template`.
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
 * The markup lives in `server/emails/templates` and is used two ways:
 *  - pasted into a Resend template, selected by a `RESEND_TEMPLATE_*` var
 *  - rendered here with the same variables, for preview and fallback
 *
 * Without `NUXT_RESEND_API_KEY` the message is printed to the server console,
 * so local development and form testing work without an account.
 */
export async function sendMail({ subject, text, replyTo, to, tag, variables }: MailInput) {
  const config = useRuntimeConfig()
  const recipient = to ?? config.mailTo
  const templateId = templateIdFor(tag)
  const usingTemplate = Boolean(templateId && variables)

  if (templateId && !variables) {
    console.warn(
      `[mail] ${tag} has a Resend template configured but no variables — rendering the local file instead`,
    )
  }

  // A configured Resend template renders itself, so do not read the file.
  const template = !templateId && tag && variables ? await loadTemplate(tag) : undefined
  const html = template && variables ? renderEmail(template, variables) : undefined

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
        `Template: ${usingTemplate ? templateId : 'none — local HTML'}`,
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

    console.info(
      `[mail] ${tag ?? 'message'} delivered via ${
        usingTemplate
          ? `Resend template "${templateId}"`
          : html
            ? `server/emails/templates/${tag}.html`
            : 'plain text only'
      }`,
    )

    return { delivered: true as const }
  } catch (error) {
    console.error(
      `[mail] ${tag ?? 'message'} delivery failed (${usingTemplate ? `Resend template "${templateId}"` : 'local template'})`,
      error,
    )

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
