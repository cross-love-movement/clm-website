import type {
  EventRow,
  RegistrationRow,
  VolunteerApplicationRow,
  VolunteerRow,
} from '../database/schema'
import { EMAIL_TEMPLATES, loadTemplate, renderEmail } from '../emails/catalog'
import {
  contactVariables,
  donationVariables,
  newsletterVariables,
  partnershipVariables,
} from '../emails/notifications'
import type { TemplateVariables } from '../emails/types'
import { inviteMail, passwordResetMail } from '../features/auth/mail'
import {
  broadcastMail,
  calledOffMail,
  cancellationMail,
  confirmationMail,
  promotionMail,
  waitlistMail,
} from '../features/events/mail'
import { applicationNotification } from '../features/volunteers/mail'

/**
 * Development-only preview of every email, rendered from the same template
 * files that are pasted into Resend. Open /api/email-preview for the list, or
 * ?kind=confirmation for one. Returns 404 in production.
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
  phone: '+233 53 050 2774',
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

const sampleLink = 'https://www.crosslovemovement.org/reset-password?token=sample-token'

const samples: Record<string, () => TemplateVariables> = {
  'event-registration': () => confirmationMail(sampleEvent, sampleRegistration).variables,
  'event-waitlist': () => waitlistMail(sampleEvent, sampleRegistration).variables,
  'event-promoted': () => promotionMail(sampleEvent, sampleRegistration).variables,
  'event-cancelled': () => cancellationMail(sampleEvent, sampleRegistration).variables,
  'event-called-off': () => calledOffMail(sampleEvent, sampleRegistration).variables,
  'event-message': () =>
    broadcastMail(
      sampleEvent,
      { name: sampleRegistration.name, email: sampleRegistration.email },
      {
        subject: 'Doors open at 8:30',
        body: 'A quick note before the day.\n\nDoors open at 8:30, and the first session starts at 9:00.',
      },
    ).variables,
  'auth-invite': () =>
    inviteMail({ name: 'Ama Mensah', role: 'volunteer', link: sampleLink }).variables,
  'auth-reset': () => passwordResetMail({ name: 'Ama Mensah', link: sampleLink }).variables,
  'volunteer-application': () =>
    applicationNotification({
      toEmail: 'apply@crosslovemovement.org',
      volunteer: sampleVolunteer,
      application: sampleApplication,
      programmeTitle: 'Cross Sessions',
      opportunityTitle: 'Sound engineer',
      adminUrl: 'https://www.crosslovemovement.org/admin/volunteers/1',
    }).variables,
  contact: () =>
    contactVariables({
      name: 'Ama Mensah',
      email: 'ama@example.com',
      phone: '+233 53 050 2774',
      topic: 'general',
      message: 'I would like to know when the next Cross Session is happening.',
    }),
  donation: () =>
    donationVariables({
      name: 'Ama Mensah',
      email: 'ama@example.com',
      amount: 'GH₵1,000',
      frequency: 'monthly',
      note: 'Please send the monthly transfer details.',
    }),
  partnership: () =>
    partnershipVariables({
      organisation: 'Acme Foundation',
      contactName: 'Kwesi Owusu',
      email: 'kwesi@example.com',
      phone: '+233 53 050 2774',
      type: 'Funding and volunteers',
      message: 'We can support transport for the choir this year.',
    }),
  newsletter: () => newsletterVariables('ama@example.com'),
}

export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const kind = getQuery(event).kind
  setHeader(event, 'content-type', 'text/html; charset=utf-8')

  if (typeof kind === 'string' && samples[kind]) {
    const template = await loadTemplate(kind)

    if (!template) {
      throw createError({ statusCode: 404, statusMessage: `No template for ${kind}` })
    }

    return renderEmail(template, samples[kind]!())
  }

  const links = Object.keys(EMAIL_TEMPLATES)
    .map(
      (name) =>
        `<li style="margin:6px 0;"><a href="/api/email-preview?kind=${name}" style="color:#b81828;">${name}</a></li>`,
    )
    .join('')

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Email previews</title></head>
<body style="font-family:system-ui,sans-serif;padding:32px;background:#faf5ec;color:#17120f;">
  <h1 style="font-size:22px;">Email previews</h1>
  <p style="color:#4a4139;">Rendered from <code>server/emails/templates</code> with sample data. Development only.</p>
  <ul style="list-style:none;padding:0;">${links}</ul>
</body></html>`
})
