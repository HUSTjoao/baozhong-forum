import { isUserMuted } from '@/data/users'

export interface Reply {
  id: string
  replier: string
  replierId?: string
  date: string
  content: string
  isAlumni: boolean
  likes: number
  likedBy?: string[] // 用户ID列表
  isAnonymous?: boolean // 是否匿名回答
  parentReplyId?: string // 父回复ID，用于嵌套回复
  subReplies?: Reply[] // 子回复列表
  reports?: string[] // 举报该回复的用户ID列表
}

export interface Report {
  id: string
  type: 'question' | 'reply'
  targetId: string // 问题或回复的ID
  targetTitle?: string // 问题的标题（如果是问题）
  targetContent: string // 问题或回复的内容摘要
  reason: string
  reporterId: string
  reporterName: string
  date: string
  status: 'pending' | 'resolved' | 'ignored'
  questionId: string // 所属问题的ID（方便点击跳转）
}

export interface Question {
  id: string
  title: string
  content: string
  asker: string
  askerId?: string
  date: string
  universityId: string
  replies: number
  likes: number
  likedBy?: string[] // 用户ID列表
  majorId?: string // 关联的专业ID
  replyList?: Reply[]
  category?: string // 问题分类：升学择校、志愿填报、专业选择、心理压力、校园琐事、其他
  isAnonymous?: boolean // 是否匿名提问
  reports?: string[] // 举报该问题的用户ID列表
}

export const questions: Question[] = []

// 从localStorage获取问题数据（包括用户添加的问题和点赞数据）
export function getQuestions(): Question[] {
  if (typeof window === 'undefined') {
    return questions
  }
  
  try {
    const stored = localStorage.getItem('forum_questions')
    if (stored) {
      const parsed = JSON.parse(stored)
      return [...questions, ...parsed]
    }
  } catch (error) {
    console.error('Error loading questions:', error)
  }
  
  return questions
}

// 保存问题数据
export function saveQuestions(questionsList: Question[]): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    // 只保存用户添加的问题
    const userAdded = questionsList.filter(q => q.id.startsWith('user-'))
    localStorage.setItem('forum_questions', JSON.stringify(userAdded))
  } catch (error) {
    console.error('Error saving questions:', error)
  }
}

// 根据ID获取问题
export function getQuestionById(id: string): Question | undefined {
  const allQuestions = getQuestions()
  return allQuestions.find(q => q.id === id)
}

// 更新问题的点赞状态
export function toggleQuestionLike(questionId: string, userId: string): Question | null {
  // 被禁言用户不能点赞
  if (isUserMuted(userId)) {
    return null
  }

  const allQuestions = getQuestions()
  const question = allQuestions.find(q => q.id === questionId)
  
  if (!question) return null
  
  const likedBy = question.likedBy || []
  const isLiked = likedBy.includes(userId)
  
  if (isLiked) {
    question.likes = Math.max(0, question.likes - 1)
    question.likedBy = likedBy.filter(id => id !== userId)
  } else {
    question.likes = (question.likes || 0) + 1
    question.likedBy = [...likedBy, userId]
  }
  
  // 更新存储
  const originalQuestions = questions.filter(q => !q.id.startsWith('user-'))
  const userAdded = allQuestions.filter(q => q.id.startsWith('user-'))
  const updatedUserAdded = userAdded.map(q => q.id === questionId ? question : q)
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('forum_questions', JSON.stringify(updatedUserAdded))
    } catch (error) {
      console.error('Error saving question like:', error)
    }
  }
  
  return question
}

// 递归查找回复（包括嵌套回复）
function findReply(replies: Reply[], replyId: string): Reply | null {
  for (const reply of replies) {
    if (reply.id === replyId) return reply
    if (reply.subReplies) {
      const found = findReply(reply.subReplies, replyId)
      if (found) return found
    }
  }
  return null
}

