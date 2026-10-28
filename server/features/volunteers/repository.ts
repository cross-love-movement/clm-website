import { and, asc, count, countDistinct, desc, eq, ilike, inArray, ne, or } from 'drizzle-orm'

import type {
  Assignment,
  Opportunity,
  Programme,
  ProgrammeSummary,
  PublicProgramme,
  VolunteerApplication,
  VolunteerDetail,
  VolunteerStatus,
  VolunteerSummary,
} from '#shared/types/volunteers'

import { useDatabase } from '../../database/client'
import {
  programmes,
  volunteerApplications,
  volunteerAssignments,
  volunteerOpportunities,
  volunteers,
  type AssignmentRow,
  type OpportunityRow,
  type ProgrammeRow,
  type VolunteerApplicationRow,
  type VolunteerRow,
} from '../../database/schema'
import type {
  ApplicationInput,
  AssignmentInput,
  AssignmentUpdateInput,
  OpportunityInput,
  ProgrammeInput,
  VolunteerUpdateInput,
} from './schemas'

/* Mapping ------------------------------------------------------------- */

function iso(value: Date | null) {
  return value ? value.toISOString() : null
}

function toOpportunity(row: OpportunityRow, filled: number): Opportunity {
  return {
    id: row.id,
    programmeId: row.programmeId,
    title: row.title,
    description: row.description,
    commitment: row.commitment,
    requirements: row.requirements,
    slots: row.slots,
    filled,
    location: row.location,
    status: row.status,
  }
}

function toProgrammeSummary(
  row: ProgrammeRow,
  opportunityCount: number,
  volunteerCount: number,
): ProgrammeSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    status: row.status,
    summary: row.summary,
    location: row.location,
    contentPath: row.contentPath,
    startsAt: iso(row.startsAt),
    endsAt: iso(row.endsAt),
    opportunityCount,
    volunteerCount,
  }
}

