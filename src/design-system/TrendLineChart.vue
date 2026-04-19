<script setup lang="ts">
// Lightweight SVG line chart — no chart library. Accepts an ordered
// series of points (oldest → newest) and draws a connected polyline
// with a subtle glow. If there's only one point we draw it as a dot;
// empty series shows a placeholder.
import { computed } from 'vue'

interface Point {
  /** X axis (timestamp or index). */
  t: number
  /** Y axis. */
  v: number
}

interface Props {
  points: Point[]
  unit?: string
  tone?: 'green' | 'red'
  height?: number
  suffix?: string
  valueFormatter?: (v: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  tone: 'green',
  height: 100,
  suffix: '',
  valueFormatter: (v: number) => v.toFixed(0),
})

const pad = 8
const width = 320

const path = computed(() => buildPath(props.points, width, props.height, pad))

const latest = computed(() => {
  const last = props.points.at(-1)
  return last ? props.valueFormatter(last.v) + props.suffix : '—'
})

const minV = computed(() => (props.points.length ? Math.min(...props.points.map((p) => p.v)) : 0))
const maxV = computed(() => (props.points.length ? Math.max(...props.points.map((p) => p.v)) : 0))

function buildPath(points: Point[], w: number, h: number, p: number): string {
  if (points.length === 0) return ''
  const xs = points.map((_pt, i) => (points.length === 1 ? w / 2 : p + (i / (points.length - 1)) * (w - 2 * p)))
  const vs = points.map((pt) => pt.v)
  const min = Math.min(...vs)
  const max = Math.max(...vs)
  const ys = vs.map((v) => {
    if (max === min) return h / 2
    const norm = (v - min) / (max - min)
    return h - p - norm * (h - 2 * p)
  })
  const parts = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${ys[i]!.toFixed(1)}`)
  return parts.join(' ')
}
</script>

<template>
  <div class="chart" :style="{ height: `${height}px` }">
    <svg
      v-if="points.length > 0"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      width="100%"
      :height="height"
      aria-hidden="true"
    >
      <path
        :d="path"
        fill="none"
        :stroke="tone === 'green' ? 'var(--ds-green)' : 'var(--ds-accent)'"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :style="{
          filter:
            tone === 'green'
              ? 'drop-shadow(0 0 6px var(--ds-green-glow))'
              : 'drop-shadow(0 0 6px var(--ds-accent-glow))',
        }"
      />
    </svg>
    <div v-else class="chart__empty">No data yet</div>

    <div class="chart__meta">
      <span class="chart__latest">{{ latest }}</span>
      <span v-if="points.length > 1" class="chart__range">
        min {{ valueFormatter(minV) }}{{ suffix }} · max {{ valueFormatter(maxV) }}{{ suffix }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-muted);
  font-family: var(--ds-font-mono);
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.chart__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  color: var(--ds-muted);
}

.chart__latest {
  font-size: 16px;
  font-weight: 700;
  color: var(--ds-text);
  letter-spacing: -0.3px;
}

.chart__range {
  font-size: 10px;
  letter-spacing: 0.5px;
  color: var(--ds-dim);
}
</style>
