import type { EventRow, RegistrationRow } from '../../database/schema'

export interface ComposedMail {
  kind: string
  toEmail: string
  subject: string
  body: string
}

const WHEN = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Africa/Accra',
})

const SIGNATURE = ['', 'Cross-Love Movement', 'crosslovemovement.lbg@gmail.com']

function when(event: EventRow) {
  return `${WHEN.format(new Date(event.startsAt))} (GMT)`
}

function where(event: EventRow) {
  return [event.venue, event.address, event.city].filter(Boolean).join(', ')
}

function places(count: number) {
  return count === 1 ? '1 person' : `${count} people`
}

function details(event: EventRow, registration: RegistrationRow) {
  return [
    `Reference: ${registration.reference}`,
    `Places:    ${places(registration.attendees)}`,
    `When:      ${when(event)}`,
    `Where:     ${where(event)}`,
  ]
}

export function confirmationMail(event: EventRow, registration: RegistrationRow): ComposedMail {
  return {
    kind: 'event-registration',
    toEmail: registration.email,
    subject: `You are registered — ${event.title}`,
    body: [
      `Hello ${registration.name},`,
      '',
      `Your place at ${event.title} is confirmed.`,
      '',
      ...details(event, registration),
      '',
      'Keep this reference — it is how we find your booking at the door.',
      'If your plans change, reply to this email so someone else can take the place.',
      ...SIGNATURE,
    ].join('\n'),
  }
}

export function waitlistMail(event: EventRow, registration: RegistrationRow): ComposedMail {
  return {
    kind: 'event-waitlist',
    toEmail: registration.email,
    subject: `You are on the waitlist — ${event.title}`,
    body: [
      `Hello ${registration.name},`,
      '',
      `${event.title} is currently full, so we have added you to the waitlist.`,
      'If a place opens, we will email you automatically — you do not need to do anything.',
      '',
      ...details(event, registration),
      ...SIGNATURE,
    ].join('\n'),
  }
}

export function promotionMail(event: EventRow, registration: RegistrationRow): ComposedMail {
  return {
    kind: 'event-promoted',
    toEmail: registration.email,
    subject: `A place has opened — ${event.title}`,
    body: [
      `Hello ${registration.name},`,
      '',
      `Good news — a place has opened at ${event.title} and your booking is now confirmed.`,
      '',
      ...details(event, registration),
      '',
      'Keep this reference — it is how we find your booking at the door.',
      ...SIGNATURE,
    ].join('\n'),
  }
}

export function cancellationMail(event: EventRow, registration: RegistrationRow): ComposedMail {
  return {
    kind: 'event-cancelled',
    toEmail: registration.email,
    subject: `Your booking was cancelled — ${event.title}`,
    body: [
      `Hello ${registration.name},`,
      '',
      `Your booking ${registration.reference} for ${event.title} has been cancelled and the seats released.`,
      '',
      'If this was not expected, reply to this email and we will look into it.',
      ...SIGNATURE,
    ].join('\n'),
  }
}
