// tests/booking-lifecycle.test.ts
//
// The reservation state machine in lib/booking-utils.ts. These are pure
// functions guarding real money: an invalid transition here means a completed
// booking can be re-cancelled, or a cancelled one silently revived.

import { describe, it, expect } from 'vitest'
import {
  mapActionToStatus,
  getAvailableActions,
  isValidStatusTransition,
  VALID_BOOKING_STATUSES as RAW_STATUSES,
} from '@/lib/booking-utils'

// VALID_BOOKING_STATUSES is Object.values(ReservationStatus). Because the
// generated Prisma client is absent at typecheck time, tsc widens it to
// unknown[]. The values are strings at runtime — assert that once, here,
// rather than casting at every call site.
const VALID_BOOKING_STATUSES = RAW_STATUSES as unknown as string[]

const TERMINAL = ['COMPLETED', 'CANCELLED', 'EXPIRED'] as const

describe('mapActionToStatus', () => {
  it('maps each UI action to its status', () => {
    expect(mapActionToStatus('CONFIRM')).toBe('CONFIRMED')
    expect(mapActionToStatus('CANCEL')).toBe('CANCELLED')
    expect(mapActionToStatus('COMPLETE')).toBe('COMPLETED')
  })

  it('passes an unknown action straight through', () => {
    // Worth knowing: this is not a whitelist. The caller must validate.
    expect(mapActionToStatus('DELETE_EVERYTHING')).toBe('DELETE_EVERYTHING')
  })
})

describe('getAvailableActions', () => {
  it('offers confirm and cancel on a pending booking', () => {
    expect(getAvailableActions('PENDING')).toEqual(['CONFIRM', 'CANCEL'])
  })

  it('offers complete and cancel on a confirmed booking', () => {
    expect(getAvailableActions('CONFIRMED')).toEqual(['COMPLETE', 'CANCEL'])
  })

  it('offers nothing on a terminal booking', () => {
    for (const s of TERMINAL) {
      expect(getAvailableActions(s), s).toEqual([])
    }
  })

  it('offers nothing for an unknown status instead of throwing', () => {
    expect(getAvailableActions('NONSENSE')).toEqual([])
  })

  it('only ever offers actions that are actually valid transitions', () => {
    // The buttons the admin UI renders must match what the API will accept,
    // otherwise a visible button returns a 400.
    for (const status of VALID_BOOKING_STATUSES) {
      for (const action of getAvailableActions(status)) {
        const target = mapActionToStatus(action)
        expect(
          isValidStatusTransition(status, target).valid,
          `${status} offers ${action} -> ${target}, which the guard rejects`
        ).toBe(true)
      }
    }
  })
})

describe('isValidStatusTransition', () => {
  it('allows the forward path', () => {
    expect(isValidStatusTransition('PENDING', 'CONFIRMED').valid).toBe(true)
    expect(isValidStatusTransition('CONFIRMED', 'COMPLETED').valid).toBe(true)
  })

  it('allows cancelling a pending or confirmed booking', () => {
    expect(isValidStatusTransition('PENDING', 'CANCELLED').valid).toBe(true)
    expect(isValidStatusTransition('CONFIRMED', 'CANCELLED').valid).toBe(true)
  })

  it('allows a pending booking to expire', () => {
    expect(isValidStatusTransition('PENDING', 'EXPIRED').valid).toBe(true)
  })

  it('locks every terminal state', () => {
    for (const from of TERMINAL) {
      for (const to of ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']) {
        if (from === to) continue
        expect(
          isValidStatusTransition(from, to).valid,
          `${from} -> ${to} must be refused`
        ).toBe(false)
      }
    }
  })

  it('refuses to reverse a completed booking', () => {
    const r = isValidStatusTransition('COMPLETED', 'PENDING')
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/cannot transition/i)
  })

  it('refuses to skip straight from pending to completed', () => {
    // A booking must be confirmed before it can be completed.
    expect(isValidStatusTransition('PENDING', 'COMPLETED').valid).toBe(false)
  })

  it('treats a no-op transition as valid (idempotent retries)', () => {
    for (const s of VALID_BOOKING_STATUSES) {
      expect(isValidStatusTransition(s, s).valid, s).toBe(true)
    }
  })

  it('rejects an unknown current status with a useful message', () => {
    const r = isValidStatusTransition('BANANA', 'CONFIRMED')
    expect(r.valid).toBe(false)
    expect(r.message).toMatch(/invalid current status/i)
  })

  it('rejects a transition to an unknown status', () => {
    expect(isValidStatusTransition('PENDING', 'BANANA').valid).toBe(false)
  })

  it('covers every schema status in the transition table', () => {
    // If someone adds a status to schema.prisma without adding it here,
    // isValidStatusTransition() will reject it as "invalid current status"
    // and that booking becomes unmanageable in the admin UI.
    for (const s of VALID_BOOKING_STATUSES) {
      expect(
        isValidStatusTransition(s, s).valid,
        `${s} is in the Prisma enum but missing from the transition table`
      ).toBe(true)
    }
  })
})
