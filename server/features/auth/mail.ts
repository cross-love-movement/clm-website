import type { H3Event } from 'h3'

import type { UserRole } from '#shared/types/auth'

import { MAILBOXES } from '../../utils/mailboxes'

function siteUrl(event: H3Event) {
  return useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
}

export function resetLink(event: H3Event, token: string) {
  return `${siteUrl(event)}/reset-password?token=${encodeURIComponent(token)}`
}

export function inviteMail(input: { name: string; role: UserRole; link: string }) {
  const portal = input.role === 'volunteer' ? 'volunteer portal' : 'staff portal'

  return {
    subject: 'Your Cross-Love Movement account',
    body: [
      `Hello ${input.name},`,
      '',
      `An account has been created for you on the Cross-Love Movement ${portal}.`,
      'Use the link below to set your password. It expires in 7 days and can only be used once.',
      '',
      input.link,
      '',
      'If you were not expecting this, you can ignore the email.',
    ].join('\n'),
    variables: {
      NAME: input.name,
      PORTAL: portal,
      ACTION_URL: input.link,
      EXPIRES: '7 days',
    },
  }
}

export function passwordResetMail(input: { name: string; link: string }) {
  return {
    subject: 'Reset your Cross-Love Movement password',
    body: [
      `Hello ${input.name},`,
      '',
      'Someone asked to reset the password on your account.',
      'Use the link below to choose a new one. It expires in 1 hour and can only be used once.',
      '',
      input.link,
      '',
      'If this was not you, no action is needed — your password has not changed.',
    ].join('\n'),
    variables: {
      NAME: input.name,
      ACTION_URL: input.link,
      EXPIRES: '1 hour',
    },
  }
}

export async function sendInviteEmail(
  event: H3Event,
  input: { to: string; name: string; role: UserRole; token: string },
) {
  const mail = inviteMail({
    name: input.name,
    role: input.role,
    link: resetLink(event, input.token),
  })

  await sendMail({
    tag: 'auth-invite',
    to: input.to,
    replyTo: MAILBOXES.support,
    subject: mail.subject,
    text: mail.body,
    variables: mail.variables,
  })
}

export async function sendPasswordResetEmail(
  event: H3Event,
  input: { to: string; name: string; token: string },
) {
  const mail = passwordResetMail({ name: input.name, link: resetLink(event, input.token) })

  await sendMail({
    tag: 'auth-reset',
    to: input.to,
    replyTo: MAILBOXES.support,
    subject: mail.subject,
    text: mail.body,
    variables: mail.variables,
  })
}
