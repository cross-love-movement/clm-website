/**
 * GET /api/paystack/webhook
 *
 * Paystack's dashboard checks that the webhook URL resolves before it saves it,
 * and a browser visits it to eyeball the endpoint. The real work happens in the
 * signed POST handler next to this file.
 */
export default defineEventHandler(() => ({ received: true }))
