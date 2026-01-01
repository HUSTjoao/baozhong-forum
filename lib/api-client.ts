// API 客户端 - 封装所有与后端的通信

export interface ApiError {
  error: string
}

export interface Question {
  id: string
  title: string
  content: string
  askerName: string
  isAnonymous: boolean
  date: string
  likes: number
  repliesCount: number
  category?: string
  universityId?: string
  majorId?: string
  askerId?: string
  university?: {
    id: string
    name: string
    logoUrl?: string
  }
  major?: {
    id: string
    name: string
  }
  asker?: {
    id: string
    nickname?: string
    name: string
    email: string
    role?: string
    avatarUrl?: string
    graduationYear?: number | string
    major?: string
    universityId?: string
  }
  replies?: Reply[]
  likesRel?: Array<{ userId: string }>
}

export interface Reply {
  id: string
  content: string
  date: string
  likes: number
  isAnonymous: boolean
  replierName?: string
  questionId: string
  replierId?: string
  parentReplyId?: string
  replier?: {
    id: string
    nickname?: string
    name: string
    email: string
    role?: string
    avatarUrl?: string
  }
  parent?: Reply
  children?: Reply[]
  likesRel?: Array<{ userId: string }>
}

export interface Report {
  id: string
  type: 'question' | 'reply'
  targetId: string
  targetTitle?: string
  targetContent: string
  reason: string
  reporterId: string
  reporterName: string
  status: 'pending' | 'resolved' | 'ignored'
  questionId: string
  date: string
}

export interface AlumniMessage {
  id: string
  userId: string
  content: string
  likes: number
  createdAt: string
  isApproved?: boolean
  user: {
    id: string
    nickname?: string
    name: string
    email: string
    role?: string
    avatarUrl?: string
    universityId?: string
    graduationYear?: number | string
    major?: string
  }
  likesRel?: Array<{ userId: string }>
}

// Questions API
export const questionsApi = {
  // 获取所有问题
  async list(): Promise<Question[]> {
    const res = await fetch('/api/questions/list')
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '加载问题列表失败')
    }
    const data = await res.json()
    return data.questions
  },

  // 获取单个问题详情
  async get(id: string): Promise<Question> {
    const res = await fetch(`/api/questions/${id}`)
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '加载问题详情失败')
    }
    const data = await res.json()
    return data.question
  },

  // 创建新问题
  async create(questionData: {
    title: string
    content: string
    isAnonymous: boolean
    universityId?: string
    majorId?: string
    category?: string
  }): Promise<Question> {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '创建问题失败')
    }
    const data = await res.json()
    return data.question
  },

  // 删除问题
  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/questions/${id}/delete`, {
      method: 'POST',
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '删除问题失败')
    }
  },

  // 点赞/取消点赞问题
  async toggleLike(id: string): Promise<Question> {
    const res = await fetch(`/api/questions/${id}/like`, {
      method: 'POST',
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '点赞失败')
    }
    const data = await res.json()
    return data.question
  },
}

// Replies API
export const repliesApi = {
  // 创建回复
  async create(
    questionId: string,
    replyData: {
      content: string
      isAnonymous: boolean
      parentReplyId?: string
    },
  ): Promise<Question> {
    const res = await fetch(`/api/questions/${questionId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData),
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '发表回复失败')
    }
    const data = await res.json()
    return data.question
  },

  // 删除回复
  async delete(questionId: string, replyId: string): Promise<void> {
    const res = await fetch(
      `/api/questions/${questionId}/reply/${replyId}/delete`,
      {
        method: 'POST',
      },
    )
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '删除回复失败')
    }
  },

  // 点赞/取消点赞回复
  async toggleLike(questionId: string, replyId: string): Promise<Reply> {
    const res = await fetch(
      `/api/questions/${questionId}/reply/${replyId}/like`,
      {
        method: 'POST',
      },
    )
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '点赞失败')
    }
    const data = await res.json()
    return data.reply
  },
}

// Reports API
export const reportsApi = {
  // 获取所有举报
  async list(): Promise<Report[]> {
    const res = await fetch('/api/reports')
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '加载举报列表失败')
    }
    const data = await res.json()
    return data.reports
  },

  // 提交举报
  async create(reportData: {
    type: 'question' | 'reply'
    targetId: string
    targetTitle?: string
    targetContent: string
    reason: string
    questionId: string
  }): Promise<void> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '提交举报失败')
    }
  },

  // 更新举报状态
  async updateStatus(
    id: string,
    status: 'resolved' | 'ignored',
  ): Promise<void> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '更新举报状态失败')
    }
  },
}

// Alumni Messages API
export const alumniMessagesApi = {
  // 获取所有寄语
  async list(): Promise<AlumniMessage[]> {
    const res = await fetch('/api/alumni-messages')
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '加载寄语列表失败')
    }
    const data = await res.json()
    return data.messages
  },

  // 创建新寄语
  async create(content: string): Promise<AlumniMessage> {
    const res = await fetch('/api/alumni-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '发布寄语失败')
    }
    const data = await res.json()
    return data.message
  },

  // 删除寄语
  async delete(id: string): Promise<void> {
    const res = await fetch(`/api/alumni-messages/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '删除寄语失败')
    }
  },

  // 点赞/取消点赞寄语
  async toggleLike(id: string): Promise<AlumniMessage> {
    const res = await fetch(`/api/alumni-messages/${id}/like`, {
      method: 'POST',
    })
    if (!res.ok) {
      const error: ApiError = await res.json()
      throw new Error(error.error || '点赞失败')
    }
    const data = await res.json()
    return data.message
  },
}

// 格式化时间显示（相对时间）
export function formatRelativeTime(dateString: string): string {
  let date: Date
  if (dateString.includes('T')) {
    date = new Date(dateString)
  } else {
    date = new Date(dateString + 'T00:00:00.000Z')
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (isNaN(date.getTime())) {
    return dateString
  }

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays === 1) {
    const hours = date.getHours().toString().padStart(2, '0')
    const mins = date.getMinutes().toString().padStart(2, '0')
    return `昨天 ${hours}:${mins}`
  }
  if (diffDays < 7) return `${diffDays}天前`

  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const mins = date.getMinutes().toString().padStart(2, '0')

  if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${mins}`
  }
  return `${year}-${month}-${day} ${hours}:${mins}`
}


