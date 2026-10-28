/**
 * Organisation mailboxes. Keep the routing in one place so a form, notification,
 * or reply-to cannot drift to the wrong inbox.
 */
export const MAILBOXES = {
  apply: 'apply@crosslovemovement.org',
  admin: 'admin@crosslovemovement.org',
  donate: 'donate@crosslovemovement.org',
  support: 'support@crosslovemovement.org',
  info: 'info@crosslovemovement.org',
} as const

/** Contact-form topics map to the team best placed to answer them. */
export function mailboxForContactTopic(topic: string) {
  switch (topic) {
    case 'volunteering':
      return MAILBOXES.apply
    case 'donation':
      return MAILBOXES.donate
    case 'complaint':
      return MAILBOXES.admin
    case 'general':
    case 'partnership':
    case 'media':
    default:
      return MAILBOXES.info
  }
}
