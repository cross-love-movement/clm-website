import type { DonationRow } from '../../database/schema'
import { sanitizeSubject } from '../../emails/catalog'
import { donationVariables } from '../../emails/notifications'
import type { ComposedMail } from '../../emails/types'
import { MAILBOXES } from '../../utils/mailboxes'
import { donationCancelUrl } from './cancel'
import { formatAmount } from './paystack'

function paidOn(donation: DonationRow) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Accra',
  }).format(donation.paidAt ?? donation.createdAt)
}

function frequencyLabel(donation: DonationRow) {
  return donation.frequency === 'monthly' ? 'Monthly' : 'One-time'
}

function channelLabel(channel: string | null) {
  switch (channel) {
    case 'card':
      return 'Card'
    case 'mobile_money':
      return 'Mobile money'
    case 'bank':
      return 'Bank transfer'
    default:
      return '—'
  }
}

/** The donor's receipt. One per settled donation, enforced by the receipt claim. */
export function receiptMail(donation: DonationRow): ComposedMail {
  const amount = formatAmount(donation.amountPesewas, donation.currency)
  const date = paidOn(donation)
  const method = channelLabel(donation.channel)
  // Only a monthly gift has something to manage; a one-time gift gets the inbox.
  const cancelUrl =
    donation.frequency === 'monthly'
      ? donationCancelUrl(donation.reference)
      : `mailto:${MAILBOXES.donations}`

  return {
    kind: 'donation-receipt',
    toEmail: donation.donorEmail,
    replyTo: MAILBOXES.donations,
    subject: sanitizeSubject(`Your gift of ${amount} — Cross-Love Movement`),
    body: [
      `Thank you, ${donation.donorName}.`,
      '',
      'Your gift has been received. Keep this email as your receipt.',
      '',
      `Amount:    ${amount}`,
      `Frequency: ${frequencyLabel(donation)}`,
      `Date:      ${date}`,
      `Method:    ${method}`,
      `Reference: ${donation.reference}`,
      '',
      `Note: ${donation.note || '—'}`,
      '',
      'Restricted gifts are ring-fenced and reported separately.',
      'If this is a monthly gift and you would like to change or pause it, use the manage link in this email or reply to this message.',
      '',
      'Cross-Love Movement Limited By Guarantee',
      'RGD CG041650523 · 64 Thirdes, GT-197-1816, Tema Community 12, Ghana',
    ].join('\n'),
    variables: {
      DONOR_NAME: donation.donorName,
      AMOUNT: amount,
      FREQUENCY: frequencyLabel(donation),
      DATE: date,
      METHOD: method,
      REFERENCE: donation.reference,
      NOTE: donation.note || '—',
      CANCEL_URL: cancelUrl,
    },
  }
}

/** Staff copy to donations@, carrying the same values the pledge form used. */
export function staffDonationMail(donation: DonationRow): ComposedMail {
  const amount = formatAmount(donation.amountPesewas, donation.currency)
  const frequency = donation.frequency === 'monthly' ? 'monthly' : 'one-time'

  return {
    kind: 'donation',
    toEmail: MAILBOXES.donations,
    replyTo: donation.donorEmail,
    subject: sanitizeSubject(`Gift received — ${amount} ${frequency} — ${donation.donorName}`),
    body: [
      'A gift has been paid through the website.',
      '',
      `Name:      ${donation.donorName}`,
      `Email:     ${donation.donorEmail}`,
      `Amount:    ${amount}`,
      `Frequency: ${frequencyLabel(donation)}`,
      `Method:    ${channelLabel(donation.channel)}`,
      `Reference: ${donation.reference}`,
      `Paid:      ${paidOn(donation)}`,
      '',
      'Note:',
      donation.note || '—',
    ].join('\n'),
    variables: donationVariables({
      name: donation.donorName,
      email: donation.donorEmail,
      amount,
      frequency,
      note: `${donation.note || '—'}\n\nReference: ${donation.reference}`,
    }),
  }
}

