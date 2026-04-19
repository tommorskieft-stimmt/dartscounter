import { describe, expect, it } from 'vitest'
import {
  bullseye,
  double,
  finishesCheckout,
  parse,
  points,
  single,
  toLabel,
  treble,
} from '@/game/DartNotation'

describe('DartNotation', () => {
  describe('points', () => {
    it('single face value matches face value', () => {
      expect(points(single(20))).toBe(20)
      expect(points(single(1))).toBe(1)
      expect(points(single(25))).toBe(25)
    })
    it('double doubles face value', () => {
      expect(points(double(20))).toBe(40)
      expect(points(double(16))).toBe(32)
    })
    it('treble triples face value', () => {
      expect(points(treble(20))).toBe(60)
      expect(points(treble(19))).toBe(57)
    })
    it('bullseye = 50', () => {
      expect(points(bullseye)).toBe(50)
    })
  })

  describe('finishesCheckout', () => {
    it('double and bullseye finish; single and treble do not', () => {
      expect(finishesCheckout(double(20))).toBe(true)
      expect(finishesCheckout(bullseye)).toBe(true)
      expect(finishesCheckout(single(20))).toBe(false)
      expect(finishesCheckout(treble(20))).toBe(false)
    })
  })

  describe('parse ↔ toLabel round-trip', () => {
    const cases = [
      { label: 'T20', dart: treble(20), points: 60 },
      { label: 'T19', dart: treble(19), points: 57 },
      { label: 'D20', dart: double(20), points: 40 },
      { label: 'D16', dart: double(16), points: 32 },
      { label: 'D1', dart: double(1), points: 2 },
      { label: '20', dart: single(20), points: 20 },
      { label: '1', dart: single(1), points: 1 },
      { label: '25', dart: single(25), points: 25 },
      { label: 'BULL', dart: bullseye, points: 50 },
    ]
    for (const c of cases) {
      it(`${c.label} → points ${c.points} → back to ${c.label}`, () => {
        const d = parse(c.label)
        expect(d).toEqual(c.dart)
        expect(points(d!)).toBe(c.points)
        expect(toLabel(d!)).toBe(c.label)
      })
    }
  })

  describe('parse rejects garbage', () => {
    it.each(['', 'X', 'T21', 'D21', 'D0', '26', '0', 'FOO'])('%s → null', (label) => {
      expect(parse(label)).toBeNull()
    })
  })

  describe('single() guards', () => {
    it('throws on invalid face', () => {
      expect(() => single(0)).toThrow()
      expect(() => single(21)).toThrow()
      expect(() => single(26)).toThrow()
    })
  })
})
