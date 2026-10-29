import type { EventRow, RegistrationRow } from '../../database/schema'
import { escapeHtml, sanitizeSubject, siteUrl } from '../../emails/catalog'
import type { ComposedMail, TemplateVariables } from '../../emails/types'

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

/** The variable set shared by all four event mails. */
function bookingVariables(event: EventRow, registration: RegistrationRow): TemplateVariables {
  return {
    NAME: registration.name,
    EVENT_TITLE: event.title,
    REFERENCE: registration.reference,
    WHEN: when(event),
    WHERE: where(event),
    PLACES: places(registration.attendees),
    EVENT_URL: `${siteUrl()}/events?event=${encodeURIComponent(event.slug)}`,
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
    variables: bookingVariables(event, registration),
  }
}

/**
 * The whole event is off — different from one guest cancelling a booking. No
 * reference code: the guest does not need one any more.
 */
export function calledOffMail(event: EventRow, registration: RegistrationRow): ComposedMail {
  return {
    kind: 'event-called-off',
    toEmail: registration.email,
    subject: `Event cancelled — ${event.title}`,
    body: [
      `Hello ${registration.name},`,
      '',
      `We are sorry to let you know that ${event.title} has been cancelled.`,
      '',
      `When:  ${when(event)}`,
      `Where: ${where(event)}`,
      '',
      'Your booking has been released and you do not need to do anything.',
      'We will write to you if the event is rescheduled.',
      ...SIGNATURE,
    ].join('\n'),
    variables: {
      NAME: registration.name,
      EVENT_TITLE: event.title,
      WHEN: when(event),
      WHERE: where(event),
    },
  }
}

/**
 * Staff-written plain text becomes the little HTML the template needs. Escaped
 * first, then newlines become `<br />`; `_HTML` variables are inserted raw by
 * the renderer because the app, not the public, built this string.
 */
export function messageHtml(message: string) {
  return message
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin: 0 0 14px;">${escapeHtml(block.trim()).replace(/\n/g, '<br />')}</p>`,
    )
    .join('')
}

export function broadcastMail(
  event: EventRow,
  recipient: { name: string; email: string },
  message: { subject: string; body: string },
): ComposedMail {
  return {
    kind: 'event-message',
    toEmail: recipient.email,
    subject: sanitizeSubject(message.subject),
    body: [`Hello ${recipient.name},`, '', message.body, ...SIGNATURE].join('\n'),
    variables: {
      NAME: recipient.name,
      EVENT_TITLE: event.title,
      WHEN: when(event),
      WHERE: where(event),
      MESSAGE_HTML: messageHtml(message.body),
    },
  }
}
