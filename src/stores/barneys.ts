import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { SessionStatus, SubmissionOutcome } from '@/game/types'

// Barney's Accuracy Drill — fixed 7-target sequence (20, 19, 18, 17, 16,
// 15, bull), 3 darts per target, 21 darts total. Scoring:
//   - miss         : 0
//   - single       : 1
//   - double       : 2
//   - treble       : 3
// No bust logic. Max 63.

export type BarneysHit = 'miss' | 'single' | 'double' | 'treble'

export const BARNEYS_TARGETS: readonly (number | 'Bull')[] = [20, 19, 18, 17, 16, 15, 'Bull'] as const

const HIT_POINTS: Record<BarneysHit, number> = {
  miss: 0,
  single: 1,
  double: 2,
  treble: 3,
}

export const useBarneysStore = defineStore('barneys', () => {
  const targetIndex = ref(0)
  const currentHits = ref<BarneysHit[]>([])
  const pastRounds = ref<
    { target: number | 'Bull'; hits: readonly BarneysHit[]; score: number }[]
  >([])
  const status = ref<SessionStatus>({ kind: 'idle' })
  const confettiTrigger = ref(0)

  const currentTarget = computed(() => BARNEYS_TARGETS[targetIndex.value] ?? null)

  const totalScore = computed(
    () => pastRounds.value.reduce((a, r) => a + r.score, 0) + currentScore.value,
  )

  const currentScore = computed(() =>
    currentHits.value.reduce((a, h) => a + HIT_POINTS[h], 0),
  )

  const dartsThrownTotal = computed(
    () => pastRounds.value.reduce((a, r) => a + r.hits.length, 0) + currentHits.value.length,
  )

  const perTargetHits = computed(() => {
    const out: BarneysHit[][] = []
    for (const r of pastRounds.value) out.push([...r.hits])
    if (currentHits.value.length) out.push([...currentHits.value])
    return out
  })

  function start() {
    targetIndex.value = 0
    currentHits.value = []
    pastRounds.value = []
    status.value = { kind: 'playing' }
    confettiTrigger.value = 0
  }

  function recordHit(hit: BarneysHit): SubmissionOutcome {
    if (status.value.kind === 'finished') return { kind: 'invalid', reason: 'Match finished' }
    if (targetIndex.value >= BARNEYS_TARGETS.length) {
      return { kind: 'invalid', reason: 'No targets remaining' }
    }
    if (currentHits.value.length >= 3) {
      return { kind: 'invalid', reason: 'Round already full' }
    }

    const nextHits = [...currentHits.value, hit]
    currentHits.value = nextHits

    if (nextHits.length === 3) {
      const target = BARNEYS_TARGETS[targetIndex.value]!
      const score = nextHits.reduce((a, h) => a + HIT_POINTS[h], 0)
      pastRounds.value = [...pastRounds.value, { target, hits: nextHits, score }]
      currentHits.value = []
      targetIndex.value += 1

      if (targetIndex.value >= BARNEYS_TARGETS.length) {
        status.value = { kind: 'finished' }
        confettiTrigger.value += 1
        return { kind: 'matchFinished' }
      }
      return { kind: 'roundCompleted' }
    }
    status.value = { kind: 'playing' }
    return { kind: 'turnRecorded' }
  }

  function undo(): boolean {
    if (currentHits.value.length > 0) {
      currentHits.value = currentHits.value.slice(0, -1)
      return true
    }
    // Rewind into the previous round.
    const prev = pastRounds.value.at(-1)
    if (!prev) return false
    pastRounds.value = pastRounds.value.slice(0, -1)
    targetIndex.value = Math.max(0, targetIndex.value - 1)
    currentHits.value = prev.hits.slice(0, -1)
    status.value = { kind: 'playing' }
    return true
  }

  function quit() {
    status.value = { kind: 'finished' }
    return {
      totalScore: totalScore.value,
      perTargetHits: perTargetHits.value,
      dartsThrown: dartsThrownTotal.value,
    }
  }

  return {
    // state
    targetIndex,
    currentHits,
    pastRounds,
    status,
    confettiTrigger,
    // getters
    currentTarget,
    totalScore,
    currentScore,
    dartsThrownTotal,
    perTargetHits,
    // actions
    start,
    recordHit,
    undo,
    quit,
  }
})
