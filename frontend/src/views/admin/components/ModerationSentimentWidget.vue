<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Sparkles,
  Smile,
  Meh,
  Frown,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle2,
  Brain,
  Sliders
} from '@lucide/vue'
import adminApi from '@/api/admin.api'
import searchApi from '@/api/search.api'
import type { SentimentResult } from '@/api/search.api'

interface SentimentStats {
  positive: number
  neutral: number
  negative: number
}

const stats = ref<SentimentStats>({ positive: 0, neutral: 0, negative: 0 })
const isLoadingStats = ref(false)
const statsError = ref('')

// Interactive live tester
const testInput = ref('')
const isTesting = ref(false)
const testResult = ref<SentimentResult | null>(null)
const showTester = ref(false)

const totalComments = computed(() => {
  return stats.value.positive + stats.value.neutral + stats.value.negative
})

const positivePercent = computed(() => {
  if (totalComments.value === 0) return 0
  return Math.round((stats.value.positive / totalComments.value) * 100)
})

const neutralPercent = computed(() => {
  if (totalComments.value === 0) return 0
  return Math.round((stats.value.neutral / totalComments.value) * 100)
})

const negativePercent = computed(() => {
  if (totalComments.value === 0) return 0
  return Math.round((stats.value.negative / totalComments.value) * 100)
})

async function fetchStats() {
  isLoadingStats.value = true
  statsError.value = ''
  try {
    const res = await adminApi.getSentimentStats()
    if (res.data?.data) {
      stats.value = {
        positive: res.data.data.positive ?? 0,
        neutral: res.data.data.neutral ?? 0,
        negative: res.data.data.negative ?? 0,
      }
    }
  } catch (err: any) {
    statsError.value = 'Không thể tải thống kê cảm xúc'
  } finally {
    isLoadingStats.value = false
  }
}

