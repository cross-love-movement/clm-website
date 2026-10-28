import { hasDatabase, useDatabase } from '../database/client'
import { mailOutbox } from '../database/schema'
import { drainOutbox } from '../features/mail/outbox'
import { applicationNotification } from '../features/volunteers/mail'
import { MAILBOXES } from '../utils/mailboxes'
import { submitApplication } from '../features/volunteers/repository'
import { applicationSchema } from '../features/volunteers/schemas'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your application has been received.' }
  }

  rateLimit(`volunteer:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`)

  const data = parseOrThrow(applicationSchema, body)

  if (!hasDatabase()) {
    // Keep the public form usable if the operations database is unavailable.
    await sendMail({
      tag: 'volunteer',
      to: MAILBOXES.apply,
      replyTo: data.email,
      subject: `Volunteer application — ${data.area || 'general'} — ${data.name}`,
      text: [
        'New volunteer application from the website.',
        '',
        `Name:         ${data.name}`,
        `Email:        ${data.email}`,
        `Phone:        ${data.phone || '—'}`,
        `Based in:     ${data.city}`,
        `Interest:     ${data.area || '—'}`,
        `Availability: ${data.availability}`,
        '',
        data.experience || '—',
      ].join('\n'),
    })

    return {
      message:
        'Thank you for offering your time. We will be in touch within two working days with next steps and the next training date.',
    }
  }

  const result = await submitApplication(data)

  const database = useDatabase()
  const config = useRuntimeConfig(event)
  const siteUrl = config.public.siteUrl.replace(/\/+$/, '')

  await database.insert(mailOutbox).values(
    applicationNotification({
      toEmail: MAILBOXES.apply,
      volunteer: result.volunteer,
      application: result.application,
      programmeTitle: result.programmeTitle,
      opportunityTitle: result.opportunityTitle,
      adminUrl: `${siteUrl}/admin/volunteers/${result.volunteer.id}`,
    }),
  )

  // Send now rather than waiting for the 20-second outbox tick. A failure is
  // recorded on the row and retried by the background worker.
  void drainOutbox().catch((error) => {
    console.error('[mail] volunteer notification was queued but not sent immediately', error)
  })

  return {
    message:
      'Thank you for offering your time. We will be in touch within two working days with next steps and the next training date.',
  }
})
