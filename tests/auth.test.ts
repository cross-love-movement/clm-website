import { describe, expect, it } from 'vite-plus/test'

import { canManageMail, type Permission, type SessionUser } from '../shared/types/auth'
import { hashPassword, verifyPassword } from '../server/features/auth/password'

describe('password hashing', () => {
  it('verifies a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple')

    expect(hash.startsWith('scrypt$')).toBe(true)
    expect(await verifyPassword('correct horse battery staple', hash)).toBe(true)
  })

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('correct horse battery staple')

    expect(await verifyPassword('Correct horse battery staple', hash)).toBe(false)
    expect(await verifyPassword('', hash)).toBe(false)
  })

  it('rejects missing or malformed hashes', async () => {
    expect(await verifyPassword('anything', null)).toBe(false)
    expect(await verifyPassword('anything', 'plaintext')).toBe(false)
    expect(await verifyPassword('anything', 'bcrypt$aa$bb')).toBe(false)
  })

  it('salts each hash, so the same password produces different values', async () => {
    const first = await hashPassword('same password')
    const second = await hashPassword('same password')

    expect(first).not.toBe(second)
    expect(await verifyPassword('same password', first)).toBe(true)
    expect(await verifyPassword('same password', second)).toBe(true)
  })
})

function withPermissions(role: SessionUser['role'], permissions: Permission[]): SessionUser {
  return { id: 'user', email: 'user@example.com', name: 'User', role, permissions }
}

describe('mail outbox access', () => {
  it('allows superadmins and operational managers', () => {
    expect(canManageMail(withPermissions('superadmin', []))).toBe(true)
    expect(canManageMail(withPermissions('admin', ['canManageNewsletter']))).toBe(true)
    expect(canManageMail(withPermissions('admin', ['canManageDonations']))).toBe(true)
    expect(canManageMail(withPermissions('admin', ['canManageRegistrations']))).toBe(true)
    expect(canManageMail(withPermissions('admin', ['canManageVolunteers']))).toBe(true)
    expect(canManageMail(withPermissions('admin', ['canEdit']))).toBe(false)
    expect(canManageMail(null)).toBe(false)
  })
})