async function runLiveTest(textToAnalyze?: string) {
  const query = textToAnalyze || testInput.value
  if (!query.trim()) return

  if (textToAnalyze) {
    testInput.value = textToAnalyze
  }

  isTesting.value = true
  try {
    const res = await searchApi.sentiment(query.trim())
    if (res.data?.data) {
      testResult.value = res.data.data
    }
  } catch (err) {
    console.error('Lỗi phân tích cảm xúc:', err)
  } finally {
    isTesting.value = false
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<template>
  <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 shadow-xs mb-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-surface-700">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 text-indigo-500 dark:text-indigo-400 ring-1 ring-indigo-500/20">
          <Brain :size="22" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-gray-900 dark:text-white">
              Phân tích cảm xúc bình luận (AI Sentiment Analysis)
            </h2>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
              <Sparkles :size="10" />
              Lexicon-based NLP
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tự động phân loại toàn bộ bình luận trong cơ sở dữ liệu để phát hiện nội dung tiêu cực, hỗ trợ kiểm duyệt
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-end sm:self-auto">
        <button
          @click="showTester = !showTester"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-gray-200 dark:border-surface-600 hover:bg-gray-50 dark:hover:bg-surface-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <Sliders :size="13" />
          {{ showTester ? 'Đóng thử nghiệm' : 'Thử nghiệm giải thuật' }}
        </button>
        <button
          @click="fetchStats"
          :disabled="isLoadingStats"
          class="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-surface-700 hover:bg-gray-200 dark:hover:bg-surface-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
          title="Tải lại số liệu"
        >
          <RefreshCw :size="13" :class="{ 'animate-spin': isLoadingStats }" />
          <span>Làm mới</span>
        </button>
      </div>
    </div>

    <!-- Stats Cards Row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
      <!-- Positive Card -->
      <div class="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-emerald-800 dark:text-emerald-300">Tích cực (Positive)</span>
          <Smile :size="18" class="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {{ stats.positive.toLocaleString() }}
          </span>
          <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {{ positivePercent }}%
          </span>
        </div>
        <p class="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-1">
          Khen ngợi, ủng hộ, cảm ơn, đánh giá cao
        </p>
      </div>

      <!-- Neutral Card -->
      <div class="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-blue-800 dark:text-blue-300">Trung lập (Neutral)</span>
          <Meh :size="18" class="text-blue-600 dark:text-blue-400" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {{ stats.neutral.toLocaleString() }}
          </span>
          <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">
            {{ neutralPercent }}%
          </span>
        </div>
        <p class="text-[11px] text-blue-600/80 dark:text-blue-400/70 mt-1">
          Hỏi đáp, trao đổi kỹ thuật, thảo luận thông thường
        </p>
      </div>

      <!-- Negative Card -->
      <div class="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-rose-800 dark:text-rose-300">Tiêu cực (Negative)</span>
          <Frown :size="18" class="text-rose-600 dark:text-rose-400" />
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-2xl font-bold text-rose-700 dark:text-rose-300">
            {{ stats.negative.toLocaleString() }}
          </span>
          <span class="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {{ negativePercent }}%
          </span>
        </div>
        <p class="text-[11px] text-rose-600/80 dark:text-rose-400/70 mt-1 flex items-center gap-1">
          <AlertCircle :size="11" />
          Nội dung chỉ trích, phàn nàn — cần lưu ý kiểm duyệt
        </p>
      </div>
    </div>

    <!-- Distribution Bar -->
    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-surface-700">
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        <span>Tỷ lệ phân bố cảm xúc trên toàn hệ thống ({{ totalComments }} bình luận)</span>
        <span class="font-medium">
          Tích cực: <strong class="text-emerald-600">{{ positivePercent }}%</strong> |
          Trung lập: <strong class="text-blue-600">{{ neutralPercent }}%</strong> |
          Tiêu cực: <strong class="text-rose-600">{{ negativePercent }}%</strong>
        </span>
      </div>
      <div class="h-3 w-full bg-gray-100 dark:bg-surface-700 rounded-full overflow-hidden flex shadow-inner">
        <div
          class="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-700"
          :style="{ width: `${positivePercent}%` }"
          :title="`Tích cực: ${stats.positive} (${positivePercent}%)`"
        />
        <div
          class="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-700"
          :style="{ width: `${neutralPercent}%` }"
          :title="`Trung lập: ${stats.neutral} (${neutralPercent}%)`"
        />
        <div
          class="h-full bg-linear-to-r from-rose-500 to-red-500 transition-all duration-700"
          :style="{ width: `${negativePercent}%` }"
          :title="`Tiêu cực: ${stats.negative} (${negativePercent}%)`"
        />
      </div>
    </div>

    <!-- Live Interactive Tester Drawer -->
    <div
      v-if="showTester"
      class="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-surface-700 bg-gray-50/70 dark:bg-surface-900/50 -mx-5 -mb-5 p-5 rounded-b-2xl"
    >
      <div class="flex items-center gap-2 mb-2">
        <Sparkles :size="16" class="text-purple-500" />
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
          Thử nghiệm trực tiếp giải thuật Lexicon-based Sentiment Analysis
        </h3>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Nhập câu văn bản tiếng Việt bất kỳ để kiểm tra khả năng tách từ (tokenization), nhận diện từ điển cảm xúc và xử lý phủ định (negation handling).
      </p>

      <!-- Quick sample prompts for defense demo -->
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="text-[11px] font-medium text-gray-400">Câu mẫu demo:</span>
        <button
          type="button"
          @click="runLiveTest('Bài viết chia sẻ rất hay và chi tiết, cảm ơn tác giả nhiều!')"
          class="text-xs px-2.5 py-1 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
        >
          👍 Tích cực mẫu
        </button>
        <button
          type="button"
          @click="runLiveTest('Nội dung bài viết này rất tệ, kiến thức sơ sài và dở quá.')"
          class="text-xs px-2.5 py-1 rounded-lg bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 transition-colors"
        >
          👎 Tiêu cực mẫu
        </button>
        <button
          type="button"
          @click="runLiveTest('Bài viết này không tốt chút nào, chẳng hay như mong đợi.')"
          class="text-xs px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 transition-colors"
          title="Kiểm tra xử lý phủ định: 'không tốt' đảo ngược thành tiêu cực"
        >
          🔄 Phủ định: "không tốt, chẳng hay"
        </button>
        <button
          type="button"
          @click="runLiveTest('Dự án này sử dụng kiến trúc Clean Architecture với Spring Boot và Vue 3.')"
          class="text-xs px-2.5 py-1 rounded-lg bg-blue-100/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-colors"
        >
          💬 Trung lập mẫu
        </button>
      </div>

      <!-- Input and Analyze Button -->
      <form @submit.prevent="runLiveTest()" class="flex gap-2">
        <input
          v-model="testInput"
          type="text"
          placeholder="Nhập câu bình luận cần phân tích cảm xúc..."
          class="flex-1 px-3.5 py-2 rounded-xl text-sm border border-gray-200 dark:border-surface-600 bg-white dark:bg-surface-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        />
        <button
          type="submit"
          :disabled="isTesting || !testInput.trim()"
          class="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
        >
          <Send :size="14" />
          <span>{{ isTesting ? 'Đang phân tích...' : 'Phân tích' }}</span>
        </button>
      </form>

      <!-- Test Result Box -->
      <div v-if="testResult" class="mt-3 p-3.5 rounded-xl border transition-all"
        :class="[
          testResult.label === 'positive' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' :
          testResult.label === 'negative' ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800' :
          'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span
              class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
              :class="[
                testResult.label === 'positive' ? 'bg-emerald-600 text-white' :
                testResult.label === 'negative' ? 'bg-rose-600 text-white' :
                'bg-blue-600 text-white'
              ]"
            >
              {{ testResult.label === 'positive' ? 'TÍCH CỰC (POSITIVE)' : testResult.label === 'negative' ? 'TIÊU CỰC (NEGATIVE)' : 'TRUNG LẬP (NEUTRAL)' }}
            </span>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
              Điểm số (Score): <strong class="font-mono">{{ testResult.score.toFixed(2) }}</strong>
            </span>
          </div>

          <span class="text-[11px] font-mono text-gray-400">
            Giải thuật: {{ testResult.algorithm }}
          </span>
        </div>

        <div class="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 dark:text-gray-300">
          <div class="p-2 rounded-lg bg-white/70 dark:bg-surface-800/70 border border-gray-100 dark:border-surface-700">
            <span class="text-gray-400 text-[10px] block">Từ tích cực (+)</span>
            <span class="font-bold text-emerald-600">{{ testResult.positiveMatches }} từ</span>
          </div>
          <div class="p-2 rounded-lg bg-white/70 dark:bg-surface-800/70 border border-gray-100 dark:border-surface-700">
            <span class="text-gray-400 text-[10px] block">Từ tiêu cực (-)</span>
            <span class="font-bold text-rose-600">{{ testResult.negativeMatches }} từ</span>
          </div>
          <div class="p-2 rounded-lg bg-white/70 dark:bg-surface-800/70 border border-gray-100 dark:border-surface-700">
            <span class="text-gray-400 text-[10px] block">Thang điểm</span>
            <span class="font-mono">[-1.0, +1.0]</span>
          </div>
          <div class="p-2 rounded-lg bg-white/70 dark:bg-surface-800/70 border border-gray-100 dark:border-surface-700">
            <span class="text-gray-400 text-[10px] block">Xử lý phủ định</span>
            <span class="font-medium text-purple-600 dark:text-purple-400">Đã kích hoạt</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
