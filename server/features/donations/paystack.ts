import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Thin Paystack client. The secret key only ever lives on the server, and every
 * amount crossing this boundary is in minor units (pesewas).
 */
function apiBase() {
  return (process.env.NUXT_PAYSTACK_API_URL?.trim() || 'https://api.paystack.co').replace(
    /\/+$/,
    '',
  )
}

function secretKey() {
  return process.env.NUXT_PAYSTACK_SECRET_KEY?.trim() || ''
}

export function paystackConfigured() {
  return Boolean(secretKey())
}

async function request<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<T> {
  const key = secretKey()

  if (!key) {
    throw createError({ statusCode: 503, statusMessage: 'Payments are not configured' })
  }

  const response = await fetch(`${apiBase()}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  const payload = (await response.json().catch(() => null)) as {
    status?: boolean
    message?: string
    data?: T
  } | null

  if (!response.ok || !payload?.status || payload.data === undefined) {
    console.error('[paystack] request failed', path, response.status, payload?.message)

    throw createError({
      statusCode: 502,
      statusMessage: 'Paystack request failed',
      data: { message: 'The payment provider did not accept that request. Please try again.' },
    })
  }

  return payload.data
}

export interface PaystackCustomer {
  email?: string
  customer_code?: string
  first_name?: string | null
  last_name?: string | null
}

export interface PaystackTransaction {
  reference?: string
  status?: string
  amount?: number
  currency?: string
  channel?: string | null
  paid_at?: string | null
  customer?: PaystackCustomer | null
  plan?: { plan_code?: string } | string | null
  subscription?: { subscription_code?: string } | null
  metadata?: Record<string, unknown> | null
}

export interface InitializedTransaction {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackSubscription {
  subscription_code?: string
  email_token?: string
  status?: string
  next_payment_date?: string | null
  plan?: { plan_code?: string; name?: string; amount?: number } | string | null
  customer?: PaystackCustomer | null
}

/** Webhook bodies for the subscription events we act on. */
export interface PaystackWebhookData extends PaystackTransaction {
  subscription_code?: string
  code?: string
  next_payment_date?: string | null
}

export function initializeTransaction(input: {
  email: string
  amountPesewas: number
  reference: string
  callbackUrl: string
  planCode?: string | null
  metadata?: Record<string, unknown>
}) {
  return request<InitializedTransaction>('/transaction/initialize', {
    method: 'POST',
    body: {
      email: input.email,
      amount: input.amountPesewas,
      currency: 'GHS',
      reference: input.reference,
      callback_url: input.callbackUrl,
      ...(input.planCode ? { plan: input.planCode } : {}),
      metadata: input.metadata ?? {},
    },
  })
}

export function verifyTransaction(reference: string) {
  return request<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`)
}

export function getSubscription(code: string) {
  return request<PaystackSubscription>(`/subscription/${encodeURIComponent(code)}`)
}

/** Disables a monthly subscription. Paystack needs its email token, not ours. */
export async function disableSubscription(code: string, token: string) {
  const key = secretKey()

  if (!key) {
    throw createError({ statusCode: 503, statusMessage: 'Payments are not configured' })
  }

  const response = await fetch(`${apiBase()}/subscription/disable`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ code, token }),
  })

  const payload = (await response.json().catch(() => null)) as {
    status?: boolean
    message?: string
  } | null

  if (!response.ok || !payload?.status) {
    console.error('[paystack] disable subscription failed', code, response.status, payload?.message)

    throw createError({
      statusCode: 502,
      statusMessage: 'Could not cancel the subscription',
      data: {
        message:
          'Paystack did not accept the cancellation just now. Please email donations@crosslovemovement.org and we will handle it.',
      },
    })
  }

  return true
}

export function createMonthlyPlan(amountPesewas: number) {
  return request<{ plan_code: string }>('/plan', {
    method: 'POST',
    body: {
      name: `Monthly giving — GH₵${(amountPesewas / 100).toLocaleString('en-GH')}`,
      interval: 'monthly',
      amount: amountPesewas,
      currency: 'GHS',
    },
  })
}

/** HMAC-SHA512 of the raw request body, keyed by the secret key. */
export function verifyWebhookSignature(rawBody: string, signature: string | null | undefined) {
  const key = secretKey()

  if (!key || !signature) return false

  const expected = createHmac('sha512', key).update(rawBody).digest('hex')
  const given = signature.trim().toLowerCase()

  if (given.length !== expected.length) return false

  return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(given, 'utf8'))
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Human-readable and unique: CLM-DON-XXXXXXXXXX. */
export function donationReference() {
  const bytes = randomBytes(10)
  let out = ''

  for (const byte of bytes) {
    out += ALPHABET[byte % ALPHABET.length]
  }

  return `CLM-DON-${out}`
}

export function formatAmount(pesewas: number, currency = 'GHS') {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(pesewas / 100)
}
