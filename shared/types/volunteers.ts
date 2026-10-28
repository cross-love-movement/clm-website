export const PROGRAMME_TYPES = [
  'cmp',
  'yep',
  'cross-sessions',
  'symposium',
  'outreach',
  'other',
] as const

export type ProgrammeType = (typeof PROGRAMME_TYPES)[number]

export const PROGRAMME_STATUSES = ['planned', 'active', 'completed', 'archived'] as const

export type ProgrammeStatus = (typeof PROGRAMME_STATUSES)[number]

export const OPPORTUNITY_STATUSES = ['open', 'closed'] as const

export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number]

export const VOLUNTEER_STATUSES = [
  'applied',
  'screening',
  'approved',
  'invited',
  'active',
  'paused',
  'declined',
  'withdrawn',
  'alumni',
] as const

export type VolunteerStatus = (typeof VOLUNTEER_STATUSES)[number]

export const ASSIGNMENT_STATUSES = ['planned', 'active', 'completed', 'cancelled'] as const

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number]

export const BACKGROUND_CHECK_STATUSES = ['not_required', 'pending', 'cleared', 'failed'] as const

export type BackgroundCheckStatus = (typeof BACKGROUND_CHECK_STATUSES)[number]

export const AVAILABILITY_OPTIONS = ['weekdays', 'evenings', 'weekends', 'flexible'] as const

export type Availability = (typeof AVAILABILITY_OPTIONS)[number]

export interface Opportunity {
  id: string
  programmeId: string
  title: string
  description: string
  commitment: string
  requirements: string[]
  slots: number | null
  filled: number
  location: string
  status: OpportunityStatus
}

export interface ProgrammeSummary {
  id: string
  slug: string
  title: string
  type: ProgrammeType
  status: ProgrammeStatus
  summary: string
  location: string
  contentPath: string
  startsAt: string | null
  endsAt: string | null
  opportunityCount: number
  volunteerCount: number
}

export interface Programme extends ProgrammeSummary {
  description: string
  opportunities: Opportunity[]
}

/** Public listing: open programmes with their open opportunities. */
export interface PublicProgramme {
  id: string
  slug: string
  title: string
  type: ProgrammeType
  summary: string
  location: string
  startsAt: string | null
  opportunities: Pick<Opportunity, 'id' | 'title' | 'commitment' | 'location'>[]
}

export interface VolunteerApplication {
  id: string
  volunteerId: string
  programmeId: string | null
  programmeTitle: string | null
  opportunityId: string | null
  opportunityTitle: string | null
  area: string
  availability: string
  experience: string
  message: string
  createdAt: string
}

export interface Assignment {
  id: string
  volunteerId: string
  volunteerName?: string
  programmeId: string
  programmeTitle: string
  opportunityId: string | null
  opportunityTitle: string | null
  roleTitle: string
  status: AssignmentStatus
  startsOn: string | null
  endsOn: string | null
  notes: string
}

export interface VolunteerSummary {
  id: string
  userId: string | null
  name: string
  email: string
  phone: string
  city: string
  status: VolunteerStatus
  createdAt: string
}

export interface VolunteerDetail extends VolunteerSummary {
  skills: string[]
  availability: string
  experience: string
  notes: string
  emergencyContactName: string
  emergencyContactPhone: string
  dateOfBirth: string | null
  safeguardingConsentAt: string | null
  safeguardingBriefingAt: string | null
  backgroundCheckStatus: BackgroundCheckStatus
  applications: VolunteerApplication[]
  assignments: Assignment[]
}
