import { describe, expect, it } from 'vite-plus/test'

import {
  assignmentInputSchema,
  eventNeedsInputSchema,
  opportunityInputSchema,
  programmeInputSchema,
} from '../server/features/volunteers/schemas'

const programme = {
  slug: 'people-like-you-2027',
  title: 'People Like You 2027',
}

describe('programme volunteer needs', () => {
  it('accepts roles with a headcount each', () => {
    const mentor = crypto.randomUUID()
    const result = programmeInputSchema.safeParse({
      ...programme,
      needs: [{ opportunityId: mentor, places: 40 }],
    })

    expect(result.success).toBe(true)
    expect(result.data?.needs).toEqual([{ opportunityId: mentor, places: 40 }])
  })

  it('defaults to no needs', () => {
    const result = programmeInputSchema.safeParse(programme)

    expect(result.success).toBe(true)
    expect(result.data?.needs).toEqual([])
  })

  it('treats a blank headcount as no limit', () => {
    const result = programmeInputSchema.safeParse({
      ...programme,
      needs: [{ opportunityId: crypto.randomUUID(), places: '' }],
    })

    expect(result.success).toBe(true)
    expect(result.data?.needs[0]?.places).toBeNull()
  })

  it('refuses the same role twice', () => {
    const mentor = crypto.randomUUID()
    const result = programmeInputSchema.safeParse({
      ...programme,
      needs: [
        { opportunityId: mentor, places: 2 },
        { opportunityId: mentor, places: 5 },
      ],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.some((issue) => issue.path[0] === 'needs')).toBe(true)
  })

  it('rejects a negative headcount', () => {
    const result = programmeInputSchema.safeParse({
      ...programme,
      needs: [{ opportunityId: crypto.randomUUID(), places: -1 }],
    })

    expect(result.success).toBe(false)
  })
})

describe('event volunteer needs', () => {
  it('accepts a timed slot', () => {
    const role = crypto.randomUUID()
    const result = eventNeedsInputSchema.safeParse({
      needs: [
        {
          opportunityId: role,
          places: 4,
          startsAt: '2027-06-12T08:00:00Z',
          endsAt: '2027-06-12T12:00:00Z',
        },
      ],
    })

    expect(result.success).toBe(true)
    expect(result.data?.needs[0]?.startsAt).toBeInstanceOf(Date)
    expect(result.data?.needs[0]?.places).toBe(4)
  })

  it('refuses the same role twice', () => {
    const role = crypto.randomUUID()
    const result = eventNeedsInputSchema.safeParse({
      needs: [
        { opportunityId: role, places: 2 },
        { opportunityId: role, places: 4 },
      ],
    })

    expect(result.success).toBe(false)
  })
})

describe('placements', () => {
  const base = { volunteerId: crypto.randomUUID(), roleTitle: '' }

  it('needs exactly one of a programme or an event', () => {
    expect(assignmentInputSchema.safeParse(base).success).toBe(false)
    expect(
      assignmentInputSchema.safeParse({ ...base, programmeId: crypto.randomUUID() }).success,
    ).toBe(true)
    expect(assignmentInputSchema.safeParse({ ...base, eventId: crypto.randomUUID() }).success).toBe(
      true,
    )
    expect(
      assignmentInputSchema.safeParse({
        ...base,
        programmeId: crypto.randomUUID(),
        eventId: crypto.randomUUID(),
      }).success,
    ).toBe(false)
  })
})

describe('role catalogue input', () => {
  it('no longer carries a container or a place count', () => {
    const result = opportunityInputSchema.safeParse({
      title: 'Mentor',
      programmeId: crypto.randomUUID(),
      eventId: crypto.randomUUID(),
      slots: 12,
    })

    expect(result.success).toBe(true)
    expect(result.data).not.toHaveProperty('programmeId')
    expect(result.data).not.toHaveProperty('eventId')
    expect(result.data).not.toHaveProperty('slots')
    expect(result.data?.status).toBe('open')
  })
})
