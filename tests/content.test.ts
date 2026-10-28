/// <reference types="vite/client" />

import { describe, expect, it } from 'vite-plus/test'
import { parse as parseYaml } from 'yaml'

import { contactFaqs, donateFaqs, partnershipFaqs, volunteerFaqs } from '../app/data/faqs'
import { postCategories, postCategoryLabels } from '../app/data/news'
import { partners } from '../app/data/partners'
import { portfolioCategories, portfolioCategoryLabels } from '../app/data/portfolio'
import { projectCategories } from '../app/data/projects'
import { footerNav, primaryNav, site } from '../app/data/site'
import { homeSlides } from '../app/data/slides'
import { testimonialAudiences, testimonials } from '../app/data/testimonials'
import type { PortfolioItem } from '../shared/types/content'
import {
  contactSchema,
  donationSchema,
  eventRegistrationSchema,
  newsletterSchema,
  volunteerSchema,
} from '../server/utils/schemas'

const newsFiles = import.meta.glob('../content/news/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const portfolioFiles = import.meta.glob('../content/portfolio/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const projectFiles = import.meta.glob('../content/projects/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

interface NewsFrontmatter {
  title: string
  category: string
  summary: string
  publishedAt: string
  author: string
  readingMinutes: number
  image: string
  imageAlt: string
  featured?: boolean
}

interface ProjectFrontmatter {
  title: string
  category: string
  summary: string
  location: string
  status: string
  timeframe: string
  image: string
  imageAlt: string
  accent: string
  featured?: boolean
  goals: string[]
  impact: { value: string; label: string }[]
  needs: string[]
  order: number
}

const slugFromFile = (file: string) =>
  file
    .split('/')
    .pop()!
    .replace(/\.\w+$/, '')

function parseMarkdown<T>(raw: string) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)

  return {
    data: (parseYaml(match?.[1] ?? '') ?? {}) as T,
    body: match?.[2] ?? '',
  }
}

const news = Object.entries(newsFiles).map(([file, raw]) => ({
  slug: slugFromFile(file),
  ...parseMarkdown<NewsFrontmatter>(raw),
}))

const portfolio = Object.entries(portfolioFiles).map(([file, raw]) => ({
  slugFromFile: slugFromFile(file),
  data: parseYaml(raw) as PortfolioItem,
}))

const projects = Object.entries(projectFiles).map(([file, raw]) => ({
  slug: slugFromFile(file),
  ...parseMarkdown<ProjectFrontmatter>(raw),
}))

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

describe('home carousel', () => {
  it('has slides with captions and internal destinations', () => {
    expect(homeSlides.length).toBeGreaterThan(0)

    for (const slide of homeSlides) {
      expect(slide.title.trim()).not.toBe('')
      expect(slide.caption.trim().length).toBeGreaterThan(40)
      expect(slide.imageAlt.trim()).not.toBe('')
      expect(slide.image.startsWith('/images/')).toBe(true)
      expect(slide.to.startsWith('/')).toBe(true)
    }
  })
})

