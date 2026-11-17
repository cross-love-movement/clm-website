import { createHmac, timingSafeEqual } from 'node:crypto'

import { siteUrl } from '../../emails/catalog'
import { MAILBOXES } from '../../utils/mailboxes'

/**
 * The cancel link is stateless: an HMAC of the donation reference, keyed by the
 * session secret. Rotating NUXT_SESSION_PASSWORD invalidates old links, which
 * is acceptable; the donor can still reply to the receipt.
 */
function secret() {
  return process.env.NUXT_SESSION_PASSWORD?.trim() || ''
}

export function donationCancelToken(reference: string) {
  const key = secret()
  if (!key) return ''

  return createHmac('sha256', key).update(`donation-cancel:${reference}`).digest('hex')
}

export function verifyDonationCancelToken(reference: string, token: string | undefined | null) {
  const expected = donationCancelToken(reference)
  if (!expected || !token) return false

  const given = token.trim().toLowerCase()
  if (given.length !== expected.length) return false

  return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(given, 'utf8'))
}

/** Monthly gifts get a manage link; one-time gifts get the giving inbox. */
export function donationCancelUrl(reference: string) {
  const token = donationCancelToken(reference)
  if (!token) return `mailto:${MAILBOXES.donations}`

  const query = new URLSearchParams({ reference, token })

  return `${siteUrl()}/donate/cancel?${query.toString()}`
}
