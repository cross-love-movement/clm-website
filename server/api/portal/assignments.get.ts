import { requireSessionUser } from '../../features/auth/guards'
import { getPortalVolunteer } from '../../features/volunteers/repository'

/** The signed-in volunteer's own profile and assignments. */
export default defineEventHandler(async (event) => {
  const user = await requireSessionUser(event)

  return getPortalVolunteer(user.id, user.email)
})
