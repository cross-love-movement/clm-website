import type { H3Event } from 'h3'

import type { UserRole } from '#shared/types/auth'

function siteUrl(event: H3Event) {
  return useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
}

export function resetLink(event: H3Event, token: string) {
  return `${siteUrl(event)}/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendInviteEmail(
  event: H3Event,
  input: { to: string; name: string; role: UserRole; token: string },
) {
  const link = resetLink(event, input.token)
  const portal = input.role === 'volunteer' ? 'volunteer portal' : 'staff portal'

  await sendMail({
    tag: 'auth-invite',
    to: input.to,
    subject: 'Your Cross-Love Movement account',
    text: [
      `Hello ${input.name},`,
      '',
      `An account has been created for you on the Cross-Love Movement ${portal}.`,
      'Use the link below to set your password. It expires in 7 days and can only be used once.',
      '',
      link,
      '',
      'If you were not expecting this, you can ignore the email.',
    ].join('\n'),
  })
}

export async function sendPasswordResetEmail(
  event: H3Event,
  input: { to: string; name: string; token: string },
) {
  const link = resetLink(event, input.token)

  await sendMail({
    tag: 'auth-reset',
    to: input.to,
    subject: 'Reset your Cross-Love Movement password',
    text: [
      `Hello ${input.name},`,
      '',
      'Someone asked to reset the password on your account.',
      'Use the link below to choose a new one. It expires in 1 hour and can only be used once.',
      '',
      link,
      '',
      'If this was not you, no action is needed — your password has not changed.',
    ].join('\n'),
  })
}
