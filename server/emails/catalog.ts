import type { TemplateVariables } from './types'

export interface EmailTemplate {
  /** Optional Resend template id/alias env var. */
  env: string
  /** File in `server/emails/templates`, copied into the build as a server asset. */
  file: string
}

/**
 * Every mail the app sends. The `.html` file is the single source of the
 * markup: it is rendered locally (preview and fallback) and can be pasted into
 * Resend verbatim, where `{{{VARIABLE}}}` placeholders are the same syntax.
 */
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  'event-registration': {
    env: 'RESEND_TEMPLATE_EVENT_REGISTRATION',
    file: 'event-registration.html',
  },
  'event-waitlist': { env: 'RESEND_TEMPLATE_EVENT_WAITLIST', file: 'event-waitlist.html' },
  'event-promoted': { env: 'RESEND_TEMPLATE_EVENT_PROMOTED', file: 'event-promoted.html' },
  'event-cancelled': { env: 'RESEND_TEMPLATE_EVENT_CANCELLED', file: 'event-cancelled.html' },
  'auth-invite': { env: 'RESEND_TEMPLATE_AUTH_INVITE', file: 'auth-invite.html' },
  'auth-reset': { env: 'RESEND_TEMPLATE_AUTH_RESET', file: 'auth-reset.html' },
  'volunteer-application': {
    env: 'RESEND_TEMPLATE_VOLUNTEER_APPLICATION',
    file: 'volunteer-application.html',
  },
  contact: { env: 'RESEND_TEMPLATE_CONTACT', file: 'contact.html' },
  donation: { env: 'RESEND_TEMPLATE_DONATION', file: 'donation.html' },
  partnership: { env: 'RESEND_TEMPLATE_PARTNERSHIP', file: 'partnership.html' },
  newsletter: { env: 'RESEND_TEMPLATE_NEWSLETTER', file: 'newsletter.html' },
}

/** The published Resend template for a mail kind, if one is configured. */
export function templateIdFor(kind: string | undefined) {
  if (!kind) return undefined

  const template = EMAIL_TEMPLATES[kind]
  if (!template) return undefined

  return process.env[template.env]?.trim() || undefined
}

export interface MailRoute {
  kind: string
  file: string
  env: string
  /** Configured template id/alias, or null when the app renders the file. */
  alias: string | null
}

/** Every kind and where it will be rendered from. Logged at boot. */
export function mailRoutes(): MailRoute[] {
  return Object.entries(EMAIL_TEMPLATES).map(([kind, template]) => ({
    kind,
    file: template.file,
    env: template.env,
    alias: process.env[template.env]?.trim() || null,
  }))
}

/** Absolute site URL. `NUXT_PUBLIC_SITE_URL` keeps preview deployments working. */
export function siteUrl() {
  const configured = process.env.NUXT_PUBLIC_SITE_URL?.trim()

  return (configured || 'https://www.crosslovemovement.org').replace(/\/+$/, '')
}

/** Every interpolated value goes through this before it reaches HTML. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const PLACEHOLDER = /\{\{\{\s*([A-Z0-9_]+)\s*\}\}\}/g

/** Replaces `{{{VARIABLE}}}` with escaped values. Used for preview and fallback. */
export function renderEmail(html: string, variables: TemplateVariables) {
  return html.replace(PLACEHOLDER, (_, key: string) => escapeHtml(String(variables[key] ?? '')))
}

/** Every variable a template file references. Used by the contract test. */
export function templateVariables(html: string) {
  return Array.from(new Set(Array.from(html.matchAll(PLACEHOLDER), (match) => match[1]!)))
}

const cache = new Map<string, string>()

/** Reads the template file from the build's server assets. */
export async function loadTemplate(kind: string) {
  const cached = cache.get(kind)
  if (cached) return cached

  const template = EMAIL_TEMPLATES[kind]
  if (!template) return undefined

  const html = await useStorage('assets:emails').getItem<string>(template.file)
  if (!html) return undefined

  cache.set(kind, html)
  return html
}

/** Keeps a user-supplied value from breaking out of a header. */
export function sanitizeSubject(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/**
 * Resend caps a string variable at 2,000 characters. Truncate rather than let
 * the whole send fail because someone pasted an essay into the form.
 */
export function take(value: string, max = 2_000) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}
