import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  ne,
  or,
} from 'drizzle-orm'

import type {
  AdminRole,
  Assignment,
  NeedWithRole,
  Programme,
  ProgrammeSummary,
  PublicRole,
  Role,
  VolunteerApplication,
  VolunteerDetail,
  VolunteerStatus,
  VolunteerSummary,
} from '#shared/types/volunteers'

import { useDatabase } from '../../database/client'
import {
  events,
  programmes,
  volunteerApplications,
  volunteerAssignments,
  volunteerNeeds,
  volunteerOpportunities,
  volunteers,
  type AssignmentRow,
  type OpportunityRow,
  type ProgrammeRow,
  type VolunteerApplicationRow,
  type VolunteerNeedRow,
  type VolunteerRow,
} from '../../database/schema'
import type {
  ApplicationInput,
  AssignmentInput,
  AssignmentUpdateInput,
  EventNeedsInput,
  OpportunityInput,
  ProgrammeInput,
  VolunteerUpdateInput,
} from './schemas'

/* Mapping ------------------------------------------------------------- */

function iso(value: Date | null) {
  return value ? value.toISOString() : null
}

type Tx = Parameters<Parameters<ReturnType<typeof useDatabase>['transaction']>[0]>[0]

type NeedDraft = {
  opportunityId: string
  places: number | null
  startsAt?: Date | null
  endsAt?: Date | null
}

/**
 * Brings a container's needs in line with the submitted list, updating rows in
 * place so placements keep pointing at the same need.
 */
async function syncNeeds(
  tx: Tx,
  container: { programmeId: string } | { eventId: string },
  needs: NeedDraft[],
) {
  const scope =
    'programmeId' in container
      ? eq(volunteerNeeds.programmeId, container.programmeId)
      : eq(volunteerNeeds.eventId, container.eventId)

  const existing = await tx
    .select({ id: volunteerNeeds.id, opportunityId: volunteerNeeds.opportunityId })
    .from(volunteerNeeds)
    .where(scope)

  const keep = new Set(needs.map((need) => need.opportunityId))
  const stale = existing.filter((row) => !keep.has(row.opportunityId)).map((row) => row.id)

  if (stale.length) {
    await tx.delete(volunteerNeeds).where(inArray(volunteerNeeds.id, stale))
  }

  const byRole = new Map(existing.map((row) => [row.opportunityId, row.id]))

  for (const need of needs) {
    const values = {
      places: need.places ?? null,
      startsAt: need.startsAt ?? null,
      endsAt: need.endsAt ?? null,
      updatedAt: new Date(),
    }
    const id = byRole.get(need.opportunityId)

    if (id) {
      await tx.update(volunteerNeeds).set(values).where(eq(volunteerNeeds.id, id))
    } else {
      await tx.insert(volunteerNeeds).values({
        ...values,
        opportunityId: need.opportunityId,
        ...('programmeId' in container
          ? { programmeId: container.programmeId }
          : { eventId: container.eventId }),
      })
    }
  }
}

function toRole(row: OpportunityRow): Role {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    commitment: row.commitment,
    requirements: row.requirements,
    location: row.location,
    status: row.status,
  }
}

function toNeedWithRole(row: OpportunityRow, need: VolunteerNeedRow, filled: number): NeedWithRole {
  return {
    ...toRole(row),
    needId: need.id,
    places: need.places,
    filled,
    startsAt: iso(need.startsAt),
    endsAt: iso(need.endsAt),
  }
}