describe('project content', () => {
  it('finds the markdown files', () => {
    expect(projects.length).toBeGreaterThan(0)
  })

  it('uses unique slugs', () => {
    const slugs = projects.map((project) => project.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('fills every field the project pages rely on', () => {
    const categories = projectCategories.map((category) => category.value)
    const orders = projects.map((project) => project.data.order)
    expect(new Set(orders).size).toBe(orders.length)

    for (const project of projects) {
      expect(project.data.title.trim()).not.toBe('')
      expect(project.data.summary.trim()).not.toBe('')
      expect(project.data.location.trim()).not.toBe('')
      expect(project.data.timeframe.trim()).not.toBe('')
      expect(project.data.goals.length).toBeGreaterThan(0)
      expect(project.data.impact.length).toBeGreaterThan(0)
      expect(project.data.needs.length).toBeGreaterThan(0)
      expect(categories).toContain(project.data.category)
      expect(['active', 'completed', 'upcoming']).toContain(project.data.status)
      expect(project.data.image.startsWith('/images/')).toBe(true)
      expect(project.data.order).toBeGreaterThanOrEqual(0)
      expect(project.body.trim().length).toBeGreaterThan(100)
    }
  })

  it('has at least one featured project for the home page', () => {
    expect(projects.filter((project) => project.data.featured).length).toBeGreaterThan(0)
  })

  it('offers a filter for every category used', () => {
    const filterValues = projectCategories.map((category) => category.value)

    for (const project of projects) {
      expect(filterValues).toContain(project.data.category)
    }
  })
})

describe('news content', () => {
  it('finds the markdown files', () => {
    expect(news.length).toBeGreaterThan(0)
  })

  it('uses unique slugs', () => {
    const slugs = news.map((post) => post.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has complete, publishable frontmatter and a body', () => {
    const categories = Object.keys(postCategoryLabels)

    for (const post of news) {
      expect(post.data.title?.trim()).not.toBe('')
      expect(post.data.summary?.trim()).not.toBe('')
      expect(post.data.author?.trim()).not.toBe('')
      expect(post.data.readingMinutes).toBeGreaterThan(0)
      expect(categories).toContain(post.data.category)
      expect(Number.isNaN(new Date(post.data.publishedAt).getTime())).toBe(false)
      expect(post.data.image.startsWith('/images/')).toBe(true)
      expect(post.body.trim().length).toBeGreaterThan(200)
    }
  })

  // Nuxt Content's markdown transformer owns `excerpt`: it overwrites the key with
  // the auto-generated first paragraph, so a frontmatter `excerpt` is dropped and
  // stored as NULL. Keep using `summary` instead.
  it('avoids frontmatter keys that Nuxt Content reserves', () => {
    const reserved = ['excerpt', 'body', 'path', 'stem', 'extension', 'meta', 'rawbody']

    for (const [file, raw] of Object.entries(newsFiles)) {
      const frontmatter = raw.slice(3, raw.indexOf('\n---', 3))

      for (const key of reserved) {
        expect(
          new RegExp(`^${key}:`, 'm').test(frontmatter),
          `${file} uses reserved key ${key}`,
        ).toBe(false)
      }
    }
  })

  it('marks at most one post as featured', () => {
    expect(news.filter((post) => post.data.featured).length).toBeLessThanOrEqual(1)
  })

  it('offers a filter for every category used', () => {
    const filterValues = postCategories.map((category) => category.value)

    for (const post of news) {
      expect(filterValues).toContain(post.data.category)
    }
  })
})

describe('portfolio content', () => {
  it('finds the YAML files', () => {
    expect(portfolio.length).toBeGreaterThan(0)
  })

  it('uses unique slugs and keeps the file name in sync', () => {
    const slugs = portfolio.map((item) => item.data.slug)
    expect(new Set(slugs).size).toBe(slugs.length)

    for (const item of portfolio) {
      expect(item.data.slug).toBe(item.slugFromFile)
    }
  })

  it('has complete portfolio pieces', () => {
    const categories = Object.keys(portfolioCategoryLabels)
    const orders = portfolio.map((item) => item.data.order)
    expect(new Set(orders).size).toBe(orders.length)

    for (const { data: item } of portfolio) {
      expect(item.title.trim()).not.toBe('')
      expect(item.summary.trim()).not.toBe('')
      expect(item.year.trim()).not.toBe('')
      expect(item.location.trim()).not.toBe('')
      expect(categories).toContain(item.category)
      expect(item.image.startsWith('/images/')).toBe(true)
      expect(item.description.length).toBeGreaterThan(0)
      expect(item.tags.length).toBeGreaterThan(0)
      expect(item.order).toBeGreaterThanOrEqual(0)
    }
  })

  it('offers a filter for every category used and only internal links', () => {
    const filterValues = portfolioCategories.map((category) => category.value)

    for (const { data: item } of portfolio) {
      expect(filterValues).toContain(item.category)
      if (item.link) expect(item.link.to.startsWith('/')).toBe(true)
    }
  })
})

describe('testimonials', () => {
  it('has complete quotes with attribution', () => {
    for (const testimonial of testimonials) {
      expect(testimonial.quote.trim().length).toBeGreaterThan(40)
      expect(testimonial.name.trim()).not.toBe('')
      expect(testimonial.role.trim()).not.toBe('')
      expect(testimonial.location.trim()).not.toBe('')
      expect(testimonialAudiences).toContain(testimonial.audience)
    }
  })

  it('uses unique people', () => {
    const names = testimonials.map((testimonial) => testimonial.name)
    expect(new Set(names).size).toBe(names.length)
  })

  // No consented quotes are published yet, so this suite is empty by design.
  // When testimonials are added, these checks apply again.
  it('features no more than three quotes for the home page', () => {
    expect(testimonials.filter((testimonial) => testimonial.featured).length).toBeLessThanOrEqual(3)
  })
})

describe('partners', () => {
  it('uses unique slugs', () => {
    const slugs = partners.map((partner) => partner.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has complete partner entries', () => {
    const types = ['church', 'ministry', 'community', 'school', 'corporate']

    for (const partner of partners) {
      expect(partner.name.trim()).not.toBe('')
      expect(partner.detail.trim()).not.toBe('')
      expect(partner.mark.trim()).not.toBe('')
      expect(types).toContain(partner.type)
      if (partner.logo) expect(partner.logo.startsWith('/images/')).toBe(true)
    }
  })

  it('includes at least one documented partner and one open slot', () => {
    expect(partners.some((partner) => !partner.placeholder)).toBe(true)
    expect(partners.some((partner) => partner.placeholder)).toBe(true)
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
