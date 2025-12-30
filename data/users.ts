// 学长学姐寄语数据模型
export interface AlumniMessage {
  id: string
  userId: string // 发布寄语的用户ID
  content: string // 寄语内容
  likes: number // 点赞数
  likedBy?: string[] // 点赞用户ID列表
  createdAt: string // 创建时间（不可修改）
}

// 用户数据模型和存储
export interface User {
  id: string
  email: string
  name: string
  username?: string // 账号（用于登录）
  password: string // 实际应用中应该存储哈希值
  role?: 'student' | 'alumni' | 'admin'
  universityId?: string // 如果是学长学姐，关联的大学ID
  graduationYear?: number | string // 毕业年份（可以是数字年份或'gaoyi'/'gaoer'/'gaosan'）
  major?: string // 专业
  gender?: 'male' | 'female' | 'prefer-not-to-say' // 性别（可选）
  avatarUrl?: string // 自定义头像
  nickname?: string // 昵称
  bio?: string // 自我介绍
  alumniMessages?: AlumniMessage[] // 学长学姐寄语列表（支持多条）
  createdAt: string
  // 向后兼容：保留旧的字段
  alumniMessage?: string // @deprecated 旧的单条寄语，已废弃
  alumniMessageLikes?: number // @deprecated 已废弃
  alumniMessageLikedBy?: string[] // @deprecated 已废弃
  // 是否被禁言：被禁言的用户无法发表评论与点赞
  isMuted?: boolean
}

// 从localStorage获取所有用户（客户端）或从文件获取（服务端）
export function getUsers(): User[] {
  if (typeof window === 'undefined') {
    // 服务端：从文件读取
    try {
      const fs = require('fs')
      const path = require('path')
      const usersFilePath = path.join(process.cwd(), 'data', 'users-data.json')
      
      if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath, 'utf-8')
        return JSON.parse(data)
      }
      return []
    } catch (error) {
      console.error('Error loading users from file:', error)
      return []
    }
  }
  
  // 客户端：从localStorage读取
  try {
    const users = localStorage.getItem('forum_users')
    return users ? JSON.parse(users) : []
  } catch (error) {
    console.error('Error loading users from localStorage:', error)
    return []
  }
}

// 保存用户（同时保存到文件和服务端localStorage）
export function saveUsers(users: User[]): void {
  try {
    if (typeof window === 'undefined') {
      // 服务端：保存到文件
      const fs = require('fs')
      const path = require('path')
      const usersFilePath = path.join(process.cwd(), 'data', 'users-data.json')
      
      // 确保目录存在
      const dir = path.dirname(usersFilePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8')
    } else {
      // 客户端：保存到localStorage
      localStorage.setItem('forum_users', JSON.stringify(users))
    }
  } catch (error) {
    console.error('Error saving users:', error)
  }
}

// 根据邮箱查找用户
export function getUserByEmail(email: string): User | undefined {
  const users = getUsers()
  return users.find((u) => u.email === email)
}

// 根据账号查找用户
export function getUserByUsername(username: string): User | undefined {
  const users = getUsers()
  return users.find((u) => u.username === username)
}

// 根据账号或邮箱查找用户（用于登录）
export function getUserByUsernameOrEmail(identifier: string): User | undefined {
  const users = getUsers()
  const trimmedIdentifier = identifier.trim()
  return users.find((u) => 
    (u.username && u.username.trim() === trimmedIdentifier) || 
    (u.email && u.email.trim() === trimmedIdentifier)
  )
}

// 根据ID查找用户
export function getUserById(id: string): User | undefined {
  const users = getUsers()
  return users.find((u) => u.id === id)
}

// 判断用户是否被禁言
export function isUserMuted(userId: string): boolean {
  const user = getUserById(userId)
  return !!user?.isMuted
}

// 设置用户禁言/解除禁言状态
export function setUserMuted(userId: string, muted: boolean): User | null {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return null

  users[index] = {
    ...users[index],
    isMuted: muted,
  }

  saveUsers(users)
  return users[index]
}

// 创建新用户
export function createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsers()
  
  // 检查邮箱是否已存在（排除临时邮箱）
  if (userData.email && !userData.email.startsWith('temp-') && getUserByEmail(userData.email)) {
    throw new Error('该邮箱已被注册')
  }
  
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }
  
  users.push(newUser)
  saveUsers(users)
  
  return newUser
}

