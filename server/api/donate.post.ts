import { formNotification, sanitizeSubject } from '../emails/layout'
import { MAILBOXES } from '../utils/mailboxes'

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
    to: MAILBOXES.donate,
    replyTo: data.email,
    subject: sanitizeSubject(`Giving interest — ${amount} ${data.frequency} — ${data.name}`),
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
    html: formNotification({
      heading: 'New giving interest',
      intro: 'Someone registered a giving interest on the website.',
      rows: [
        ['Name', data.name],
        ['Email', data.email],
        ['Amount', amount],
        ['Frequency', data.frequency === 'monthly' ? 'Monthly' : 'One-time'],
      ],
      message: data.note,
      messageLabel: 'Note',
      footnote: 'Reply to this email to send transfer details and confirm the giving schedule.',
    }),
  })

  return {
    message: `Thank you. We have recorded your ${data.frequency === 'monthly' ? 'monthly' : 'one-time'} gift of ${amount} and will email transfer details and a receipt within two working days.`,
  }
})
