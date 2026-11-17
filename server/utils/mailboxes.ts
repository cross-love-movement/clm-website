/**
 * Organisation mailboxes. Keep the routing in one place so a form, notification,
 * or reply-to cannot drift to the wrong inbox.
 */
export const MAILBOXES = {
  volunteers: 'volunteers@crosslovemovement.org',
  admin: 'admin@crosslovemovement.org',
  donations: 'donations@crosslovemovement.org',
  media: 'media@crosslovemovement.org',
  support: 'support@crosslovemovement.org',
  info: 'info@crosslovemovement.org',
} as const

/** Contact-form topics map to the team best placed to answer them. */
export function mailboxForContactTopic(topic: string) {
  switch (topic) {
    case 'volunteering':
      return MAILBOXES.volunteers
    case 'donation':
      return MAILBOXES.donations
    case 'complaint':
      return MAILBOXES.admin
    case 'media':
      return MAILBOXES.media
    case 'general':
    case 'partnership':
    default:
      return MAILBOXES.info
  }
}
