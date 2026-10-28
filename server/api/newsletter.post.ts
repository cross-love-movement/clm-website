import { formNotification } from '../emails/layout'
import { MAILBOXES } from '../utils/mailboxes'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'You are subscribed.' }
  }

  rateLimit(`newsletter:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 3)

  const data = parseOrThrow(newsletterSchema, body)

  await sendMail({
    tag: 'newsletter',
    to: MAILBOXES.info,
    replyTo: data.email,
    subject: 'Newsletter signup',
    text: [
      'New newsletter signup from the website footer.',
      '',
      `Email: ${data.email}`,
      '',
      'Add this address to the monthly update list.',
    ].join('\n'),
    html: formNotification({
      heading: 'New newsletter signup',
      intro: 'Someone subscribed from the website footer.',
      rows: [['Email', data.email]],
      footnote: 'Add this address to the monthly update list.',
    }),
  })

  return { message: 'You are subscribed. Look out for the next update.' }
})
