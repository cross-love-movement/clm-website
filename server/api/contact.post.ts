export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your message has been received.' }
  }

  rateLimit(`contact:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`)

  const data = parseOrThrow(contactSchema, body)

  await sendMail({
    tag: 'contact',
    replyTo: data.email,
    subject: `Contact form — ${data.topic} — ${data.name}`,
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
  })

  return {
    message: 'Thank you — your message is with us. We reply within two working days.',
  }
})
