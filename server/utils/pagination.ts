import { getQuery, type H3Event } from 'h3'

/** A page big enough for a screenful of a dense admin table. */
export const DEFAULT_PAGE_SIZE = 25

/** The most a caller may ask for, so one request cannot pull the whole table. */
export const MAX_PAGE_SIZE = 100

export interface PageRequest {
  page: number
  pageSize: number
  offset: number
}

export interface PageResult {
  page: number
  pageSize: number
  total: number
  pageCount: number
}

function toPositiveInt(value: unknown, fallback: number) {
  const raw = typeof value === 'string' ? value : ''
  const parsed = Number.parseInt(raw, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

/**
 * `?page=` and `?pageSize=` from the query string, clamped. Anything unreadable
 * falls back to the first page rather than throwing: a stale bookmark or a bot
 * should still see a list.
 */
export function parsePage(event: H3Event, defaultSize = DEFAULT_PAGE_SIZE): PageRequest {
  const query = getQuery(event)
  const pageSize = Math.min(toPositiveInt(query.pageSize, defaultSize), MAX_PAGE_SIZE)
  const page = toPositiveInt(query.page, 1)

  return { page, pageSize, offset: (page - 1) * pageSize }
}

export interface ResolvedPage extends PageResult {
  offset: number
}

/**
 * Works out the page that will actually be returned. Clamping here means a
 * filter that shrinks the result set shows the last page instead of an empty
 * table, and the response always says which page it is.
 */
export function resolvePage(total: number, request: PageRequest): ResolvedPage {
  const pageCount = Math.max(1, Math.ceil(total / request.pageSize))
  const page = Math.min(request.page, pageCount)

  return {
    page,
    pageSize: request.pageSize,
    total,
    pageCount,
    offset: (page - 1) * request.pageSize,
  }
}
