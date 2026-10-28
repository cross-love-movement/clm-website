import type { VolunteerApplicationRow, VolunteerRow } from '../../database/schema'
import { sanitizeSubject, siteUrl, take } from '../../emails/catalog'
import type { ComposedMail } from '../../emails/types'

export function applicationNotification(input: {
  toEmail: string
  volunteer: VolunteerRow
  application: VolunteerApplicationRow
  programmeTitle: string | null
  opportunityTitle: string | null
  adminUrl?: string
}): ComposedMail {
  const { volunteer, application } = input

  const interest = [
    input.programmeTitle ? `Programme: ${input.programmeTitle}` : '',
    input.opportunityTitle ? `Role: ${input.opportunityTitle}` : '',
    !input.programmeTitle && !input.opportunityTitle && application.area
      ? `Interest: ${application.area}`
      : '',
  ].filter(Boolean)

  const lines = [
    `New volunteer application from ${volunteer.name}.`,
    '',
    `Email:        ${volunteer.email}`,
    `Phone:        ${volunteer.phone || '—'}`,
    `Based in:     ${volunteer.city}`,
    `Availability: ${application.availability || volunteer.availability || '—'}`,
    ...interest,
    '',
    'Experience:',
    application.experience || '—',
    '',
    'Message:',
    application.message || '—',
    '',
    `Safeguarding consent: ${application.consentAt.toISOString()}`,
    '',
    input.adminUrl ? `Review: ${input.adminUrl}` : '',
    input.adminUrl ? '' : 'Review this application in the staff portal under Volunteers.',
  ].filter((line, index, all) => line !== '' || all[index - 1] !== '')

  const interestLabel =
    input.opportunityTitle || input.programmeTitle || application.area || 'general'

  return {
    kind: 'volunteer-application',
    toEmail: input.toEmail,
    replyTo: volunteer.email,
    subject: sanitizeSubject(`Volunteer application — ${volunteer.name} — ${interestLabel}`),
    body: lines.join('\n'),
    variables: {
      APPLICANT_NAME: volunteer.name,
      APPLICANT_EMAIL: volunteer.email,
      PHONE: volunteer.phone || '—',
      CITY: volunteer.city,
      AVAILABILITY: application.availability || volunteer.availability || '—',
      PROGRAMME: input.programmeTitle || '—',
      ROLE: input.opportunityTitle || '—',
      INTEREST: (!input.programmeTitle && !input.opportunityTitle && application.area) || '—',
      EXPERIENCE: take(application.experience || '—'),
      MESSAGE: take(application.message || '—'),
      CONSENT_AT: application.consentAt.toISOString(),
      REVIEW_URL: input.adminUrl || `${siteUrl()}/admin/volunteers`,
    },
  }
}
