// tests/permissions.test.ts
//
// lib/permissions.ts is the shared authorization vocabulary. proxy.ts,
// lib/auth-guard.ts, lib/api-auth.ts and the admin UI all ask hasPermission()
// the same question, so a bug here is a bug in every one of those layers at
// once. These tests cover the grant paths, the deny paths, and the legacy
// underscore normalisation that the DB still contains.

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import {
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_DEPENDENCIES,
  VALID_PERMISSIONS,
  hasPermission,
  normalizePermissionKey,
  normalizePermissions,
  type PermissionKey,
} from '@/lib/permissions'

describe('hasPermission — grants', () => {
  it('grants an explicitly assigned permission', () => {
    expect(hasPermission('STAFF', ['cars:view'], PERMISSIONS.CARS_VIEW)).toBe(true)
  })

  it('grants via a domain wildcard', () => {
    expect(hasPermission('ADMIN', ['cars:*'], PERMISSIONS.CARS_DELETE)).toBe(true)
  })

  it('grants via a global wildcard', () => {
    expect(hasPermission('ADMIN', ['*'], PERMISSIONS.USERS_DELETE)).toBe(true)
  })

  it('gives SUPERADMIN everything without listing anything', () => {
    for (const key of Object.values(PERMISSIONS)) {
      expect(hasPermission('SUPERADMIN', [], key as PermissionKey)).toBe(true)
    }
  })

  it('accepts the SUPER_ADMIN spelling too', () => {
    expect(hasPermission('SUPER_ADMIN', [], PERMISSIONS.USERS_DELETE)).toBe(true)
  })

  it('is case-insensitive about the role', () => {
    expect(hasPermission('superadmin', [], PERMISSIONS.CARS_DELETE)).toBe(true)
  })
})

describe('hasPermission — denials', () => {
  it('denies a permission the user does not hold', () => {
    expect(hasPermission('STAFF', ['cars:view'], PERMISSIONS.CARS_DELETE)).toBe(false)
  })

  it('denies when the role is missing', () => {
    expect(hasPermission(null, ['cars:view'], PERMISSIONS.CARS_VIEW)).toBe(false)
    expect(hasPermission(undefined, ['*'], PERMISSIONS.CARS_VIEW)).toBe(false)
    expect(hasPermission('', ['*'], PERMISSIONS.CARS_VIEW)).toBe(false)
  })

  it('denies when the permission list is missing or malformed', () => {
    expect(hasPermission('STAFF', null, PERMISSIONS.CARS_VIEW)).toBe(false)
    expect(hasPermission('STAFF', undefined, PERMISSIONS.CARS_VIEW)).toBe(false)
    // A non-array (corrupt DB row) must not throw and must not grant.
    expect(
      hasPermission('STAFF', 'cars:view' as unknown as string[], PERMISSIONS.CARS_VIEW)
    ).toBe(false)
  })

  it('does not let one domain wildcard leak into another', () => {
    // cars:* must never grant users:delete.
    expect(hasPermission('ADMIN', ['cars:*'], PERMISSIONS.USERS_DELETE)).toBe(false)
  })

  it('does not treat a view grant as an edit grant', () => {
    const perms = ['cars:view', 'reservations:view', 'users:view']
    expect(hasPermission('STAFF', perms, PERMISSIONS.CARS_EDIT)).toBe(false)
    expect(hasPermission('STAFF', perms, PERMISSIONS.USERS_DELETE)).toBe(false)
    expect(hasPermission('STAFF', perms, PERMISSIONS.PERMISSIONS_MANAGE)).toBe(false)
  })

  it('denies a CUSTOMER every admin permission', () => {
    // The most important negative case in the app: a signed-in customer must
    // not reach anything in the back office.
    for (const key of Object.values(PERMISSIONS)) {
      expect(
        hasPermission('CUSTOMER', [], key as PermissionKey),
        `CUSTOMER must not hold ${key}`
      ).toBe(false)
    }
  })

  it('ignores an empty-string permission entry', () => {
    expect(hasPermission('STAFF', [''], PERMISSIONS.CARS_VIEW)).toBe(false)
  })
})

describe('legacy underscore normalisation', () => {
  it('maps a legacy underscore key onto its canonical colon form', () => {
    expect(normalizePermissionKey('messages_view')).toBe('messages:view')
  })

  it('leaves an unknown key untouched rather than inventing one', () => {
    expect(normalizePermissionKey('not_a_real_key')).toBe('not_a_real_key')
  })

  it('leaves an already-canonical key untouched', () => {
    expect(normalizePermissionKey('cars:view')).toBe('cars:view')
  })

  it('grants access for a legacy-format permission stored on a user', () => {
    // Older rows in the DB hold 'messages_view'. Those users must still work.
    expect(hasPermission('STAFF', ['messages_view'], PERMISSIONS.MESSAGES_VIEW)).toBe(true)
  })

  it('normalizePermissions maps a whole array', () => {
    expect(normalizePermissions(['messages_view', 'cars:view'])).toEqual([
      'messages:view',
      'cars:view',
    ])
  })
})

