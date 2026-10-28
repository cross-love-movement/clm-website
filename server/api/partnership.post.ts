import { formNotification, sanitizeSubject } from '../emails/layout'
import { MAILBOXES } from '../utils/mailboxes'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your enquiry has been received.' }
  }

  rateLimit(`partnership:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`)

  const data = parseOrThrow(partnershipSchema, body)

  await sendMail({
    tag: 'partnership',
    to: MAILBOXES.info,
    replyTo: data.email,
    subject: sanitizeSubject(`Partnership enquiry — ${data.organisation}`),
    text: [
      'New partnership enquiry from the website.',
      '',
      `Organisation: ${data.organisation}`,
      `Contact:      ${data.contactName}`,
      `Email:        ${data.email}`,
      `Phone:        ${data.phone || '—'}`,
      `Type:         ${data.type}`,
      '',
      'Message:',
      data.message,
    ].join('\n'),
    html: formNotification({
      heading: 'New partnership enquiry',
      intro: `${data.organisation} would like to explore a partnership.`,
      rows: [
        ['Organisation', data.organisation],
        ['Contact', data.contactName],
        ['Email', data.email],
        ['Phone', data.phone || '—'],
        ['Type', data.type],
      ],
      message: data.message,
      messageLabel: 'What they have in mind',
    }),
  })

  return {
    message:
      'Thank you — your enquiry is with our partnerships team. We will reply within two working days to arrange an introductory call.',
  }
})
