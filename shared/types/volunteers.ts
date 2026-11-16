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

/** A reusable volunteer role. What a programme needs lives on the programme. */
export interface Role {
  id: string
  title: string
  description: string
  commitment: string
  requirements: string[]
  location: string
  status: OpportunityStatus
}

/** One role in the staff catalogue, with how widely it is used. */
export interface AdminRole extends Role {
  /** Live needs (programme or event) that ask for this role. */
  needCount: number
  /** People placed in this role, across every need. */
  filled: number
}

/** A role as a specific programme or event needs it. */
export interface NeedWithRole extends Role {
  needId: string
  /** People needed. Null means no limit. */
  places: number | null
  filled: number
  /** Optional window: a slot on an event day, or a season on a programme. */
  startsAt: string | null
  endsAt: string | null
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
  /** Roles this programme needs. */
  needCount: number
  volunteerCount: number
}

export interface Programme extends ProgrammeSummary {
  description: string
  needs: NeedWithRole[]
}

/** Public listing: one way to volunteer, grouped by where the need sits. */
export interface PublicRole {
  /** Select value: need id for programme/event needs, role id for a general role. */
  id: string
  kind: 'programme' | 'event' | 'general'
  needId: string | null
  roleId: string
  programmeId: string | null
  eventId: string | null
  programmeTitle: string | null
  eventTitle: string | null
  /** ISO start of the event, so the card can show the date. */
  eventStartsAt: string | null
  title: string
  description: string
  commitment: string
  requirements: string[]
  location: string
  /** People needed. Null means no limit, or a general role. */
  places: number | null
}

export interface VolunteerApplication {
  id: string
  volunteerId: string
  programmeId: string | null
  programmeTitle: string | null
  eventId: string | null
  eventTitle: string | null
  needId: string | null
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
  programmeId: string | null
  programmeTitle: string | null
  eventId: string | null
  eventTitle: string | null
  needId: string | null
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
