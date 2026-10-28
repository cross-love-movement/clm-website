import type {
  EventRow,
  RegistrationRow,
  VolunteerApplicationRow,
  VolunteerRow,
} from '../database/schema'
import { formNotification } from '../emails/layout'
import { inviteMail, passwordResetMail } from '../features/auth/mail'
import {
  cancellationMail,
  confirmationMail,
  promotionMail,
  waitlistMail,
} from '../features/events/mail'
import { applicationNotification } from '../features/volunteers/mail'

/**
 * Development-only preview of every branded email, with sample data.
 * Open /api/email-preview for the list, or ?kind=confirmation for one.
 * Returns 404 in production so it never becomes a public surface.
 */

const sampleEvent: EventRow = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'people-like-you-2027',
  title: 'People Like You',
  category: 'session',
  summary: 'A one-day symposium for young people.',
  description: '',
  startsAt: new Date('2027-06-12T09:00:00Z'),
  endsAt: new Date('2027-06-12T16:00:00Z'),
  venue: 'Accra International Conference Centre',
  address: 'Castle Road',
  city: 'Accra',
  capacity: 900,
  registrationDeadline: null,
  status: 'published',
  featured: true,
  image: '',
  imageAlt: '',
  createdBy: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

const sampleRegistration: RegistrationRow = {
  id: '00000000-0000-4000-8000-000000000002',
  reference: 'PEO-7K4M2Q',
  eventId: sampleEvent.id,
  name: 'Ama Mensah',
  email: 'ama@example.com',
  phone: '+233 55 175 7842',
  attendees: 2,
  notes: '',
  status: 'confirmed',
  consentAt: new Date('2026-01-01T00:00:00Z'),
  checkedInAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  cancelledAt: null,
}

const sampleVolunteer: VolunteerRow = {
  id: '00000000-0000-4000-8000-000000000003',
  userId: null,
  name: 'Kofi Boateng',
  email: 'kofi@example.com',
  phone: '+233 53 050 2774',
  city: 'Tema',
  skills: [],
  availability: 'Weekends',
  experience: 'Three years leading a youth choir.',
  status: 'applied',
  notes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  dateOfBirth: null,
  safeguardingConsentAt: new Date('2026-01-01T00:00:00Z'),
  safeguardingBriefingAt: null,
  backgroundCheckStatus: 'not_required',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

const sampleApplication: VolunteerApplicationRow = {
  id: '00000000-0000-4000-8000-000000000004',
  volunteerId: sampleVolunteer.id,
  programmeId: null,
  opportunityId: null,
  area: 'Music and media',
  availability: 'Weekends',
  experience: 'Three years leading a youth choir.',
  message: 'I would love to help with sound at Cross Sessions.',
  consentAt: new Date('2026-01-01T00:00:00Z'),
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

const previews: Record<string, () => string> = {
  confirmation: () => confirmationMail(sampleEvent, sampleRegistration).html,
  waitlist: () => waitlistMail(sampleEvent, sampleRegistration).html,
  promotion: () => promotionMail(sampleEvent, sampleRegistration).html,
  cancellation: () => cancellationMail(sampleEvent, sampleRegistration).html,
  invite: () =>
    inviteMail({
      name: 'Ama Mensah',
      role: 'volunteer',
      link: 'https://www.crosslovemovement.org/reset-password?token=sample-token',
    }).html,
  reset: () =>
    passwordResetMail({
      name: 'Ama Mensah',
      link: 'https://www.crosslovemovement.org/reset-password?token=sample-token',
    }).html,
  application: () =>
    applicationNotification({
      toEmail: 'apply@crosslovemovement.org',
      volunteer: sampleVolunteer,
      application: sampleApplication,
      programmeTitle: 'Cross Sessions',
      opportunityTitle: 'Sound engineer',
      adminUrl: 'https://www.crosslovemovement.org/admin/volunteers/1',
    }).html,
  contact: () =>
    formNotification({
      heading: 'New contact form message',
      intro: 'A visitor sent a message through the website contact form.',
      rows: [
        ['Name', 'Ama Mensah'],
        ['Email', 'ama@example.com'],
        ['Phone', '+233 55 175 7842'],
        ['Topic', 'general'],
      ],
      message: 'I would like to know when the next Cross Session is happening.',
      messageLabel: 'Message',
    }),
  donation: () =>
    formNotification({
      heading: 'New giving interest',
      intro: 'Someone registered a giving interest on the website.',
      rows: [
        ['Name', 'Ama Mensah'],
        ['Email', 'ama@example.com'],
        ['Amount', 'GH₵1,000'],
        ['Frequency', 'Monthly'],
      ],
      message: 'Please send the monthly transfer details.',
      messageLabel: 'Note',
      footnote: 'Reply to this email to send transfer details and confirm the giving schedule.',
    }),
  partnership: () =>
    formNotification({
      heading: 'New partnership enquiry',
      intro: 'Acme Foundation would like to explore a partnership.',
      rows: [
        ['Organisation', 'Acme Foundation'],
        ['Contact', 'Kwesi Owusu'],
        ['Email', 'kwesi@example.com'],
        ['Phone', '+233 55 175 7842'],
        ['Type', 'Funding and volunteers'],
      ],
      message: 'We can support transport for the choir this year.',
      messageLabel: 'What they have in mind',
    }),
  newsletter: () =>
    formNotification({
      heading: 'New newsletter signup',
      intro: 'Someone subscribed from the website footer.',
      rows: [['Email', 'ama@example.com']],
      footnote: 'Add this address to the monthly update list.',
    }),
}

export default defineEventHandler((event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const kind = getQuery(event).kind
  setHeader(event, 'content-type', 'text/html; charset=utf-8')

  if (typeof kind === 'string' && previews[kind]) return previews[kind]()

  const links = Object.keys(previews)
    .map(
      (name) =>
        `<li style="margin:6px 0;"><a href="/api/email-preview?kind=${name}" style="color:#b81828;">${name}</a></li>`,
    )
    .join('')

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Email previews</title></head>
<body style="font-family:system-ui,sans-serif;padding:32px;background:#faf5ec;color:#17120f;">
  <h1 style="font-size:22px;">Email previews</h1>
  <p style="color:#4a4139;">Rendered with sample data. Development only.</p>
  <ul style="list-style:none;padding:0;">${links}</ul>
</body></html>`
})
