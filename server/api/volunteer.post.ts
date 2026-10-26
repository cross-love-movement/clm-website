export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your application has been received.' }
  }

  rateLimit(`volunteer:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`)

  const data = parseOrThrow(volunteerSchema, body)

  await sendMail({
    tag: 'volunteer',
    replyTo: data.email,
    subject: `Volunteer application — ${data.area} — ${data.name}`,
    text: [
      'New volunteer application from the website.',
      '',
      `Name:         ${data.name}`,
      `Email:        ${data.email}`,
      `Phone:        ${data.phone || '—'}`,
      `Based in:     ${data.city}`,
      `Role:         ${data.area}`,
      `Availability: ${data.availability}`,
      '',
      'Experience / notes:',
      data.experience || '—',
    ].join('\n'),
  })

  return {
    message:
      'Thank you for offering your time. We will be in touch within two working days with next steps and the next training date.',
  }
})