// 递归更新回复（包括嵌套回复）
function updateReplyInList(replies: Reply[], replyId: string, updatedReply: Reply): Reply[] {
  return replies.map(reply => {
    if (reply.id === replyId) return updatedReply
    if (reply.subReplies) {
      return {
        ...reply,
        subReplies: updateReplyInList(reply.subReplies, replyId, updatedReply)
      }
    }
    return reply
  })
}

// 更新回复的点赞状态（支持嵌套回复）
export function toggleReplyLike(questionId: string, replyId: string, userId: string): Reply | null {
  // 被禁言用户不能点赞
  if (isUserMuted(userId)) {
    return null
  }

  const allQuestions = getQuestions()
  const question = allQuestions.find(q => q.id === questionId)
  
  if (!question || !question.replyList) return null
  
  const reply = findReply(question.replyList, replyId)
  if (!reply) return null
  
  const likedBy = reply.likedBy || []
  const isLiked = likedBy.includes(userId)
  
  if (isLiked) {
    reply.likes = Math.max(0, reply.likes - 1)
    reply.likedBy = likedBy.filter(id => id !== userId)
  } else {
    reply.likes = (reply.likes || 0) + 1
    reply.likedBy = [...likedBy, userId]
  }
  
  // 更新存储（需要更新整个回复列表以包含嵌套回复的更改）
  const originalQuestions = questions.filter(q => !q.id.startsWith('user-'))
  const userAdded = allQuestions.filter(q => q.id.startsWith('user-'))
  const updatedUserAdded = userAdded.map(q => {
    if (q.id === questionId) {
      return {
        ...q,
        replyList: updateReplyInList(q.replyList || [], replyId, reply)
      }
    }
    return q
  })
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('forum_questions', JSON.stringify(updatedUserAdded))
    } catch (error) {
      console.error('Error saving reply like:', error)
    }
  }
  
  return reply
}

// 递归统计某条回复及其所有子回复的数量
function countReplyWithSub(replies: Reply | Reply[] | undefined): number {
  if (!replies) return 0
  if (Array.isArray(replies)) {
    return replies.reduce((sum, r) => sum + countReplyWithSub(r), 0)
  }
  let count = 1
  if (replies.subReplies && replies.subReplies.length > 0) {
    count += replies.subReplies.reduce((sum, r) => sum + countReplyWithSub(r), 0)
  }
  return count
}

// 删除指定回复及其子回复（只能删除自己的回复；管理员可通过 options.isAdmin=true 绕过限制）
export function deleteReply(
  questionId: string,
  replyId: string,
  userId: string,
  options?: { isAdmin?: boolean }
): boolean {
  const allQuestions = getQuestions()
  const question = allQuestions.find((q) => q.id === questionId)

  if (!question || !question.replyList) return false

  const target = findReply(question.replyList, replyId)
  if (!target) return false

  // 普通用户：只能删除自己发布的回复
  if (!options?.isAdmin && target.replierId !== userId) return false

  const removedCount = countReplyWithSub(target)

  const removeFromList = (replies: Reply[]): Reply[] => {
    return replies
      .filter((reply) => reply.id !== replyId)
      .map((reply) => {
        if (reply.subReplies && reply.subReplies.length > 0) {
          return {
            ...reply,
            subReplies: removeFromList(reply.subReplies),
          }
        }
        return reply
      })
  }

  question.replyList = removeFromList(question.replyList)
  question.replies = Math.max(0, (question.replies || 0) - removedCount)

  const originalQuestions = questions.filter((q) => !q.id.startsWith('user-'))
  const userAdded = allQuestions.filter((q) => q.id.startsWith('user-'))
  const updatedUserAdded = userAdded.map((q) => (q.id === questionId ? question : q))

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('forum_questions', JSON.stringify(updatedUserAdded))
    } catch (error) {
      console.error('Error deleting reply:', error)
      return false
    }
  }

  return true
}

