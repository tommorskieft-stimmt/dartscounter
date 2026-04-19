import { describe, expect, it } from 'vitest'
import { route } from '@/game/CheckoutEngine'
import { points } from '@/game/DartNotation'
import { CHECKOUT_CHART, NO_OUT_SCORES } from '@/game/CheckoutChart'

describe('CheckoutEngine.route', () => {
  it('0 → done', () => {
    expect(route(0)).toEqual({ kind: 'done' })
  })
  it('1 → bust', () => {
    expect(route(1)).toEqual({ kind: 'bust' })
  })
  it('negatives → noOut', () => {
    expect(route(-1).kind).toBe('noOut')
  })
  it('> 170 → noOut', () => {
    expect(route(171).kind).toBe('noOut')
    expect(route(200).kind).toBe('noOut')
  })

  it.each([...NO_OUT_SCORES])('no-out score %s → noOut', (score) => {
    expect(route(score).kind).toBe('noOut')
  })

  it('170 → T20 T20 BULL and points sum to 170', () => {
    const r = route(170)
    expect(r.kind).toBe('route')
    if (r.kind !== 'route') throw new Error('expected route')
    expect(r.darts.map((d) => d.kind)).toEqual(['treble', 'treble', 'bullseye'])
    const total = r.darts.reduce((a, d) => a + points(d), 0)
    expect(total).toBe(170)
    // Last dart must be a double or bullseye (finish rule).
    expect(['double', 'bullseye']).toContain(r.darts.at(-1)!.kind)
  })

  it('every chart entry sums to its score and ends on a finishing dart', () => {
    for (const [scoreStr, labels] of Object.entries(CHECKOUT_CHART)) {
      const score = Number(scoreStr)
      const r = route(score)
      expect(r.kind, `${score} should have a route`).toBe('route')
      if (r.kind !== 'route') continue
      const sum = r.darts.reduce((a, d) => a + points(d), 0)
      expect(sum, `${score} darts should sum to ${score}`).toBe(score)
      expect(
        ['double', 'bullseye'],
        `${score} should finish on a double/bull, got ${r.darts.at(-1)!.kind}`,
      ).toContain(r.darts.at(-1)!.kind)
      expect(r.darts.length).toBeLessThanOrEqual(3)
      expect(r.darts).toHaveLength(labels.length)
    }
  })
})
