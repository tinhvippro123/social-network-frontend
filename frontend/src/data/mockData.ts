// ==========================================
// Mock data for UI development
// ==========================================
import type { User, Post, Category, Comment, Group, ChatConversation, ChatMessage, Notification, Report, AdminStats } from '@/types'

// ---- Users ----
export const currentUser: User = {
  id: 'u1',
  name: 'Lê Thanh Tính',
  email: 'tinh.le@example.com',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=tinh',
  bio: 'Full-stack developer | Yêu thích công nghệ và viết blog chia sẻ kiến thức 🚀',
  role: 'admin',
  joinedAt: '2024-09-01',
  postsCount: 42,
  followersCount: 1280,
  followingCount: 356
}

export const mockUsers: User[] = [
  currentUser,
  {
    id: 'u2', name: 'Nguyễn Văn An', email: 'an.nguyen@example.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=an', bio: 'Backend engineer tại FPT Software',
    role: 'user', joinedAt: '2024-10-15', postsCount: 28, followersCount: 890, followingCount: 210
  },
  {
    id: 'u3', name: 'Trần Thị Mai', email: 'mai.tran@example.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=mai', bio: 'UI/UX Designer | Coffee lover ☕',
    role: 'user', joinedAt: '2024-11-20', postsCount: 15, followersCount: 2100, followingCount: 145
  },
  {
    id: 'u4', name: 'Phạm Minh Tuấn', email: 'tuan.pham@example.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=tuan', bio: 'DevOps Engineer | Docker enthusiast 🐳',
    role: 'moderator', joinedAt: '2025-01-10', postsCount: 56, followersCount: 3400, followingCount: 89
  },
  {
    id: 'u5', name: 'Hoàng Thị Lan', email: 'lan.hoang@example.com',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=lan', bio: 'Data Scientist | AI researcher 🤖',
    role: 'user', joinedAt: '2025-02-28', postsCount: 33, followersCount: 1560, followingCount: 278
  }
]

// ---- Categories ----
export const mockCategories: Category[] = [
  { id: 'c1', name: 'Công nghệ', slug: 'cong-nghe', icon: '💻', postsCount: 128 },
  { id: 'c2', name: 'Lập trình', slug: 'lap-trinh', icon: '⌨️', postsCount: 256 },
  { id: 'c3', name: 'Thiết kế', slug: 'thiet-ke', icon: '🎨', postsCount: 89 },
  { id: 'c4', name: 'DevOps', slug: 'devops', icon: '🐳', postsCount: 67 },
  { id: 'c5', name: 'AI & ML', slug: 'ai-ml', icon: '🤖', postsCount: 145 },
  { id: 'c6', name: 'Mobile', slug: 'mobile', icon: '📱', postsCount: 93 },
  { id: 'c7', name: 'Đời sống', slug: 'doi-song', icon: '🌿', postsCount: 72 },
  { id: 'c8', name: 'Review', slug: 'review', icon: '⭐', postsCount: 54 },
]

