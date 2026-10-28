import type { Event } from '#shared/types/content'
import { registrationDeadlinePassed, remainingSeats, toAvailability } from '#shared/utils/events'
import { queryCollection } from '@nuxt/content/server'

import { reserveSeats } from '../../features/events/repository'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your registration has been received.' }
  }

  rateLimit(`events:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)

  const data = parseOrThrow(eventRegistrationSchema, body)
  const selected = (await queryCollection(event, 'events')
    .where('slug', '=', data.eventSlug)
    .first()) as Event | null

  if (!selected) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
      data: {
        message: 'We could not find that event.',
        errors: { eventSlug: 'Please choose an event from the list.' },
      },
    })
  }

  if (registrationDeadlinePassed(selected.registrationDeadline)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Registration closed',
      data: {
        message: `Registration for ${selected.title} has closed.`,
        errors: { eventSlug: 'Registration for this event has closed.' },
      },
    })
  }

  const reserved = reserveSeats({
    eventSlug: selected.slug,
    capacity: selected.capacity,
    registeredOffline: selected.registeredOffline,
    attendees: data.attendees,
    name: data.name,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
  })

  if (!reserved.ok) {
    const left = remainingSeats(selected.capacity, reserved.registered)

    throw createError({
      statusCode: 409,
      statusMessage: 'Not enough places',
      data: {
        message:
          left === 0
            ? `${selected.title} is now fully booked.`
            : `Only ${left} ${left === 1 ? 'place is' : 'places are'} left for ${selected.title}.`,
        errors: {
          attendees: left === 0 ? 'This event is fully booked.' : `Please choose ${left} or fewer.`,
        },
      },
    })
  }

  const when = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Accra',
  }).format(new Date(selected.startsAt))

  const availability = toAvailability(selected, reserved.registeredOnline)

  await sendMail({
    tag: 'event-registration',
    replyTo: data.email,
    subject: `Event registration — ${selected.title} — ${data.name}`,
    text: [
      'New event registration from the website.',
      '',
      `Event:     ${selected.title}`,
      `When:      ${when} (GMT)`,
      `Where:     ${selected.venue}, ${selected.address}, ${selected.city}`,
      `Places:    ${data.attendees}`,
      '',
      `Name:      ${data.name}`,
      `Email:     ${data.email}`,
      `Phone:     ${data.phone || '—'}`,
      '',
      'Notes:',
      data.notes || '—',
      '',
      `Running total: ${availability.registered} of ${availability.capacity} places (${availability.remaining} left).`,
    ].join('\n'),
  })

  return {
    message: `You are registered for ${selected.title} on ${when}. We will email the details and a reminder before the day.`,
    availability,
  }
})
