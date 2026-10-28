import type { H3Event } from 'h3'

import type { UserRole } from '#shared/types/auth'

import { emailButton, emailLayout, escapeHtml, paragraphs } from '../../emails/layout'
import { MAILBOXES } from '../../utils/mailboxes'

function siteUrl(event: H3Event) {
  return useRuntimeConfig(event).public.siteUrl.replace(/\/+$/, '')
}

export function resetLink(event: H3Event, token: string) {
  return `${siteUrl(event)}/reset-password?token=${encodeURIComponent(token)}`
}

/** Fallback for clients that strip buttons and for people who print email. */
function rawLink(link: string) {
  return `<p style="margin:0 0 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b6259;">If the button does not work, paste this link into your browser:<br><a href="${escapeHtml(link)}" style="color:#b81828;word-break:break-all;">${escapeHtml(link)}</a></p>`
}

export function inviteMail(input: { name: string; role: UserRole; link: string }) {
  const portal = input.role === 'volunteer' ? 'volunteer portal' : 'staff portal'

  return {
    subject: 'Your Cross-Love Movement account',
    variables: { NAME: input.name, ACTION_URL: input.link, EXPIRES: '7 days' },
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
    html: emailLayout({
      preheader: 'Set your password to open your Cross-Love Movement account.',
      heading: 'Your account is ready',
      content: [
        paragraphs(
          `Hello ${input.name},\n\nAn account has been created for you on the Cross-Love Movement ${portal}. Choose a password to open it.`,
        ),
        emailButton('Set your password', input.link),
        rawLink(input.link),
        paragraphs(
          'This link expires in 7 days and can only be used once. If you were not expecting this email, you can ignore it — no account is active until a password is set.',
        ),
      ].join(''),
      footnote:
        'You are receiving this because the Cross-Love Movement team created an account for you.',
    }),
  }
}

export function passwordResetMail(input: { name: string; link: string }) {
  return {
    subject: 'Reset your Cross-Love Movement password',
    variables: { NAME: input.name, ACTION_URL: input.link, EXPIRES: '1 hour' },
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
    html: emailLayout({
      preheader: 'Choose a new password. The link expires in one hour.',
      heading: 'Reset your password',
      content: [
        paragraphs(
          `Hello ${input.name},\n\nSomeone asked to reset the password on your account. Choose a new one below — the link expires in 1 hour and can only be used once.`,
        ),
        emailButton('Choose a new password', input.link),
        rawLink(input.link),
        paragraphs('If this was not you, no action is needed — your password has not changed.'),
      ].join(''),
      footnote: 'You are receiving this because a password reset was requested for your account.',
    }),
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
    html: mail.html,
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
    html: mail.html,
    variables: mail.variables,
  })
}
