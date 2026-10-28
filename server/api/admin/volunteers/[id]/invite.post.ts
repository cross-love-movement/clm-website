import { requirePermission } from '../../../../features/auth/guards'
import { sendInviteEmail } from '../../../../features/auth/mail'
import { findUserByEmail, inviteUser } from '../../../../features/auth/service'
import { getVolunteer, linkVolunteerAccount } from '../../../../features/volunteers/repository'

/** Approve a volunteer by creating or reusing their account and emailing a link. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid volunteer id' })

  const volunteer = await getVolunteer(id)

  if (!volunteer) throw createError({ statusCode: 404, statusMessage: 'Volunteer not found' })

  const existing = await findUserByEmail(volunteer.email)

  if (existing?.status === 'active') {
    await linkVolunteerAccount(volunteer.id, existing.id, 'active')

    return {
      message: `${volunteer.name} already has an active account. It has been linked to their volunteer profile.`,
    }
  }

  const result = await inviteUser({
    email: volunteer.email,
    name: volunteer.name,
    role: 'volunteer',
  })

  if (!result) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Could not invite this volunteer',
    })
  }

  await linkVolunteerAccount(volunteer.id, result.user.id)
  await sendInviteEmail(event, {
    to: result.user.email,
    name: result.user.name,
    role: 'volunteer',
    token: result.token,
  })

  return {
    message: `Invite sent to ${volunteer.email}. Their volunteer profile activates when they set a password.`,
  }
})