// ---- Posts ----
export const mockPosts: Post[] = [
  {
    id: 'p1',
    title: 'Hướng dẫn xây dựng REST API với Spring Boot 3 và Clean Architecture',
    excerpt: 'Trong bài viết này, mình sẽ chia sẻ cách xây dựng một REST API hoàn chỉnh sử dụng Spring Boot 3, áp dụng Clean Architecture để code dễ bảo trì và mở rộng...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    author: mockUsers[0],
    category: mockCategories[1],
    tags: ['Spring Boot', 'Java', 'REST API', 'Clean Architecture'],
    createdAt: '2025-08-25T10:30:00',
    updatedAt: '2025-08-25T10:30:00',
    viewsCount: 3420,
    upvotesCount: 245,
    commentsCount: 38,
    bookmarked: false,
    upvoted: false,
    status: 'published',
    location: { lat: 10.8231, lng: 106.6297, address: 'TP. Hồ Chí Minh' }
  },
  {
    id: 'p2',
    title: 'Vue 3 Composition API: Từ cơ bản đến nâng cao',
    excerpt: 'Composition API là một trong những thay đổi lớn nhất của Vue 3. Hãy cùng tìm hiểu cách sử dụng reactive, ref, computed, watch và các composables...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80',
    author: mockUsers[1],
    category: mockCategories[1],
    tags: ['Vue 3', 'JavaScript', 'Frontend', 'Composition API'],
    createdAt: '2025-08-24T14:00:00',
    updatedAt: '2025-08-24T14:00:00',
    viewsCount: 2180,
    upvotesCount: 189,
    commentsCount: 24,
    bookmarked: true,
    upvoted: true,
    status: 'published'
  },
  {
    id: 'p3',
    title: 'Docker & Docker Compose cho người mới bắt đầu',
    excerpt: 'Bạn có bao giờ gặp tình huống "máy em chạy được nhưng máy thầy thì lỗi"? Docker sẽ giải quyết vấn đề này. Hãy cùng tìm hiểu từ A-Z...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&q=80',
    author: mockUsers[3],
    category: mockCategories[3],
    tags: ['Docker', 'DevOps', 'Container', 'Docker Compose'],
    createdAt: '2025-08-23T09:15:00',
    updatedAt: '2025-08-23T09:15:00',
    viewsCount: 5670,
    upvotesCount: 412,
    commentsCount: 56,
    bookmarked: false,
    upvoted: false,
    status: 'published'
  },
  {
    id: 'p4',
    title: 'Thiết kế UI/UX hiện đại với Figma: 10 mẹo không thể bỏ qua',
    excerpt: 'Figma đã trở thành công cụ thiết kế số 1 hiện nay. Trong bài viết này, mình chia sẻ 10 mẹo giúp bạn thiết kế nhanh hơn và đẹp hơn...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    author: mockUsers[2],
    category: mockCategories[2],
    tags: ['Figma', 'UI/UX', 'Design', 'Tips'],
    createdAt: '2025-08-22T16:45:00',
    updatedAt: '2025-08-22T16:45:00',
    viewsCount: 1890,
    upvotesCount: 156,
    commentsCount: 19,
    bookmarked: true,
    upvoted: false,
    status: 'published'
  },
  {
    id: 'p5',
    title: 'PostgreSQL Performance: Đánh Index và tối ưu Query như thế nào?',
    excerpt: 'Hiệu suất database là yếu tố sống còn của mọi ứng dụng. Cùng tìm hiểu cách đánh index đúng cách, phân tích execution plan và xử lý N+1 query...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    author: mockUsers[4],
    category: mockCategories[0],
    tags: ['PostgreSQL', 'Database', 'Performance', 'SQL'],
    createdAt: '2025-08-21T11:00:00',
    updatedAt: '2025-08-21T11:00:00',
    viewsCount: 4230,
    upvotesCount: 298,
    commentsCount: 42,
    bookmarked: false,
    upvoted: true,
    status: 'published',
    location: { lat: 10.7769, lng: 106.7009, address: 'Quận 1, TP.HCM' }
  },
  {
    id: 'p6',
    title: 'Machine Learning cơ bản: Linear Regression từ đầu',
    excerpt: 'Thay vì dùng thư viện có sẵn, hãy cùng implement thuật toán Linear Regression từ đầu bằng Python để hiểu rõ bản chất toán học đằng sau...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&q=80',
    author: mockUsers[4],
    category: mockCategories[4],
    tags: ['Machine Learning', 'Python', 'AI', 'Algorithm'],
    createdAt: '2025-08-20T08:30:00',
    updatedAt: '2025-08-20T08:30:00',
    viewsCount: 6780,
    upvotesCount: 534,
    commentsCount: 67,
    bookmarked: false,
    upvoted: false,
    status: 'published'
  },
  {
    id: 'p7',
    title: 'Review quán cà phê Hội An: Không gian cổ kính giữa lòng Sài Gòn',
    excerpt: 'Một quán cà phê mang phong cách phố cổ Hội An ngay giữa trung tâm TP.HCM. Không gian đẹp, đồ uống ngon, rất thích hợp để ngồi code...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
    author: mockUsers[2],
    category: mockCategories[7],
    tags: ['Review', 'Cafe', 'TP.HCM', 'Lifestyle'],
    createdAt: '2025-08-19T15:20:00',
    updatedAt: '2025-08-19T15:20:00',
    viewsCount: 1250,
    upvotesCount: 89,
    commentsCount: 15,
    bookmarked: false,
    upvoted: false,
    status: 'published',
    location: { lat: 10.7726, lng: 106.6991, address: 'Quận 3, TP.HCM' }
  },
  {
    id: 'p8',
    title: 'WebSocket vs Server-Sent Events: Khi nào dùng cái nào?',
    excerpt: 'Cả hai đều hỗ trợ real-time communication, nhưng chúng phù hợp với các use case khác nhau. Hãy cùng phân tích ưu nhược điểm của từng loại...',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    author: mockUsers[1],
    category: mockCategories[0],
    tags: ['WebSocket', 'SSE', 'Real-time', 'Backend'],
    createdAt: '2025-08-18T12:00:00',
    updatedAt: '2025-08-18T12:00:00',
    viewsCount: 3100,
    upvotesCount: 201,
    commentsCount: 31,
    bookmarked: false,
    upvoted: false,
    status: 'published'
  }
]

