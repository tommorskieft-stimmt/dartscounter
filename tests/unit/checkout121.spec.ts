import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCheckout121Store } from '@/stores/checkout121'

describe('useCheckout121Store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts at 121 with default settings', () => {
    const s = useCheckout121Store()
    s.start()
    expect(s.target).toBe(121)
    expect(s.remaining).toBe(121)
    expect(s.dartsUsed).toBe(0)
    expect(s.currentRoundNumber).toBe(1)
    expect(s.dartsRemainingThisRound).toBe(9)
  })

  it('records an ordinary turn', () => {
    const s = useCheckout121Store()
    s.start()
    const r = s.submit(60, 3)
    expect(r.kind).toBe('turnRecorded')
    expect(s.remaining).toBe(61)
    expect(s.dartsUsed).toBe(3)
  })

  it('busts on tentative == 1', () => {
    const s = useCheckout121Store()
    s.start()
    s.submit(60, 3) // 121 → 61
    s.submit(59, 3) // 61 → 2 ok
    const r = s.submit(1, 1) // tentative 1 → bust
    expect(r.kind).toBe('bust')
    expect(s.remaining).toBe(2)
  })

  it('checkout at 0 climbs target and starts next round', () => {
    const s = useCheckout121Store()
    s.start({ maxDarts: 9, rounds: 3 })
    // 121 → 61 → 1 (bust) skipped. Cleanly check out in one turn of three darts.
    s.submit(121, 3) // 121 → 0 (checkout)
    expect(s.target).toBe(122)
    expect(s.remaining).toBe(122)
    expect(s.currentRoundNumber).toBe(2)
  })

  it('round fails when darts run out without a checkout, target drops', () => {
    const s = useCheckout121Store()
    s.start({ maxDarts: 3, rounds: 3 })
    s.submit(60, 3) // 121 → 61, darts = 3 → round fails
    expect(s.history).toHaveLength(1)
    expect(s.history[0]!.success).toBe(false)
    expect(s.target).toBe(121) // floored at 121 (already at 121)
    expect(s.remaining).toBe(121)
    expect(s.currentRoundNumber).toBe(2)
  })

  it('match finishes after configured rounds', () => {
    const s = useCheckout121Store()
    s.start({ maxDarts: 3, rounds: 2 })
    s.submit(60, 3) // fail round 1
    s.submit(60, 3) // fail round 2 → match over
    expect(s.status.kind).toBe('finished')
    expect(s.history).toHaveLength(2)
  })

  it('undo restores previous remaining and darts', () => {
    const s = useCheckout121Store()
    s.start()
    s.submit(60, 3)
    expect(s.remaining).toBe(61)
    const ok = s.undo()
    expect(ok).toBe(true)
    expect(s.remaining).toBe(121)
    expect(s.dartsUsed).toBe(0)
  })

  it('undo returns false with no turns', () => {
    const s = useCheckout121Store()
    s.start()
    expect(s.undo()).toBe(false)
  })

  it('rejects invalid submissions', () => {
    const s = useCheckout121Store()
    s.start({ maxDarts: 3 })
    expect(s.submit(-1, 1).kind).toBe('invalid')
    expect(s.submit(61, 1).kind).toBe('invalid') // single dart max 60
    expect(s.submit(0, 4 as 1).kind).toBe('invalid')
  })
})