// 添加新问题（被禁言用户无法发帖）
export function addQuestion(
  questionData: Omit<Question, 'id' | 'replies' | 'likes' | 'likedBy' | 'replyList'>
): Question | null {
  if (questionData.askerId && isUserMuted(questionData.askerId)) {
    return null
  }

  const newQuestion: Question = {
    ...questionData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    replies: 0,
    likes: 0,
    likedBy: [],
    replyList: [],
  }
  
  if (typeof window !== 'undefined') {
    try {
      const existing = localStorage.getItem('forum_questions')
      const userQuestions = existing ? JSON.parse(existing) : []
      userQuestions.push(newQuestion)
      localStorage.setItem('forum_questions', JSON.stringify(userQuestions))
      
      // 记录用户首次进入论坛的大学（如果用户是首次提问且不是匿名）
      if (newQuestion.askerId && !newQuestion.isAnonymous) {
        recordUserForumUniversity(newQuestion.askerId, newQuestion.universityId)
      }
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }
  
  return newQuestion
}

// 记录用户首次进入论坛的大学
function recordUserForumUniversity(userId: string, universityId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const stored = localStorage.getItem('user_forum_universities')
    const userUniversities: Record<string, string> = stored ? JSON.parse(stored) : {}
    
    // 如果用户还没有记录过首次进入论坛的大学，则记录
    if (!userUniversities[userId]) {
      userUniversities[userId] = universityId
      localStorage.setItem('user_forum_universities', JSON.stringify(userUniversities))
    }
  } catch (error) {
    console.error('Error recording user forum university:', error)
  }
}

// 获取用户首次进入论坛的大学ID
export function getUserForumUniversity(userId: string): string | undefined {
  if (typeof window === 'undefined') return undefined
  
  try {
    const stored = localStorage.getItem('user_forum_universities')
    const userUniversities: Record<string, string> = stored ? JSON.parse(stored) : {}
    return userUniversities[userId]
  } catch (error) {
    console.error('Error getting user forum university:', error)
    return undefined
  }
}

// 获取指定大学论坛中，曾经「发帖 / 评论 / 点赞」过的去重用户数量
export function getUniversityForumUserCount(universityId: string): number {
  if (typeof window === 'undefined') return 0

  try {
    const allQuestions = getQuestions()
    const relatedQuestions = allQuestions.filter(
      (q) => q.universityId === universityId
    )

    const userIds = new Set<string>()

    const collectReplyUsers = (replies: Reply[] | undefined) => {
      if (!replies) return
      for (const reply of replies) {
        if (!reply.isAnonymous && reply.replierId) {
          userIds.add(reply.replierId)
        }
        if (reply.likedBy) {
          reply.likedBy.forEach((id) => userIds.add(id))
        }
        if (reply.subReplies && reply.subReplies.length > 0) {
          collectReplyUsers(reply.subReplies)
        }
      }
    }

    for (const q of relatedQuestions) {
      // 发帖用户
      if (!q.isAnonymous && q.askerId) {
        userIds.add(q.askerId)
      }

      // 给问题点赞的用户
      if (q.likedBy) {
        q.likedBy.forEach((id) => userIds.add(id))
      }

      // 回复 & 回复点赞用户
      collectReplyUsers(q.replyList)
    }

    return userIds.size
  } catch (error) {
    console.error('Error getting university forum user count:', error)
    return 0
  }
}

// 删除问题（只能删除自己的问题；管理员可通过 options.isAdmin=true 绕过限制）
export function deleteQuestion(
  questionId: string,
  userId: string,
  options?: { isAdmin?: boolean }
): boolean {
  const allQuestions = getQuestions()
  const question = allQuestions.find(q => q.id === questionId)
  
  if (!question) return false
  
  // 普通用户：检查是否是问题的发布者
  if (!options?.isAdmin && question.askerId !== userId) return false
  
  // 从用户添加的问题列表中移除
  const userAdded = allQuestions.filter(q => q.id.startsWith('user-') && q.id !== questionId)
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('forum_questions', JSON.stringify(userAdded))
    } catch (error) {
      console.error('Error deleting question:', error)
      return false
    }
  }
  
  return true
}

