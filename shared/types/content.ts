export type ProjectCategory = 'gospel' | 'artistes' | 'environment' | 'community'

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
  | 'download'
  | 'copy'

export interface NavLink {
  label: string
  to: string
}

export interface SocialLink {
  label: string
  href: string
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

export interface Project {
  slug: string
  title: string
  category: ProjectCategory
  summary: string
  /** Paragraphs rendered on the project detail page. */
  story: string[]
  location: string
  status: ProjectStatus
  timeframe: string
  image: string
  imageAlt: string
  accent: Accent
  featured: boolean
  goals: string[]
  impact: Stat[]
  needs: string[]
}

export interface VolunteerRole {
  title: string
  commitment: string
  description: string
  requirements: string[]
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

/** Field-level errors keyed by form field name. */
export type FieldErrors = Record<string, string>
