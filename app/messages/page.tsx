'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  MessageCircle,
  GraduationCap,
  Star,
  Pencil,
  Heart,
  Sparkles,
  Sun,
  Zap,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
} from 'lucide-react'
import {
  getUsers,
  addAlumniMessage,
  deleteAlumniMessage,
  toggleAlumniMessageLike,
  getAllAlumniMessages,
  getUserById,
  saveUsers,
} from '@/data/users'
import { getAllUniversities } from '@/data/universities'
import type { User, AlumniMessage } from '@/data/users'
import { AlertDialog, ConfirmDialog } from '@/components/Dialog'

// 寄语项类型（包含用户信息）
type MessageItem = AlumniMessage & { user: User }

export default function MessagesPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set())
  const [animatingLikes, setAnimatingLikes] = useState<Set<string>>(new Set())
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState<string | undefined>('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  // 寄语分页：每页最多显示 10 条
  const itemsPerPage = 10

  // 当前用户是否被禁言
  const currentUser =
    typeof window !== 'undefined' && session?.user?.id
      ? getUserById(session.user.id)
      : undefined
  const isMutedUser = !!currentUser?.isMuted

  // 确保当前登录用户在本地用户列表中存在一份记录
  // 这样即使是在新设备上第一次登录，也可以正常发布寄语和更新头像
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!session?.user?.id) return

    const existing = getUserById(session.user.id)
    if (existing) return

    const allUsers = getUsers()

    const newUser: User = {
      id: session.user.id,
      email: session.user.email || '',
      name:
        session.user.name ||
        (session.user as any).username ||
        session.user.email ||
        '未命名用户',
      username: (session.user as any).username,
      // 本地这份 user 记录不会参与登录校验，所以可以留空密码
      password: '',
      role: (session.user as any).role,
      universityId: (session.user as any).universityId,
      graduationYear: (session.user as any).graduationYear,
      major: (session.user as any).major,
      gender: (session.user as any).gender,
      avatarUrl: (session.user as any).avatarUrl,
      nickname: (session.user as any).nickname,
      bio: (session.user as any).bio,
      createdAt: new Date().toISOString(),
    }

    allUsers.push(newUser)
    saveUsers(allUsers)
  }, [session?.user])

  useEffect(() => {
    loadMessages()
    setUniversities(getAllUniversities())
    // 初始化已点赞的寄语
    if (session?.user?.id) {
      const allMessages = getAllAlumniMessages()
      const likedSet = new Set<string>()
      allMessages.forEach(msg => {
        if (msg.likedBy?.includes(session.user.id)) {
          likedSet.add(msg.id)
        }
      })
      setLikedMessages(likedSet)
    }
  }, [session?.user?.id])

  const showAlert = (title: string, message?: string) => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertOpen(true)
  }

  // 统一判断：当前登录用户是否可视为“学长/学姐”
  const isSessionUserAlumni = () => {
    if (!session?.user) return false

    // 显式选择了学长/学姐身份
    if (session.user.role === 'alumni') return true

    const gy = session.user.graduationYear
    // 如果毕业年份是数字，并且小于等于当前年份，也视为已毕业的学长/学姐
    if (typeof gy === 'number') {
      const currentYear = new Date().getFullYear()
      return gy <= currentYear
    }

    // 如果是字符串且不是在校年级（高一/高二/高三），也可以视为已毕业
    if (typeof gy === 'string') {
      if (!['gaoyi', 'gaoer', 'gaosan'].includes(gy)) {
        return true
      }
    }

    return false
  }

  const loadMessages = () => {
    const allMessages = getAllAlumniMessages()
    setMessages(allMessages)
  }

  // 分页计算
  const totalPages = Math.ceil(messages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMessages = messages.slice(startIndex, endIndex)

  // 翻页时滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // 保存新寄语
  const handleSaveMessage = async () => {
    if (!session?.user?.id) {
      showAlert('提示', '请先登录')
      return
    }

    if (isMutedUser) {
      showAlert('提示', '你已被管理员禁言，暂时无法发表评论和点赞。')
      return
    }

    if (!messageText.trim()) {
      showAlert('提示', '请输入寄语内容')
      return
    }

    if (messageText.length > 500) {
      showAlert('提示', '寄语内容不能超过500字')
      return
    }

    setIsSubmitting(true)

    try {
      const newMessage = addAlumniMessage(session.user.id, messageText.trim())

      if (!newMessage) {
        showAlert('保存失败', '用户信息不存在，请重新登录后再试')
        return
      }

      // 触发页面刷新以更新显示
      loadMessages()
      setIsWriting(false)
      setMessageText('')
      showAlert('寄语发布成功', '你的寄语已经展示在下方列表中啦～')
    } catch (error) {
      showAlert('保存失败', '请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 删除寄语
  const requestDeleteMessage = (messageId: string) => {
    if (!session?.user?.id) {
      showAlert('提示', '请先登录')
      return
    }

    setPendingDeleteId(messageId)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!pendingDeleteId || !session?.user?.id) {
      setConfirmOpen(false)
      setPendingDeleteId(null)
      return
    }

    const success = deleteAlumniMessage(pendingDeleteId, session.user.id)

    if (success) {
      loadMessages()
      // 更新点赞状态
      const newLikedSet = new Set(likedMessages)
      newLikedSet.delete(pendingDeleteId)
      setLikedMessages(newLikedSet)
      showAlert('寄语已删除', '这条寄语已经从列表中移除。')
    } else {
      showAlert('删除失败', '只能删除自己的寄语')
    }

    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  const handleCancelDelete = () => {
    setConfirmOpen(false)
    setPendingDeleteId(null)
  }

  // 获取大学名称
  const getUniversityName = (universityId?: string) => {
    if (!universityId) return '未指定'
    const uni = universities.find((u) => u.id === universityId)
    return uni?.name || '未指定'
  }

  // 格式化毕业年份显示
  const formatGraduationYear = (year?: number | string) => {
    if (!year) return ''
    if (typeof year === 'string') {
      const yearMap: { [key: string]: string } = {
        gaoyi: '高一',
        gaoer: '高二',
        gaosan: '高三',
      }
      return yearMap[year] || year
    }
    return `${year}届`
  }

  // 处理点赞
  const handleLike = (messageId: string) => {
    if (!session?.user?.id) {
      showAlert('提示', '请先登录后再点赞')
      return
    }

    if (isMutedUser) {
      showAlert('提示', '你已被管理员禁言，暂时无法发表评论和点赞。')
      return
    }

    const updated = toggleAlumniMessageLike(messageId, session.user.id)
    if (updated) {
      // 更新本地状态
      const newLikedSet = new Set(likedMessages)
      if (updated.likedBy?.includes(session.user.id)) {
        newLikedSet.add(messageId)
      } else {
        newLikedSet.delete(messageId)
      }
      setLikedMessages(newLikedSet)

      // 更新消息列表中的点赞数
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, likes: updated.likes, likedBy: updated.likedBy }
          : msg
      ))

      // 添加点赞特效
      setAnimatingLikes(prev => new Set(prev).add(messageId))
      setTimeout(() => {
        setAnimatingLikes(prev => {
          const newSet = new Set(prev)
          newSet.delete(messageId)
          return newSet
        })
      }, 600)
    }
  }

  // 检查是否已点赞
  const isLiked = (messageId: string) => {
    if (!session?.user?.id) return false
    return likedMessages.has(messageId)
  }


  // 气泡颜色数组 - 积极向上的颜色（扩展更多颜色）
  const bubbleColors = [
    { bg: 'bg-gradient-to-br from-yellow-400 to-orange-500', shadow: 'shadow-yellow-200' },
    { bg: 'bg-gradient-to-br from-pink-400 to-rose-500', shadow: 'shadow-pink-200' },
    { bg: 'bg-gradient-to-br from-blue-400 to-cyan-500', shadow: 'shadow-blue-200' },
    { bg: 'bg-gradient-to-br from-green-400 to-emerald-500', shadow: 'shadow-green-200' },
    { bg: 'bg-gradient-to-br from-purple-400 to-violet-500', shadow: 'shadow-purple-200' },
    { bg: 'bg-gradient-to-br from-indigo-400 to-blue-500', shadow: 'shadow-indigo-200' },
    { bg: 'bg-gradient-to-br from-amber-400 to-yellow-500', shadow: 'shadow-amber-200' },
    { bg: 'bg-gradient-to-br from-teal-400 to-cyan-500', shadow: 'shadow-teal-200' },
    { bg: 'bg-gradient-to-br from-red-400 to-pink-500', shadow: 'shadow-red-200' },
    { bg: 'bg-gradient-to-br from-cyan-400 to-blue-500', shadow: 'shadow-cyan-200' },
    { bg: 'bg-gradient-to-br from-lime-400 to-green-500', shadow: 'shadow-lime-200' },
    { bg: 'bg-gradient-to-br from-fuchsia-400 to-pink-500', shadow: 'shadow-fuchsia-200' },
    { bg: 'bg-gradient-to-br from-orange-400 to-red-500', shadow: 'shadow-orange-200' },
    { bg: 'bg-gradient-to-br from-violet-400 to-purple-500', shadow: 'shadow-violet-200' },
    { bg: 'bg-gradient-to-br from-emerald-400 to-teal-500', shadow: 'shadow-emerald-200' },
    { bg: 'bg-gradient-to-br from-sky-400 to-blue-500', shadow: 'shadow-sky-200' },
  ]

  // 获取气泡颜色（基于寄语索引，确保每条寄语都有不同的颜色）
  const getBubbleColor = (index: number) => {
    return bubbleColors[index % bubbleColors.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      <AlertDialog
        open={alertOpen}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertOpen(false)}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="确定要删除这条寄语吗？"
        message="删除后不可恢复。"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* 背景装饰元素 - 积极向上的元素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 星星装饰 */}
        <div className="absolute top-20 left-10 text-yellow-300/30 animate-twinkle">
          <Star className="w-8 h-8" />
        </div>
        <div className="absolute top-40 right-20 text-yellow-400/30 animate-twinkle" style={{ animationDelay: '1s' }}>
          <Star className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-1/4 text-amber-300/30 animate-twinkle" style={{ animationDelay: '2s' }}>
          <Star className="w-7 h-7" />
        </div>
        
        {/* 太阳装饰 */}
        <div className="absolute top-60 right-1/4 text-orange-300/20 animate-pulse-slow">
          <Sun className="w-12 h-12" />
        </div>
        
        {/* 闪光装饰 */}
        <div className="absolute bottom-20 right-16 text-blue-300/30 animate-pulse-slow" style={{ animationDelay: '1.5s' }}>
          <Sparkles className="w-10 h-10" />
        </div>
        
        {/* 闪电装饰 */}
        <div className="absolute top-1/3 left-1/3 text-purple-300/25 animate-pulse-slow" style={{ animationDelay: '2.5s' }}>
          <Zap className="w-9 h-9" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* 标题区 */}
        <div className="pt-10 pb-8 text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-3 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent" style={{ fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
              学长学姐寄语
            </h1>
            <Heart className="w-8 h-8 text-pink-500 ml-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-lg text-gray-700" style={{ fontWeight: 400 }}>
            来自学长学姐的温暖话语，为你的求学之路点亮明灯 ✨
          </p>
        </div>

        {/* 我要留言按钮 */}
        <div className="flex justify-center mb-8">
          {session?.user ? (
            isSessionUserAlumni() ? (
              <button
                type="button"
                onClick={() => setIsWriting(!isWriting)}
                className="inline-flex items-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform"
              >
                <Plus className="w-5 h-5 mr-2" />
                发布新寄语
              </button>
            ) : (
              <div className="inline-flex items-center bg-gradient-to-r from-gray-400 to-gray-500 text-white px-8 py-4 rounded-full font-bold text-lg cursor-not-allowed opacity-75">
                <Pencil className="w-5 h-5 mr-2" />
                仅学长/学姐可留言（请在注册/资料中选择“学长/学姐”或正确填写毕业年份）
              </div>
            )
          ) : (
            <Link
              href="/auth/login?callbackUrl=/messages"
              className="inline-flex items-center bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              <Pencil className="w-5 h-5 mr-2" />
              我要留言
            </Link>
          )}
        </div>

        {/* 写寄语表单 - 仅学长学姐可见 */}
        {isSessionUserAlumni() && isWriting && (
          <div className="bg-white rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] p-7 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">写下你想对学弟学妹说的话</h3>
            <div className="relative mb-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="写下你想对学弟学妹们说的话，可以是鼓励、建议、经验分享等～"
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#005BAC]/20 focus:border-[#005BAC] focus:outline-none resize-none transition-all"
              />
              <div className="absolute bottom-2 right-3">
                <span className="text-xs text-gray-300">{messageText.length}/500</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsWriting(false)
                  setMessageText('')
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-semibold"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveMessage}
                disabled={isSubmitting || !messageText.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-blue-500 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-blue-600 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 text-sm"
              >
                {isSubmitting ? '保存中...' : '保存寄语'}
              </button>
            </div>
          </div>
        )}

        {/* 结果统计 */}
        {messages.length > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            找到 <span className="font-semibold text-primary-600">{messages.length}</span> 条寄语
            {messages.length > itemsPerPage && (
              <span className="ml-2 text-gray-500">
                （第 {currentPage}/{totalPages} 页）
              </span>
            )}
          </div>
        )}

        {/* 寄语列表 - 气泡形式 */}
        {messages.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center">
            <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-semibold mb-2">还没有寄语</p>
            <p className="text-gray-500 text-sm">
              期待更多学长学姐分享他们的经验与鼓励 💝
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6 pb-8">
              {paginatedMessages.map((messageItem, index) => {
              // 使用全局索引（考虑分页）来确保每条寄语都有不同的颜色
              const globalIndex = startIndex + index
              const bubbleColor = getBubbleColor(globalIndex)
              const isCurrentUser = session?.user?.id === messageItem.userId
              
              return (
                <div
                  key={messageItem.id}
                  className="flex items-start gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 头像 */}
                  <Link href={`/users/${messageItem.user.id}`} className="flex-shrink-0 hover:opacity-80 transition-opacity">
                    {messageItem.user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={messageItem.user.avatarUrl}
                        alt={messageItem.user.nickname || messageItem.user.name}
                        className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg cursor-pointer"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer`}>
                        {(messageItem.user.nickname || messageItem.user.name || 'A').charAt(0)}
                      </div>
                    )}
                  </Link>

                  {/* 气泡 */}
                  <div className="flex-1 min-w-0">
                    <div className={`${bubbleColor.bg} ${bubbleColor.shadow} rounded-3xl rounded-tl-none px-6 py-5 shadow-xl relative group`}>
                      {/* 气泡小尾巴 */}
                      <div className={`absolute -left-3 top-0 ${bubbleColor.bg} w-6 h-6`} style={{
                        clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                      }}></div>
                      
                      {/* 用户信息和删除按钮 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-lg">
                            {messageItem.user.nickname || messageItem.user.name}
                          </span>
                          {isCurrentUser && (
                            <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              {formatGraduationYear(messageItem.user.graduationYear) || '我的'}
                            </span>
                          )}
                          {getUniversityName(messageItem.user.universityId) !== '未指定' && (
                            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              {getUniversityName(messageItem.user.universityId)}
                            </span>
                          )}
                        </div>
                        {/* 删除按钮 - 仅自己可见 */}
                        {isCurrentUser && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  requestDeleteMessage(messageItem.id)
                }}
                className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
                title="删除这条寄语"
              >
                <Trash2 className="w-4 h-4" />
              </button>
                        )}
                      </div>
                      
                      {/* 寄语内容 */}
                      <p className="text-white leading-relaxed whitespace-pre-wrap text-base font-medium">
                        {messageItem.content}
                      </p>
                      
                      {/* 底部信息 */}
                      <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/80 text-xs">
                          {messageItem.user.graduationYear && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {formatGraduationYear(messageItem.user.graduationYear)}
                            </span>
                          )}
                          {messageItem.user.major && (
                            <span>{messageItem.user.major}</span>
                          )}
                          <span className="text-white/60">
                            {new Date(messageItem.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        
                        {/* 点赞按钮 */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleLike(messageItem.id)
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 relative ${
                            isLiked(messageItem.id)
                              ? 'bg-white/30 text-white hover:bg-white/40'
                              : 'bg-white/20 text-white/80 hover:bg-white/30'
                          } ${animatingLikes.has(messageItem.id) ? 'animate-bounce scale-110' : ''}`}
                        >
                          <Heart 
                            className={`w-4 h-4 transition-all duration-300 ${
                              isLiked(messageItem.id) 
                                ? 'fill-current text-red-300 scale-110' 
                                : ''
                            } ${animatingLikes.has(messageItem.id) ? 'scale-150' : ''}`}
                          />
                          <span className="text-sm font-medium">
                            {messageItem.likes || 0}
                          </span>
                          {/* 点赞特效 - 爱心飘出 */}
                          {animatingLikes.has(messageItem.id) && (
                            <span className="absolute -top-2 -right-2 text-red-400 text-xl animate-ping">❤️</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
              })}
            </div>
            
            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="mt-12 mb-8 flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一页
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | string)[] = []
                      const maxVisiblePages = 10
                      
                      if (totalPages <= maxVisiblePages) {
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        if (currentPage <= 6) {
                          for (let i = 1; i <= maxVisiblePages; i++) {
                            pages.push(i)
                          }
                          pages.push('...')
                          pages.push(totalPages)
                        } else if (currentPage >= totalPages - 5) {
                          pages.push(1)
                          pages.push('...')
                          for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          pages.push(1)
                          pages.push('...')
                          for (let i = currentPage - 4; i <= currentPage + 5; i++) {
                            pages.push(i)
                          }
                          pages.push('...')
                          pages.push(totalPages)
                        }
                      }
                      
                      return pages.map((page, idx) => {
                        if (page === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                              ...
                            </span>
                          )
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      })
                    })()}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : 'border-primary-300 text-primary-600 hover:bg-primary-50 hover:border-primary-400'
                    }`}
                  >
                    下一页
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* 直接跳转到指定页 */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>跳转到</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt((e.target as HTMLInputElement).value)
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page)
                          ;(e.target as HTMLInputElement).value = ''
                        }
                      }
                    }}
                  />
                  <span>页</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* 底部提示 - 仅对非学长学姐用户显示 */}
        {session?.user?.role !== 'alumni' && (
          <div className="mt-8 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-2xl p-6 border-2 border-white/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="bg-white/50 rounded-full p-3">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">你是学长/学姐？</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  如果你还没有写下寄语，请先登录并选择"学长/学姐"身份，然后就可以在这里写下你想对学弟学妹说的话了！💪✨
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
