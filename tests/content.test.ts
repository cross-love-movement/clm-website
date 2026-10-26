import { describe, expect, it } from 'vite-plus/test'

import { contactFaqs, donateFaqs, partnershipFaqs, volunteerFaqs } from '../app/data/faqs'
import { primaryNav, footerNav, site } from '../app/data/site'
import { projectCategories, projects } from '../app/data/projects'
import {
  contactSchema,
  donationSchema,
  newsletterSchema,
  volunteerSchema,
} from '../server/utils/schemas'

const validContact = {
  name: 'Ada Obi',
  email: 'ada@example.com',
  phone: '',
  topic: 'general',
  message: 'I would like to help with the reading programme this term.',
  consent: true,
}

const validVolunteer = {
  name: 'Ada Obi',
  email: 'ada@example.com',
  phone: '',
  city: 'Accra',
  area: 'Cross Sessions volunteer',
  availability: 'weekends',
  experience: '',
  consent: true,
}

const validDonation = {
  name: 'Ada Obi',
  email: 'ada@example.com',
  amount: 15_000,
  frequency: 'monthly',
  note: '',
}

describe('content', () => {
  it('uses unique project slugs', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('fills every field the pages rely on', () => {
    const categories = projectCategories.map((category) => category.value)

    for (const project of projects) {
      expect(project.title.trim()).not.toBe('')
      expect(project.summary.trim()).not.toBe('')
      expect(project.story.length).toBeGreaterThan(0)
      expect(project.goals.length).toBeGreaterThan(0)
      expect(project.impact.length).toBeGreaterThan(0)
      expect(project.needs.length).toBeGreaterThan(0)
      expect(categories).toContain(project.category)
      expect(project.image.startsWith('/images/')).toBe(true)
    }
  })

  it('has at least one featured project for the home page', () => {
    expect(projects.filter((project) => project.featured).length).toBeGreaterThan(0)
  })

  it('keeps navigation links internal and unique', () => {
    const links = [...primaryNav, ...footerNav.flatMap((group) => group.links)]

    for (const link of links) {
      expect(link.to.startsWith('/')).toBe(true)
    }

    expect(new Set(primaryNav.map((link) => link.to)).size).toBe(primaryNav.length)
  })

  it('publishes usable contact details', () => {
    expect(site.email).toContain('@')
    expect(site.phoneHref.startsWith('+')).toBe(true)
    expect(site.address.city.trim()).not.toBe('')
  })

  it('answers every FAQ', () => {
    const faqs = [...donateFaqs, ...volunteerFaqs, ...partnershipFaqs, ...contactFaqs]

    for (const faq of faqs) {
      expect(faq.question.trim()).not.toBe('')
      expect(faq.answer.trim().length).toBeGreaterThan(20)
    }
  })
})

describe('server validation', () => {
  it('accepts a complete contact submission', () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true)
  })

  it('rejects a contact submission without consent or a valid email', () => {
    const missingConsent = contactSchema.safeParse({ ...validContact, consent: false })
    const malformedEmail = contactSchema.safeParse({ ...validContact, email: 'not-an-email' })

    expect(missingConsent.success).toBe(false)
    expect(malformedEmail.success).toBe(false)
  })

  it('rejects unknown contact topics', () => {
    expect(contactSchema.safeParse({ ...validContact, topic: 'sales' }).success).toBe(false)
  })

  it('accepts a complete volunteer application', () => {
    expect(volunteerSchema.safeParse(validVolunteer).success).toBe(true)
  })

  it('requires a known availability for volunteers', () => {
    const unknown = volunteerSchema.safeParse({ ...validVolunteer, availability: 'whenever' })
    expect(unknown.success).toBe(false)
  })

  it('accepts monthly and one-time donations', () => {
    expect(donationSchema.safeParse(validDonation).success).toBe(true)
    expect(donationSchema.safeParse({ ...validDonation, frequency: 'one-time' }).success).toBe(true)
  })

  it('rejects donations below the minimum', () => {
    expect(donationSchema.safeParse({ ...validDonation, amount: 10 }).success).toBe(false)
  })

  it('validates newsletter addresses', () => {
    expect(newsletterSchema.safeParse({ email: 'ada@example.com' }).success).toBe(true)
    expect(newsletterSchema.safeParse({ email: 'ada' }).success).toBe(false)
  })
})
