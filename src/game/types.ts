// Shared transient types used by the Pinia session stores. These are
// *not* persisted — the Dexie shapes in @/types/domain.ts are.

export interface TurnRecord {
  /** 1-indexed within its round. */
  turnNumber: number
  dartsThrown: 1 | 2 | 3
  scoreThrown: number
  remainingAfter: number
  isBust: boolean
}

export interface RoundRecord {
  /** 1-indexed within its match. */
  roundNumber: number
  target: number
  success: boolean
  dartsUsed: number
  turns: TurnRecord[]
}

export type SessionStatus =
  | { kind: 'idle' }
  | { kind: 'playing' }
  | { kind: 'bust'; message: string }
  | { kind: 'success'; message: string }
  | { kind: 'finished' }

export type SubmissionOutcome =
  | { kind: 'invalid'; reason: string }
  | { kind: 'turnRecorded' }
  | { kind: 'bust' }
  | { kind: 'roundFailed' }
  | { kind: 'roundCompleted' }
  | { kind: 'legFinished' }
  | { kind: 'matchFinished' }
