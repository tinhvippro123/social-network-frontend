<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowUp, ArrowDown, Bookmark, BookmarkCheck, Share2, MessageCircle,
  Eye, Clock, MapPin, Flag, Heart, MoreHorizontal, Send, ChevronLeft
} from '@lucide/vue'
import { useRouter } from 'vue-router'
import { mockPosts, mockComments } from '@/data/mockData'

const router = useRouter()
const post = ref(mockPosts[0])
const comments = ref(mockComments)
const newComment = ref('')
const isBookmarked = ref(false)
const isUpvoted = ref(false)

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatNumber = (num: number) => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

const postContent = `
<h2>1. Clean Architecture là gì?</h2>
<p>Clean Architecture là một kiến trúc phần mềm được đề xuất bởi Robert C. Martin (Uncle Bob). Mục tiêu chính là tạo ra một hệ thống phần mềm mà:</p>
<ul>
  <li><strong>Independent of Frameworks:</strong> Kiến trúc không phụ thuộc vào bất kỳ framework nào.</li>
  <li><strong>Testable:</strong> Business logic có thể test mà không cần UI, Database, hay bất kỳ external element nào.</li>
  <li><strong>Independent of UI:</strong> UI có thể thay đổi mà không ảnh hưởng đến phần còn lại.</li>
  <li><strong>Independent of Database:</strong> Có thể swap database mà business rules không bị ảnh hưởng.</li>
</ul>

<h2>2. Cấu trúc thư mục trong Spring Boot</h2>
<p>Chúng ta sẽ chia project thành 4 layer chính:</p>

<pre><code>src/main/java/com/example/
├── domain/          # Enterprise Business Rules
│   ├── entity/
│   └── repository/  # Interface only
├── usecase/         # Application Business Rules
├── adapter/         # Interface Adapters
│   ├── controller/
│   ├── presenter/
│   └── gateway/
└── infrastructure/  # Frameworks & Drivers
    ├── config/
    ├── persistence/
    └── security/</code></pre>

<h2>3. Implement Domain Layer</h2>
<p>Domain layer chứa các entity và business rules cốt lõi. Đây là layer quan trọng nhất và không phụ thuộc vào bất kỳ layer nào khác.</p>

<pre><code class="language-java">@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String title;
    private String content;
    private PostStatus status;
    private LocalDateTime createdAt;

    // Business logic methods
    public void publish() {
        if (this.content == null || this.content.isEmpty()) {
            throw new DomainException("Cannot publish empty post");
        }
        this.status = PostStatus.PUBLISHED;
    }
}</code></pre>

<h2>4. Use Case Layer</h2>
<p>Use Case layer chứa application-specific business rules. Mỗi use case đại diện cho một hành động cụ thể mà người dùng có thể thực hiện.</p>

<blockquote>
  <p>💡 <strong>Tip:</strong> Mỗi use case nên có một và chỉ một responsibility. Nếu use case quá phức tạp, hãy chia nhỏ nó ra.</p>
</blockquote>

<p>Đó là tổng quan về cách xây dựng REST API với Spring Boot 3 và Clean Architecture. Trong phần tiếp theo, chúng ta sẽ đi sâu vào việc viết test và deploy ứng dụng.</p>
`
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Back button -->
    <button
      @click="router.back()"
      class="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors mb-6"
    >
      <ChevronLeft :size="16" />
      Quay lại
    </button>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Article -->
      <article class="flex-1 min-w-0">
        <!-- Cover Image -->
        <div class="relative rounded-2xl overflow-hidden mb-6 h-64 sm:h-80">
          <img :src="post.coverImage" :alt="post.title" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div class="absolute bottom-6 left-6 right-6">
            <span class="inline-block px-3 py-1 rounded-lg text-xs font-semibold bg-white/90 text-gray-700 mb-3">
              {{ post.category.icon }} {{ post.category.name }}
            </span>
            <h1 class="text-2xl sm:text-3xl font-bold text-white">{{ post.title }}</h1>
          </div>
        </div>

        <!-- Author Info -->
        <div class="flex items-center justify-between mb-6 bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4">
          <div class="flex items-center gap-3">
            <img :src="post.author.avatar" class="w-12 h-12 rounded-full ring-2 ring-primary-500/30" />
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ post.author.name }}</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1"><Clock :size="12" /> {{ formatDate(post.createdAt) }}</span>
                <span class="flex items-center gap-1"><Eye :size="12" /> {{ formatNumber(post.viewsCount) }} lượt xem</span>
                <span v-if="post.location" class="flex items-center gap-1"><MapPin :size="12" /> {{ post.location.address }}</span>
              </div>
            </div>
          </div>
          <button class="px-4 py-2 rounded-xl text-sm font-medium border border-primary-500/30 text-primary-500 hover:bg-primary-500 hover:text-white transition-all duration-200">
            Theo dõi
          </button>
        </div>

        <!-- Content -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6 sm:p-8 mb-6">
          <div
            class="prose prose-lg dark:prose-invert max-w-none
              prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-500 prose-a:no-underline hover:prose-a:underline
              prose-code:bg-gray-100 dark:prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 dark:prose-pre:bg-surface-900 prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-surface-700
              prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50 dark:prose-blockquote:bg-primary-900/10 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:not-italic
              prose-li:text-gray-600 dark:prose-li:text-gray-300
              prose-strong:text-gray-900 dark:prose-strong:text-white"
            v-html="postContent"
          />

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200 dark:border-surface-700">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 cursor-pointer transition-colors"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Interaction Bar -->
        <div class="flex items-center justify-between bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-4 mb-6 sticky bottom-4 shadow-lg">
          <div class="flex items-center gap-1">
            <button
              @click="isUpvoted = !isUpvoted"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isUpvoted ? 'bg-primary-500/10 text-primary-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
            >
              <ArrowUp :size="18" />
              <span>{{ formatNumber(post.upvotesCount + (isUpvoted ? 1 : 0)) }}</span>
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <ArrowDown :size="18" />
            </button>
          </div>

          <div class="flex items-center gap-1">
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <MessageCircle :size="18" />
              <span class="hidden sm:inline">{{ post.commentsCount }}</span>
            </button>
            <button
              @click="isBookmarked = !isBookmarked"
              :class="[
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                isBookmarked ? 'bg-amber-500/10 text-amber-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700'
              ]"
            >
              <BookmarkCheck v-if="isBookmarked" :size="18" />
              <Bookmark v-else :size="18" />
              <span class="hidden sm:inline">Lưu</span>
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <Share2 :size="18" />
              <span class="hidden sm:inline">Chia sẻ</span>
            </button>
            <button class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all">
              <Flag :size="18" />
            </button>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle :size="20" class="text-primary-500" />
            Bình luận ({{ comments.length }})
          </h3>

          <!-- Comment Input -->
          <div class="flex items-start gap-3 mb-6">
            <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=tinh" class="w-9 h-9 rounded-full shrink-0" />
            <div class="flex-1 relative">
              <textarea
                v-model="newComment"
                placeholder="Viết bình luận..."
                rows="3"
                class="w-full p-3 pr-12 bg-gray-50 dark:bg-surface-700 border border-gray-200 dark:border-surface-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none transition-all"
              />
              <button class="absolute bottom-3 right-3 p-2 rounded-lg gradient-primary text-white hover:opacity-90 transition-all">
                <Send :size="14" />
              </button>
            </div>
          </div>

          <!-- Comments List -->
          <div class="space-y-5">
            <div v-for="comment in comments" :key="comment.id" class="animate-slide-up">
              <!-- Main Comment -->
              <div class="flex items-start gap-3">
                <img :src="comment.author.avatar" class="w-9 h-9 rounded-full shrink-0" />
                <div class="flex-1">
                  <div class="bg-gray-50 dark:bg-surface-700 rounded-2xl p-4">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ comment.author.name }}</span>
                      <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">{{ comment.content }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-2 ml-2">
                    <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors">
                      <Heart :size="12" /> {{ comment.upvotesCount }}
                    </button>
                    <button class="text-xs text-gray-400 hover:text-primary-500 transition-colors font-medium">
                      Phản hồi
                    </button>
                  </div>

                  <!-- Replies -->
                  <div v-if="comment.replies.length > 0" class="ml-6 mt-3 space-y-3">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex items-start gap-3">
                      <img :src="reply.author.avatar" class="w-7 h-7 rounded-full shrink-0" />
                      <div class="flex-1">
                        <div class="bg-gray-50 dark:bg-surface-700/50 rounded-xl p-3">
                          <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ reply.author.name }}</span>
                            <span class="text-xs text-gray-400">{{ formatDate(reply.createdAt) }}</span>
                          </div>
                          <p class="text-sm text-gray-600 dark:text-gray-300">{{ reply.content }}</p>
                        </div>
                        <div class="flex items-center gap-3 mt-1.5 ml-2">
                          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-primary-500 transition-colors">
                            <Heart :size="12" /> {{ reply.upvotesCount }}
                          </button>
                          <button class="text-xs text-gray-400 hover:text-primary-500 transition-colors font-medium">
                            Phản hồi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- Sidebar -->
      <aside class="w-full lg:w-72 shrink-0 space-y-5">
        <!-- Author Card -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5 text-center">
          <img :src="post.author.avatar" class="w-16 h-16 rounded-full mx-auto ring-3 ring-primary-500/20 mb-3" />
          <h4 class="font-bold text-gray-900 dark:text-white">{{ post.author.name }}</h4>
          <p class="text-xs text-gray-400 mt-1 mb-3">{{ post.author.bio }}</p>
          <div class="flex justify-center gap-4 text-center mb-4">
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ post.author.postsCount }}</p>
              <p class="text-xs text-gray-400">Bài viết</p>
            </div>
            <div>
              <p class="text-lg font-bold text-gray-900 dark:text-white">{{ formatNumber(post.author.followersCount) }}</p>
              <p class="text-xs text-gray-400">Followers</p>
            </div>
          </div>
          <button class="w-full py-2 rounded-xl text-sm font-medium text-white gradient-primary hover:opacity-90 transition-all shadow-lg shadow-primary-500/25">
            Theo dõi
          </button>
        </div>

        <!-- Related Posts -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl border border-gray-200 dark:border-surface-700 p-5">
          <h4 class="font-bold text-gray-900 dark:text-white mb-4">Bài viết liên quan</h4>
          <div class="space-y-3">
            <div
              v-for="p in mockPosts.slice(1, 4)"
              :key="p.id"
              @click="router.push(`/posts/${p.id}`)"
              class="flex items-start gap-3 cursor-pointer group"
            >
              <img :src="p.coverImage" class="w-16 h-12 rounded-lg object-cover shrink-0" />
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 group-hover:text-primary-500 transition-colors">
                  {{ p.title }}
                </p>
                <p class="text-xs text-gray-400 mt-1">{{ formatDate(p.createdAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