function toVolunteerSummary(row: VolunteerRow): VolunteerSummary {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

function toApplication(
  row: VolunteerApplicationRow,
  programmeTitle: string | null,
  opportunityTitle: string | null,
): VolunteerApplication {
  return {
    id: row.id,
    volunteerId: row.volunteerId,
    programmeId: row.programmeId,
    programmeTitle,
    opportunityId: row.opportunityId,
    opportunityTitle,
    area: row.area,
    availability: row.availability,
    experience: row.experience,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
  }
}

function toAssignment(
  row: AssignmentRow,
  programmeTitle: string,
  opportunityTitle: string | null,
  volunteerName?: string,
): Assignment {
  return {
    id: row.id,
    volunteerId: row.volunteerId,
    volunteerName,
    programmeId: row.programmeId,
    programmeTitle,
    opportunityId: row.opportunityId,
    opportunityTitle,
    roleTitle: row.roleTitle,
    status: row.status,
    startsOn: row.startsOn,
    endsOn: row.endsOn,
    notes: row.notes,
  }
}

function isUniqueViolation(error: unknown) {
  return (error as { code?: string }).code === '23505'
}

/* Programmes ---------------------------------------------------------- */

export async function listProgrammes(): Promise<ProgrammeSummary[]> {
  const db = useDatabase()
  const rows = await db.select().from(programmes).orderBy(desc(programmes.createdAt))

  const opportunities = await db
    .select({ programmeId: volunteerOpportunities.programmeId, total: count() })
    .from(volunteerOpportunities)
    .groupBy(volunteerOpportunities.programmeId)

  const placements = await db
    .select({
      programmeId: volunteerAssignments.programmeId,
      total: countDistinct(volunteerAssignments.volunteerId),
    })
    .from(volunteerAssignments)
    .where(ne(volunteerAssignments.status, 'cancelled'))
    .groupBy(volunteerAssignments.programmeId)

  const opportunityCounts = new Map(
    opportunities.map((row) => [row.programmeId, Number(row.total)]),
  )
  const volunteerCounts = new Map(placements.map((row) => [row.programmeId, Number(row.total)]))

  return rows.map((row) =>
    toProgrammeSummary(row, opportunityCounts.get(row.id) ?? 0, volunteerCounts.get(row.id) ?? 0),
  )
}

export async function getProgramme(id: string): Promise<Programme | null> {
  const db = useDatabase()
  const [row] = await db.select().from(programmes).where(eq(programmes.id, id)).limit(1)

  if (!row) return null

  const opportunities = await db
    .select({ opportunity: volunteerOpportunities, filled: count(volunteerAssignments.id) })
    .from(volunteerOpportunities)
    .leftJoin(
      volunteerAssignments,
      and(
        eq(volunteerAssignments.opportunityId, volunteerOpportunities.id),
        ne(volunteerAssignments.status, 'cancelled'),
      ),
    )
    .where(eq(volunteerOpportunities.programmeId, id))
    .groupBy(volunteerOpportunities.id)
    .orderBy(asc(volunteerOpportunities.title))

  const placements = await db
    .select({ total: countDistinct(volunteerAssignments.volunteerId) })
    .from(volunteerAssignments)
    .where(
      and(eq(volunteerAssignments.programmeId, id), ne(volunteerAssignments.status, 'cancelled')),
    )

  return {
    ...toProgrammeSummary(row, opportunities.length, Number(placements[0]?.total ?? 0)),
    description: row.description,
    opportunities: opportunities.map((entry) =>
      toOpportunity(entry.opportunity, Number(entry.filled ?? 0)),
    ),
  }
}

export async function listOpenProgrammes(): Promise<PublicProgramme[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(programmes)
    .where(inArray(programmes.status, ['planned', 'active']))
    .orderBy(asc(programmes.startsAt), asc(programmes.title))

  if (!rows.length) return []

  const opportunities = await db
    .select()
    .from(volunteerOpportunities)
    .where(
      and(
        inArray(
          volunteerOpportunities.programmeId,
          rows.map((row) => row.id),
        ),
        eq(volunteerOpportunities.status, 'open'),
      ),
    )
    .orderBy(asc(volunteerOpportunities.title))

  const byProgramme = new Map<string, typeof opportunities>()
  for (const opportunity of opportunities) {
    const list = byProgramme.get(opportunity.programmeId) ?? []
    list.push(opportunity)
    byProgramme.set(opportunity.programmeId, list)
  }

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    summary: row.summary,
    location: row.location,
    startsAt: iso(row.startsAt),
    opportunities: (byProgramme.get(row.id) ?? []).map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      commitment: opportunity.commitment,
      location: opportunity.location,
    })),
  }))
}

export async function createProgramme(input: ProgrammeInput) {
  const db = useDatabase()

  try {
    const [row] = await db.insert(programmes).values(input).returning()
    return row ?? null
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already used',
        data: {
          message: 'Another programme already uses that slug.',
          errors: { slug: 'Choose a different slug.' },
        },
      })
    }
    throw error
  }
}

export async function updateProgramme(id: string, input: ProgrammeInput) {
  const db = useDatabase()

  try {
    const [row] = await db
      .update(programmes)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(programmes.id, id))
      .returning()

    return row ?? null
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already used',
        data: {
          message: 'Another programme already uses that slug.',
          errors: { slug: 'Choose a different slug.' },
        },
      })
    }
    throw error
  }
}

export async function createOpportunity(programmeId: string, input: OpportunityInput) {
  const db = useDatabase()
  const [programme] = await db
    .select({ id: programmes.id })
    .from(programmes)
    .where(eq(programmes.id, programmeId))
    .limit(1)

  if (!programme) {
    throw createError({ statusCode: 404, statusMessage: 'Programme not found' })
  }

  const [row] = await db
    .insert(volunteerOpportunities)
    .values({ ...input, programmeId })
    .returning()

  return row ?? null
}

export async function updateOpportunity(id: string, input: OpportunityInput) {
  const db = useDatabase()
  const [row] = await db
    .update(volunteerOpportunities)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(volunteerOpportunities.id, id))
    .returning()

  return row ?? null
}

/* Applications -------------------------------------------------------- */