describe('permission catalogue integrity', () => {
  it('has no duplicate permission values', () => {
    const values = Object.values(PERMISSIONS)
    expect(new Set(values).size).toBe(values.length)
  })

  it('uses domain:action formatting throughout', () => {
    for (const value of Object.values(PERMISSIONS)) {
      expect(value, `${value} must look like domain:action`).toMatch(
        /^[a-z-]+:[a-z-]+$/
      )
    }
  })

  it('exposes every permission that guards something through a UI group', () => {
    // A permission missing from PERMISSION_GROUPS can be required by a route
    // but can never be granted in the admin UI — so nobody below SUPERADMIN
    // can ever pass that check. This caught messages:edit, which guards
    // PATCH /api/admin/contacts/[id] and was ungrantable.
    //
    // reports:* are deliberately reserved: their group entries and role
    // defaults are commented out in lib/permissions.ts and no /admin/reports
    // or /api/admin/reports route exists yet. Delete them from this list when
    // the reports feature ships.
    const RESERVED_UNIMPLEMENTED = new Set<string>([
      PERMISSIONS.REPORTS_VIEW,
      PERMISSIONS.REPORTS_EXPORT,
    ])

    const grouped = new Set(
      PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key))
    )
    const ungrouped = Object.values(PERMISSIONS).filter(
      (p) => !grouped.has(p) && !RESERVED_UNIMPLEMENTED.has(p)
    )
    expect(ungrouped).toEqual([])
  })

  it('has no route guarded by a reserved/unimplemented permission', () => {
    // The flip side: if reports:view is not grantable, nothing reachable may
    // require it. proxy.ts guards /admin/reports and /api/admin/reports with
    // reports:view — that is only safe while those routes do not exist.
    const routesExist =
      existsSync(path.resolve(__dirname, '../app/admin/reports')) ||
      existsSync(path.resolve(__dirname, '../app/api/admin/reports'))

    expect(
      routesExist,
      'A reports route now exists, but reports:view is still ungrantable — ' +
        'uncomment its PERMISSION_GROUPS entry and role defaults.'
    ).toBe(false)
  })

  it('only references real permissions in the role defaults', () => {
    for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      for (const p of perms) {
        expect(VALID_PERMISSIONS.has(p), `${role} references unknown ${p}`).toBe(true)
      }
    }
  })

  it('only references real permissions in the dependency map', () => {
    for (const [key, deps] of Object.entries(PERMISSION_DEPENDENCIES)) {
      expect(VALID_PERMISSIONS.has(key as PermissionKey)).toBe(true)
      for (const dep of deps ?? []) {
        expect(VALID_PERMISSIONS.has(dep), `${key} depends on unknown ${dep}`).toBe(true)
      }
    }
  })

  it('gives every dependency-holder its dependencies in the role defaults', () => {
    // If ADMIN can edit reservations it must also be able to view them,
    // otherwise the UI shows an edit button on a list it cannot load.
    for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      if (role === 'SUPERADMIN') continue
      const held = new Set(perms)
      for (const p of perms) {
        for (const dep of PERMISSION_DEPENDENCIES[p] ?? []) {
          expect(held.has(dep), `${role} has ${p} but is missing ${dep}`).toBe(true)
        }
      }
    }
  })
})

describe('role defaults reflect the intended hierarchy', () => {
  it('gives SUPERADMIN the complete set', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.SUPERADMIN.length).toBe(
      Object.values(PERMISSIONS).length
    )
  })

  it('makes STAFF a strict subset of ADMIN', () => {
    const admin = new Set(DEFAULT_ROLE_PERMISSIONS.ADMIN)
    for (const p of DEFAULT_ROLE_PERMISSIONS.STAFF) {
      expect(admin.has(p), `STAFF holds ${p} that ADMIN does not`).toBe(true)
    }
    expect(DEFAULT_ROLE_PERMISSIONS.STAFF.length).toBeLessThan(
      DEFAULT_ROLE_PERMISSIONS.ADMIN.length
    )
  })

  it('withholds destructive and privilege-escalating powers from STAFF', () => {
    const staff = DEFAULT_ROLE_PERMISSIONS.STAFF as string[]
    expect(staff).not.toContain(PERMISSIONS.USERS_DELETE)
    expect(staff).not.toContain(PERMISSIONS.CARS_DELETE)
    expect(staff).not.toContain(PERMISSIONS.PERMISSIONS_MANAGE)
    expect(staff).not.toContain(PERMISSIONS.STAFF_DELETE)
  })

  it('does not let ADMIN grant itself permissions', () => {
    // permissions:manage is the escalation primitive — SUPERADMIN only.
    expect(DEFAULT_ROLE_PERMISSIONS.ADMIN as string[]).not.toContain(
      PERMISSIONS.PERMISSIONS_MANAGE
    )
  })

  it('has no CUSTOMER entry — customers hold no back-office rights', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.CUSTOMER).toBeUndefined()
  })
})

describe('the Role enum stub stays in sync with schema.prisma', () => {
  it('matches the roles declared in the schema', async () => {
    const schema = readFileSync(
      path.resolve(__dirname, '../prisma/schema.prisma'),
      'utf8'
    )
    const block = /enum Role \{([^}]*)\}/.exec(schema)
    expect(block, 'enum Role not found in schema.prisma').not.toBeNull()

    const fromSchema = block![1]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//'))
      .sort()

    const { Role } = await import('@prisma/client')
    expect(Object.keys(Role).sort()).toEqual(fromSchema)
  })
})
