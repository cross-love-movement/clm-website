/**
 * Brand tokens for email. Email clients cannot load the site's web fonts, so
 * the stacks below degrade to Georgia and system sans-serif; the colours and
 * spacing match `app/assets/css/main.css` so a message still looks like CLM.
 */
export const emailBrand = {
  site: 'https://www.crosslovemovement.org',
  logoPath: '/images/clm-mark.png',
  name: 'Cross-Love Movement',
  /** The registered name runs over two lines: Cross-Love Movement / Limited By Guarantee. */
  legalSuffix: 'Limited By Guarantee',
  tagline: 'Faith. Creativity. Inclusion.',
  email: 'info@crosslovemovement.org',
  phone: '+233 55 175 7842',
  address: ['28 Waterbird Lane', 'Sixth Avenue Street, Tema Community 11', 'Ghana'],
  registration: 'RGD CG041650523',
} as const

const color = {
  ink: '#17120f',
  inkSoft: '#4a4139',
  inkMuted: '#6b6259',
  sand50: '#fdfbf7',
  sand100: '#faf5ec',
  sand200: '#f2e8d7',
  brand900: '#17120f',
  brand300: '#b3a99c',
  clay600: '#b81828',
  white: '#ffffff',
} as const

const SANS =
  "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif"
const MONO = "'Courier New', Courier, monospace"

/** Absolute site URL. `NUXT_PUBLIC_SITE_URL` keeps preview deployments working. */
export function siteUrl() {
  const configured = process.env.NUXT_PUBLIC_SITE_URL?.trim()

  return (configured || emailBrand.site).replace(/\/+$/, '')
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

/**
 * Keeps a user-supplied value from breaking out of a header. CR/LF in a
 * subject only ever reaches the API by accident, so flatten it.
 */
export function sanitizeSubject(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/** Escaped paragraph; blank lines in the source become separate paragraphs. */
export function paragraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(
      (block) =>
        `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${color.inkSoft};">${escapeHtml(block).replace(/\n/g, '<br>')}</p>`,
    )
    .join('')
}

export function detailList(rows: Array<[string, string]>) {
  const cells = rows
    .filter(([, value]) => value.trim().length > 0)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:7px 16px 7px 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${color.inkMuted};text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:7px 0;font-family:${SANS};font-size:14px;line-height:1.5;color:${color.ink};font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('')

  if (!cells) return ''

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;border-collapse:collapse;">
      ${cells}
    </table>`
}

/** The booking code, set large so it is easy to read off a phone at the door. */
export function referenceBlock(label: string, value: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;background:${color.sand100};border:1px solid ${color.sand200};border-radius:16px;">
      <tr>
        <td align="center" style="padding:20px 16px;">
          <p style="margin:0;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${color.inkMuted};">${escapeHtml(label)}</p>
          <p style="margin:8px 0 0;font-family:${MONO};font-size:23px;font-weight:700;letter-spacing:.12em;color:${color.ink};">${escapeHtml(value)}</p>
        </td>
      </tr>
    </table>`
}

export function emailButton(label: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;">
      <tr>
        <td style="background:${color.clay600};border-radius:999px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-family:${SANS};font-size:14px;font-weight:700;line-height:1;color:${color.white};text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`
}

export function divider() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px;"><tr><td style="height:1px;background:${color.sand200};font-size:0;line-height:0;">&nbsp;</td></tr></table>`
}

export interface EmailLayoutInput {
  /** Inbox preview line. Hidden in the body. */
  preheader: string
  heading: string
  /** Pre-escaped HTML from the helpers above. */
  content: string
  /** One line explaining why the recipient got this. */
  footnote?: string
}

/**
 * Tables and inline styles only: it has to survive Outlook, Gmail, and Apple
 * Mail, none of which agree on much. The logo is decorative — the wordmark is
 * real text, so the header still reads correctly when images are blocked.
 */
export function emailLayout({ preheader, heading, content, footnote }: EmailLayoutInput) {
  const site = siteUrl()
  const logo = `${site}${emailBrand.logoPath}`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${color.sand100};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${color.sand100};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;">
            <tr>
              <td style="background:${color.white};border-radius:24px 24px 0 0;padding:28px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;padding-right:14px;">
                      <a href="${escapeHtml(site)}" style="text-decoration:none;">
                        <img src="${escapeHtml(logo)}" width="48" height="48" alt="${emailBrand.name}" style="display:block;width:48px;height:48px;border:0;">
                      </a>
                    </td>
                    <td style="vertical-align:middle;">
                      <p style="margin:0;font-family:${SANS};font-size:16px;line-height:1.15;font-weight:800;letter-spacing:.02em;text-transform:uppercase;color:${color.clay600};">${emailBrand.name}</p>
                      <p style="margin:5px 0 0;font-family:${SANS};font-size:11px;line-height:1.15;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:${color.clay600};">${emailBrand.legalSuffix}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:4px;background:${color.clay600};font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="background:${color.white};padding:36px 32px 8px;">
                <h1 style="margin:0 0 20px;font-family:${SERIF};font-size:26px;line-height:1.25;font-weight:600;color:${color.ink};">${escapeHtml(heading)}</h1>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="background:${color.white};padding:0 32px;">
                ${divider()}
              </td>
            </tr>
            <tr>
              <td style="background:${color.white};border-radius:0 0 24px 24px;padding:0 32px 32px;">
                ${
                  footnote
                    ? `<p style="margin:0 0 16px;font-family:${SANS};font-size:13px;line-height:1.6;color:${color.inkSoft};">${escapeHtml(footnote)}</p>`
                    : ''
                }
                <p style="margin:0 0 4px;font-family:${SANS};font-size:12px;line-height:1.6;color:${color.inkMuted};">${emailBrand.name}<br>${emailBrand.legalSuffix}</p>
                <p style="margin:0 0 4px;font-family:${SANS};font-size:12px;line-height:1.6;color:${color.inkMuted};">${emailBrand.registration} · ${emailBrand.address.join(', ')}</p>
                <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${color.inkMuted};">
                  <a href="${escapeHtml(site)}" style="color:${color.clay600};text-decoration:none;">crosslovemovement.org</a>
                  &nbsp;·&nbsp;
                  <a href="mailto:${emailBrand.email}" style="color:${color.clay600};text-decoration:none;">${emailBrand.email}</a>
                  &nbsp;·&nbsp;
                  ${emailBrand.phone}
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-family:${SANS};font-size:11px;line-height:1.6;color:${color.inkMuted};">Sent by the Cross-Love Movement website.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

/**
 * Internal notifications (contact form, giving interest, partnerships,
 * newsletter signups, volunteer applications). Staff read these in an inbox,
 * so the branded shell matters less than scannable labels.
 */
export function formNotification(input: {
  heading: string
  intro?: string
  rows?: Array<[string, string]>
  message?: string
  messageLabel?: string
  footnote?: string
}) {
  const content = [
    input.intro ? paragraphs(input.intro) : '',
    input.rows?.length ? detailList(input.rows) : '',
    input.message
      ? `<p style="margin:20px 0 6px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color.inkMuted};">${escapeHtml(input.messageLabel ?? 'Message')}</p>
         <p style="margin:0 0 16px;padding:16px;background:${color.sand50};border-left:3px solid ${color.sand200};font-family:${SANS};font-size:14px;line-height:1.65;color:${color.inkSoft};white-space:pre-wrap;">${escapeHtml(input.message)}</p>`
      : '',
  ].join('')

  return emailLayout({
    preheader: input.heading,
    heading: input.heading,
    content,
    footnote: input.footnote ?? 'Reply to this email to answer the sender directly.',
  })
}