export interface SubmitApplicationResult {
  volunteer: VolunteerRow
  application: VolunteerApplicationRow
  programmeTitle: string | null
  opportunityTitle: string | null
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitApplicationResult> {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    let programmeId = input.programmeId ?? null
    let opportunityId = input.opportunityId ?? null

    if (opportunityId) {
      const [opportunity] = await tx
        .select()
        .from(volunteerOpportunities)
        .where(eq(volunteerOpportunities.id, opportunityId))
        .limit(1)

      if (!opportunity) {
        throw createError({ statusCode: 400, statusMessage: 'Opportunity not found' })
      }

      if (programmeId && programmeId !== opportunity.programmeId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'That opportunity belongs to a different programme',
        })
      }

      programmeId = opportunity.programmeId
    }

    const [inserted] = await tx
      .insert(volunteers)
      .values({
        name: input.name,
        email: input.email.trim().toLowerCase(),
        phone: input.phone ?? '',
        city: input.city,
        availability: input.availability,
        experience: input.experience ?? '',
        status: 'applied',
        safeguardingConsentAt: new Date(),
      })
      .onConflictDoUpdate({
        target: volunteers.email,
        set: {
          name: input.name,
          phone: input.phone ?? '',
          city: input.city,
          availability: input.availability,
          experience: input.experience ?? '',
          updatedAt: new Date(),
        },
      })
      .returning()

    if (!inserted) throw new Error('Could not save the volunteer')

    let volunteer = inserted

    if (['declined', 'withdrawn', 'alumni'].includes(volunteer.status)) {
      const [reopened] = await tx
        .update(volunteers)
        .set({ status: 'applied', updatedAt: new Date() })
        .where(eq(volunteers.id, volunteer.id))
        .returning()

      volunteer = reopened ?? volunteer
    }

    const [application] = await tx
      .insert(volunteerApplications)
      .values({
        volunteerId: volunteer.id,
        programmeId,
        opportunityId,
        area: input.area ?? '',
        availability: input.availability,
        experience: input.experience ?? '',
        message: input.message ?? '',
        consentAt: new Date(),
      })
      .returning()

    if (!application) throw new Error('Could not save the application')

    const [programme] = programmeId
      ? await tx
          .select({ title: programmes.title })
          .from(programmes)
          .where(eq(programmes.id, programmeId))
          .limit(1)
      : [undefined]

    const [opportunity] = opportunityId
      ? await tx
          .select({ title: volunteerOpportunities.title })
          .from(volunteerOpportunities)
          .where(eq(volunteerOpportunities.id, opportunityId))
          .limit(1)
      : [undefined]

    return {
      volunteer,
      application,
      programmeTitle: programme?.title ?? null,
      opportunityTitle: opportunity?.title ?? null,
    }
  })
}

/* Volunteers ---------------------------------------------------------- */

export async function listVolunteers(
  options: { status?: VolunteerStatus; search?: string } = {},
): Promise<VolunteerSummary[]> {
  const db = useDatabase()
  const clauses = []

  if (options.status) clauses.push(eq(volunteers.status, options.status))
  if (options.search?.trim()) {
    const needle = `%${options.search.trim()}%`
    clauses.push(or(ilike(volunteers.name, needle), ilike(volunteers.email, needle)))
  }

  const rows = await db
    .select()
    .from(volunteers)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(desc(volunteers.createdAt))

  return rows.map(toVolunteerSummary)
}

export async function getVolunteer(id: string): Promise<VolunteerDetail | null> {
  const db = useDatabase()
  const [row] = await db.select().from(volunteers).where(eq(volunteers.id, id)).limit(1)

  if (!row) return null

  const applications = await db
    .select({
      application: volunteerApplications,
      programmeTitle: programmes.title,
      opportunityTitle: volunteerOpportunities.title,
    })
    .from(volunteerApplications)
    .leftJoin(programmes, eq(programmes.id, volunteerApplications.programmeId))
    .leftJoin(
      volunteerOpportunities,
      eq(volunteerOpportunities.id, volunteerApplications.opportunityId),
    )
    .where(eq(volunteerApplications.volunteerId, id))
    .orderBy(desc(volunteerApplications.createdAt))

  const assignments = await listAssignmentsForVolunteer(id)

  return {
    ...toVolunteerSummary(row),
    skills: row.skills,
    availability: row.availability,
    experience: row.experience,
    notes: row.notes,
    emergencyContactName: row.emergencyContactName,
    emergencyContactPhone: row.emergencyContactPhone,
    dateOfBirth: row.dateOfBirth,
    safeguardingConsentAt: iso(row.safeguardingConsentAt),
    safeguardingBriefingAt: iso(row.safeguardingBriefingAt),
    backgroundCheckStatus: row.backgroundCheckStatus,
    applications: applications.map((entry) =>
      toApplication(entry.application, entry.programmeTitle, entry.opportunityTitle),
    ),
    assignments,
  }
}