function toProgrammeSummary(
  row: ProgrammeRow,
  needCount: number,
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
    needCount,
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
  eventTitle: string | null,
  opportunityTitle: string | null,
): VolunteerApplication {
  return {
    id: row.id,
    volunteerId: row.volunteerId,
    programmeId: row.programmeId,
    programmeTitle,
    eventId: row.eventId,
    eventTitle,
    needId: row.needId,
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
  programmeTitle: string | null,
  eventTitle: string | null,
  opportunityTitle: string | null,
  volunteerName?: string,
): Assignment {
  return {
    id: row.id,
    volunteerId: row.volunteerId,
    volunteerName,
    programmeId: row.programmeId,
    programmeTitle,
    eventId: row.eventId,
    eventTitle,
    needId: row.needId,
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

  const roleCounts = await db
    .select({ programmeId: volunteerNeeds.programmeId, total: count() })
    .from(volunteerNeeds)
    .innerJoin(volunteerOpportunities, eq(volunteerOpportunities.id, volunteerNeeds.opportunityId))
    .where(isNull(volunteerOpportunities.deletedAt))
    .groupBy(volunteerNeeds.programmeId)

  const placements = await db
    .select({
      programmeId: volunteerAssignments.programmeId,
      total: countDistinct(volunteerAssignments.volunteerId),
    })
    .from(volunteerAssignments)
    .where(ne(volunteerAssignments.status, 'cancelled'))
    .groupBy(volunteerAssignments.programmeId)

  const roleCountByProgramme = new Map(
    roleCounts.map((row) => [row.programmeId, Number(row.total)]),
  )
  const volunteerCounts = new Map(placements.map((row) => [row.programmeId, Number(row.total)]))

  return rows.map((row) =>
    toProgrammeSummary(
      row,
      roleCountByProgramme.get(row.id) ?? 0,
      volunteerCounts.get(row.id) ?? 0,
    ),
  )
}

export async function getProgramme(id: string): Promise<Programme | null> {
  const db = useDatabase()
  const [row] = await db.select().from(programmes).where(eq(programmes.id, id)).limit(1)

  if (!row) return null

  const needRows = await db
    .select({
      role: volunteerOpportunities,
      need: volunteerNeeds,
      filled: count(volunteerAssignments.id),
    })
    .from(volunteerNeeds)
    .innerJoin(volunteerOpportunities, eq(volunteerOpportunities.id, volunteerNeeds.opportunityId))
    .leftJoin(
      volunteerAssignments,
      and(
        eq(volunteerAssignments.needId, volunteerNeeds.id),
        ne(volunteerAssignments.status, 'cancelled'),
      ),
    )
    .where(and(eq(volunteerNeeds.programmeId, id), isNull(volunteerOpportunities.deletedAt)))
    .groupBy(volunteerOpportunities.id, volunteerNeeds.id)
    .orderBy(asc(volunteerOpportunities.title))

  const placements = await db
    .select({ total: countDistinct(volunteerAssignments.volunteerId) })
    .from(volunteerAssignments)
    .where(
      and(eq(volunteerAssignments.programmeId, id), ne(volunteerAssignments.status, 'cancelled')),
    )

  return {
    ...toProgrammeSummary(row, needRows.length, Number(placements[0]?.total ?? 0)),
    description: row.description,
    needs: needRows.map((entry) =>
      toNeedWithRole(entry.role, entry.need, Number(entry.filled ?? 0)),
    ),
  }
}

/**
 * Public listing, in the order the page shows them:
 * - needs on published events, soonest first;
 * - needs on planned/active programmes;
 * - general roles — open roles that are needed nowhere.
 */
export async function listOpenRoles(): Promise<PublicRole[]> {
  const db = useDatabase()

  const eventRows = await db
    .select({
      need: volunteerNeeds,
      role: volunteerOpportunities,
      eventTitle: events.title,
      eventStartsAt: events.startsAt,
      eventLocation: events.city,
    })
    .from(volunteerNeeds)
    .innerJoin(volunteerOpportunities, eq(volunteerOpportunities.id, volunteerNeeds.opportunityId))
    .innerJoin(events, eq(events.id, volunteerNeeds.eventId))
    .where(
      and(
        eq(volunteerOpportunities.status, 'open'),
        isNull(volunteerOpportunities.deletedAt),
        eq(events.status, 'published'),
      ),
    )
    .orderBy(asc(events.startsAt), asc(volunteerOpportunities.title))

  const programmeRows = await db
    .select({
      need: volunteerNeeds,
      role: volunteerOpportunities,
      programmeTitle: programmes.title,
      programmeLocation: programmes.location,
    })
    .from(volunteerNeeds)
    .innerJoin(volunteerOpportunities, eq(volunteerOpportunities.id, volunteerNeeds.opportunityId))
    .innerJoin(programmes, eq(programmes.id, volunteerNeeds.programmeId))
    .where(
      and(
        eq(volunteerOpportunities.status, 'open'),
        isNull(volunteerOpportunities.deletedAt),
        inArray(programmes.status, ['planned', 'active']),
      ),
    )
    .orderBy(asc(programmes.title), asc(volunteerOpportunities.title))

  const generalRows = await db
    .select({ role: volunteerOpportunities })
    .from(volunteerOpportunities)
    .leftJoin(volunteerNeeds, eq(volunteerNeeds.opportunityId, volunteerOpportunities.id))
    .where(
      and(
        eq(volunteerOpportunities.status, 'open'),
        isNull(volunteerOpportunities.deletedAt),
        isNull(volunteerNeeds.id),
      ),
    )
    .orderBy(asc(volunteerOpportunities.title))

  return [
    ...eventRows.map(({ need, role, eventTitle, eventStartsAt, eventLocation }) => ({
      id: need.id,
      kind: 'event' as const,
      needId: need.id,
      roleId: role.id,
      programmeId: null,
      eventId: need.eventId,
      programmeTitle: null,
      eventTitle,
      eventStartsAt: iso(eventStartsAt),
      title: role.title,
      description: role.description,
      commitment: role.commitment,
      requirements: role.requirements,
      location: role.location || eventLocation,
      places: need.places,
    })),
    ...programmeRows.map(({ need, role, programmeTitle, programmeLocation }) => ({
      id: need.id,
      kind: 'programme' as const,
      needId: need.id,
      roleId: role.id,
      programmeId: need.programmeId,
      eventId: null,
      programmeTitle,
      eventTitle: null,
      eventStartsAt: null,
      title: role.title,
      description: role.description,
      commitment: role.commitment,
      requirements: role.requirements,
      location: role.location || programmeLocation,
      places: need.places,
    })),
    ...generalRows.map(({ role }) => ({
      id: role.id,
      kind: 'general' as const,
      needId: null,
      roleId: role.id,
      programmeId: null,
      eventId: null,
      programmeTitle: null,
      eventTitle: null,
      eventStartsAt: null,
      title: role.title,
      description: role.description,
      commitment: role.commitment,
      requirements: role.requirements,
      location: role.location,
      places: null,
    })),
  ]
}

/* Event needs --------------------------------------------------------- */

export async function listEventNeeds(eventId: string): Promise<NeedWithRole[]> {
  const db = useDatabase()
  const rows = await db
    .select({
      role: volunteerOpportunities,
      need: volunteerNeeds,
      filled: count(volunteerAssignments.id),
    })
    .from(volunteerNeeds)
    .innerJoin(volunteerOpportunities, eq(volunteerOpportunities.id, volunteerNeeds.opportunityId))
    .leftJoin(
      volunteerAssignments,
      and(
        eq(volunteerAssignments.needId, volunteerNeeds.id),
        ne(volunteerAssignments.status, 'cancelled'),
      ),
    )
    .where(and(eq(volunteerNeeds.eventId, eventId), isNull(volunteerOpportunities.deletedAt)))
    .groupBy(volunteerOpportunities.id, volunteerNeeds.id)
    .orderBy(asc(volunteerOpportunities.title))

  return rows.map((entry) => toNeedWithRole(entry.role, entry.need, Number(entry.filled ?? 0)))
}

/** Replaces the event's volunteer line-up in one transaction. */
export async function replaceEventNeeds(eventId: string, input: EventNeedsInput): Promise<boolean> {
  const db = useDatabase()

  await assertRolesExist(input.needs.map((need) => need.opportunityId))

  return db.transaction(async (tx) => {
    const [event] = await tx.select({ id: events.id }).from(events).where(eq(events.id, eventId))

    if (!event) return false

    await syncNeeds(tx, { eventId }, input.needs)

    return true
  })
}

/* Roles (staff) ------------------------------------------------------- */

/** Every live role in the catalogue, with how widely it is used. */
export async function listRoles(): Promise<AdminRole[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(volunteerOpportunities)
    .where(isNull(volunteerOpportunities.deletedAt))
    .orderBy(desc(volunteerOpportunities.createdAt))

  const links = await db
    .select({ opportunityId: volunteerNeeds.opportunityId, total: count() })
    .from(volunteerNeeds)
    .groupBy(volunteerNeeds.opportunityId)

  const placements = await db
    .select({ opportunityId: volunteerAssignments.opportunityId, total: count() })
    .from(volunteerAssignments)
    .where(
      and(
        isNotNull(volunteerAssignments.opportunityId),
        ne(volunteerAssignments.status, 'cancelled'),
      ),
    )
    .groupBy(volunteerAssignments.opportunityId)

  const needCounts = new Map(links.map((row) => [row.opportunityId, Number(row.total)]))
  const placementCounts = new Map(
    placements.map((row) => [row.opportunityId ?? '', Number(row.total)]),
  )

  return rows.map((row) => ({
    ...toRole(row),
    needCount: needCounts.get(row.id) ?? 0,
    filled: placementCounts.get(row.id) ?? 0,
  }))
}

export async function getRole(id: string): Promise<AdminRole | null> {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(volunteerOpportunities)
    .where(and(eq(volunteerOpportunities.id, id), isNull(volunteerOpportunities.deletedAt)))
    .limit(1)

  if (!row) return null

  const [links] = await db
    .select({ total: count() })
    .from(volunteerNeeds)
    .where(eq(volunteerNeeds.opportunityId, id))

  const [placements] = await db
    .select({ total: count() })
    .from(volunteerAssignments)
    .where(
      and(eq(volunteerAssignments.opportunityId, id), ne(volunteerAssignments.status, 'cancelled')),
    )

  return {
    ...toRole(row),
    needCount: Number(links?.total ?? 0),
    filled: Number(placements?.total ?? 0),
  }
}

export async function createRole(input: OpportunityInput) {
  const db = useDatabase()

  const [row] = await db.insert(volunteerOpportunities).values(input).returning()

  return row ?? null
}

/** Soft delete, and drop it from every programme or event that needed it. */
export async function deleteRole(id: string) {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(volunteerOpportunities)
      .set({ deletedAt: new Date(), status: 'closed', updatedAt: new Date() })
      .where(and(eq(volunteerOpportunities.id, id), isNull(volunteerOpportunities.deletedAt)))
      .returning()

    if (!row) return false

    await tx.delete(volunteerNeeds).where(eq(volunteerNeeds.opportunityId, id))

    return true
  })
}

