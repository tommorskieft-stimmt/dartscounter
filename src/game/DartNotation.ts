// Typed representation of a single dart. Mirrors DartNotation.swift.
//
// `parse(label)` round-trips with `toLabel(dart)` for every legal short
// label that appears in the checkout chart. Invalid labels return null.

export type DartKind = 'single' | 'double' | 'treble' | 'bullseye'

export interface Dart {
  kind: DartKind
  /** Face value 1..20, or 25 for the single bull. Unused for bullseye (=50). */
  value: number
}

export function single(value: number): Dart {
  if (value !== 25 && (value < 1 || value > 20)) {
    throw new Error(`Single must be 1..20 or 25, got ${value}`)
  }
  return { kind: 'single', value }
}

export function double(value: number): Dart {
  if (value < 1 || value > 20) throw new Error(`Double must be 1..20, got ${value}`)
  return { kind: 'double', value }
}

export function treble(value: number): Dart {
  if (value < 1 || value > 20) throw new Error(`Treble must be 1..20, got ${value}`)
  return { kind: 'treble', value }
}

export const bullseye: Dart = { kind: 'bullseye', value: 50 }

export function points(d: Dart): number {
  switch (d.kind) {
    case 'single':
      return d.value
    case 'double':
      return d.value * 2
    case 'treble':
      return d.value * 3
    case 'bullseye':
      return 50
  }
}

/** True if throwing this dart last would satisfy the double-out rule. */
export function finishesCheckout(d: Dart): boolean {
  return d.kind === 'double' || d.kind === 'bullseye'
}

/** Short label used throughout the app and the checkout chart. */
export function toLabel(d: Dart): string {
  switch (d.kind) {
    case 'single':
      return d.value === 25 ? '25' : String(d.value)
    case 'double':
      return `D${d.value}`
    case 'treble':
      return `T${d.value}`
    case 'bullseye':
      return 'BULL'
  }
}

/** Parse a short label back into a typed dart. Returns null on invalid. */
export function parse(label: string): Dart | null {
  const l = label.trim().toUpperCase()
  if (l === 'BULL' || l === '50') return bullseye
  if (l === '25') return single(25)
  if (l.startsWith('T')) {
    const n = Number(l.slice(1))
    if (Number.isInteger(n) && n >= 1 && n <= 20) return treble(n)
    return null
  }
  if (l.startsWith('D')) {
    const n = Number(l.slice(1))
    if (Number.isInteger(n) && n >= 1 && n <= 20) return double(n)
    return null
  }
  const n = Number(l)
  if (Number.isInteger(n) && n >= 1 && n <= 20) return single(n)
  return null
}
