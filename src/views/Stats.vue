<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BackButton,
  BodyText,
  Eyebrow,
  Heading,
  PrimaryButton,
  SegmentGroup,
  StatTile,
  TrendLineChart,
} from '@/design-system'
import { computeAllStats, type AllStats } from '@/features/stats/aggregator'

type Tab = 'overall' | 'checkout121' | 'standardCheckout' | 'barneys'

const router = useRouter()
const tab = ref<Tab>('overall')
const stats = ref<AllStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  stats.value = await computeAllStats()
  loading.value = false
})

const TAB_OPTIONS: Tab[] = ['overall', 'checkout121', 'standardCheckout', 'barneys']
const TAB_LABELS: string[] = ['Overall', '121', '501', "Barney's"]
</script>

<template>
  <section class="stats">
    <div class="stats__back">
      <BackButton label="Home" @click="router.push({ name: 'home' })" />
    </div>
    <Heading :size="32" style="margin-bottom: 10px">Performance</Heading>
    <BodyText style="margin-bottom: 20px">
      Everything you've thrown, rolled up. Nothing here leaves this device.
    </BodyText>

    <div class="stats__tabs">
      <SegmentGroup v-model="tab" :options="TAB_OPTIONS" :labels="TAB_LABELS" />
    </div>

    <div v-if="loading" class="stats__loading">Loading stats…</div>

    <div v-else-if="stats && stats.overall.matches === 0" class="stats__empty">
      <BodyText>No matches yet. Play a round and come back.</BodyText>
      <div style="margin-top: 14px">
        <PrimaryButton @click="router.push({ name: 'play-setup' })">▸ Play now</PrimaryButton>
      </div>
    </div>

    <div v-else-if="stats && tab === 'overall'" class="stats__content">
      <div class="stats__grid">
        <StatTile label="Matches Played" :value="stats.overall.matches" />
        <StatTile label="Total Darts" :value="stats.overall.totalDarts" />
        <StatTile label="Rounds" :value="stats.overall.rounds" />
        <StatTile label="Checkouts" :value="stats.overall.checkouts" />
        <StatTile label="Checkout Rate" :value="`${stats.overall.checkoutRate}%`" />
        <StatTile label="Highest Out" :value="stats.overall.highestOut" />
        <StatTile label="Fewest Darts" :value="stats.overall.fewestDarts" />
        <StatTile label="Best Streak" :value="stats.overall.bestStreak" />
      </div>

      <Eyebrow style="margin: 28px 0 10px">By Mode</Eyebrow>
      <div class="stats__grid">
        <StatTile label="121 Matches" :value="stats.overall.perType.checkout121" />
        <StatTile label="501 Matches" :value="stats.overall.perType.standardCheckout" />
        <StatTile label="Barney's" :value="stats.overall.perType.barneys" />
      </div>
    </div>

    <div v-else-if="stats && tab === 'checkout121'" class="stats__content">
      <div class="stats__grid">
        <StatTile label="Matches" :value="stats.checkout121.matches" />
        <StatTile label="Highest Target" :value="stats.checkout121.highestTarget" />
        <StatTile
          label="Avg Target Reached"
          :value="stats.checkout121.averageTargetReached.toFixed(1)"
        />
      </div>

      <Eyebrow style="margin: 24px 0 10px">Checkout Rate by Range</Eyebrow>
      <div class="stats__grid">
        <StatTile
          v-for="r in stats.checkout121.checkoutsByRange"
          :key="r.label"
          :label="r.label"
          :value="`${r.rate}% · ${r.count}`"
        />
      </div>

      <Eyebrow style="margin: 24px 0 10px">Checkout Rate Trend</Eyebrow>
      <TrendLineChart
        :points="stats.checkout121.trend.map(t => ({ t: t.playedAt, v: t.checkoutRate }))"
        tone="green"
        suffix="%"
      />
    </div>

    <div v-else-if="stats && tab === 'standardCheckout'" class="stats__content">
      <div class="stats__grid">
        <StatTile label="Matches" :value="stats.standard.matches" />
        <StatTile label="Legs Won" :value="stats.standard.legsWon" />
        <StatTile label="Best Avg" :value="stats.standard.bestAverage.toFixed(1)" />
        <StatTile label="Rolling Avg (10)" :value="stats.standard.rollingAverage.toFixed(1)" />
        <StatTile label="180s" :value="stats.standard.oneEighties" />
        <StatTile label="140+" :value="stats.standard.forties" />
        <StatTile label="Tons (100-139)" :value="stats.standard.tons" />
        <StatTile label="60+ scored turns" :value="stats.standard.sixties" />
        <StatTile label="Busts" :value="stats.standard.busts" />
      </div>

      <Eyebrow style="margin: 24px 0 10px">3-Dart Avg Trend</Eyebrow>
      <TrendLineChart
        :points="stats.standard.trend.map(t => ({ t: t.playedAt, v: t.average }))"
        tone="green"
        :value-formatter="(v: number) => v.toFixed(1)"
      />
    </div>

    <div v-else-if="stats && tab === 'barneys'" class="stats__content">
      <div class="stats__grid">
        <StatTile label="Matches" :value="stats.barneys.matches" />
        <StatTile label="Best Score" :value="`${stats.barneys.bestScore}/63`" />
        <StatTile
          label="Average"
          :value="`${stats.barneys.averageScore.toFixed(1)}/63`"
        />
      </div>

      <Eyebrow style="margin: 24px 0 10px">Hits per Target</Eyebrow>
      <div class="stats__grid stats__grid--seven">
        <StatTile
          v-for="t in stats.barneys.perTarget"
          :key="String(t.target)"
          :label="String(t.target)"
          :value="t.attempts"
        />
      </div>

      <Eyebrow style="margin: 24px 0 10px">Score Trend</Eyebrow>
      <TrendLineChart
        :points="stats.barneys.trend.map(t => ({ t: t.playedAt, v: t.score }))"
        tone="red"
        suffix="/63"
      />
    </div>
  </section>
</template>

<style scoped>
.stats {
  padding: 60px var(--ds-edge-padding) 40px;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100%;
}

.stats__back {
  margin-bottom: 20px;
}

.stats__tabs {
  margin-bottom: 20px;
}

.stats__tab-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 6px;
  font-family: var(--ds-font-mono);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-dim);
}

.stats__tab-labels span {
  flex: 1;
  text-align: center;
}

.stats__loading {
  padding: 40px 0;
  text-align: center;
  font-family: var(--ds-font-mono);
  font-size: 12px;
  color: var(--ds-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.stats__empty {
  padding: 32px 20px;
  border-radius: var(--ds-radius-md);
  background: var(--ds-bg-2);
  border: 1px dashed var(--ds-border-2);
  text-align: center;
}

.stats__content {
  display: flex;
  flex-direction: column;
}

.stats__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stats__grid--seven {
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}
</style>