/** Confirmation after a donor cancels a monthly gift. */
export function cancellationMail(donation: DonationRow): ComposedMail {
  const amount = formatAmount(donation.amountPesewas, donation.currency)
  const date = paidOn(donation)

  return {
    kind: 'donation-cancelled',
    toEmail: donation.donorEmail,
    replyTo: MAILBOXES.donations,
    subject: sanitizeSubject('Your monthly gift has been cancelled — Cross-Love Movement'),
    body: [
      `Hello ${donation.donorName},`,
      '',
      `Your monthly gift of ${amount} has been cancelled. No further payments will be taken.`,
      '',
      `Reference: ${donation.reference}`,
      `Cancelled: ${date}`,
      '',
      'Thank you for standing with the work. If this was a mistake, reply to this email or write to donations@crosslovemovement.org and we will help.',
      '',
      'Cross-Love Movement Limited By Guarantee',
      'RGD CG041650523 · 64 Thirdes, GT-197-1816, Tema Community 12, Ghana',
    ].join('\n'),
    variables: {
      DONOR_NAME: donation.donorName,
      AMOUNT: amount,
      REFERENCE: donation.reference,
      DATE: date,
      CONTACT_EMAIL: MAILBOXES.donations,
    },
  }
}

/** The donor's confirmation that a gift has been sent back. */
export function refundMail(donation: DonationRow): ComposedMail {
  const amount = formatAmount(donation.amountPesewas, donation.currency)
  const refundedOn = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Accra',
  }).format(donation.refundedAt ?? new Date())

  return {
    kind: 'donation-refunded',
    toEmail: donation.donorEmail,
    replyTo: MAILBOXES.donations,
    subject: sanitizeSubject(`Your gift of ${amount} has been refunded — Cross-Love Movement`),
    body: [
      `Hello ${donation.donorName},`,
      '',
      `We have sent back your gift of ${amount}.`,
      '',
      `Reference: ${donation.reference}`,
      `Refunded:  ${refundedOn}`,
      '',
      'Depending on your bank or mobile-money provider it can take five to ten working days to appear. If it has not arrived after that, reply to this email or write to donations@crosslovemovement.org and we will chase it.',
      '',
      'Thank you for giving in the first place.',
      '',
      'Cross-Love Movement Limited By Guarantee',
      'RGD CG041650523 · 64 Thirdes, GT-197-1816, Tema Community 12, Ghana',
    ].join('\n'),
    variables: {
      DONOR_NAME: donation.donorName,
      AMOUNT: amount,
      REFERENCE: donation.reference,
      DATE: refundedOn,
      CONTACT_EMAIL: MAILBOXES.donations,
    },
  }
}

export interface RenewalFailure {
  donorName: string
  donorEmail: string
  amountPesewas: number
  currency: string
  reference: string
  subscriptionCode: string
  failedAt?: Date | null
}

/** Staff notice when a monthly charge does not renew. */
export function renewalFailedMail(input: RenewalFailure): ComposedMail {
  const amount = formatAmount(input.amountPesewas, input.currency)
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Accra',
  }).format(input.failedAt ?? new Date())

  return {
    kind: 'donation-renewal-failed',
    toEmail: MAILBOXES.donations,
    replyTo: input.donorEmail,
    subject: sanitizeSubject(`Monthly gift failed — ${amount} — ${input.donorName}`),
    body: [
      'A monthly gift did not renew.',
      '',
      `Donor:      ${input.donorName}`,
      `Email:      ${input.donorEmail}`,
      `Amount:     ${amount}`,
      `Reference:  ${input.reference || '—'}`,
      `Subscription: ${input.subscriptionCode || '—'}`,
      `Failed:     ${date}`,
      '',
      'Check the subscription in Paystack and follow up with the donor directly.',
    ].join('\n'),
    variables: {
      DONOR_NAME: input.donorName,
      DONOR_EMAIL: input.donorEmail,
      AMOUNT: amount,
      REFERENCE: input.reference || '—',
      SUBSCRIPTION: input.subscriptionCode || '—',
      DATE: date,
      CONTACT_EMAIL: MAILBOXES.donations,
    },
  }
}
