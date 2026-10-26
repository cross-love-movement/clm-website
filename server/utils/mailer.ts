interface MailInput {
  subject: string
  text: string
  replyTo?: string
  /** Used only in development logs. */
  tag?: string
}

/**
 * Sends mail through Resend over plain HTTP (no SDK required).
 *
 * Without `NUXT_RESEND_API_KEY` the message is logged to the server console,
 * so local development and form testing work without an account.
 */
export async function sendMail({ subject, text, replyTo, tag }: MailInput) {
  const config = useRuntimeConfig()

  if (!config.resendApiKey) {
    console.info(
      [
        '',
        '──────────── [mail:dev] ────────────',
        `Type:     ${tag ?? 'message'}`,
        `From:     ${config.mailFrom}`,
        `To:       ${config.mailTo}`,
        `Reply-To: ${replyTo ?? '—'}`,
        `Subject:  ${subject}`,
        '',
        text,
        '────────────────────────────────────',
        '',
      ].join('\n'),
    )

    return { delivered: false as const }
  }

  try {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        from: config.mailFrom,
        to: [config.mailTo],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      },
    })

    return { delivered: true as const }
  } catch (error) {
    console.error('[mail] delivery failed', error)

    throw createError({
      statusCode: 502,
      statusMessage: 'Mail delivery failed',
      data: {
        message:
          'We could not deliver that message just now. Please email us directly and we will pick it up.',
      },
    })
  }
}
