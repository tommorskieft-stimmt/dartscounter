import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { route } from '@/game/CheckoutEngine'
import type { RoundRecord, SessionStatus, SubmissionOutcome, TurnRecord } from '@/game/types'

// 121 Checkout session — transient in-memory state for the live game.
// Mirrors the iOS GameSession (and prototype GamePlay) logic: climb the
// target on checkout, drop on miss (floor 121), bust on tentative < 0 or
// == 1. Round fails when darts are exhausted without a checkout.
export const useCheckout121Store = defineStore('checkout121', () => {
  const maxDarts = ref(9)
  /** null = endless. */
  const rounds = ref<number | null>(10)

  const target = ref(121)
  const remaining = ref(121)
  const dartsUsed = ref(0)
  const roundIndex = ref(0) // count of completed rounds
  const currentTurns = ref<TurnRecord[]>([])
  const history = ref<RoundRecord[]>([])
  const status = ref<SessionStatus>({ kind: 'idle' })
  const confettiTrigger = ref(0)

  const dartsRemainingThisRound = computed(() => maxDarts.value - dartsUsed.value)
  const currentRoundNumber = computed(() => roundIndex.value + 1)
  const currentRoute = computed(() => route(remaining.value))
  const finalTarget = computed(() => target.value)

  function start(options: { maxDarts?: number; rounds?: number | null } = {}) {
    maxDarts.value = options.maxDarts ?? 9
    rounds.value = options.rounds === undefined ? 10 : options.rounds
    target.value = 121
    remaining.value = 121
    dartsUsed.value = 0
    roundIndex.value = 0
    currentTurns.value = []
    history.value = []
    status.value = { kind: 'playing' }
    confettiTrigger.value = 0
  }

  function submit(scoreThrown: number, dartsThrown: 1 | 2 | 3): SubmissionOutcome {
    if (status.value.kind === 'finished') return { kind: 'invalid', reason: 'Match finished' }
    if (scoreThrown < 0) return { kind: 'invalid', reason: 'Score < 0' }
    const remainingDarts = maxDarts.value - dartsUsed.value
    if (dartsThrown > remainingDarts) return { kind: 'invalid', reason: 'Not enough darts left' }
    if (scoreThrown > dartsThrown * 60) return { kind: 'invalid', reason: 'Score too high' }

    const tentative = remaining.value - scoreThrown
    const isBust = tentative < 0 || tentative === 1
    const turnNumber = currentTurns.value.length + 1

    if (isBust) {
      const turn: TurnRecord = {
        turnNumber,
        dartsThrown,
        scoreThrown,
        remainingAfter: remaining.value,
        isBust: true,
      }
      currentTurns.value = [...currentTurns.value, turn]
      dartsUsed.value += dartsThrown
      if (dartsUsed.value >= maxDarts.value) {
        failRound()
        const finished = (status.value as SessionStatus).kind === 'finished'
        return finished ? { kind: 'matchFinished' } : { kind: 'roundFailed' }
      }
      status.value = { kind: 'bust', message: `Bust — score stays at ${remaining.value}` }
      return { kind: 'bust' }
    }

    if (tentative === 0) {
      const turn: TurnRecord = {
        turnNumber,
        dartsThrown,
        scoreThrown,
        remainingAfter: 0,
        isBust: false,
      }
      currentTurns.value = [...currentTurns.value, turn]
      dartsUsed.value += dartsThrown
      remaining.value = 0
      confettiTrigger.value += 1
      status.value = { kind: 'success', message: `Checked out in ${dartsUsed.value} darts` }
      completeRound(true)
      const finished: boolean = (status.value as SessionStatus).kind === 'finished'
      return finished ? { kind: 'matchFinished' } : { kind: 'roundCompleted' }
    }

    const turn: TurnRecord = {
      turnNumber,
      dartsThrown,
      scoreThrown,
      remainingAfter: tentative,
      isBust: false,
    }
    currentTurns.value = [...currentTurns.value, turn]
    dartsUsed.value += dartsThrown
    remaining.value = tentative
    status.value = { kind: 'playing' }

    if (dartsUsed.value >= maxDarts.value) {
      failRound()
      const finished = (status.value as SessionStatus).kind === 'finished'
      return finished ? { kind: 'matchFinished' } : { kind: 'roundFailed' }
    }
    return { kind: 'turnRecorded' }
  }

  function undo(): boolean {
    const last = currentTurns.value.at(-1)
    if (!last) return false
    currentTurns.value = currentTurns.value.slice(0, -1)
    dartsUsed.value = Math.max(0, dartsUsed.value - last.dartsThrown)
    remaining.value = last.isBust ? remaining.value : last.remainingAfter + last.scoreThrown
    status.value = { kind: 'playing' }
    return true
  }

  function quit(): RoundRecord[] {
    status.value = { kind: 'finished' }
    return history.value
  }

  function failRound() {
    completeRound(false)
  }

  function completeRound(success: boolean) {
    history.value = [
      ...history.value,
      {
        roundNumber: currentRoundNumber.value,
        target: target.value,
        success,
        dartsUsed: dartsUsed.value,
        turns: currentTurns.value,
      },
    ]
    const newTarget = success ? target.value + 1 : Math.max(target.value - 1, 121)
    roundIndex.value += 1
    if (rounds.value !== null && roundIndex.value >= rounds.value) {
      status.value = { kind: 'finished' }
      return
    }
    // Advance to next round.
    target.value = newTarget
    remaining.value = newTarget
    dartsUsed.value = 0
    currentTurns.value = []
    status.value = { kind: 'playing' }
  }

  return {
    // config
    maxDarts,
    rounds,
    // live state
    target,
    remaining,
    dartsUsed,
    roundIndex,
    currentTurns,
    history,
    status,
    confettiTrigger,
    // getters
    dartsRemainingThisRound,
    currentRoundNumber,
    currentRoute,
    finalTarget,
    // actions
    start,
    submit,
    undo,
    quit,
  }
})
