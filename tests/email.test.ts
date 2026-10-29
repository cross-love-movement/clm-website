import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vite-plus/test'

import type {
  EventRow,
  RegistrationRow,
  SubscriberRow,
  VolunteerApplicationRow,
  VolunteerRow,
} from '../server/database/schema'
import {
  EMAIL_TEMPLATES,
  escapeHtml,
  mailRoutes,
  renderEmail,
  sanitizeSubject,
  take,
  templateIdFor,
  templateVariables,
} from '../server/emails/catalog'
import {
  contactVariables,
  donationVariables,
  partnershipVariables,
} from '../server/emails/notifications'
import type { TemplateVariables } from '../server/emails/types'
import { inviteMail, passwordResetMail } from '../server/features/auth/mail'
import {
  broadcastMail,
  calledOffMail,
  cancellationMail,
  confirmationMail,
  promotionMail,
  waitlistMail,
} from '../server/features/events/mail'
import { applicationNotification } from '../server/features/volunteers/mail'
import { issueMail, welcomeMail } from '../server/features/newsletter/mail'
import { buildMailPayload } from '../server/utils/mailer'

const templatesDir = fileURLToPath(new URL('../server/emails/templates/', import.meta.url))

function templateFile(kind: string) {
  return readFileSync(join(templatesDir, EMAIL_TEMPLATES[kind]!.file), 'utf8')
}

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
  phone: '+233530502774',
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

const link = 'https://www.crosslovemovement.org/reset-password?token=abc'

const subscriber: SubscriberRow = {
  id: '00000000-0000-4000-8000-000000000005',
  email: 'ama@example.com',
  status: 'subscribed',
  token: 'unsubscribe-token-abc123',
  source: 'website',
  subscribedAt: new Date('2026-01-01T00:00:00Z'),
  unsubscribedAt: null,
  updatedAt: new Date('2026-01-01T00:00:00Z'),
}

/** The variables each kind actually sends. Must cover the template's placeholders. */
const samples: Record<string, TemplateVariables> = {
  'event-registration': confirmationMail(event, registration).variables,
  'event-waitlist': waitlistMail(event, registration).variables,
  'event-promoted': promotionMail(event, registration).variables,
  'event-cancelled': cancellationMail(event, registration).variables,
  'event-called-off': calledOffMail(event, registration).variables,
  'event-message': broadcastMail(
    event,
    { name: registration.name, email: registration.email },
    { subject: 'A change to the programme', body: 'The doors open at 8:30.' },
  ).variables,
  'auth-invite': inviteMail({ name: 'Ama', role: 'volunteer', link }).variables,
  'auth-reset': passwordResetMail({ name: 'Ama', link }).variables,
  'volunteer-application': applicationNotification({
    toEmail: 'apply@crosslovemovement.org',
    volunteer,
    application,
    programmeTitle: 'Cross Sessions',
    opportunityTitle: 'Sound engineer',
    adminUrl: 'https://www.crosslovemovement.org/admin/volunteers/1',
  }).variables,
  contact: contactVariables({
    name: 'Ama',
    email: 'ama@example.com',
    topic: 'general',
    message: 'Hello',
  }),
  donation: donationVariables({
    name: 'Ama',
    email: 'ama@example.com',
    amount: 'GH₵100',
    frequency: 'monthly',
  }),
  partnership: partnershipVariables({
    organisation: 'Acme',
    contactName: 'Kwesi',
    email: 'kwesi@example.com',
    type: 'Funding',
    message: 'Hello',
  }),
  newsletter: welcomeMail(subscriber).variables,
  'newsletter-broadcast': issueMail(subscriber, {
    subject: 'October from the field',
    body: 'A short update about the work.',
  }).variables,
}

