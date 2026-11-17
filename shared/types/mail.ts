export const MAIL_STATUSES = ['pending', 'sent', 'failed'] as const

export type MailStatus = (typeof MAIL_STATUSES)[number]

export interface MailMessage {
  id: string
  kind: string
  toEmail: string
  subject: string
  status: MailStatus
  attempts: number
  lastError: string | null
  createdAt: string
  sentAt: string | null
}

export interface MailSummary {
  pending: number
  sent: number
  failed: number
}
