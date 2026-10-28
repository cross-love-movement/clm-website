import type { SessionUser } from '#shared/types/auth'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)

  return { user: (user as SessionUser | undefined) ?? null }
})
