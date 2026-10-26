import { describe, expect, it } from 'vite-plus/test'

import { contactFaqs, donateFaqs, partnershipFaqs, volunteerFaqs } from '../app/data/faqs'
import { primaryNav, footerNav, site } from '../app/data/site'
import { projectCategories, projects } from '../app/data/projects'
import { categoryLabels, eventSlugs, events, getEventBySlug } from '../shared/data/events'
import { postCategories, postCategoryLabels, posts } from '../app/data/posts'
import {
  contactSchema,
  donationSchema,
  eventRegistrationSchema,
  newsletterSchema,
  volunteerSchema,
} from '../server/utils/schemas'

const validContact = {
  name: 'Ama Mensah',
  email: 'ama@example.com',
  phone: '',
  topic: 'general',
  message: 'I would like to help with the reading programme this term.',
  consent: true,
}

const validVolunteer = {
  name: 'Ama Mensah',
  email: 'ama@example.com',
  phone: '',
  city: 'Accra',
  area: 'Cross Sessions volunteer',
  availability: 'weekends',
  experience: '',
  consent: true,
}

const validDonation = {
  name: 'Ama Mensah',
  email: 'ama@example.com',
  amount: 15_000,
  frequency: 'monthly',
  note: '',
}

const validEventRegistration = {
  eventSlug: 'cross-sessions-accra-november',
  name: 'Ama Mensah',
  email: 'ama@example.com',
  phone: '',
  attendees: 2,
  notes: '',
  consent: true,
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

describe('events', () => {
  it('uses unique slugs', () => {
    expect(new Set(eventSlugs).size).toBe(eventSlugs.length)
  })

  it('has a complete, coherent timetable', () => {
    const categories = Object.keys(categoryLabels)

    for (const event of events) {
      expect(event.title.trim()).not.toBe('')
      expect(event.summary.trim()).not.toBe('')
      expect(event.venue.trim()).not.toBe('')
      expect(event.city.trim()).not.toBe('')
      expect(categories).toContain(event.category)
      expect(event.registered).toBeLessThanOrEqual(event.capacity)
      expect(new Date(event.endsAt).getTime()).toBeGreaterThan(new Date(event.startsAt).getTime())

      if (event.registrationDeadline) {
        expect(new Date(event.registrationDeadline).getTime()).toBeLessThan(
          new Date(event.startsAt).getTime(),
        )
      }
    }
  })

  it('looks events up by slug', () => {
    expect(getEventBySlug(eventSlugs[0]!)).toBeDefined()
    expect(getEventBySlug('does-not-exist')).toBeUndefined()
  })
})

describe('news', () => {
  it('uses unique slugs', () => {
    const slugs = posts.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has complete, publishable posts', () => {
    const categories = Object.keys(postCategoryLabels)

    for (const post of posts) {
      expect(post.title.trim()).not.toBe('')
      expect(post.excerpt.trim()).not.toBe('')
      expect(post.author.trim()).not.toBe('')
      expect(post.readingMinutes).toBeGreaterThan(0)
      expect(categories).toContain(post.category)
      expect(Number.isNaN(new Date(post.publishedAt).getTime())).toBe(false)
      expect(post.image.startsWith('/images/')).toBe(true)
      expect(post.sections.length).toBeGreaterThan(0)

      for (const section of post.sections) {
        expect(section.paragraphs.length).toBeGreaterThan(0)
        for (const paragraph of section.paragraphs) {
          expect(paragraph.trim().length).toBeGreaterThan(40)
        }
      }
    }
  })

  it('marks at most one post as featured', () => {
    expect(posts.filter((post) => post.featured).length).toBeLessThanOrEqual(1)
  })

  it('offers a filter for every category used', () => {
    const filterValues = postCategories.map((category) => category.value)

    for (const post of posts) {
      expect(filterValues).toContain(post.category)
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
    expect(newsletterSchema.safeParse({ email: 'ama@example.com' }).success).toBe(true)
    expect(newsletterSchema.safeParse({ email: 'ada' }).success).toBe(false)
  })

  it('accepts a valid event registration', () => {
    expect(eventRegistrationSchema.safeParse(validEventRegistration).success).toBe(true)
  })

  it('rejects event registrations without an event or consent', () => {
    expect(
      eventRegistrationSchema.safeParse({ ...validEventRegistration, eventSlug: '' }).success,
    ).toBe(false)
    expect(
      eventRegistrationSchema.safeParse({ ...validEventRegistration, consent: false }).success,
    ).toBe(false)
  })

  it('rejects impossible attendee counts', () => {
    expect(
      eventRegistrationSchema.safeParse({ ...validEventRegistration, attendees: 0 }).success,
    ).toBe(false)
    expect(
      eventRegistrationSchema.safeParse({ ...validEventRegistration, attendees: 21 }).success,
    ).toBe(false)
  })
})
