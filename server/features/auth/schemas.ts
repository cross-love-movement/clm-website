import { z } from 'zod'

import { INVITABLE_ROLES, PERMISSIONS, USER_ROLES, USER_STATUSES } from '#shared/types/auth'

const email = z.email('Please enter a valid email address.').max(200)

const password = z
  .string()
  .min(10, 'Use at least 10 characters.')
  .max(200, 'That password is too long.')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Please enter your password.').max(200),
})

export const resetRequestSchema = z.object({ email })

export const resetConfirmSchema = z.object({
  token: z.string().min(20, 'That link is not valid.'),
  password,
})

export const inviteSchema = z.object({
  email,
  name: z.string().trim().min(2, 'Please enter a name.').max(120),
  role: z.enum(INVITABLE_ROLES).default('volunteer'),
  /** Omit to use the role default. An empty array means no permissions. */
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
})

export const userUpdateSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).optional(),
})