export async function updateVolunteer(id: string, input: VolunteerUpdateInput) {
  const db = useDatabase()
  const [row] = await db
    .update(volunteers)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(volunteers.id, id))
    .returning()

  return row ?? null
}

export async function linkVolunteerAccount(
  id: string,
  userId: string,
  status: 'invited' | 'active' = 'invited',
) {
  const db = useDatabase()
  const [row] = await db
    .update(volunteers)
    .set({ userId, status, updatedAt: new Date() })
    .where(eq(volunteers.id, id))
    .returning()

  return row ?? null
}

/* Assignments --------------------------------------------------------- */

export async function listAssignmentsForVolunteer(volunteerId: string): Promise<Assignment[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      assignment: volunteerAssignments,
      programmeTitle: programmes.title,
      opportunityTitle: volunteerOpportunities.title,
    })
    .from(volunteerAssignments)
    .innerJoin(programmes, eq(programmes.id, volunteerAssignments.programmeId))
    .leftJoin(
      volunteerOpportunities,
      eq(volunteerOpportunities.id, volunteerAssignments.opportunityId),
    )
    .where(eq(volunteerAssignments.volunteerId, volunteerId))
    .orderBy(desc(volunteerAssignments.createdAt))

  return rows.map((entry) =>
    toAssignment(entry.assignment, entry.programmeTitle, entry.opportunityTitle),
  )
}

export async function getVolunteerForUser(userId: string, email: string) {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(volunteers)
    .where(or(eq(volunteers.userId, userId), eq(volunteers.email, email.trim().toLowerCase())))
    .limit(1)

  return row ?? null
}

export async function getPortalVolunteer(userId: string, email: string) {
  const volunteer = await getVolunteerForUser(userId, email)
  if (!volunteer) return null

  return {
    volunteer: toVolunteerSummary(volunteer),
    assignments: await listAssignmentsForVolunteer(volunteer.id),
  }
}

export async function createAssignment(input: AssignmentInput, assignedBy: string) {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    const [volunteer] = await tx
      .select()
      .from(volunteers)
      .where(eq(volunteers.id, input.volunteerId))
      .for('update')

    if (!volunteer) {
      throw createError({ statusCode: 404, statusMessage: 'Volunteer not found' })
    }

    const [programme] = await tx
      .select()
      .from(programmes)
      .where(eq(programmes.id, input.programmeId))
      .for('update')

    if (!programme) {
      throw createError({ statusCode: 404, statusMessage: 'Programme not found' })
    }

    if (input.opportunityId) {
      const [opportunity] = await tx
        .select()
        .from(volunteerOpportunities)
        .where(eq(volunteerOpportunities.id, input.opportunityId))
        .for('update')

      if (!opportunity) {
        throw createError({ statusCode: 404, statusMessage: 'Opportunity not found' })
      }

      if (opportunity.programmeId !== input.programmeId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'That opportunity belongs to a different programme',
        })
      }

      if (opportunity.slots !== null) {
        const [taken] = await tx
          .select({ total: count() })
          .from(volunteerAssignments)
          .where(
            and(
              eq(volunteerAssignments.opportunityId, input.opportunityId),
              inArray(volunteerAssignments.status, ['planned', 'active']),
            ),
          )

        if (Number(taken?.total ?? 0) >= opportunity.slots) {
          throw createError({
            statusCode: 409,
            statusMessage: 'That opportunity is full',
            data: { message: 'All places for that role are filled.' },
          })
        }
      }
    }

    const [row] = await tx
      .insert(volunteerAssignments)
      .values({ ...input, assignedBy })
      .returning()

    return row ?? null
  })
}

export async function updateAssignment(id: string, input: AssignmentUpdateInput) {
  const db = useDatabase()
  const [row] = await db
    .update(volunteerAssignments)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(volunteerAssignments.id, id))
    .returning()

  return row ?? null
}
