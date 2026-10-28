import type {
  AssignmentStatus,
  BackgroundCheckStatus,
  ProgrammeStatus,
  ProgrammeType,
  VolunteerStatus,
} from '#shared/types/volunteers'

export const programmeTypeLabels: Record<ProgrammeType, string> = {
  cmp: 'Christian Mission Project',
  yep: 'Youth Empowerment Programme',
  'cross-sessions': 'Cross Sessions',
  symposium: 'Symposium',
  outreach: 'Outreach',
  other: 'Other',
}

export const backgroundCheckLabels: Record<BackgroundCheckStatus, string> = {
  not_required: 'Not required',
  pending: 'Pending',
  cleared: 'Cleared',
  failed: 'Failed',
}

const programmeTones: Record<ProgrammeStatus, string> = {
  planned: 'bg-sand-200 text-ink-soft',
  active: 'bg-brand-100 text-brand-800',
  completed: 'bg-gold-100 text-gold-800',
  archived: 'bg-clay-50 text-clay-700 ring-1 ring-clay-200',
}

const volunteerTones: Record<VolunteerStatus, string> = {
  applied: 'bg-gold-100 text-gold-800',
  screening: 'bg-gold-100 text-gold-800',
  approved: 'bg-brand-100 text-brand-800',
  invited: 'bg-brand-100 text-brand-800',
  active: 'bg-brand-100 text-brand-800',
  paused: 'bg-sand-200 text-ink-soft',
  declined: 'bg-clay-50 text-clay-700 ring-1 ring-clay-200',
  withdrawn: 'bg-sand-200 text-ink-soft',
  alumni: 'bg-gold-100 text-gold-800',
}

const assignmentTones: Record<AssignmentStatus, string> = {
  planned: 'bg-sand-200 text-ink-soft',
  active: 'bg-brand-100 text-brand-800',
  completed: 'bg-gold-100 text-gold-800',
  cancelled: 'bg-clay-50 text-clay-700 ring-1 ring-clay-200',
}

export function programmeStatusTone(status: ProgrammeStatus) {
  return programmeTones[status]
}

export function volunteerStatusTone(status: VolunteerStatus) {
  return volunteerTones[status]
}

export function assignmentStatusTone(status: AssignmentStatus) {
  return assignmentTones[status]
}
