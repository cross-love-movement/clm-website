import { getEventBySlug } from '#shared/data/events'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your registration has been received.' }
  }

  rateLimit(`events:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)

  const data = parseOrThrow(eventRegistrationSchema, body)
  const selected = getEventBySlug(data.eventSlug)

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

  const closed =
    selected.registered >= selected.capacity ||
    (selected.registrationDeadline !== undefined &&
      new Date(selected.registrationDeadline).getTime() < Date.now())

  if (closed) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Registration closed',
      data: {
        message: `Registration for ${selected.title} has closed.`,
        errors: { eventSlug: 'Registration for this event has closed.' },
      },
    })
  }

  const when = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Accra',
  }).format(new Date(selected.startsAt))

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
      `Running total: ${selected.registered + data.attendees} of ${selected.capacity} places.`,
    ].join('\n'),
  })

  return {
    message: `You are registered for ${selected.title} on ${when}. We will email the details and a reminder before the day.`,
  }
})
