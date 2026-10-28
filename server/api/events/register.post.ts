import { hasDatabase } from '../../database/client'
import { parseOrThrow } from '../../utils/validation'
import { eventRegistrationSchema } from '../../utils/schemas'
import { registerForEvent } from '../../features/events/repository'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your registration has been received.' }
  }

  rateLimit(`events:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)

  const data = parseOrThrow(eventRegistrationSchema, body)

  if (!hasDatabase()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Registration is temporarily unavailable',
      data: {
        message:
          'Online registration is unavailable right now. Please email apply@crosslovemovement.org and we will reserve your place.',
      },
    })
  }

  const result = await registerForEvent({
    slug: data.eventSlug,
    name: data.name,
    email: data.email,
    phone: data.phone,
    attendees: data.attendees,
    notes: data.notes,
  })

  if (!result.ok) {
    if (result.reason === 'not-found') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found',
        data: {
          message: 'We could not find that event.',
          errors: { eventSlug: 'Please choose an event from the list.' },
        },
      })
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'Registration closed',
      data: {
        message: 'Registration for this event has closed.',
        errors: { eventSlug: 'Registration for this event has closed.' },
      },
    })
  }

  return {
    message:
      result.status === 'confirmed'
        ? `You are registered for ${result.event.title}. Check your email for your reference code.`
        : `${result.event.title} is full, so you are on the waitlist. Check your email for your reference.`,
    status: result.status,
    availability: result.event.availability,
  }
})
