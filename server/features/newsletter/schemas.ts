import { z } from 'zod'

/** The opaque unsubscribe token carried in newsletter links. */
export const unsubscribeSchema = z.object({
  token: z.string().trim().min(10, 'That link is incomplete.').max(200),
})

/** A staff-written issue for the subscriber list. */
export const issueSchema = z.object({
  subject: z.string().trim().min(3, 'Add a subject.').max(160),
  body: z.string().trim().min(10, 'Write the issue.').max(20_000),
})

export type IssueFormInput = z.infer<typeof issueSchema>
