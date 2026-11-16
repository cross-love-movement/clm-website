import type { DonationRow } from '../../database/schema'
import { sanitizeSubject } from '../../emails/catalog'
import { donationVariables } from '../../emails/notifications'
import type { ComposedMail } from '../../emails/types'
import { MAILBOXES } from '../../utils/mailboxes'
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

/** The donor's receipt. One per settled donation, enforced by claimDonationReceipt. */
export function receiptMail(donation: DonationRow): ComposedMail {
  const amount = formatAmount(donation.amountPesewas, donation.currency)
  const date = paidOn(donation)
  const method = channelLabel(donation.channel)

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
      'If this is a monthly gift and you would like to change or pause it, reply to this email.',
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
