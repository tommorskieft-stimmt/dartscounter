// Web Vibration API wrapper. Works on Android Chrome and a few other
// platforms; iOS Safari silently no-ops. Keep the patterns short —
// long buzzes are annoying and drain battery.

export type HapticKind = 'light' | 'success' | 'error' | 'soft'

const PATTERNS: Record<HapticKind, number | number[]> = {
  light: 12,
  soft: 8,
  success: [20, 40, 40],
  error: [40, 60, 40],
}

/** Respected when the user has reduced motion turned on (proxy for noise-averse). */
function shouldVibrate(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  return true
}

export function haptic(kind: HapticKind): void {
  if (!shouldVibrate()) return
  try {
    navigator.vibrate(PATTERNS[kind])
  } catch {
    // Some browsers throw on invalid patterns; ignore.
  }
}
