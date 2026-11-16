import { createHmac } from 'node:crypto'

import { afterEach, describe, expect, it } from 'vite-plus/test'

import {
  donationReference,
  formatAmount,
  verifyWebhookSignature,
} from '../server/features/donations/paystack'

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
