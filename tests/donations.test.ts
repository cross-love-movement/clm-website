import { createHmac } from 'node:crypto'

import { afterEach, describe, expect, it } from 'vite-plus/test'

import {
  donationReference,
  formatAmount,
  verifyWebhookSignature,
} from '../server/features/donations/paystack'
import {
  donationCancelToken,
  donationCancelUrl,
  verifyDonationCancelToken,
} from '../server/features/donations/cancel'

const key = 'sk_test_unit'
const original = process.env.NUXT_PAYSTACK_SECRET_KEY

function sign(body: string) {
  return createHmac('sha512', key).update(body).digest('hex')
}

afterEach(() => {
  if (original === undefined) delete process.env.NUXT_PAYSTACK_SECRET_KEY
  else process.env.NUXT_PAYSTACK_SECRET_KEY = original
})

describe('paystack webhook signatures', () => {
  it('accepts the exact signed body', () => {
    process.env.NUXT_PAYSTACK_SECRET_KEY = key
    const body = JSON.stringify({ event: 'charge.success', data: { reference: 'CLM-DON-ABC' } })

    expect(verifyWebhookSignature(body, sign(body))).toBe(true)
  })

  it('rejects a tampered body', () => {
    process.env.NUXT_PAYSTACK_SECRET_KEY = key
    const body = '{"event":"charge.success"}'

    expect(verifyWebhookSignature(`${body} `, sign(body))).toBe(false)
    expect(verifyWebhookSignature(body, 'not-a-signature')).toBe(false)
  })

  it('rejects everything when no signature or key is present', () => {
    process.env.NUXT_PAYSTACK_SECRET_KEY = key
    const body = '{"event":"charge.success"}'

    expect(verifyWebhookSignature(body, null)).toBe(false)

    delete process.env.NUXT_PAYSTACK_SECRET_KEY
    expect(verifyWebhookSignature(body, sign(body))).toBe(false)
  })
})

describe('donation amounts and references', () => {
  it('works in pesewas', () => {
    expect(formatAmount(5_000)).toContain('50')
    expect(formatAmount(50_000)).toContain('500')
  })

  it('generates readable, unambiguous references', () => {
    expect(donationReference()).toMatch(/^CLM-DON-[A-HJ-NP-Z2-9]{10}$/)
    expect(donationReference()).not.toBe(donationReference())
  })
})

describe('donation cancel links', () => {
  const session = process.env.NUXT_SESSION_PASSWORD

  afterEach(() => {
    if (session === undefined) delete process.env.NUXT_SESSION_PASSWORD
    else process.env.NUXT_SESSION_PASSWORD = session
  })

  it('signs the reference itself, not the whole link', () => {
    process.env.NUXT_SESSION_PASSWORD = 'unit-session-secret'

    const token = donationCancelToken('CLM-DON-ABC')

    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(verifyDonationCancelToken('CLM-DON-ABC', token)).toBe(true)
    expect(verifyDonationCancelToken('CLM-DON-ABD', token)).toBe(false)
    expect(verifyDonationCancelToken('CLM-DON-ABC', 'nope')).toBe(false)
    expect(verifyDonationCancelToken('CLM-DON-ABC', null)).toBe(false)
  })

  it('builds the link the cancel page posts from', () => {
    process.env.NUXT_SESSION_PASSWORD = 'unit-session-secret'

    const url = new URL(donationCancelUrl('CLM-DON-ABC'))

    expect(url.pathname).toBe('/donate/cancel')
    expect(url.searchParams.get('reference')).toBe('CLM-DON-ABC')
    expect(verifyDonationCancelToken('CLM-DON-ABC', url.searchParams.get('token'))).toBe(true)
  })

  it('rotating the secret invalidates old links', () => {
    process.env.NUXT_SESSION_PASSWORD = 'unit-session-secret'
    const token = donationCancelToken('CLM-DON-ABC')

    process.env.NUXT_SESSION_PASSWORD = 'a-new-session-secret'

    expect(verifyDonationCancelToken('CLM-DON-ABC', token)).toBe(false)
  })

  it('falls back to the giving inbox when no secret is configured', () => {
    delete process.env.NUXT_SESSION_PASSWORD

    expect(donationCancelToken('CLM-DON-ABC')).toBe('')
    expect(donationCancelUrl('CLM-DON-ABC')).toBe('mailto:donations@crosslovemovement.org')
    expect(verifyDonationCancelToken('CLM-DON-ABC', 'anything')).toBe(false)
  })
})
