import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { BARNEYS_TARGETS, useBarneysStore } from '@/stores/barneys'

describe('useBarneysStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts at target 20 with 0 score', () => {
    const s = useBarneysStore()
    s.start()
    expect(s.currentTarget).toBe(20)
    expect(s.totalScore).toBe(0)
    expect(s.targetIndex).toBe(0)
  })

  it('scoring: miss=0, single=1, double=2, treble=3', () => {
    const s = useBarneysStore()
    s.start()
    s.recordHit('miss')
    s.recordHit('single')
    s.recordHit('treble')
    // 0 + 1 + 3 = 4 — round closes (3 darts)
    expect(s.totalScore).toBe(4)
    expect(s.targetIndex).toBe(1)
    expect(s.currentTarget).toBe(19)
  })

  it('full 21-dart run computes total correctly (63 max)', () => {
    const s = useBarneysStore()
    s.start()
    // 7 targets x 3 trebles = 63
    for (let i = 0; i < 7 * 3; i += 1) s.recordHit('treble')
    expect(s.status.kind).toBe('finished')
    expect(s.totalScore).toBe(63)
    expect(s.targetIndex).toBe(BARNEYS_TARGETS.length)
  })

  it('undo removes last hit within current round', () => {
    const s = useBarneysStore()
    s.start()
    s.recordHit('treble')
    s.recordHit('double')
    expect(s.currentScore).toBe(5)
    const ok = s.undo()
    expect(ok).toBe(true)
    expect(s.currentScore).toBe(3)
  })

  it('undo rewinds into previous round', () => {
    const s = useBarneysStore()
    s.start()
    s.recordHit('single')
    s.recordHit('single')
    s.recordHit('single') // round 1 done
    expect(s.targetIndex).toBe(1)
    s.undo() // back into round 1
    expect(s.targetIndex).toBe(0)
    expect(s.currentHits).toHaveLength(2)
  })

  it('rejects recordHit once the match is finished', () => {
    const s = useBarneysStore()
    s.start()
    for (let i = 0; i < 7 * 3; i += 1) s.recordHit('treble')
    const r = s.recordHit('treble')
    expect(r.kind).toBe('invalid')
  })
})
