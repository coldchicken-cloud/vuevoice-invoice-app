<template>
  <svg class="revenue-chart" :viewBox="`0 0 ${chartWidth} ${chartHeight}`" preserveAspectRatio="xMidYMid meet">
    <g v-for="bar in bars" :key="bar.label">
      <rect :x="bar.x" :y="bar.y" :width="barWidth" :height="bar.height" rx="4" class="bar" />
      <text :x="bar.x + barWidth / 2" :y="bar.y - 8" text-anchor="middle" class="value-label">
        {{ formatCompactCurrency(bar.total, currencyCode) }}
      </text>
      <text :x="bar.x + barWidth / 2" :y="chartHeight - 8" text-anchor="middle" class="axis-label">
        {{ bar.label }}
      </text>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue';
import { formatCompactCurrency } from '@/utils/currencyFormatter';

const props = defineProps({
  // [{ key, label, total }, ...] - see invoices/monthlyPaidRevenue getter
  data: {
    type: Array,
    required: true,
  },
  currencyCode: {
    type: String,
    default: 'USD',
  },
});

const chartWidth = 480;
const chartHeight = 220;
const topPadding = 32;
const bottomPadding = 28;
const barWidth = 40;

const gap = computed(() => (chartWidth - props.data.length * barWidth) / (props.data.length + 1));
const maxTotal = computed(() => Math.max(1, ...props.data.map((month) => month.total)));

const bars = computed(() =>
  props.data.map((month, index) => {
    const availableHeight = chartHeight - topPadding - bottomPadding;
    const height = Math.max(2, (month.total / maxTotal.value) * availableHeight);
    const x = gap.value + index * (barWidth + gap.value);
    const y = chartHeight - bottomPadding - height;
    return { ...month, x, y, height };
  })
);
</script>

<style lang="scss" scoped>
.revenue-chart {
  width: 100%;
  height: auto;

  .bar {
    fill: var(--color-accent);
    transition: height 0.6s var(--ease-premium), y 0.6s var(--ease-premium);
  }

  .value-label {
    fill: var(--color-text-secondary);
    font-size: 10px;
  }

  .axis-label {
    fill: var(--color-text-muted);
    font-size: 11px;
  }
}
</style>
