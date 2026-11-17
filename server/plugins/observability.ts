import { randomUUID } from 'node:crypto'

/**
 * Ops logging for a container we can only see through stdout.
 *
 * Every request gets an id, returned in `x-request-id` so a person reporting a
 * failure can quote it and we can find the exact line. Unhandled server errors
 * are written as one JSON object per line — search Coolify's logs for
 * `"level":"error"` and the id. 4xx responses are deliberately not logged: they
 * are mostly bots, expired links, and validation.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    const id = randomUUID()

    event.context.requestId = id
    event.context.startedAt = Date.now()

    try {
      setResponseHeader(event, 'x-request-id', id)
    } catch {
      // A header problem must never turn into a failed request.
    }
  })

  nitroApp.hooks.hook('error', (error, context) => {
    const event = context?.event
    const startedAt = typeof event?.context.startedAt === 'number' ? event.context.startedAt : 0
    const h3 = error as { statusCode?: number; statusMessage?: string }
    const statusCode = h3.statusCode ?? 500

    // Nothing to act on: 4xx is validation, an expired link, or a crawler.
    if (statusCode < 500) return

    console.error(
      JSON.stringify({
        level: 'error',
        requestId: event?.context.requestId ?? '-',
        method: event?.method ?? '-',
        path: event?.path ?? '-',
        statusCode,
        statusMessage: h3.statusMessage ?? error.message,
        message: error.message,
        durationMs: startedAt ? Date.now() - startedAt : undefined,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      }),
    )
  })
})
