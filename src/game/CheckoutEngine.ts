import { CHECKOUT_CHART, MAX_CHECKOUT_SCORE, NO_OUT_SCORES } from './CheckoutChart'
import { parse, type Dart } from './DartNotation'

export type RouteKind = 'done' | 'bust' | 'noOut' | 'route'

export type RouteResult =
  | { kind: 'done' }
  | { kind: 'bust' }
  | { kind: 'noOut' }
  | { kind: 'route'; darts: Dart[] }

/**
 * Looks up the suggested finish for a remaining score.
 *
 *  - 0 → 'done' (already checked out)
 *  - 1 → 'bust' (can't finish on a double from 1)
 *  - 169/168/166/165/163/162/159 or > 170 → 'noOut'
 *  - otherwise → 'route' with 1–3 darts
 */
export function route(score: number): RouteResult {
  if (!Number.isFinite(score)) return { kind: 'noOut' }
  if (score === 0) return { kind: 'done' }
  if (score === 1) return { kind: 'bust' }
  if (score < 0) return { kind: 'noOut' }
  if (score > MAX_CHECKOUT_SCORE) return { kind: 'noOut' }
  if (NO_OUT_SCORES.has(score)) return { kind: 'noOut' }
  const labels = CHECKOUT_CHART[score]
  if (!labels) return { kind: 'noOut' }
  const darts: Dart[] = []
  for (const label of labels) {
    const d = parse(label)
    if (!d) {
      // Chart corruption — should be caught by unit tests before shipping.
      return { kind: 'noOut' }
    }
    darts.push(d)
  }
  return { kind: 'route', darts }
}
