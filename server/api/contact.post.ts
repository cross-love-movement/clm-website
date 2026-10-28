import { formNotification, sanitizeSubject } from '../emails/layout'
import { mailboxForContactTopic } from '../utils/mailboxes'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your message has been received.' }
  }

  rateLimit(`contact:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`)

  const data = parseOrThrow(contactSchema, body)

  await sendMail({
    tag: 'contact',
    to: mailboxForContactTopic(data.topic),
    replyTo: data.email,
    subject: sanitizeSubject(`Contact form — ${data.topic} — ${data.name}`),
    text: [
      'New message from the website contact form.',
      '',
      `Name:    ${data.name}`,
      `Email:   ${data.email}`,
      `Phone:   ${data.phone || '—'}`,
      `Topic:   ${data.topic}`,
      '',
      'Message:',
      data.message,
    ].join('\n'),
    html: formNotification({
      heading: 'New contact form message',
      intro: 'A visitor sent a message through the website contact form.',
      rows: [
        ['Name', data.name],
        ['Email', data.email],
        ['Phone', data.phone || '—'],
        ['Topic', data.topic],
      ],
      message: data.message,
      messageLabel: 'Message',
    }),
  })

  return {
    message: 'Thank you — your message is with us. We reply within two working days.',
  }
})
