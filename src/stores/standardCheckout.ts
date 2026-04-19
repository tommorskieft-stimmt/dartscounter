import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { route } from '@/game/CheckoutEngine'
import type { StandardStartScore } from '@/types/domain'
import type { SessionStatus, SubmissionOutcome, TurnRecord } from '@/game/types'

// Standard Checkout (501 / 301 / 201 / 101). Multi-leg support:
//   - A turn that brings remaining to 0 on a double finishes the leg.
//   - Bust on tentative < 0, tentative == 1, or finishing on a non-double.
//   - `legsTarget = null` → endless; match finishes when the user quits.
//
// Each turn's `finishesOnDouble` flag is required when the user submits
// a turn that closes the leg; it encodes the final-dart type. If false
// and tentative == 0, we treat the turn as a bust.
export const useStandardCheckoutStore = defineStore('standardCheckout', () => {
  const startScore = ref<StandardStartScore>(501)
  const legsTarget = ref<number | null>(1)

  const remaining = ref(501)
  const turns = ref<TurnRecord[]>([])
  const legsWon = ref(0)
  const dartsThisLeg = ref(0)
  const dartsTotal = ref(0)
  const status = ref<SessionStatus>({ kind: 'idle' })
  const confettiTrigger = ref(0)
  const completedLegs = ref<Array<{ darts: number; average: number }>>([])

  const currentRoute = computed(() => route(remaining.value))

  const threeDartAverage = computed(() => {
    if (dartsTotal.value === 0) return 0
    const scored =
      startScore.value * Math.max(1, legsWon.value + (remaining.value < startScore.value ? 0 : 0)) -
      remaining.value
    return (scored / dartsTotal.value) * 3
  })

  function start(options: {
    startScore?: StandardStartScore
    legsTarget?: number | null
  } = {}) {
    startScore.value = options.startScore ?? 501
    legsTarget.value = options.legsTarget === undefined ? 1 : options.legsTarget
    remaining.value = startScore.value
    turns.value = []
    legsWon.value = 0
    dartsThisLeg.value = 0
    dartsTotal.value = 0
    status.value = { kind: 'playing' }
    confettiTrigger.value = 0
    completedLegs.value = []
  }

  function submit(
    scoreThrown: number,
    dartsThrown: 1 | 2 | 3,
    finishesOnDouble = false,
  ): SubmissionOutcome {
    if (status.value.kind === 'finished') return { kind: 'invalid', reason: 'Match finished' }
    if (scoreThrown < 0) return { kind: 'invalid', reason: 'Score < 0' }
    if (scoreThrown > dartsThrown * 60) return { kind: 'invalid', reason: 'Score too high' }

    const tentative = remaining.value - scoreThrown
    const bustByScore = tentative < 0 || tentative === 1
    const bustByNonDouble = tentative === 0 && !finishesOnDouble
    const isBust = bustByScore || bustByNonDouble

    const turnNumber = turns.value.length + 1

    if (isBust) {
      turns.value = [
        ...turns.value,
        {
          turnNumber,
          dartsThrown,
          scoreThrown,
          remainingAfter: remaining.value,
          isBust: true,
        },
      ]
      dartsThisLeg.value += dartsThrown
      dartsTotal.value += dartsThrown
      status.value = { kind: 'bust', message: `Bust — stays at ${remaining.value}` }
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
      turns.value = [...turns.value, turn]
      dartsThisLeg.value += dartsThrown
      dartsTotal.value += dartsThrown
      legsWon.value += 1
      confettiTrigger.value += 1
      const legAvg = dartsThisLeg.value === 0 ? 0 : (startScore.value / dartsThisLeg.value) * 3
      completedLegs.value = [
        ...completedLegs.value,
        { darts: dartsThisLeg.value, average: legAvg },
      ]

      if (legsTarget.value !== null && legsWon.value >= legsTarget.value) {
        status.value = { kind: 'finished' }
        return { kind: 'matchFinished' }
      }

      // Start next leg
      remaining.value = startScore.value
      dartsThisLeg.value = 0
      turns.value = []
      status.value = { kind: 'success', message: `Leg ${legsWon.value} in ${turn.turnNumber} turns` }
      return { kind: 'legFinished' }
    }

    // Ordinary turn
    turns.value = [
      ...turns.value,
      {
        turnNumber,
        dartsThrown,
        scoreThrown,
        remainingAfter: tentative,
        isBust: false,
      },
    ]
    remaining.value = tentative
    dartsThisLeg.value += dartsThrown
    dartsTotal.value += dartsThrown
    status.value = { kind: 'playing' }
    return { kind: 'turnRecorded' }
  }

  function undo(): boolean {
    const last = turns.value.at(-1)
    if (!last) return false
    turns.value = turns.value.slice(0, -1)
    dartsThisLeg.value = Math.max(0, dartsThisLeg.value - last.dartsThrown)
    dartsTotal.value = Math.max(0, dartsTotal.value - last.dartsThrown)
    if (!last.isBust) {
      remaining.value = last.remainingAfter + last.scoreThrown
    }
    status.value = { kind: 'playing' }
    return true
  }

  function quit() {
    status.value = { kind: 'finished' }
    return {
      legsWon: legsWon.value,
      dartsTotal: dartsTotal.value,
      threeDartAverage: threeDartAverage.value,
      completedLegs: completedLegs.value,
    }
  }

  return {
    // config
    startScore,
    legsTarget,
    // live state
    remaining,
    turns,
    legsWon,
    dartsThisLeg,
    dartsTotal,
    status,
    confettiTrigger,
    completedLegs,
    // getters
    currentRoute,
    threeDartAverage,
    // actions
    start,
    submit,
    undo,
    quit,
  }
})
