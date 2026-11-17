import { useDatabase } from '../../../database/client'
import { mailOutbox } from '../../../database/schema'
import { requirePermission } from '../../../features/auth/guards'
import { drainOutbox } from '../../../features/mail/outbox'
import { approvalMail, declineMail } from '../../../features/volunteers/mail'
import {
  getVolunteerStatus,
  latestApplicationArea,
  updateVolunteer,
} from '../../../features/volunteers/repository'
import { volunteerUpdateSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid volunteer id' })

  const body = await readBody(event)
  const input = parseOrThrow(volunteerUpdateSchema, body)
  const before = await getVolunteerStatus(id)
  const updated = await updateVolunteer(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Volunteer not found' })

  // Only a transition into approved/declined sends a message, so repeated
  // saves or unrelated edits cannot email the volunteer again.
  if (
    input.status &&
    input.status !== before &&
    (input.status === 'approved' || input.status === 'declined')
  ) {
    const area = await latestApplicationArea(id)
    const mail =
      input.status === 'approved' ? approvalMail(updated, area) : declineMail(updated, area)

    await useDatabase().insert(mailOutbox).values(mail)

    void drainOutbox().catch((error) => {
      console.error('[mail] volunteer status email not sent immediately', error)
    })
  }

  return { ok: true }
})
