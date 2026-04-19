import { db } from '@/db/database'

// Surfaces a "maybe try X" card on Home based on recent practice. Mirrors
// the iOS RecommendationService: if the rolling 501 average is below a
// threshold, suggest Barney's. If there's no practice data at all, pick
// 121 as the starter.

export type RecommendationKey = 'checkout121' | 'standardCheckout' | 'barneys' | null

export interface Recommendation {
  key: Exclude<RecommendationKey, null>
  title: string
  reason: string
}

const RECS: Record<Exclude<RecommendationKey, null>, { title: string; reason: string }> = {
  checkout121: {
    title: 'Try 121 Checkout',
    reason: 'A focused finishing drill — climb the target every time you check out.',
  },
  standardCheckout: {
    title: 'Play a 501 match',
    reason: 'Proper match format. See where your 3-dart average lands today.',
  },
  barneys: {
    title: "Try Barney's Drill",
    reason: "Accuracy on the big numbers is dragging your 501 average down — work the 20/19/18 line.",
  },
}

export async function currentRecommendation(): Promise<Recommendation | null> {
  const recent = await db.matches.orderBy('playedAt').reverse().limit(20).toArray()
  if (recent.length === 0) {
    return { key: 'checkout121', ...RECS.checkout121 }
  }
  const recent501 = recent.filter((m) => m.gameType === 'standardCheckout')
  if (recent501.length >= 3) {
    const avg =
      recent501.reduce((a, m) => a + (m.threeDartAverage ?? 0), 0) / recent501.length
    if (avg < 45) return { key: 'barneys', ...RECS.barneys }
  }
  const hasStandard = recent.some((m) => m.gameType === 'standardCheckout')
  if (!hasStandard) return { key: 'standardCheckout', ...RECS.standardCheckout }
  // Otherwise nudge toward 121 checkout practice.
  return { key: 'checkout121', ...RECS.checkout121 }
}