describe('email templates', () => {
  it('has a file for every kind and no orphan files', () => {
    const files = readdirSync(templatesDir).filter((file) => file.endsWith('.html'))

    expect(files.sort()).toEqual(
      Object.values(EMAIL_TEMPLATES)
        .map((template) => template.file)
        .sort(),
    )
  })

  it('carries the brand in every template', () => {
    for (const kind of Object.keys(EMAIL_TEMPLATES)) {
      const html = templateFile(kind)

      expect(html.startsWith('<!doctype html>')).toBe(true)
      expect(html).toContain('Cross-Love Movement')
      expect(html).toContain('Limited By Guarantee')
      expect(html).toContain('RGD CG041650523')
      expect(html).toContain('crosslovemovement.org')
      expect(templateVariables(html).length).toBeGreaterThan(0)
    }
  })

  it('centres the card in every template', () => {
    for (const kind of Object.keys(EMAIL_TEMPLATES)) {
      const html = templateFile(kind)

      // Resend's renderer drops some legacy alignment, so the card carries both
      // the attribute and a CSS margin.
      expect(html).toContain('align="center" width="600"')
      expect(html).toContain('margin: 0 auto')
    }
  })

  it('supplies every variable the template uses', () => {
    for (const kind of Object.keys(EMAIL_TEMPLATES)) {
      const used = templateVariables(templateFile(kind))
      const supplied = Object.keys(samples[kind] ?? {})
      const missing = used.filter((name) => !supplied.includes(name))

      expect(missing, `${kind} is missing ${missing.join(', ')}`).toEqual([])
    }
  })

  it('renders with no placeholders left behind', () => {
    for (const kind of Object.keys(EMAIL_TEMPLATES)) {
      const html = renderEmail(templateFile(kind), samples[kind]!)

      expect(html).not.toContain('{{{')
      expect(html).toContain('Cross-Love Movement')
    }
  })

  it('uses the real booking values', () => {
    const html = renderEmail(templateFile('event-registration'), samples['event-registration']!)

    expect(html).toContain('PEO-7K4M2Q')
    expect(html).toContain('People Like You')
    expect(html).toContain('2 people')
    expect(html).toContain('/events?event=people-like-you-2027')
  })

  it('avoids the variable names Resend reserves', () => {
    const reserved = ['FIRST_NAME', 'LAST_NAME', 'EMAIL', 'UNSUBSCRIBE_URL', 'contact', 'this']

    for (const kind of Object.keys(EMAIL_TEMPLATES)) {
      for (const name of templateVariables(templateFile(kind))) {
        expect(reserved, `${kind} uses ${name}`).not.toContain(name)
      }
    }
  })
})

describe('email rendering', () => {
  it('escapes interpolated values', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(escapeHtml(`O'Brien & "co"`)).toBe('O&#39;Brien &amp; &quot;co&quot;')

    const html = renderEmail(templateFile('contact'), {
      ...samples.contact!,
      NAME: '<img src=x onerror=alert(1)>',
    })

    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;')
  })

  it('inserts only `_HTML` variables as markup', () => {
    const html = renderEmail(templateFile('event-message'), samples['event-message']!)

    expect(html).toContain('<p style="margin: 0 0 14px;">The doors open at 8:30.</p>')

    // A tag typed into the message is escaped before it reaches MESSAGE_HTML.
    const escaped = broadcastMail(
      event,
      { name: registration.name, email: registration.email },
      { subject: 'Test', body: '<b>not bold</b>' },
    ).variables.MESSAGE_HTML

    expect(escaped).toContain('&lt;b&gt;not bold&lt;/b&gt;')
  })

  it('flattens header injection attempts', () => {
    expect(sanitizeSubject('Hello\nBcc: victim@example.com')).toBe('Hello Bcc: victim@example.com')
  })

  it('keeps long form answers inside the variable limit', () => {
    expect(take('x'.repeat(5_000)).length).toBeLessThanOrEqual(2_000)
  })
})

describe('Resend templates', () => {
  it('only selects a template when its env var is set', () => {
    const previous = process.env.RESEND_TEMPLATE_AUTH_RESET

    try {
      delete process.env.RESEND_TEMPLATE_AUTH_RESET
      expect(templateIdFor('auth-reset')).toBeUndefined()

      process.env.RESEND_TEMPLATE_AUTH_RESET = ' clm-auth-reset '
      expect(templateIdFor('auth-reset')).toBe('clm-auth-reset')

      expect(templateIdFor('unknown')).toBeUndefined()
      expect(templateIdFor(undefined)).toBeUndefined()
    } finally {
      if (previous === undefined) delete process.env.RESEND_TEMPLATE_AUTH_RESET
      else process.env.RESEND_TEMPLATE_AUTH_RESET = previous
    }
  })

  it('reports where each kind will be rendered from', () => {
    const previous = process.env.RESEND_TEMPLATE_CONTACT

    try {
      process.env.RESEND_TEMPLATE_CONTACT = 'clm-contact'

      const routes = mailRoutes()

      expect(routes.find((route) => route.kind === 'contact')?.alias).toBe('clm-contact')
      expect(routes.find((route) => route.kind === 'newsletter')?.alias).toBeNull()
      expect(routes).toHaveLength(Object.keys(EMAIL_TEMPLATES).length)
    } finally {
      if (previous === undefined) delete process.env.RESEND_TEMPLATE_CONTACT
      else process.env.RESEND_TEMPLATE_CONTACT = previous
    }
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
