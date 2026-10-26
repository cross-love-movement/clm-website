export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'Thank you — your giving interest has been recorded.' }
  }

  rateLimit(`donate:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)

  const data = parseOrThrow(donationSchema, body)

  const amount = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(data.amount)

  await sendMail({
    tag: 'donation',
    replyTo: data.email,
    subject: `Giving interest — ${amount} ${data.frequency} — ${data.name}`,
    text: [
      'Someone has registered giving interest on the website.',
      '',
      `Name:      ${data.name}`,
      `Email:     ${data.email}`,
      `Amount:    ${amount}`,
      `Frequency: ${data.frequency}`,
      '',
      'Note:',
      data.note || '—',
      '',
      'Send transfer details and confirm the giving schedule.',
    ].join('\n'),
  })

  return {
    message: `Thank you. We have recorded your ${data.frequency === 'monthly' ? 'monthly' : 'one-time'} gift of ${amount} and will email transfer details and a receipt within two working days.`,
  }
})