// 验证用户密码（实际应用中应该使用bcrypt）
export function verifyPassword(user: User, password: string): boolean {
  // 这里简化处理，实际应该使用bcrypt.compare
  if (!user.password || !password) {
    return false
  }
  return user.password.trim() === password.trim()
}

// 更新用户信息
export function updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'email' | 'password'>>): User | null {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  
  if (userIndex === -1) {
    return null
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
  }
  
  saveUsers(users)
  return users[userIndex]
}

// 添加学长学姐寄语
export function addAlumniMessage(userId: string, content: string): AlumniMessage | null {
  // 被禁言用户不能发表评论
  if (isUserMuted(userId)) {
    return null
  }

  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  
  if (userIndex === -1) return null
  
  const user = users[userIndex]
  const newMessage: AlumniMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: userId,
    content: content,
    likes: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
  }
  
  // 确保 alumniMessages 数组存在
  if (!user.alumniMessages) {
    user.alumniMessages = []
  }
  
  user.alumniMessages.push(newMessage)
  
  // 自动将用户角色设置为 alumni
  if (user.role !== 'alumni') {
    user.role = 'alumni'
  }
  
  users[userIndex] = user
  saveUsers(users)
  
  return newMessage
}

// 删除学长学姐寄语（只能删除自己的寄语；管理员可通过 options.isAdmin=true 绕过限制）
export function deleteAlumniMessage(
  messageId: string,
  userId: string,
  options?: { isAdmin?: boolean }
): boolean {
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.id === userId)
  
  if (userIndex === -1) return false
  
  const user = users[userIndex]
  if (!user.alumniMessages) return false
  
  const messageIndex = user.alumniMessages.findIndex((msg) => msg.id === messageId)
  if (messageIndex === -1) return false
  
  // 普通用户：只能删除自己的寄语
  if (!options?.isAdmin && user.alumniMessages[messageIndex].userId !== userId) return false
  
  user.alumniMessages.splice(messageIndex, 1)
  users[userIndex] = user
  saveUsers(users)
  
  return true
}

// 获取所有学长学姐寄语（包含用户信息）
export function getAllAlumniMessages(): (AlumniMessage & { user: User })[] {
  const users = getUsers()
  const allMessages: (AlumniMessage & { user: User })[] = []
  
  users.forEach((user) => {
    if (user.alumniMessages && user.alumniMessages.length > 0) {
      user.alumniMessages.forEach((message) => {
        allMessages.push({
          ...message,
          user: user,
        })
      })
    }
  })
  
  // 按创建时间倒序排序（最新的在前）
  return allMessages.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

// 切换学长学姐寄语的点赞状态（基于messageId）
export function toggleAlumniMessageLike(messageId: string, likerId: string): AlumniMessage | null {
  // 被禁言用户不能点赞
  if (isUserMuted(likerId)) {
    return null
  }

  const users = getUsers()
  const user = users.find((u) => u.alumniMessages?.some(msg => msg.id === messageId))
  
  if (!user || !user.alumniMessages) return null
  
  const message = user.alumniMessages.find((msg) => msg.id === messageId)
  if (!message) return null
  
  const likedBy = message.likedBy || []
  const isLiked = likedBy.includes(likerId)
  
  if (isLiked) {
    // 取消点赞
    message.likes = Math.max(0, message.likes - 1)
    message.likedBy = likedBy.filter(id => id !== likerId)
  } else {
    // 点赞
    message.likes = (message.likes || 0) + 1
    message.likedBy = [...likedBy, likerId]
  }
  
  saveUsers(users)
  return message
}

