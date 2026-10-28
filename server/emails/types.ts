/** Values substituted into a Resend-hosted template. Strings cap at 2,000 chars. */
export type TemplateVariables = Record<string, string | number>

/**
 * A composed message. `variables` is the only body representation the app
 * keeps: the HTML comes from `server/emails/templates`, either rendered here or
 * by the Resend template with the same variables.
 */
export interface ComposedMail {
  kind: string
  toEmail: string
  /** Optional Reply-To, so staff can answer the person who submitted. */
  replyTo?: string
  subject: string
  /** Plain-text alternative. Keep it complete — it is also the dev log. */
  body: string
  variables: TemplateVariables
}