// 添加回复（支持嵌套回复）
export function addReply(questionId: string, replyData: Omit<Reply, 'id' | 'likes' | 'likedBy' | 'subReplies'>): Reply | null {
  // 被禁言用户不能发表评论
  if (replyData.replierId && isUserMuted(replyData.replierId)) {
    return null
  }

  const allQuestions = getQuestions()
  const question = allQuestions.find(q => q.id === questionId)
  
  if (!question) return null
  
  const newReply: Reply = {
    ...replyData,
    id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    likes: 0,
    likedBy: [],
    subReplies: [],
  }
  
  // 如果是嵌套回复（有parentReplyId），找到父回复并添加到其subReplies中
  if (replyData.parentReplyId) {
    const addToParent = (replies: Reply[]): boolean => {
      for (const reply of replies) {
        if (reply.id === replyData.parentReplyId) {
          if (!reply.subReplies) reply.subReplies = []
          reply.subReplies.push(newReply)
          return true
        }
        if (reply.subReplies && addToParent(reply.subReplies)) {
          return true
        }
      }
      return false
    }
    
    if (question.replyList) {
      if (!addToParent(question.replyList)) {
        // 如果找不到父回复，作为顶级回复添加
        question.replyList.push(newReply)
      }
    } else {
      question.replyList = [newReply]
    }
  } else {
    // 顶级回复
    question.replyList = [...(question.replyList || []), newReply]
  }
  
  // 计算总回复数（包括所有嵌套回复）
  const countReplies = (replies: Reply[]): number => {
    return replies.reduce((count, reply) => {
      return count + 1 + (reply.subReplies ? countReplies(reply.subReplies) : 0)
    }, 0)
  }
  
  question.replies = question.replyList ? countReplies(question.replyList) : 0
  
  // 更新存储
  const originalQuestions = questions.filter(q => !q.id.startsWith('user-'))
  const userAdded = allQuestions.filter(q => q.id.startsWith('user-'))
  const updatedUserAdded = userAdded.map(q => q.id === questionId ? question : q)
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('forum_questions', JSON.stringify(updatedUserAdded))
    } catch (error) {
      console.error('Error saving reply:', error)
    }
  }
  
  return newReply
}

// 格式化时间显示（相对时间）
export function formatRelativeTime(dateString: string): string {
  // 处理只有日期部分的旧格式（如 "2025-01-15"）
  let date: Date
  if (dateString.includes('T')) {
    date = new Date(dateString)
  } else {
    // 如果是只有日期的格式，将其转换为当天的开始时间
    date = new Date(dateString + 'T00:00:00.000Z')
  }
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  // 如果日期是无效的，返回原始字符串
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
  
  // 超过一周，显示具体日期
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

// 获取所有举报
export function getReports(): Report[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem('forum_reports')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading reports:', error)
    return []
  }
}

// 提交举报
export function addReport(reportData: Omit<Report, 'id' | 'date' | 'status'>): Report | null {
  if (typeof window === 'undefined') return null
  
  const newReport: Report = {
    ...reportData,
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    date: new Date().toISOString(),
    status: 'pending',
  }

  try {
    const reports = getReports()
    reports.push(newReport)
    localStorage.setItem('forum_reports', JSON.stringify(reports))
    
    // 更新对应内容上的举报计数（可选，方便快速查找哪些内容举报多）
    if (reportData.type === 'question') {
      const allQ = getQuestions()
      const q = allQ.find(x => x.id === reportData.targetId)
      if (q) {
        q.reports = [...(q.reports || []), reportData.reporterId]
        saveQuestions(allQ)
      }
    } else {
      // 回复的更新逻辑由于嵌套较深，这里主要依赖 reports 表来管理
    }
    
    return newReport
  } catch (error) {
    console.error('Error saving report:', error)
    return null
  }
}

// 处理举报
export function updateReportStatus(reportId: string, status: 'resolved' | 'ignored'): boolean {
  if (typeof window === 'undefined') return false
  try {
    const reports = getReports()
    const index = reports.findIndex(r => r.id === reportId)
    if (index === -1) return false
    
    reports[index].status = status
    localStorage.setItem('forum_reports', JSON.stringify(reports))
    return true
  } catch (error) {
    console.error('Error updating report status:', error)
    return false
  }
}

