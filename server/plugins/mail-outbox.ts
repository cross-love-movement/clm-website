import { hasDatabase } from '../database/client'
import { mailRoutes } from '../emails/catalog'
import { drainOutbox } from '../features/mail/outbox'

const INTERVAL_MS = 20_000

/** Background sender for the mail outbox. Safe with a single replica. */
export default defineNitroPlugin((nitroApp) => {
  // Say which kinds are served by Resend and which fall back to the files in
  // server/emails/templates, so the deploy log answers this without guessing.
  const routes = mailRoutes()
  const remote = routes.filter((route) => route.alias)

  console.info(
    `[mail] ${remote.length}/${routes.length} kinds use a Resend template` +
      (remote.length > 0
        ? `: ${remote.map((route) => `${route.kind} → ${route.alias}`).join(', ')}`
        : ' — all render server/emails/templates'),
  )

  if (!hasDatabase()) return

  const tick = () => {
    void drainOutbox().catch((error) => {
      console.error('[mail] outbox drain failed:', error)
    })
  }

  const timer = setInterval(tick, INTERVAL_MS)
  timer.unref()

  nitroApp.hooks.hook('close', () => clearInterval(timer))

  tick()
})
