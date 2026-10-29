import type { SubscriberRow } from '../../database/schema'
import { sanitizeSubject, siteUrl } from '../../emails/catalog'
import { messageHtml } from '../../emails/text'
import type { ComposedMail } from '../../emails/types'

/** The public unsubscribe page. Every newsletter mail carries this link. */
export function unsubscribeUrl(token: string) {
  return `${siteUrl()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

const SIGNATURE = ['', 'Cross-Love Movement', 'info@crosslovemovement.org']

/**
 * The confirmation a new subscriber receives. This used to notify the
 * organisation inbox; that copy would grow with every signup, so the list is
 * now the record and this mail goes to the person who asked for it.
 */
export function welcomeMail(subscriber: SubscriberRow): ComposedMail {
  const unsubscribe = unsubscribeUrl(subscriber.token)

  return {
    kind: 'newsletter',
    toEmail: subscriber.email,
    subject: 'You are on the list — Cross-Love Movement',
    body: [
      'Hello,',
      '',
      'You are subscribed to the Cross-Love Movement monthly note.',
      'One short letter from the field each month: stories from the work, upcoming events,',
      'and an honest line about what we got wrong.',
      '',
      `Subscribed as: ${subscriber.email}`,
      '',
      'If this was not you, unsubscribe here:',
      unsubscribe,
      ...SIGNATURE,
    ].join('\n'),
    variables: {
      SUBSCRIBER_EMAIL: subscriber.email,
      OPT_OUT_URL: unsubscribe,
    },
  }
}

/** A staff-written issue sent to the whole subscribed list. */
export function issueMail(
  subscriber: SubscriberRow,
  message: { subject: string; body: string },
): ComposedMail {
  const unsubscribe = unsubscribeUrl(subscriber.token)
  const subject = sanitizeSubject(message.subject)

  return {
    kind: 'newsletter-broadcast',
    toEmail: subscriber.email,
    subject,
    body: [
      'Hello,',
      '',
      message.body,
      '',
      'You are receiving this because you subscribed to the Cross-Love Movement monthly note.',
      `Unsubscribe: ${unsubscribe}`,
      ...SIGNATURE,
    ].join('\n'),
    variables: {
      SUBSCRIBER_EMAIL: subscriber.email,
      SUBJECT: subject,
      MESSAGE_HTML: messageHtml(message.body),
      OPT_OUT_URL: unsubscribe,
    },
  }
}
