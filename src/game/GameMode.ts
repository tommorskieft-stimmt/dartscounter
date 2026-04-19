import type { GameType, StandardStartScore } from '@/types/domain'

// Discriminated union for "what are we playing". Carries configuration
// per mode plus display metadata for the mode picker.
export type GameMode =
  | { type: 'checkout121'; maxDarts: number; rounds: number | null }
  | { type: 'standardCheckout'; startScore: StandardStartScore; legs: number | null }
  | { type: 'barneys' }

export interface GameModeDisplay {
  type: GameType
  title: string
  tagline: string
  blurb: string
}

export const GAME_MODE_DISPLAY: Readonly<Record<GameType, GameModeDisplay>> = {
  checkout121: {
    type: 'checkout121',
    title: '121 Checkout',
    tagline: 'Climb from 121',
    blurb: 'Check out to climb the target. Miss and it drops back. Floor at 121.',
  },
  standardCheckout: {
    type: 'standardCheckout',
    title: 'Standard Checkout',
    tagline: '501 / 301 / 201 / 101',
    blurb: 'Classic multi-leg format. Must finish on a double (or bull).',
  },
  barneys: {
    type: 'barneys',
    title: "Barney's Accuracy Drill",
    tagline: '20 → bull',
    blurb: "Three darts per target through 20, 19, 18, 17, 16, 15, bull. 63 max.",
  },
}

export const DEFAULT_CHECKOUT_121: Extract<GameMode, { type: 'checkout121' }> = {
  type: 'checkout121',
  maxDarts: 9,
  rounds: 10,
}

export const DEFAULT_STANDARD: Extract<GameMode, { type: 'standardCheckout' }> = {
  type: 'standardCheckout',
  startScore: 501,
  legs: 1,
}

export const DEFAULT_BARNEYS: Extract<GameMode, { type: 'barneys' }> = { type: 'barneys' }

export function modeTypeId(mode: GameMode): GameType {
  return mode.type
}