/** Guards against attaching a role that has been deleted or never existed. */
async function assertRolesExist(opportunityIds: string[]) {
  if (!opportunityIds.length) return

  const db = useDatabase()
  const rows = await db
    .select({ id: volunteerOpportunities.id })
    .from(volunteerOpportunities)
    .where(
      and(
        inArray(volunteerOpportunities.id, opportunityIds),
        isNull(volunteerOpportunities.deletedAt),
      ),
    )

  if (rows.length !== new Set(opportunityIds).size) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Role not found',
      data: { errors: { roles: 'One of those roles no longer exists. Refresh and try again.' } },
    })
  }
}

export async function createProgramme(input: ProgrammeInput) {
  const db = useDatabase()
  const { needs, ...values } = input

  await assertRolesExist(needs.map((need) => need.opportunityId))

  try {
    return await db.transaction(async (tx) => {
      const [row] = await tx.insert(programmes).values(values).returning()

      if (!row) return null

      await syncNeeds(tx, { programmeId: row.id }, needs)

      return row
    })
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
  const { needs, ...values } = input

  await assertRolesExist(needs.map((need) => need.opportunityId))

  try {
    return await db.transaction(async (tx) => {
      const [row] = await tx
        .update(programmes)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(programmes.id, id))
        .returning()

      if (!row) return null

      await syncNeeds(tx, { programmeId: id }, needs)

      return row
    })
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

export async function updateOpportunity(id: string, input: OpportunityInput) {
  const db = useDatabase()

  const [row] = await db
    .update(volunteerOpportunities)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(volunteerOpportunities.id, id), isNull(volunteerOpportunities.deletedAt)))
    .returning()

  return row ?? null
}