// ---- Comments ----
export const mockComments: Comment[] = [
  {
    id: 'cm1', content: 'Bài viết rất chi tiết và dễ hiểu! Cảm ơn tác giả 🔥',
    author: mockUsers[1], createdAt: '2025-08-25T12:00:00', upvotesCount: 12,
    replies: [
      { id: 'cm1-1', content: 'Cảm ơn bạn! Mình sẽ viết thêm phần 2 về testing nhé 😊', author: mockUsers[0], createdAt: '2025-08-25T13:00:00', upvotesCount: 5, replies: [] },
    ]
  },
  {
    id: 'cm2', content: 'Phần Clean Architecture mình thấy giải thích rõ ràng hơn nhiều tài liệu tiếng Anh. Mong tác giả viết thêm!',
    author: mockUsers[2], createdAt: '2025-08-25T14:30:00', upvotesCount: 8,
    replies: []
  },
  {
    id: 'cm3', content: 'Mình có một câu hỏi: Khi nào nên dùng Clean Architecture và khi nào thì CRUD đơn giản là đủ?',
    author: mockUsers[3], createdAt: '2025-08-25T16:00:00', upvotesCount: 15,
    replies: [
      { id: 'cm3-1', content: 'Theo kinh nghiệm mình, nếu project có hơn 5 modules và cần maintain lâu dài thì nên dùng Clean Architecture. Còn CRUD đơn giản thì 3-layer là đủ rồi.', author: mockUsers[0], createdAt: '2025-08-25T17:00:00', upvotesCount: 20, replies: [] }
    ]
  }
]

// ---- Groups ----
export const mockGroups: Group[] = [
  {
    id: 'g1', name: 'Vietnam Developers', description: 'Cộng đồng lập trình viên Việt Nam. Chia sẻ kiến thức, kinh nghiệm và cơ hội việc làm.',
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=vndev', coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    membersCount: 15600, postsCount: 890, isJoined: true, isPublic: true, createdAt: '2024-01-15', owner: mockUsers[0]
  },
  {
    id: 'g2', name: 'Vue.js Vietnam', description: 'Nhóm dành cho những ai yêu thích Vue.js. Thảo luận, hỏi đáp và chia sẻ project.',
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=vuejs', coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    membersCount: 4200, postsCount: 340, isJoined: true, isPublic: true, createdAt: '2024-03-20', owner: mockUsers[1]
  },
  {
    id: 'g3', name: 'Design & UI/UX', description: 'Nơi chia sẻ các xu hướng thiết kế, review portfolio và feedback lẫn nhau.',
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=design', coverImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
    membersCount: 7800, postsCount: 560, isJoined: false, isPublic: true, createdAt: '2024-05-10', owner: mockUsers[2]
  },
  {
    id: 'g4', name: 'DevOps & Cloud', description: 'Docker, Kubernetes, AWS, CI/CD - tất cả những gì liên quan đến DevOps.',
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=devops', coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    membersCount: 3100, postsCount: 210, isJoined: false, isPublic: true, createdAt: '2024-07-01', owner: mockUsers[3]
  },
  {
    id: 'g5', name: 'AI & Machine Learning VN', description: 'Cộng đồng nghiên cứu AI/ML tại Việt Nam. Papers, projects và discussions.',
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=aiml', coverImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    membersCount: 5400, postsCount: 430, isJoined: true, isPublic: true, createdAt: '2024-09-15', owner: mockUsers[4]
  },
  {
    id: 'g6', name: 'Nhóm ĐACN - HCMUNRE', description: 'Nhóm thảo luận đồ án chuyên ngành khoa CNTT - Trường ĐH TN&MT TP.HCM.',
    avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=hcmunre', coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=800&q=80',
    membersCount: 45, postsCount: 12, isJoined: true, isPublic: false, createdAt: '2025-08-01', owner: mockUsers[0]
  }
]

