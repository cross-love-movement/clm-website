import type { EventRow, RegistrationRow } from '../../database/schema'
import {
  detailList,
  emailButton,
  emailLayout,
  paragraphs,
  referenceBlock,
  siteUrl,
} from '../../emails/layout'
import type { ComposedMail, TemplateVariables } from '../../emails/types'

export type { ComposedMail }

const WHEN = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Africa/Accra',
})

const SIGNATURE = ['', 'Cross-Love Movement', 'info@crosslovemovement.org']

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

/** Shared booking summary: reference card, then the practical details. */
function bookingHtml(event: EventRow, registration: RegistrationRow) {
  return [
    referenceBlock('Your reference', registration.reference),
    detailList([
      ['When', when(event)],
      ['Where', where(event)],
      ['Places', places(registration.attendees)],
    ]),
  ].join('')
}

function eventLink(event: EventRow) {
  return `${siteUrl()}/events?event=${encodeURIComponent(event.slug)}`
}

/** The variable set shared by all four event mails. */
function bookingVariables(event: EventRow, registration: RegistrationRow): TemplateVariables {
  return {
    NAME: registration.name,
    EVENT_TITLE: event.title,
    REFERENCE: registration.reference,
    WHEN: when(event),
    WHERE: where(event),
    PLACES: places(registration.attendees),
    EVENT_URL: eventLink(event),
  }
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
    html: emailLayout({
      preheader: `Your place at ${event.title} is confirmed.`,
      heading: 'Your place is confirmed',
      content: [
        paragraphs(
          `Hello ${registration.name},\n\nYour place at ${event.title} is confirmed. We are glad you are coming.`,
        ),
        bookingHtml(event, registration),
        emailButton('See the event', eventLink(event)),
      ].join(''),
      footnote:
        'Keep this reference — it is how we find your booking at the door. If your plans change, reply to this email so someone else can take the place.',
    }),
    variables: bookingVariables(event, registration),
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
    html: emailLayout({
      preheader: `${event.title} is full — we will email you if a place opens.`,
      heading: 'You are on the waitlist',
      content: [
        paragraphs(
          `Hello ${registration.name},\n\n${event.title} is currently full, so we have added you to the waitlist. If a place opens, we will email you automatically — you do not need to do anything.`,
        ),
        bookingHtml(event, registration),
        emailButton('See the event', eventLink(event)),
      ].join(''),
      footnote: 'Your reference keeps your place in the queue if seats are released.',
    }),
    variables: bookingVariables(event, registration),
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
    html: emailLayout({
      preheader: `A place has opened at ${event.title}.`,
      heading: 'A place has opened',
      content: [
        paragraphs(
          `Hello ${registration.name},\n\nGood news — a place has opened at ${event.title} and your booking is now confirmed.`,
        ),
        bookingHtml(event, registration),
        emailButton('See the event', eventLink(event)),
      ].join(''),
      footnote: 'Keep this reference — it is how we find your booking at the door.',
    }),
    variables: bookingVariables(event, registration),
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
    html: emailLayout({
      preheader: `Your booking for ${event.title} has been cancelled.`,
      heading: 'Your booking was cancelled',
      content: [
        paragraphs(
          `Hello ${registration.name},\n\nYour booking for ${event.title} has been cancelled and the seats released.`,
        ),
        detailList([
          ['Reference', registration.reference],
          ['Event', event.title],
          ['When', when(event)],
        ]),
      ].join(''),
      footnote: 'If this was not expected, reply to this email and we will look into it.',
    }),
    variables: bookingVariables(event, registration),
  }
}
