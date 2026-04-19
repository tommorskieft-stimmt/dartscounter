import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useStandardCheckoutStore } from '@/stores/standardCheckout'

describe('useStandardCheckoutStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts at configured startScore', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 501, legsTarget: 1 })
    expect(s.remaining).toBe(501)
    expect(s.legsWon).toBe(0)
  })

  it('busts when score goes negative', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 101 })
    const r = s.submit(120, 3)
    expect(r.kind).toBe('bust')
    expect(s.remaining).toBe(101)
  })

  it('busts when tentative == 1', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 101 })
    const r = s.submit(100, 3) // tentative 1
    expect(r.kind).toBe('bust')
    expect(s.remaining).toBe(101)
  })

  it('busts when finishing on a non-double', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 101 })
    // Score 101 → hitting 101 without finishing on a double is a bust.
    const r = s.submit(101, 3, /* finishesOnDouble */ false)
    expect(r.kind).toBe('bust')
    expect(s.remaining).toBe(101)
  })

  it('finishes a leg when tentative == 0 with a double', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 101, legsTarget: 2 })
    const r = s.submit(101, 3, /* finishesOnDouble */ true)
    expect(r.kind).toBe('legFinished')
    expect(s.legsWon).toBe(1)
    expect(s.remaining).toBe(101) // next leg started
  })

  it('finishes the match when legsTarget reached', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 101, legsTarget: 1 })
    const r = s.submit(101, 3, true)
    expect(r.kind).toBe('matchFinished')
    expect(s.status.kind).toBe('finished')
  })

  it('records ordinary turns and decrements remaining', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 501 })
    s.submit(60, 3)
    s.submit(60, 3)
    expect(s.remaining).toBe(381)
    expect(s.dartsTotal).toBe(6)
    expect(s.turns).toHaveLength(2)
  })

  it('undo reverts ordinary turn', () => {
    const s = useStandardCheckoutStore()
    s.start({ startScore: 501 })
    s.submit(60, 3)
    const ok = s.undo()
    expect(ok).toBe(true)
    expect(s.remaining).toBe(501)
    expect(s.dartsTotal).toBe(0)
  })
})
