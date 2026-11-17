/** The kinds of record a trail entry can be about. */
export const AUDIT_ENTITIES = [
  'donation',
  'event',
  'registration',
  'programme',
  'volunteer',
  'user',
  'newsletter',
] as const

export type AuditEntity = (typeof AUDIT_ENTITIES)[number]

export interface AuditEntry {
  id: string
  actorId: string | null
  actorName: string
  actorEmail: string
  action: string
  entity: string
  entityId: string | null
  summary: string
  metadata: Record<string, unknown> | null
  createdAt: string
}
