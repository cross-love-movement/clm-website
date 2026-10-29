import type { TemplateVariables } from './types'

/**
 * Variable builders for the staff notifications. Kept together so the routes
 * and the template contract test read from one source.
 */

export function contactVariables(input: {
  name: string
  email: string
  phone?: string
  topic: string
  message: string
}): TemplateVariables {
  return {
    NAME: input.name,
    SENDER_EMAIL: input.email,
    PHONE: input.phone || '—',
    TOPIC: input.topic,
    MESSAGE: input.message,
  }
}

export function donationVariables(input: {
  name: string
  email: string
  amount: string
  frequency: 'monthly' | 'one-time'
  note?: string
}): TemplateVariables {
  return {
    NAME: input.name,
    DONOR_EMAIL: input.email,
    AMOUNT: input.amount,
    FREQUENCY: input.frequency === 'monthly' ? 'Monthly' : 'One-time',
    NOTE: input.note || '—',
  }
}

export function partnershipVariables(input: {
  organisation: string
  contactName: string
  email: string
  phone?: string
  type: string
  message: string
}): TemplateVariables {
  return {
    ORGANISATION: input.organisation,
    CONTACT_NAME: input.contactName,
    PARTNER_EMAIL: input.email,
    PHONE: input.phone || '—',
    TYPE: input.type,
    MESSAGE: input.message,
  }
}
