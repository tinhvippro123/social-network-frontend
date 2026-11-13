<script setup lang="ts">
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData, type ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = withDefaults(defineProps<{
  positive: number
  neutral: number
  negative: number
  size?: 'sm' | 'md'
}>(), {
  size: 'sm',
})

const total = computed(() => props.positive + props.neutral + props.negative)

const chartData = computed<ChartData<'doughnut'>>(() => {
  if (total.value === 0) {
    return {
      labels: ['Chưa có dữ liệu'],
      datasets: [{
        data: [1],
        backgroundColor: ['rgba(148, 163, 184, 0.25)'],
        borderWidth: 0,
      }],
    }
  }
  return {
    labels: ['Tích cực', 'Trung lập', 'Tiêu cực'],
    datasets: [{
      data: [props.positive, props.neutral, props.negative],
      backgroundColor: ['#10b981', '#3b82f6', '#f43f5e'],
      borderColor: 'transparent',
      borderWidth: 1,
      hoverOffset: 4,
    }],
  }
})

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: props.size === 'sm' ? '64%' : '68%',
  animation: { duration: 350 },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: total.value > 0,
      callbacks: {
        label(ctx) {
          const val = Number(ctx.parsed || 0)
          const pct = total.value > 0 ? Math.round((val / total.value) * 100) : 0
          return ` ${ctx.label}: ${val} (${pct}%)`
        },
      },
    },
  },
}))
</script>

<template>
  <div
    class="relative shrink-0 flex items-center justify-center"
    :class="size === 'sm' ? 'w-12 h-12' : 'w-36 h-36'"
  >
    <Doughnut :data="chartData" :options="chartOptions" />
    <div
      v-if="size === 'md'"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <span class="text-xl font-bold text-gray-900 dark:text-white leading-none tabular-nums">
        {{ total }}
      </span>
      <span class="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1">
        bình luận
      </span>
    </div>
  </div>
</template>

