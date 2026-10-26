export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'You are subscribed.' }
  }

  rateLimit(`newsletter:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 3)

  const data = parseOrThrow(newsletterSchema, body)

  await sendMail({
    tag: 'newsletter',
    replyTo: data.email,
    subject: 'Newsletter signup',
    text: [
      'New newsletter signup from the website footer.',
      '',
      `Email: ${data.email}`,
      '',
      'Add this address to the monthly update list.',
    ].join('\n'),
  })

  return { message: 'You are subscribed. Look out for the next update.' }
})