// ---- Chat ----
export const mockConversations: ChatConversation[] = [
  {
    id: 'conv1', name: 'Nguyễn Văn An', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=an',
    lastMessage: 'Bạn đã xong phần frontend chưa?', lastMessageTime: '10:30', unreadCount: 2,
    isGroup: false, isOnline: true, participants: [mockUsers[0], mockUsers[1]]
  },
  {
    id: 'conv2', name: 'Vietnam Developers', avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=vndev',
    lastMessage: 'Phạm Tuấn: Có ai biết cách fix lỗi CORS không?', lastMessageTime: '09:45', unreadCount: 5,
    isGroup: true, isOnline: false, participants: [mockUsers[0], mockUsers[1], mockUsers[3]]
  },
  {
    id: 'conv3', name: 'Trần Thị Mai', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=mai',
    lastMessage: 'Mình gửi bạn file design nha', lastMessageTime: 'Hôm qua', unreadCount: 0,
    isGroup: false, isOnline: false, participants: [mockUsers[0], mockUsers[2]]
  },
  {
    id: 'conv4', name: 'Nhóm ĐACN', avatar: 'https://api.dicebear.com/9.x/identicon/svg?seed=hcmunre',
    lastMessage: 'Thầy: Các em nhớ nộp báo cáo tuần này nha', lastMessageTime: 'Hôm qua', unreadCount: 0,
    isGroup: true, isOnline: false, participants: mockUsers
  }
]

export const mockMessages: ChatMessage[] = [
  { id: 'm1', content: 'Chào bạn! Mình muốn hỏi về phần REST API', sender: mockUsers[1], createdAt: '10:15', isOwn: false, type: 'text' },
  { id: 'm2', content: 'Chào bạn! Bạn hỏi đi, mình sẽ giúp 😊', sender: mockUsers[0], createdAt: '10:18', isOwn: true, type: 'text' },
  { id: 'm3', content: 'Mình đang implement phần authentication, bạn có recommend dùng JWT hay Session-based không?', sender: mockUsers[1], createdAt: '10:20', isOwn: false, type: 'text' },
  { id: 'm4', content: 'Theo mình nên dùng JWT cho REST API vì nó stateless, phù hợp với microservices. Còn nếu monolith thì Session cũng ổn.', sender: mockUsers[0], createdAt: '10:22', isOwn: true, type: 'text' },
  { id: 'm5', content: 'Tuyệt vời! Cảm ơn bạn nhiều nha 🙏', sender: mockUsers[1], createdAt: '10:25', isOwn: false, type: 'text' },
  { id: 'm6', content: 'Bạn đã xong phần frontend chưa?', sender: mockUsers[1], createdAt: '10:30', isOwn: false, type: 'text' }
]

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'upvote', message: 'Nguyễn Văn An đã upvote bài viết của bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=an', createdAt: '5 phút trước', isRead: false, link: '/posts/p1' },
  { id: 'n2', type: 'comment', message: 'Trần Thị Mai đã bình luận bài viết của bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=mai', createdAt: '15 phút trước', isRead: false, link: '/posts/p1' },
  { id: 'n3', type: 'follow', message: 'Phạm Minh Tuấn đã theo dõi bạn', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=tuan', createdAt: '1 giờ trước', isRead: true, link: '/profile/u4' },
  { id: 'n4', type: 'mention', message: 'Hoàng Thị Lan đã nhắc đến bạn trong bình luận', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=lan', createdAt: '2 giờ trước', isRead: true, link: '/posts/p5' },
  { id: 'n5', type: 'system', message: 'Bài viết "Spring Boot 3" đã được duyệt', avatar: '', createdAt: '3 giờ trước', isRead: true, link: '/posts/p1' }
]

// ---- Reports (Admin) ----
export const mockReports: Report[] = [
  { id: 'r1', type: 'post', reason: 'Nội dung spam, quảng cáo', reporter: mockUsers[1], targetId: 'p10', targetTitle: 'Kiếm tiền online dễ dàng...', status: 'pending', createdAt: '2025-08-27T08:00:00' },
  { id: 'r2', type: 'comment', reason: 'Ngôn ngữ không phù hợp', reporter: mockUsers[2], targetId: 'cm10', targetTitle: 'Bình luận xúc phạm trong bài "Vue 3..."', status: 'pending', createdAt: '2025-08-26T14:30:00' },
  { id: 'r3', type: 'user', reason: 'Tài khoản giả mạo', reporter: mockUsers[3], targetId: 'u10', targetTitle: 'User: fake_account_123', status: 'resolved', createdAt: '2025-08-25T09:00:00' },
]

// ---- Admin Stats ----
export const mockAdminStats: AdminStats = {
  totalUsers: 12450,
  newUsersToday: 34,
  totalPosts: 8920,
  newPostsToday: 67,
  totalGroups: 156,
  pendingReports: 8,
  userGrowth: [120, 145, 180, 210, 195, 230, 280],
  postGrowth: [45, 62, 58, 75, 82, 91, 67]
}

export const popularTags = [
  'JavaScript', 'Vue.js', 'Spring Boot', 'Docker', 'PostgreSQL',
  'TypeScript', 'Python', 'React', 'DevOps', 'AI', 'CSS', 'Node.js'
]
