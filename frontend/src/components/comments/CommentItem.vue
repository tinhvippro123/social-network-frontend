<template>
  <div class="animate-slide-up" :class="containerClass">
    <div class="flex items-start gap-2 sm:gap-3">
      <!-- Avatar size based on level -->
      <UserAvatar 
        :user="comment.author" 
        :size="level === 0 ? 'md' : 'sm'" 
        class="shrink-0" 
        :class="level === 0 ? '' : 'w-6! h-6! sm:w-8! sm:h-8!'" 
      />
      <div class="flex-1">
        <!-- Content Box -->
        <div 
          :class="[
            'rounded-2xl',
            level === 0 
              ? 'bg-gray-50 dark:bg-surface-700 p-4' 
              : level === 1 
                ? 'bg-gray-50 dark:bg-surface-700/50 p-3 rounded-xl' 
                : 'bg-gray-50 dark:bg-surface-700/30 p-2.5 rounded-lg'
          ]"
        >
          <div class="flex items-center justify-between mb-1" :class="{ 'mb-0.5': level === 2 }">
            <span class="font-semibold text-gray-900 dark:text-white" :class="level === 0 ? 'text-sm' : 'text-xs sm:text-sm'">
              {{ comment.author.name }}
            </span>
            <span class="text-gray-400" :class="level === 0 ? 'text-xs' : 'text-[10px] sm:text-xs'">
              {{ formatDate(comment.createdAt) }}
            </span>
          </div>
          <div class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap wrap-break-word" :class="level === 0 ? 'text-sm' : 'text-xs sm:text-sm'">
            <span v-if="comment.replyTo" class="text-primary-500 font-medium cursor-pointer hover:underline mr-1">
              @{{ comment.replyTo }}
            </span>
            {{ comment.content }}
          </div>
        </div>
        
        <!-- Actions: Reactions + Reply -->
        <div class="flex items-center gap-3 mt-1.5 ml-2" :class="level === 0 ? 'mt-2' : level === 2 ? 'mt-1 ml-1' : ''">
          <!-- Emoji Reactions -->
          <div v-if="comment.reactions && comment.reactions.length > 0" class="flex items-center gap-1">
            <button
              v-for="reaction in comment.reactions"
              :key="reaction.emoji"
              :class="[
                'flex items-center gap-1 rounded-full font-medium transition-all border',
                level === 2 ? 'px-1.5 py-0.5 text-[10px] sm:text-xs' : 'px-2 py-0.5 text-xs',
                reaction.reacted
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-50 dark:bg-surface-600 border-gray-200 dark:border-surface-500 text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-500'
              ]"
            >
              {{ reaction.emoji }} {{ reaction.count }}
            </button>
          </div>
          
          <!-- Add Reaction Button -->
          <div class="relative">
            <button
              @click="$emit('toggle-emoji', comment.id)"
              class="flex items-center gap-1 text-gray-400 hover:text-primary-500 transition-colors"
              :class="level === 2 ? 'text-[10px] sm:text-xs' : 'text-xs'"
            >
              <SmilePlus :size="level === 2 ? 12 : 14" />
            </button>
            
            <!-- Emoji Picker Popup -->
            <div v-if="activeEmojiPicker === comment.id" class="absolute left-0 bottom-7 z-50 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-gray-200 dark:border-surface-700 p-2 flex gap-1">
              <button
                v-for="emoji in emojiList"
                :key="emoji"
                @click="$emit('toggle-emoji', null)"
                class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 flex items-center justify-center text-base transition-colors"
              >
                {{ emoji }}
              </button>
            </div>
          </div>
          
          <!-- Reply Button -->
          <button 
            @click="handleReplyClick" 
            class="font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            :class="level === 2 ? 'text-[10px] sm:text-xs' : 'text-xs'"
          >
            Phản hồi
          </button>
        </div>

        <!-- Inline Reply Box -->
        <div v-if="inlineReplyId === comment.id" class="flex items-start gap-2 sm:gap-3 mt-2 sm:mt-3 animate-slide-down">
          <UserAvatar v-if="user" :user="user" size="sm" class="shrink-0" :class="level === 0 ? 'w-8! h-8!' : 'w-6! h-6!'" />
          <div v-else class="rounded-full bg-gray-200 dark:bg-surface-700 shrink-0" :class="level === 0 ? 'w-8 h-8' : 'w-6 h-6'"></div>
          <CommentComposer
            ref="inlineComposerRef"
            :placeholder="`Trả lời @${comment.author.name}...`"
            :auto-focus="true"
            :compact="true"
            :show-cancel="true"
            @submit="handleSubmitReply"
            @cancel="$emit('cancel-reply')"
          />
        </div>
      </div>
    </div>
    
    <!-- Recursive Sub-replies -->
    <div 
      v-if="comment.replies && comment.replies.length > 0" 
      class="mt-3 space-y-3 border-l-2 border-gray-100 dark:border-surface-600"
      :class="level === 0 ? 'ml-3 sm:ml-6 pl-2 sm:pl-4' : 'ml-2 sm:ml-5 pl-2 sm:pl-3'"
    >
      <CommentItem
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        :level="level + 1"
        :inline-reply-id="inlineReplyId"
        :active-emoji-picker="activeEmojiPicker"
        :user="user"
        @reply="(tid, rid, aname) => $emit('reply', tid, rid, aname)"
        @submit-reply="(content, image) => $emit('submit-reply', content, image)"
        @cancel-reply="$emit('cancel-reply')"
        @toggle-emoji="(cid) => $emit('toggle-emoji', cid)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { SmilePlus } from '@lucide/vue'
import UserAvatar from '@/components/UserAvatar.vue'
import CommentComposer from '@/components/comments/CommentComposer.vue'
import { formatDate } from '@/utils/formatters'

interface Props {
  comment: any
  level?: number
  inlineReplyId?: string | null
  activeEmojiPicker?: string | null
  user?: any
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
  inlineReplyId: null,
  activeEmojiPicker: null,
  user: null
})

const emit = defineEmits<{
  (e: 'reply', targetId: string, rootCommentId: string, authorName: string): void
  (e: 'submit-reply', content: string, image: File | null): void
  (e: 'cancel-reply'): void
  (e: 'toggle-emoji', commentId: string | null): void
}>()

const emojiList = ['😀', '😂', '🥰', '😎', '😭', '😡', '👍', '👎', '❤️', '🔥', '🎉', '✨', '🤔', '🙌', '👀', '💯']

const inlineComposerRef = ref<InstanceType<typeof CommentComposer> | null>(null)

const containerClass = computed(() => {
  if (props.level === 0) return 'mt-5'
  return ''
})

const handleReplyClick = () => {
  // If it's a level 0 comment, root is itself. If it's a sub-comment, we typically pass the parent's ID as root, 
  // but since we are recursive, we don't have the parent's ID directly unless passed down. 
  // Wait, in PostDetailView, level 0 uses `comment.id, comment.id`.
  // Level 1 uses `reply.id, comment.id`.
  // Level 2 uses `subReply.id, comment.id`.
  // To keep it simple, we just pass the target ID. The logic in PostDetailView currently only requires the target ID.
  // Wait, `handleReplyClick` in PostDetailView accepts `(targetId, authorName)` now!
  emit('reply', props.comment.id, props.comment.id, props.comment.author.name)
}

const handleSubmitReply = (content: string, image: File | null) => {
  emit('submit-reply', content, image)
  inlineComposerRef.value?.clear()
}
</script>
