export type ProjectCategory = 'cmp' | 'yep'

export type ProjectStatus = 'active' | 'completed' | 'upcoming'

export type Accent = 'brand' | 'clay'

export type IconName =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'check'
  | 'menu'
  | 'close'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'clock'
  | 'heart'
  | 'book'
  | 'music'
  | 'activity'
  | 'users'
  | 'link'
  | 'gift'
  | 'shield'
  | 'sprout'
  | 'sparkles'
  | 'globe'
  | 'calendar'
  | 'quote'
  | 'chevron-down'
  | 'pause'
  | 'play'
  | 'download'
  | 'copy'
  | 'instagram'
  | 'x'
  | 'youtube'
  | 'linkedin'
  | 'whatsapp'

export interface NavLink {
  label: string
  to: string
}

export interface SocialLink {
  label: string
  href: string
  icon: IconName
}

export interface Stat {
  value: string
  label: string
  note?: string
}

export interface Pillar {
  title: string
  description: string
  icon: IconName
}

export interface HomeSlide {
  eyebrow: string
  title: string
  caption: string
  image: string
  imageAlt: string
  to: string
  cta: string
}

export interface ValueItem {
  title: string
  description: string
  icon: IconName
}

export interface Testimonial {
  quote: string
  name: string
  role: string
}

export interface TeamMember {
  name: string
  role: string
  bio: string
}

export interface Milestone {
  year: string
  title: string
  description: string
}

export interface ProjectSummary {
  path: string
  title: string
  category: ProjectCategory
  summary: string
  location: string
  status: ProjectStatus
  timeframe: string
  image: string
  imageAlt: string
  accent: Accent
  featured: boolean
}

export interface Project extends ProjectSummary {
  goals: string[]
  impact: Stat[]
  needs: string[]
  /** Rendered Markdown body supplied by Nuxt Content. */
  body?: unknown
}

export interface PartnerTier {
  name: string
  commitment: string
  description: string
  benefits: string[]
  highlighted?: boolean
}

export interface FaqItem {
  question: string
  answer: string
}

export interface DonationOption {
  amount: number
  label: string
  impact: string
}

export const EVENT_CATEGORIES = [
  'session',
  'training',
  'workshop',
  'devotion',
  'outreach',
  'showcase',
] as const

export type EventCategory = (typeof EVENT_CATEGORIES)[number]

export const EVENT_STATUSES = ['draft', 'published', 'archived', 'cancelled'] as const

export type EventStatus = (typeof EVENT_STATUSES)[number]

export interface Event {
  slug: string
  title: string
  category: EventCategory
  summary: string
  /** Markdown body. */
  description: string
  /** ISO 8601 timestamp with offset. Ghana is GMT (UTC+00:00). */
  startsAt: string
  endsAt: string
  venue: string
  address: string
  city: string
  capacity: number
  registrationDeadline: string | null
  featured: boolean
  image: string
  imageAlt: string
  availability: EventAvailability
}

/** Live capacity for one event, computed per request from confirmed bookings. */
export interface EventAvailability {
  capacity: number
  registered: number
  remaining: number
  /** False when full or past the registration deadline. */
  open: boolean
}

/** Admin list row: event plus its booking counts. */
export interface AdminEvent {
  id: string
  slug: string
  title: string
  category: EventCategory
  status: EventStatus
  startsAt: string
  endsAt: string
  venue: string
  city: string
  capacity: number
  featured: boolean
  registered: number
  remaining: number
  waitlisted: number
}

export interface AdminEventDetail extends AdminEvent {
  summary: string
  description: string
  address: string
  registrationDeadline: string | null
  image: string
  imageAlt: string
}

/** One booking as returned by the admin registrations endpoint. */
export interface AdminRegistration {
  id: string
  reference: string
  eventId: string
  eventTitle: string
  eventSlug: string
  name: string
  email: string
  phone: string
  attendees: number
  notes: string
  status: 'confirmed' | 'waitlisted' | 'cancelled'
  createdAt: string
  checkedInAt: string | null
  cancelledAt: string | null
}

export type PostCategory = 'story' | 'update' | 'reflection' | 'event'

export interface Post {
  path: string
  title: string
  category: PostCategory
  summary: string
  /** ISO date used for ordering and display. */
  publishedAt: string
  author: string
  readingMinutes: number
  image: string
  imageAlt: string
  featured?: boolean
  /** Rendered Markdown body supplied by Nuxt Content. */
  body?: unknown
}

export type PortfolioCategory =
  | 'performances'
  | 'recordings'
  | 'outreach'
  | 'empowerment'
  | 'church'

export interface PortfolioItem {
  slug: string
  title: string
  category: PortfolioCategory
  year: string
  location: string
  summary: string
  description: string[]
  image: string
  imageAlt: string
  tags: string[]
  link?: { label: string; to: string }
  /** Sort order in the gallery, ascending. */
  order: number
}

export type TestimonialAudience = 'church' | 'artiste' | 'volunteer' | 'partner' | 'participant'

export interface Testimonial {
  name: string
  role: string
  location: string
  audience: TestimonialAudience
  programme?: string
  quote: string
  featured?: boolean
}

export type PartnerType = 'church' | 'ministry' | 'community' | 'school' | 'corporate'

export interface Partner {
  slug: string
  name: string
  detail: string
  /** Short monogram used when no logo file is supplied. */
  mark: string
  type: PartnerType
  logo?: string
  /** Renders as an open slot rather than an existing partner. */
  placeholder?: boolean
}

/** Field-level errors keyed by form field name. */
export type FieldErrors = Record<string, string>
