import { hasDatabase } from '../database/client'
import { drainOutbox } from '../features/mail/outbox'

const INTERVAL_MS = 20_000

/** Background sender for the mail outbox. Safe with a single replica. */
export default defineNitroPlugin((nitroApp) => {
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
