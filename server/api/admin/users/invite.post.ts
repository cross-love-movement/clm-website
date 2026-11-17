import { parseOrThrow } from '../../../utils/validation'
import { recordAudit } from '../../../features/audit/repository'
import { sendInviteEmail } from '../../../features/auth/mail'
import { inviteSchema } from '../../../features/auth/schemas'
import { inviteUser } from '../../../features/auth/service'
import { requirePermission } from '../../../features/auth/guards'

/**
 * Invite is the only way an account is created — there is no public signup.
 * Admins may invite members; only a superadmin may invite staff.
 */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canManagePeople')

  const body = await readBody(event)
  const data = parseOrThrow(inviteSchema, body)

  if (actor.role !== 'superadmin' && data.role !== 'volunteer') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only a superadmin can invite staff.',
    })
  }

  const result = await inviteUser(data)

  if (result) {
    await sendInviteEmail(event, {
      to: result.user.email,
      name: result.user.name,
      role: result.user.role,
      token: result.token,
    })
  }

  await recordAudit(actor, {
    action: 'user.invited',
    entity: 'user',
    entityId: result?.user.id ?? null,
    summary: `Invited ${data.email} as ${data.role}.`,
    metadata: { email: data.email, role: data.role, sent: Boolean(result) },
  })

  return {
    message: `If ${data.email} can be invited, they will receive an email with a link to set a password.`,
  }
})
