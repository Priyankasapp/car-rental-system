// tests/auth.test.ts
//
// Token signing/verification and the password + temp-credential helpers.
//
// lib/auth/jwt.ts throws at import time if JWT_SECRET is unset, so the secret
// is stubbed before the module is pulled in.

import { describe, it, expect, beforeAll } from 'vitest'
import bcrypt from 'bcryptjs'

process.env.JWT_SECRET = 'test-secret-not-real-1234567890'

type JwtModule = typeof import('@/lib/auth/jwt')
let jwt: JwtModule

beforeAll(async () => {
  jwt = await import('@/lib/auth/jwt')
})

const payload = {
  userId: '507f1f77bcf86cd799439011',
  email: 'admin@urbandrive.com',
  role: 'ADMIN',
  permissions: ['cars:view'],
  tokenVersion: 0,
  sessionId: '507f1f77bcf86cd799439012',
}

describe('access tokens', () => {
  it('round-trips the claims the guards depend on', async () => {
    const token = await jwt.signAccessToken(payload as never)
    const decoded = await jwt.verifyToken(token)

    expect(decoded).toMatchObject({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
      tokenVersion: 0,
    })
  })

  it('produces a three-part JWS', async () => {
    const token = await jwt.signAccessToken(payload as never)
    expect(token.split('.')).toHaveLength(3)
  })

  it('sets iat and exp', async () => {
    const token = await jwt.signAccessToken(payload as never)
    const decoded = (await jwt.verifyToken(token)) as Record<string, number>
    expect(decoded.iat).toBeTypeOf('number')
    expect(decoded.exp).toBeTypeOf('number')
    expect(decoded.exp).toBeGreaterThan(decoded.iat)
  })

  it('expires access tokens in 1 day', async () => {
    const token = await jwt.signAccessToken(payload as never)
    const d = (await jwt.verifyToken(token)) as Record<string, number>
    expect(d.exp - d.iat).toBe(60 * 60 * 24)
  })

  it('expires refresh tokens in 7 days', async () => {
    const token = await jwt.signRefreshToken({
      userId: payload.userId,
      sessionId: payload.sessionId,
    } as never)
    const d = (await jwt.verifyToken(token)) as Record<string, number>
    expect(d.exp - d.iat).toBe(60 * 60 * 24 * 7)
  })

  it('returns null for a tampered token instead of throwing', async () => {
    const token = await jwt.signAccessToken(payload as never)
    const [h, p] = token.split('.')
    expect(await jwt.verifyToken(`${h}.${p}.forged-signature`)).toBeNull()
  })

  it('returns null for a token signed with a different secret', async () => {
    // Someone else's HS256 token must not be accepted as ours.
    const { SignJWT } = await import('jose')
    const foreign = await new SignJWT({ ...payload, role: 'SUPERADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(new TextEncoder().encode('a-completely-different-secret'))

    expect(await jwt.verifyToken(foreign)).toBeNull()
  })

  it('returns null for an expired token', async () => {
    const { SignJWT } = await import('jose')
    const expired = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!))

    expect(await jwt.verifyToken(expired)).toBeNull()
  })

  it('returns null for garbage input rather than throwing', async () => {
    for (const bad of ['', 'not.a.token', 'aaa', '...']) {
      expect(await jwt.verifyToken(bad), bad).toBeNull()
    }
  })

  it('rejects an alg:none token', async () => {
    // Classic JWT downgrade. jose must refuse an unsigned token.
    const b64 = (o: unknown) =>
      Buffer.from(JSON.stringify(o)).toString('base64url')
    const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64(payload)}.`
    expect(await jwt.verifyToken(none)).toBeNull()
  })
})

describe('the `sub` claim — KNOWN BUG #8/#9', () => {
  // lib/auth/session.ts and app/api/auth/refresh/route.ts both sign with
  // `sub: undefined`. jose drops undefined values, so the claim never exists.
  //
  // app/api/auth/change-password and app/api/auth/refresh then gate on
  // `payload?.sub`, which means BOTH ROUTES RETURN 401 ON EVERY REQUEST.
  //
  // These tests document the broken behaviour so it is visible in CI. When
  // the routes are fixed to read payload.userId, update these expectations.

  it('is absent from a token signed with sub: undefined', async () => {
    const token = await jwt.signAccessToken({
      ...payload,
      sub: undefined,
    } as never)
    const decoded = (await jwt.verifyToken(token)) as Record<string, unknown>

    expect(decoded.sub).toBeUndefined()
    expect(Object.keys(decoded)).not.toContain('sub')
  })

  it('means the change-password / refresh guard rejects a VALID token', async () => {
    const token = await jwt.signAccessToken({
      ...payload,
      sub: undefined,
    } as never)
    const decoded = (await jwt.verifyToken(token)) as { sub?: string }

    // The literal condition in both route files.
    const routeRejects = !decoded?.sub
    expect(routeRejects).toBe(true)

    // ...even though userId is right there and perfectly usable.
    expect((decoded as unknown as { userId: string }).userId).toBe(payload.userId)
  })

  it('refresh tokens carry no sub either, so refresh can never rotate', async () => {
    const token = await jwt.signRefreshToken({
      userId: payload.userId,
      sessionId: payload.sessionId,
    } as never)
    const d = (await jwt.verifyToken(token)) as {
      sub?: string
      sessionId?: string
    }

    expect(!d?.sub || !d?.sessionId).toBe(true)
  })
})

describe('password hashing', () => {
  it('hashes and verifies a password', async () => {
    const { hashPassword, comparePassword } = await import('@/lib/auth/password')
    const hash = await hashPassword('Str0ngPass!')

    expect(hash).not.toBe('Str0ngPass!')
    expect(await comparePassword('Str0ngPass!', hash)).toBe(true)
    expect(await comparePassword('wrong', hash)).toBe(false)
  })

  it('salts — the same password hashes differently each time', async () => {
    const { hashPassword } = await import('@/lib/auth/password')
    const [a, b] = await Promise.all([
      hashPassword('same-password'),
      hashPassword('same-password'),
    ])
    expect(a).not.toBe(b)
  })

  it('uses bcrypt cost 12', async () => {
    const { hashPassword } = await import('@/lib/auth/password')
    const hash = await hashPassword('x')
    expect(bcrypt.getRounds(hash)).toBe(12)
  })
})

describe('temporary credential generators', () => {
  it('lib/auth.ts generatePassword respects length and character classes', async () => {
    const { generatePassword } = await import('@/lib/auth')

    for (let i = 0; i < 20; i++) {
      const pw = generatePassword(12)
      expect(pw).toHaveLength(12)
      expect(pw).toMatch(/[A-Z]/)
      expect(pw).toMatch(/[a-z]/)
      expect(pw).toMatch(/[0-9]/)
      expect(pw).toMatch(/[!@#$%^&*()_+\-=]/)
    }
  })

  it('lib/auth.ts generatePassword does not repeat', async () => {
    const { generatePassword } = await import('@/lib/auth')
    const seen = new Set(Array.from({ length: 200 }, () => generatePassword(12)))
    expect(seen.size).toBe(200)
  })

  it('generateTempPassword meets its stated character requirements', async () => {
    // NOTE: this helper uses Math.random(), not crypto. It is not
    // cryptographically secure — see lib/auth/password.ts. The test pins the
    // shape only; the weakness is tracked separately.
    const { generateTempPassword } = await import('@/lib/auth/password')

    for (let i = 0; i < 20; i++) {
      const pw = generateTempPassword(10)
      expect(pw).toHaveLength(10)
      expect(pw).toMatch(/[A-Z]/)
      expect(pw).toMatch(/[a-z]/)
      expect(pw).toMatch(/[0-9]/)
      expect(pw).toMatch(/[!@#$%^&*]/)
    }
  })
})
