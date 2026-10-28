/** Values substituted into a Resend-hosted template. Strings cap at 2,000 chars. */
export type TemplateVariables = Record<string, string | number>

/** A rendered message: plain text for clients that prefer it, HTML for everyone else. */
export interface ComposedMail {
  kind: string
  toEmail: string
  /** Optional Reply-To, so staff can answer the person who submitted. */
  replyTo?: string
  subject: string
  /** Plain-text alternative. Keep it complete — it is also the dev log. */
  body: string
  html: string
  /**
   * Variables for the matching Resend template. Used only when that kind has a
   * template configured; harmless otherwise.
   */
  variables?: TemplateVariables
}
