<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Copy, Check, ChevronUp, RefreshCw, BrainCircuit, Quote, FileText, ListOrdered } from '@lucide/vue'
import searchApi, { type PostSummary } from '@/api/search.api'

const props = defineProps<{
  postId: string
}>()

const isExpanded = ref(false)
const isLoading = ref(false)
const sentencesCount = ref<number>(3)
const viewMode = ref<'paragraph' | 'bullet'>('paragraph')
const summaryData = ref<PostSummary | null>(null)
const isCopied = ref(false)
const error = ref<string | null>(null)

async function fetchSummary(targetSentences = sentencesCount.value) {
  isLoading.value = true
  error.value = null
  try {
    const { data } = await searchApi.summary(props.postId, targetSentences)
    if (data.success && data.data) {
      summaryData.value = data.data
      sentencesCount.value = targetSentences
    } else {
      error.value = data.message || 'Không thể tạo tóm tắt'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tóm tắt nội dung'
  } finally {
    isLoading.value = false
  }
}

async function handleToggle() {
  if (!isExpanded.value) {
    isExpanded.value = true
    if (!summaryData.value) {
      await fetchSummary(sentencesCount.value)
    }
  } else {
    isExpanded.value = false
  }
}

async function changeSentencesCount(count: number) {
  if (sentencesCount.value === count && summaryData.value) return
  await fetchSummary(count)
}

async function copySummary() {
  if (!summaryData.value?.summary) return
  try {
    await navigator.clipboard.writeText(summaryData.value.summary)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = summaryData.value.summary
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="my-6 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/50 bg-linear-to-br from-indigo-50/70 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-surface-900 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
    <!-- Header / Trigger Bar -->
    <div
      @click="handleToggle"
      class="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer select-none transition-colors"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <Sparkles :size="20" class="animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              Tóm tắt bài viết bằng AI
            </h3>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-900/40 rounded-full border border-indigo-200 dark:border-indigo-800/60">
              <BrainCircuit :size="12" />
              TextRank + TF-IDF
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Trích xuất các câu cốt lõi nhất dựa trên đồ thị liên kết ngữ nghĩa
          </p>
        </div>
      </div>

      <!-- Action Button / Expand State -->
      <div class="flex items-center gap-2 ml-auto">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all shadow-sm"
          :class="isExpanded
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-surface-800 dark:hover:bg-surface-700 dark:text-gray-300'
            : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/25'"
        >
          <template v-if="!isExpanded">
            <Sparkles :size="14" />
            <span>Xem tóm tắt</span>
          </template>
          <template v-else>
            <ChevronUp :size="14" />
            <span>Thu gọn</span>
          </template>
        </button>
      </div>
    </div>

    <!-- Collapsible Content -->
    <div v-if="isExpanded" class="border-t border-indigo-100 dark:border-indigo-950/60 p-4 sm:p-5 pt-3">
      <!-- Toolbar: View Mode & Số câu & Copy -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-surface-800 text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Chế độ xem: Đoạn văn vs Từng câu -->
          <div class="inline-flex p-0.5 rounded-lg bg-gray-100 dark:bg-surface-800 border border-gray-200/80 dark:border-surface-700">
            <button
              type="button"
              @click.stop="viewMode = 'paragraph'"
              :class="viewMode === 'paragraph'
                ? 'bg-white dark:bg-surface-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs"
            >
              <FileText :size="12" />
              <span>Đoạn văn liền mạch</span>
            </button>
            <button
              type="button"
              @click.stop="viewMode = 'bullet'"
              :class="viewMode === 'bullet'
                ? 'bg-white dark:bg-surface-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-all text-xs"
            >
              <ListOrdered :size="12" />
              <span>Từng câu cốt lõi</span>
            </button>
          </div>

          <!-- Chọn số câu -->
          <div class="inline-flex p-0.5 rounded-lg bg-gray-100 dark:bg-surface-800 border border-gray-200/80 dark:border-surface-700">
            <button
              type="button"
              @click.stop="changeSentencesCount(3)"
              :disabled="isLoading"
              :class="sentencesCount === 3
                ? 'bg-white dark:bg-surface-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
              class="px-2.5 py-1 rounded-md transition-all text-xs"
            >
              3 câu
            </button>
            <button
              type="button"
              @click.stop="changeSentencesCount(5)"
              :disabled="isLoading"
              :class="sentencesCount === 5
                ? 'bg-white dark:bg-surface-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'"
              class="px-2.5 py-1 rounded-md transition-all text-xs"
            >
              5 câu
            </button>
          </div>
        </div>

        <!-- Copy & Refresh -->
        <div class="flex items-center gap-2">
          <button
            v-if="summaryData"
            type="button"
            @click.stop="copySummary"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-surface-800 border border-gray-200 dark:border-surface-700 transition-colors shadow-2xs"
          >
            <template v-if="isCopied">
              <Check :size="13" class="text-emerald-500" />
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Đã sao chép</span>
            </template>
            <template v-else>
              <Copy :size="13" />
              <span>Sao chép</span>
            </template>
          </button>

          <button
            type="button"
            @click.stop="fetchSummary(sentencesCount)"
            :disabled="isLoading"
            title="Tạo lại tóm tắt"
            class="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white dark:hover:bg-surface-800 border border-gray-200 dark:border-surface-700 transition-colors"
          >
            <RefreshCw :size="13" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="space-y-3 py-2">
        <div class="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
          <RefreshCw :size="14" class="animate-spin" />
          <span>Đang phân tích đồ thị câu và tính toán trọng số TextRank...</span>
        </div>
        <div class="h-4 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-md animate-pulse w-full"></div>
        <div class="h-4 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-md animate-pulse w-11/12"></div>
        <div class="h-4 bg-indigo-200/50 dark:bg-indigo-900/30 rounded-md animate-pulse w-4/5"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-2">
        <span>{{ error }}</span>
        <button
          type="button"
          @click.stop="fetchSummary(sentencesCount)"
          class="font-semibold underline hover:no-underline"
        >
          Thử lại
        </button>
      </div>

      <!-- Summary Result Content -->
      <div v-else-if="summaryData" class="space-y-3">
        <!-- Chế độ 1: Đoạn văn liền mạch (Mặc định) -->
        <div
          v-if="viewMode === 'paragraph'"
          class="p-4 sm:p-5 rounded-xl bg-white/90 dark:bg-surface-800/90 border border-indigo-100 dark:border-surface-700 shadow-2xs backdrop-blur-xs relative overflow-hidden"
        >
          <div class="absolute -bottom-2 -right-2 text-indigo-500/10 dark:text-indigo-400/10 pointer-events-none select-none">
            <Quote :size="80" />
          </div>
          <p class="relative z-10 text-[14.5px] leading-relaxed text-gray-800 dark:text-gray-200 font-normal text-justify">
            {{ summaryData.summary }}
          </p>
        </div>

        <!-- Chế độ 2: Danh sách từng câu cốt lõi có đánh số -->
        <div v-else class="space-y-2.5">
          <div
            v-for="(sentence, idx) in summaryData.sentences"
            :key="idx"
            class="flex items-start gap-3 p-3 rounded-xl bg-white/80 dark:bg-surface-800/80 border border-indigo-100/70 dark:border-surface-700 shadow-2xs backdrop-blur-xs transition-all hover:border-indigo-300 dark:hover:border-indigo-700"
          >
            <span class="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
              {{ idx + 1 }}
            </span>
            <p class="text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-normal">
              {{ sentence }}
            </p>
          </div>
        </div>

        <!-- Footer Algorithm Attribution Note -->
        <div class="flex items-center justify-between pt-2 text-[11px] text-gray-400 dark:text-gray-500">
          <div class="flex items-center gap-1.5">
            <Quote :size="12" />
            <span>Trích xuất câu quan trọng bằng TextRank, giữ nguyên tính khách quan từ bài viết gốc.</span>
          </div>
          <span class="font-mono text-[10px] text-indigo-500/80">
            alg: {{ summaryData.algorithm }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
