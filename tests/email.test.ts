import { describe, expect, it } from 'vite-plus/test'

import type {
  EventRow,
  RegistrationRow,
  VolunteerApplicationRow,
  VolunteerRow,
} from '../server/database/schema'
import { escapeHtml, formNotification, sanitizeSubject } from '../server/emails/layout'
import { RESEND_TEMPLATES, resendTemplateId, take } from '../server/emails/resend'
import {
  cancellationMail,
  confirmationMail,
  promotionMail,
  waitlistMail,
} from '../server/features/events/mail'
import { inviteMail, passwordResetMail } from '../server/features/auth/mail'
import { applicationNotification } from '../server/features/volunteers/mail'
import { buildMailPayload } from '../server/utils/mailer'

const event: EventRow = {
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

const registration: RegistrationRow = {
  id: '00000000-0000-4000-8000-000000000002',
  reference: 'PEO-7K4M2Q',
  eventId: event.id,
  name: 'Ama Mensah',
  email: 'ama@example.com',
  phone: '+233551757842',
  attendees: 2,
  notes: '',
  status: 'confirmed',
  consentAt: new Date('2026-01-01T00:00:00Z'),
  checkedInAt: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  cancelledAt: null,
}

const volunteer: VolunteerRow = {
  id: '00000000-0000-4000-8000-000000000003',
  userId: null,
  name: 'Kofi Boateng',
  email: 'kofi@example.com',
  phone: '+233530502774',
  city: 'Tema',
  skills: [],
  availability: 'Weekends',
  experience: 'Youth choir lead.',
  status: 'applied',
  notes: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  dateOfBirth: null,
  safeguardingConsentAt: null,
  safeguardingBriefingAt: null,
  backgroundCheckStatus: 'not_required',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

const application: VolunteerApplicationRow = {
  id: '00000000-0000-4000-8000-000000000004',
  volunteerId: volunteer.id,
  programmeId: null,
  opportunityId: null,
  area: 'Music and media',
  availability: 'Weekends',
  experience: 'Youth choir lead.',
  message: 'Happy to help with sound.',
  consentAt: new Date('2026-01-01T00:00:00Z'),
  createdAt: new Date('2026-01-01T00:00:00Z'),
}

describe('email escaping', () => {
  it('neutralises markup in interpolated values', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(escapeHtml(`O'Brien & "co"`)).toBe('O&#39;Brien &amp; &quot;co&quot;')
  })

  it('flattens header injection attempts', () => {
    expect(sanitizeSubject('Hello\nBcc: victim@example.com')).toBe('Hello Bcc: victim@example.com')
  })

  it('escapes the notification message but keeps line breaks', () => {
    const html = formNotification({
      heading: 'New message',
      message: '<img src=x onerror=alert(1)>\nSecond line',
    })

    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })
})

describe('branded mail', () => {
  const mails = [
    confirmationMail(event, registration),
    waitlistMail(event, registration),
    promotionMail(event, registration),
    cancellationMail(event, registration),
  ]

  it('renders a full HTML document with the brand footer', () => {
    for (const mail of mails) {
      expect(mail.html.startsWith('<!doctype html>')).toBe(true)
      expect(mail.html).toContain('Limited By Guarantee')
      expect(mail.html).toContain('RGD CG041650523')
      expect(mail.html).toContain('role="presentation"')
    }
  })

  it('renders the official lockup in the header', () => {
    for (const mail of mails) {
      expect(mail.html).toContain('alt="Cross-Love Movement"')
      expect(mail.html).toContain('width="48" height="48"')
      expect(mail.html).toContain('>Limited By Guarantee</p>')
      expect(mail.html).toContain('text-transform:uppercase;color:#b81828')
    }
  })

  it('keeps the plain-text alternative complete', () => {
    expect(mails[0]!.body).toContain('PEO-7K4M2Q')
    expect(mails[0]!.body).toContain('Ama Mensah')
    expect(mails[2]!.body).toContain('a place has opened')
  })

  it('shows the reference code in every booking mail', () => {
    for (const mail of mails) {
      expect(mail.html).toContain('PEO-7K4M2Q')
    }
  })

  it('escapes a registrant name in HTML but not in text', () => {
    const risky = { ...registration, name: '<b>Ama</b>' }
    const mail = confirmationMail(event, risky)

    expect(mail.html).toContain('&lt;b&gt;Ama&lt;/b&gt;')
    expect(mail.html).not.toContain('<b>Ama</b>')
    expect(mail.body).toContain('<b>Ama</b>')
  })

  it('links the action to the public calendar', () => {
    expect(mails[0]!.html).toContain('/events?event=people-like-you-2027')
  })

  it('uses the reset link in the password reset mail', () => {
    const mail = passwordResetMail({
      name: 'Ama',
      link: 'https://www.crosslovemovement.org/reset-password?token=abc',
    })

    expect(mail.subject).toContain('Reset your')
    expect(mail.html).toContain('reset-password?token=abc')
    expect(mail.html).toContain('expires in 1 hour')
    expect(mail.body).toContain('reset-password?token=abc')
  })
})

describe('Resend templates', () => {
  const inviteLink = 'https://www.crosslovemovement.org/reset-password?token=abc'

  const mailsByKind: Record<string, { variables?: Record<string, string | number> }> = {
    'event-registration': confirmationMail(event, registration),
    'event-waitlist': waitlistMail(event, registration),
    'event-promoted': promotionMail(event, registration),
    'event-cancelled': cancellationMail(event, registration),
    'auth-invite': inviteMail({ name: 'Ama', role: 'volunteer', link: inviteLink }),
    'auth-reset': passwordResetMail({ name: 'Ama', link: inviteLink }),
    'volunteer-application': applicationNotification({
      toEmail: 'apply@crosslovemovement.org',
      volunteer,
      application,
      programmeTitle: 'Cross Sessions',
      opportunityTitle: 'Sound engineer',
      adminUrl: 'https://www.crosslovemovement.org/admin/volunteers/1',
    }),
  }

  it('supplies exactly the variables each template declares', () => {
    for (const [kind, template] of Object.entries(RESEND_TEMPLATES)) {
      const mail = mailsByKind[kind]

      expect(mail, `no sample mail for ${kind}`).toBeTruthy()
      expect(Object.keys(mail!.variables ?? {}).sort()).toEqual([...template.variables].sort())
    }
  })

  it('sends the real booking values', () => {
    const variables = mailsByKind['event-registration']!.variables!

    expect(variables.NAME).toBe('Ama Mensah')
    expect(variables.REFERENCE).toBe('PEO-7K4M2Q')
    expect(variables.EVENT_TITLE).toBe('People Like You')
    expect(variables.PLACES).toBe('2 people')
    expect(variables.EVENT_URL).toContain('/events?event=people-like-you-2027')
  })

  it('only selects a template when its env var is set', () => {
    const previous = process.env.RESEND_TEMPLATE_AUTH_RESET

    try {
      delete process.env.RESEND_TEMPLATE_AUTH_RESET
      expect(resendTemplateId('auth-reset')).toBeUndefined()

      process.env.RESEND_TEMPLATE_AUTH_RESET = ' clm-auth-reset '
      expect(resendTemplateId('auth-reset')).toBe('clm-auth-reset')

      expect(resendTemplateId('contact')).toBeUndefined()
      expect(resendTemplateId(undefined)).toBeUndefined()
    } finally {
      if (previous === undefined) delete process.env.RESEND_TEMPLATE_AUTH_RESET
      else process.env.RESEND_TEMPLATE_AUTH_RESET = previous
    }
  })

  it('keeps long form answers inside the variable limit', () => {
    const long = 'x'.repeat(5_000)

    expect(take(long).length).toBeLessThanOrEqual(2_000)
  })
})

describe('Resend payload', () => {
  const base = {
    from: 'Cross-Love Movement <info@crosslovemovement.org>',
    to: 'ama@example.com',
    subject: 'You are registered',
    text: 'Plain body',
    html: '<p>Branded body</p>',
    replyTo: 'ama@example.com',
  }

  it('sends both parts when no template is configured', () => {
    const payload = buildMailPayload(base)

    expect(payload.html).toBe('<p>Branded body</p>')
    expect(payload.text).toBe('Plain body')
    expect(payload.template).toBeUndefined()
    expect(payload.reply_to).toBe('ama@example.com')
  })

  it('never mixes a template with html or text', () => {
    const payload = buildMailPayload({
      ...base,
      templateId: 'clm-event-registration',
      variables: { NAME: 'Ama' },
    })

    expect(payload.template).toEqual({
      id: 'clm-event-registration',
      variables: { NAME: 'Ama' },
    })
    expect(payload.html).toBeUndefined()
    expect(payload.text).toBeUndefined()
    expect(payload.subject).toBe('You are registered')
    expect(payload.reply_to).toBe('ama@example.com')
  })

  it('falls back to rendered HTML when a template has no variables', () => {
    const payload = buildMailPayload({ ...base, templateId: 'clm-event-registration' })

    expect(payload.template).toBeUndefined()
    expect(payload.html).toBe('<p>Branded body</p>')
  })
})