/* Applications -------------------------------------------------------- */

export interface SubmitApplicationResult {
  volunteer: VolunteerRow
  application: VolunteerApplicationRow
  programmeTitle: string | null
  eventTitle: string | null
  opportunityTitle: string | null
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitApplicationResult> {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    let programmeId: string | null = null
    let eventId: string | null = null
    const needId: string | null = input.needId ?? null
    let opportunityId: string | null = input.opportunityId ?? null

    if (needId) {
      const [row] = await tx
        .select({
          need: volunteerNeeds,
          role: volunteerOpportunities,
          programmeStatus: programmes.status,
          programmeTitle: programmes.title,
          eventStatus: events.status,
          eventTitle: events.title,
        })
        .from(volunteerNeeds)
        .innerJoin(
          volunteerOpportunities,
          eq(volunteerOpportunities.id, volunteerNeeds.opportunityId),
        )
        .leftJoin(programmes, eq(programmes.id, volunteerNeeds.programmeId))
        .leftJoin(events, eq(events.id, volunteerNeeds.eventId))
        .where(eq(volunteerNeeds.id, needId))
        .limit(1)

      if (!row) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Opportunity not found',
          data: { message: 'That opening is no longer available. Please choose another.' },
        })
      }

      if (row.role.status !== 'open' || row.role.deletedAt) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This role is closed',
          data: {
            message: 'That role is no longer open. Please choose another one.',
            errors: { needId: 'That role is closed.' },
          },
        })
      }

      if (row.programmeStatus && !['planned', 'active'].includes(row.programmeStatus)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This programme is closed',
          data: { message: 'That programme is no longer taking volunteers.' },
        })
      }

      if (row.eventStatus && row.eventStatus !== 'published') {
        throw createError({
          statusCode: 409,
          statusMessage: 'This event is not open',
          data: { message: 'That event is no longer taking volunteers.' },
        })
      }

      programmeId = row.need.programmeId
      eventId = row.need.eventId
      opportunityId = row.need.opportunityId
    } else if (opportunityId) {
      const [role] = await tx
        .select()
        .from(volunteerOpportunities)
        .where(eq(volunteerOpportunities.id, opportunityId))
        .limit(1)

      if (!role) {
        throw createError({ statusCode: 400, statusMessage: 'Opportunity not found' })
      }

      if (role.status !== 'open' || role.deletedAt) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This role is closed',
          data: {
            message: 'That role is no longer open. Please choose another one.',
            errors: { opportunityId: 'That role is closed.' },
          },
        })
      }

      const [need] = await tx
        .select({ id: volunteerNeeds.id })
        .from(volunteerNeeds)
        .where(eq(volunteerNeeds.opportunityId, role.id))
        .limit(1)

      if (need) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Choose a specific opening',
          data: { message: 'That role is needed on a programme or event. Pick the opening.' },
        })
      }
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
        eventId,
        needId,
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

    const [event] = eventId
      ? await tx.select({ title: events.title }).from(events).where(eq(events.id, eventId)).limit(1)
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
      eventTitle: event?.title ?? null,
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
      eventTitle: events.title,
      opportunityTitle: volunteerOpportunities.title,
    })
    .from(volunteerApplications)
    .leftJoin(programmes, eq(programmes.id, volunteerApplications.programmeId))
    .leftJoin(events, eq(events.id, volunteerApplications.eventId))
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
      toApplication(
        entry.application,
        entry.programmeTitle,
        entry.eventTitle,
        entry.opportunityTitle,
      ),
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
      eventTitle: events.title,
      opportunityTitle: volunteerOpportunities.title,
    })
    .from(volunteerAssignments)
    .leftJoin(programmes, eq(programmes.id, volunteerAssignments.programmeId))
    .leftJoin(events, eq(events.id, volunteerAssignments.eventId))
    .leftJoin(
      volunteerOpportunities,
      eq(volunteerOpportunities.id, volunteerAssignments.opportunityId),
    )
    .where(eq(volunteerAssignments.volunteerId, volunteerId))
    .orderBy(desc(volunteerAssignments.createdAt))

  return rows.map((entry) =>
    toAssignment(entry.assignment, entry.programmeTitle, entry.eventTitle, entry.opportunityTitle),
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

    if (input.programmeId) {
      const [programme] = await tx
        .select()
        .from(programmes)
        .where(eq(programmes.id, input.programmeId))
        .for('update')

      if (!programme) {
        throw createError({ statusCode: 404, statusMessage: 'Programme not found' })
      }

      if (programme.status === 'completed' || programme.status === 'archived') {
        throw createError({
          statusCode: 409,
          statusMessage: 'That programme is closed',
          data: { message: 'This programme is no longer taking volunteers.' },
        })
      }
    }

    if (input.eventId) {
      const [event] = await tx
        .select()
        .from(events)
        .where(eq(events.id, input.eventId))
        .for('update')

      if (!event) {
        throw createError({ statusCode: 404, statusMessage: 'Event not found' })
      }

      if (event.status === 'cancelled' || event.status === 'archived') {
        throw createError({
          statusCode: 409,
          statusMessage: 'That event is closed',
          data: { message: 'This event is not taking volunteers.' },
        })
      }
    }

    let needId: string | null = null

    if (input.opportunityId) {
      const [opportunity] = await tx
        .select()
        .from(volunteerOpportunities)
        .where(
          and(
            eq(volunteerOpportunities.id, input.opportunityId),
            isNull(volunteerOpportunities.deletedAt),
          ),
        )
        .for('update')

      if (!opportunity) {
        throw createError({ statusCode: 404, statusMessage: 'Role not found' })
      }

      const container = input.programmeId
        ? eq(volunteerNeeds.programmeId, input.programmeId)
        : eq(volunteerNeeds.eventId, input.eventId ?? '')

      const [need] = await tx
        .select()
        .from(volunteerNeeds)
        .where(and(eq(volunteerNeeds.opportunityId, input.opportunityId), container))
        .for('update')

      if (!need) {
        throw createError({
          statusCode: 400,
          statusMessage: 'That role is not needed there',
          data: { message: 'That role is not part of this programme or event.' },
        })
      }

      needId = need.id

      if (need.places !== null) {
        const [taken] = await tx
          .select({ total: count() })
          .from(volunteerAssignments)
          .where(
            and(
              eq(volunteerAssignments.needId, need.id),
              inArray(volunteerAssignments.status, ['planned', 'active']),
            ),
          )

        if (Number(taken?.total ?? 0) >= need.places) {
          throw createError({
            statusCode: 409,
            statusMessage: 'That role is full',
            data: { message: 'All places for that role are filled.' },
          })
        }
      }
    }

    const [row] = await tx
      .insert(volunteerAssignments)
      .values({
        volunteerId: input.volunteerId,
        programmeId: input.programmeId ?? null,
        eventId: input.eventId ?? null,
        needId,
        opportunityId: input.opportunityId ?? null,
        roleTitle: input.roleTitle,
        status: input.status,
        startsOn: input.startsOn ?? null,
        endsOn: input.endsOn ?? null,
        notes: input.notes,
        assignedBy,
      })
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
