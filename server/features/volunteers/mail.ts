import type { VolunteerApplicationRow, VolunteerRow } from '../../database/schema'
import { sanitizeSubject, siteUrl, take } from '../../emails/catalog'
import type { ComposedMail } from '../../emails/types'
import { MAILBOXES } from '../../utils/mailboxes'

export function applicationNotification(input: {
  toEmail: string
  volunteer: VolunteerRow
  application: VolunteerApplicationRow
  programmeTitle: string | null
  eventTitle?: string | null
  opportunityTitle: string | null
  adminUrl?: string
}): ComposedMail {
  const { volunteer, application } = input

  const interest = [
    input.programmeTitle ? `Programme: ${input.programmeTitle}` : '',
    input.eventTitle ? `Event: ${input.eventTitle}` : '',
    input.opportunityTitle ? `Role: ${input.opportunityTitle}` : '',
    !input.programmeTitle && !input.eventTitle && !input.opportunityTitle && application.area
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
    input.opportunityTitle ||
    input.eventTitle ||
    input.programmeTitle ||
    application.area ||
    'general'

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
      EVENT: input.eventTitle || '—',
      ROLE: input.opportunityTitle || '—',
      INTEREST:
        (!input.programmeTitle &&
          !input.eventTitle &&
          !input.opportunityTitle &&
          application.area) ||
        '—',
      EXPERIENCE: take(application.experience || '—'),
      MESSAGE: take(application.message || '—'),
      CONSENT_AT: application.consentAt.toISOString(),
      REVIEW_URL: input.adminUrl || `${siteUrl()}/admin/volunteers`,
    },
  }
}

/** Sent when staff move an application to `approved`. */
export function approvalMail(volunteer: VolunteerRow, area = 'general volunteering'): ComposedMail {
  return {
    kind: 'volunteer-approved',
    toEmail: volunteer.email,
    replyTo: MAILBOXES.volunteers,
    subject: sanitizeSubject('Your volunteer application is approved — Cross-Love Movement'),
    body: [
      `Hello ${volunteer.name},`,
      '',
      `Thank you for offering your time. Your application to volunteer with Cross-Love Movement for ${area} has been approved.`,
      '',
      'We will be in touch about the next step: matching you with a programme or event, sharing the safeguarding briefing, and sending a portal invite when your account is ready.',
      '',
      `If you have a question in the meantime, reply to this email or write to ${MAILBOXES.volunteers}.`,
      '',
      'Cross-Love Movement Limited By Guarantee',
      'RGD CG041650523 · 64 Thirdes, GT-197-1816, Tema Community 12, Ghana',
    ].join('\n'),
    variables: {
      NAME: volunteer.name,
      AREA: area,
      CONTACT_EMAIL: MAILBOXES.volunteers,
    },
  }
}

/** Sent when staff move an application to `declined`. */
export function declineMail(volunteer: VolunteerRow, area = 'general volunteering'): ComposedMail {
  return {
    kind: 'volunteer-declined',
    toEmail: volunteer.email,
    replyTo: MAILBOXES.volunteers,
    subject: sanitizeSubject('Your volunteer application — Cross-Love Movement'),
    body: [
      `Hello ${volunteer.name},`,
      '',
      `Thank you for offering to volunteer with Cross-Love Movement. We are grateful for your interest in ${area}.`,
      '',
      'We cannot offer a place right now — we had more applications than openings for this round.',
      '',
      `We would like to stay in touch. If you would like to be considered for a future opportunity, reply to this email or write to ${MAILBOXES.volunteers}.`,
      '',
      'Cross-Love Movement Limited By Guarantee',
      'RGD CG041650523 · 64 Thirdes, GT-197-1816, Tema Community 12, Ghana',
    ].join('\n'),
    variables: {
      NAME: volunteer.name,
      AREA: area,
      CONTACT_EMAIL: MAILBOXES.volunteers,
    },
  }
}
