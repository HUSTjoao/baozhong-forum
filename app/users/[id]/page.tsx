'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  User,
  Mail,
  GraduationCap,
  MessageCircle,
  Heart,
  BookOpen,
  Star,
  Calendar,
  Edit2,
  X,
  Save,
  Shield,
} from 'lucide-react'
import { getUserById, getUsers, updateUser, type User as UserType } from '@/data/users'
import { getQuestions, type Question } from '@/data/questions'
import {
  getAllUniversities,
  getUserAddedUniversities,
  type University,
} from '@/data/universities'
import { getAllMajors, getUserAddedMajors, type Major } from '@/data/majors'
import { AlertDialog } from '@/components/Dialog'
import { BackButton } from '@/components/BackButton'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const userId = params.id as string
  
  const [user, setUser] = useState<UserType | null>(null)
  const [userQuestions, setUserQuestions] = useState<Question[]>([])
  const [userReplies, setUserReplies] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [majors, setMajors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<
    'questions' | 'replies' | 'likes' | 'applications'
  >('questions')
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<UserType>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [alertConfig, setAlertConfig] = useState<{ title: string; message?: string } | null>(
    null
  )
  const [isAdmin, setIsAdmin] = useState(false)
  // 统计用户的点赞数（被点赞的问题和回复）
  const [totalLikes, setTotalLikes] = useState(0)
  // 记录每个提问相对于上次查看时新增的回复/点赞数量
  const [questionActivity, setQuestionActivity] = useState<
    Record<string, { newReplies: number; newLikes: number }>
  >({})
  const [myUniversityApplications, setMyUniversityApplications] = useState<University[]>([])
  const [myMajorApplications, setMyMajorApplications] = useState<Major[]>([])
  const isOwnProfile = session?.user?.id === userId

  // 根据当前登录用户角色判断是否为管理员
  useEffect(() => {
    setIsAdmin(session?.user?.role === 'admin')
  }, [session?.user?.role])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // 优先从本地用户列表获取资料
    let foundUser = getUserById(userId)

    // 如果本地没有，但当前 session 中的用户 ID 与之匹配，则用 session 构造一个临时用户对象
    if (!foundUser && session?.user && session.user.id === userId) {
      foundUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email,
        role: (session.user as any).role,
        universityId: (session.user as any).universityId,
        graduationYear: (session.user as any).graduationYear,
        major: (session.user as any).major,
        gender: (session.user as any).gender,
        avatarUrl: (session.user as any).avatarUrl,
        nickname: (session.user as any).nickname,
        bio: (session.user as any).bio,
        createdAt: new Date().toISOString(),
      } as UserType

      // 如果这是第一次在本设备登录该用户，将其同步到本地用户列表，
      // 以便后续头像/资料修改都能正确保存
      const allUsers = getUsers()
      if (!allUsers.find((u) => u.id === foundUser!.id)) {
        allUsers.push(foundUser)
        saveUsers(allUsers)
      }
    }

    if (!foundUser) {
      setLoading(false)
      return
    }
    
    setUser(foundUser)
    setUniversities(getAllUniversities())
    setMajors(getAllMajors())
    setEditFormData({
      nickname: foundUser.nickname || '',
      bio: foundUser.bio || '',
      major: foundUser.major || '',
      universityId: foundUser.universityId || '',
      graduationYear: foundUser.graduationYear || '',
      gender: foundUser.gender || 'prefer-not-to-say',
      avatarUrl: foundUser.avatarUrl || '',
    })
    
    // 获取用户的问题
    const allQuestions = getQuestions()
    const myQuestions = allQuestions.filter(
      (q) => q.askerId === userId && !q.isAnonymous
    )
    setUserQuestions(myQuestions)
    
    // 递归获取所有回复（包括嵌套回复）
    const collectAllReplies = (replies: any[], question: Question): any[] => {
      const result: any[] = []
      replies.forEach((reply) => {
        if (reply.replierId === userId && !reply.isAnonymous) {
          result.push({
            ...reply,
            questionId: question.id,
            questionTitle: question.title,
            questionUniversityId: question.universityId,
          })
        }
        // 递归处理子回复
        if (reply.subReplies && reply.subReplies.length > 0) {
          result.push(...collectAllReplies(reply.subReplies, question))
        }
      })
      return result
    }
    
    // 获取用户的回复（包括嵌套回复）
    const myReplies: any[] = []
    allQuestions.forEach((q) => {
      if (q.replyList && q.replyList.length > 0) {
        myReplies.push(...collectAllReplies(q.replyList, q))
      }
    })
    setUserReplies(myReplies)
    
    // 统计点赞数（问题点赞 + 所有回复点赞，包括嵌套回复）
    let likes = 0
    myQuestions.forEach((q) => {
      likes += q.likes || 0
    })
    myReplies.forEach((r) => {
      likes += r.likes || 0
    })
    setTotalLikes(likes)

    // 我提交的大学 / 专业申请（包括待审核和被拒）
    const allUserUniversities = getUserAddedUniversities().filter(
      (u) => u.creatorId === userId
    )
    setMyUniversityApplications(allUserUniversities)

    const allUserMajors = getUserAddedMajors().filter((m) => m.creatorId === userId)
    setMyMajorApplications(allUserMajors)

    setLoading(false)
  }, [userId, router])

  // 统计每个提问相对于上次查看时新增的回复/点赞数量（仅在查看自己的主页时启用）
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isOwnProfile) {
      setQuestionActivity({})
      return
    }

    const key = `user_question_activity_${userId}`
    try {
      const storedRaw = localStorage.getItem(key)

      // 第一次打开：记录当前基线，不显示 +N
      if (!storedRaw) {
        const snapshot: Record<string, { replies: number; likes: number }> = {}
        userQuestions.forEach((q) => {
          snapshot[q.id] = {
            replies: q.replies || 0,
            likes: q.likes || 0,
          }
        })
        localStorage.setItem(key, JSON.stringify(snapshot))
        setQuestionActivity({})
        return
      }

      const stored: Record<string, { replies: number; likes: number }> = JSON.parse(storedRaw)
      const activity: Record<string, { newReplies: number; newLikes: number }> = {}

      userQuestions.forEach((q) => {
        const prev = stored[q.id] || { replies: 0, likes: 0 }
        const currentReplies = q.replies || 0
        const currentLikes = q.likes || 0

        const diffReplies = Math.max(0, currentReplies - prev.replies)
        const diffLikes = Math.max(0, currentLikes - prev.likes)

        if (diffReplies > 0 || diffLikes > 0) {
          activity[q.id] = { newReplies: diffReplies, newLikes: diffLikes }
        }
      })

      setQuestionActivity(activity)
    } catch (error) {
      console.error('Error calculating question activity:', error)
      setQuestionActivity({})
    }
  }, [userQuestions, userId, isOwnProfile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600">加载中...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userUniversity = universities.find((u) => u.id === user.universityId)

  // 根据性别显示“学长”或“学姐”标签
  const getAlumniTitle = () => {
    if (user.role !== 'alumni') return null
    const gender =
      (isEditing ? editFormData.gender : undefined) || user.gender || 'prefer-not-to-say'
    if (gender === 'male') return '学长'
    if (gender === 'female') return '学姐'
    return '学长/学姐'
  }
  
  // 根据是否为当前用户和用户性别，决定显示"我"还是"他/她"
  const getPossessivePronoun = () => {
    if (isOwnProfile) return '我的'
    if (user.gender === 'female') return '她的'
    if (user.gender === 'male') return '他的'
    return 'TA的' // 性别未知时使用中性词
  }
  
  // 获取主格代词（我/他/她）
  const getSubjectPronoun = () => {
    if (isOwnProfile) return '我'
    if (user.gender === 'female') return '她'
    if (user.gender === 'male') return '他'
    return 'TA' // 性别未知时使用中性词
  }

  // 点击进入讨论详情时，将该问题的最新数据记为“已读”，清除 +N 提示
  const handleQuestionClick = (question: Question) => {
    if (typeof window === 'undefined') return
    const key = `user_question_activity_${userId}`
    try {
      const storedRaw = localStorage.getItem(key)
      const stored: Record<string, { replies: number; likes: number }> = storedRaw
        ? JSON.parse(storedRaw)
        : {}
      stored[question.id] = {
        replies: question.replies || 0,
        likes: question.likes || 0,
      }
      localStorage.setItem(key, JSON.stringify(stored))
      setQuestionActivity((prev) => {
        const next = { ...prev }
        delete next[question.id]
        return next
      })
    } catch (error) {
      console.error('Error updating question activity snapshot:', error)
    }
  }

  const getReviewStatusLabel = (
    status: 'pending' | 'approved' | 'rejected' | undefined
  ): { text: string; className: string } => {
    if (status === 'approved') {
      return { text: '已阅', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    }
    if (status === 'rejected') {
      return { text: '被拒', className: 'bg-red-50 text-red-600 border-red-200' }
    }
    // 默认视为待审核
    return { text: '待阅', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton href="/" label="返回首页" />
        </div>

        {/* 用户基本信息卡片 - 最大化的视觉层次 */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-12 mb-8 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10">
            {/* 头像 - 更大更突出 */}
            <div className="flex-shrink-0">
              {(isEditing && editFormData.avatarUrl) || (!isEditing && user.avatarUrl) ? (
                <img
                  src={isEditing ? editFormData.avatarUrl : user.avatarUrl}
                  alt={user.nickname || user.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-slate-100 shadow-lg"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-5xl sm:text-6xl font-bold border-4 border-slate-100 shadow-lg">
                  {((isEditing ? editFormData.nickname : user.nickname) || user.name || 'U').charAt(0)}
                </div>
              )}
            </div>

            {/* 用户信息 - 突出重点 */}
            <div className="flex-1 min-w-0">
              {/* 名字 + 操作区 */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  {user.nickname || user.name}
                </h1>
                {getAlumniTitle() && (
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md">
                    {getAlumniTitle()}
                  </span>
                )}
                  </div>
                  {isOwnProfile && !isEditing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50/60 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      编辑资料
                    </button>
                  )}
                </div>
              </div>
              
              {/* 编辑表单或显示模式 */}
              {isEditing ? (
                <EditForm
                  formData={editFormData}
                  setFormData={setEditFormData}
                  universities={universities}
                  majors={majors}
                  user={user}
                  onSave={async () => {
                    setIsSaving(true)
                    const updated = updateUser(userId, editFormData)
                    if (updated) {
                      setUser(updated)
                      setIsEditing(false)
                      setAlertConfig({
                        title: '资料更新成功',
                        message: '你的个人资料已成功保存。',
                      })
                    } else {
                      setAlertConfig({
                        title: '更新失败',
                        message: '资料更新失败，请稍后重试。',
                      })
                    }
                    setIsSaving(false)
                  }}
                  onCancel={() => {
                    setIsEditing(false)
                    // 重置表单数据
                    if (user) {
                      setEditFormData({
                        nickname: user.nickname || '',
                        bio: user.bio || '',
                        major: user.major || '',
                        universityId: user.universityId || '',
                        graduationYear: user.graduationYear || '',
                        gender: user.gender || 'prefer-not-to-say',
                        avatarUrl: user.avatarUrl || '',
                      })
                    }
                  }}
                  isSaving={isSaving}
                />
              ) : (
                <>
                  {/* 自我介绍 - 第二大，深灰色 */}
                  {user.bio && (
                    <p className="text-lg sm:text-xl text-slate-700 mb-6 leading-relaxed font-light">
                      {user.bio}
                    </p>
                  )}

                  {/* 详细信息 - 次要信息，浅灰色，图标点缀 */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base text-slate-500">
                    {/* 只有学长/学姐展示学校和专业，学生主页不显示这两项 */}
                    {user.role === 'alumni' && user.major && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span>{user.major}</span>
                      </div>
                    )}
                    {user.role === 'alumni' && userUniversity && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <Link
                          href={`/universities/${userUniversity.id}`}
                          className="hover:text-primary-600 transition-colors duration-200"
                        >
                          {userUniversity.name}
                        </Link>
                      </div>
                    )}
                    {user.graduationYear && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span>
                          {typeof user.graduationYear === 'string' &&
                          ['gaoyi', 'gaoer', 'gaosan'].includes(user.graduationYear)
                            ? user.graduationYear === 'gaoyi'
                              ? '高一'
                              : user.graduationYear === 'gaoer'
                                ? '高二'
                                : '高三'
                            : `${user.graduationYear}届`}
                        </span>
                      </div>
                    )}
                    {user.email && !user.email.startsWith('temp-') && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span className="break-all">{user.email}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 统计信息卡片 - 更大的间距和圆角 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <button
            onClick={() => setActiveTab('questions')}
            className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100 p-6 sm:p-8 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-4xl sm:text-5xl font-bold text-primary-600 mb-3 group-hover:scale-110 transition-transform duration-300">
              {userQuestions.length}
            </div>
            <div className="text-slate-600 font-medium">{getPossessivePronoun()}提问</div>
          </button>
          <button
            onClick={() => setActiveTab('replies')}
            className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100 p-6 sm:p-8 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300">
              {userReplies.length}
            </div>
            <div className="text-slate-600 font-medium">{getPossessivePronoun()}评论</div>
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className="bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100 p-6 sm:p-8 text-center hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
          >
            <div className="text-4xl sm:text-5xl font-bold text-rose-500 mb-3 group-hover:scale-110 transition-transform duration-300">
              {totalLikes}
            </div>
            <div className="text-slate-600 font-medium">{getPossessivePronoun()}获赞</div>
          </button>
        </div>

        {/* 标签页内容 - 更大的内边距 */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-slate-100 p-6 sm:p-10">
          {/* 标签导航 - 更精致的设计 */}
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-8 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 px-4 sm:px-6 font-medium text-base transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'questions'
                  ? 'text-primary-600 border-b-3 border-primary-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {getPossessivePronoun()}提问
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium ml-1">
                {userQuestions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('replies')}
              className={`pb-4 px-4 sm:px-6 font-medium text-base transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'replies'
                  ? 'text-primary-600 border-b-3 border-primary-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User className="w-5 h-5" />
              {getPossessivePronoun()}评论
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium ml-1">
                {userReplies.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('likes')}
              className={`pb-4 px-4 sm:px-6 font-medium text-base transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'likes'
                  ? 'text-primary-600 border-b-3 border-primary-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Heart className="w-5 h-5" />
              {getPossessivePronoun()}获赞
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium ml-1">
                {totalLikes}
              </span>
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab('applications')}
                className={`pb-4 px-4 sm:px-6 font-medium text-base transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'applications'
                    ? 'text-primary-600 border-b-3 border-primary-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                我的申请
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium ml-1">
                  {myUniversityApplications.length + myMajorApplications.length}
                </span>
              </button>
            )}
          </div>

          {/* 提问列表 */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              {userQuestions.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">{isOwnProfile ? '还没有提问' : `${getSubjectPronoun()}还没有提问`}</p>
                </div>
              ) : (
                userQuestions.map((question) => {
                  const questionUniversity = universities.find((u) => u.id === question.universityId)
                  const activity = questionActivity[question.id]
                  return (
                    <Link
                      key={question.id}
                      href={`/forum/${question.id}`}
                      onClick={() => handleQuestionClick(question)}
                      className="block border border-slate-200 rounded-xl p-5 sm:p-6 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
                    >
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 leading-snug">{question.title}</h3>
                      <p className="text-slate-600 text-sm sm:text-base mb-4 line-clamp-2 leading-relaxed">{question.content}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
                        <span>{question.date}</span>
                        {question.category && (
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
                            {question.category}
                          </span>
                        )}
                        {questionUniversity && (
                          <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                            {questionUniversity.name}
                          </span>
                        )}
                        <div className="flex items-center gap-4 ml-auto">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span className="font-medium">{question.likes || 0}</span>
                            {activity?.newLikes && activity.newLikes > 0 && (
                              <span className="ml-1 text-xs font-semibold text-rose-500">
                                +{activity.newLikes}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-primary-500" />
                            <span className="font-medium">{question.replies || 0}</span>
                            {activity?.newReplies && activity.newReplies > 0 && (
                              <span className="ml-1 text-xs font-semibold text-primary-500">
                                +{activity.newReplies}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          )}

          {/* 评论列表 */}
          {activeTab === 'replies' && (
            <div className="space-y-4">
              {userReplies.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <User className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">{isOwnProfile ? '还没有评论' : `${getSubjectPronoun()}还没有评论`}</p>
                </div>
              ) : (
                userReplies.map((reply) => {
                  const replyUniversity = universities.find((u) => u.id === reply.questionUniversityId)
                  return (
                    <Link
                      key={reply.id}
                      href={`/forum/${reply.questionId}`}
                      className="block border border-slate-200 rounded-xl p-5 sm:p-6 hover:border-primary-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-3">
                        <span>回复了：</span>
                        <span className="font-semibold text-slate-700">{reply.questionTitle}</span>
                        {replyUniversity && (
                          <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                            {replyUniversity.name}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 mb-4 line-clamp-3 leading-relaxed">{reply.content}</p>
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-500">
                        <span>{reply.date}</span>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <span className="font-medium">{reply.likes || 0}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          )}

          {/* 获赞统计 */}
          {activeTab === 'likes' && (
            <div className="space-y-6">
              {totalLikes === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg">
                    {isOwnProfile ? '还没有收到获赞' : `${getSubjectPronoun()}还没有收到获赞`}
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-l-4 border-rose-500 shadow-sm">
                    <div className="text-3xl sm:text-4xl font-bold text-rose-600 mb-2">
                      {totalLikes}
                    </div>
                    <div className="text-slate-600">
                      {isOwnProfile
                        ? `总共收到 ${totalLikes} 个获赞`
                        : `${getSubjectPronoun()}总共收到 ${totalLikes} 个获赞`}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userQuestions.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-5">
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-primary-500" />
                          提问收到的获赞
                        </h4>
                        <div className="space-y-2">
                          {userQuestions.map((q) => (
                            <Link
                              key={q.id}
                              href={`/forum/${q.id}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 group"
                            >
                              <span className="text-sm text-slate-700 group-hover:text-primary-600 transition-colors flex-1 truncate pr-3">
                                {q.title}
                              </span>
                              <span className="text-sm font-semibold text-rose-600 whitespace-nowrap">{q.likes || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {userReplies.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-5">
                        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-primary-500" />
                          评论收到的获赞
                        </h4>
                        <div className="space-y-2">
                          {userReplies.map((r) => (
                            <Link
                              key={r.id}
                              href={`/forum/${r.questionId}`}
                              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all duration-200 group"
                            >
                              <span className="text-sm text-slate-700 group-hover:text-primary-600 transition-colors flex-1 truncate pr-3">
                                {r.content.substring(0, 40)}...
                              </span>
                              <span className="text-sm font-semibold text-rose-600 whitespace-nowrap">{r.likes || 0}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && isOwnProfile && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* 大学申请 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-500" />
                    我提交的大学
                  </h3>
                  <span className="text-xs text-slate-400">
                    共 {myUniversityApplications.length} 条
                  </span>
                </div>
                {myUniversityApplications.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    你还没有通过“添加大学”提交过新的学校信息。
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myUniversityApplications.map((u) => {
                      const { text, className } = getReviewStatusLabel(u.reviewStatus as any)
                      return (
                        <div
                          key={u.id}
                          className="rounded-lg border border-slate-100 px-3 py-2 text-xs bg-slate-50/60"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-900 line-clamp-1">{u.name}</p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${className}`}
                            >
                              {text}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {u.location} · {u.level || '未填写等级'}
                          </p>
                          {u.reviewStatus === 'rejected' && u.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-[10px] text-red-600 border border-red-100">
                              拒绝原因：{u.rejectionReason}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* 专业申请 */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    我提交的专业
                  </h3>
                  <span className="text-xs text-slate-400">
                    共 {myMajorApplications.length} 条
                  </span>
                </div>
                {myMajorApplications.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    你还没有在“浏览专业”页面添加过自定义专业。
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myMajorApplications.map((m) => {
                      const { text, className } = getReviewStatusLabel(m.reviewStatus as any)
                      return (
                        <div
                          key={m.id}
                          className="rounded-lg border border-slate-100 px-3 py-2 text-xs bg-slate-50/60"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-slate-900 line-clamp-1">{m.name}</p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${className}`}
                            >
                              {text}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {m.category === 'science'
                              ? '理科'
                              : m.category === 'engineering'
                              ? '工科'
                              : m.category === 'arts'
                              ? '文科'
                              : '医科'}
                          </p>
                          {m.reviewStatus === 'rejected' && m.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-[10px] text-red-600 border border-red-100">
                              拒绝原因：{m.rejectionReason}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 编辑表单组件
function EditForm({
  formData,
  setFormData,
  universities,
  majors,
  user,
  onSave,
  onCancel,
  isSaving,
}: {
  formData: Partial<UserType>
  setFormData: (data: Partial<UserType>) => void
  universities: any[]
  majors: any[]
  user: UserType
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [avatarPreview, setAvatarPreview] = useState(formData.avatarUrl || '')
  const [localAlert, setLocalAlert] = useState<{ title: string; message?: string } | null>(
    null
  )
  
  useEffect(() => {
    setAvatarPreview(formData.avatarUrl || '')
  }, [formData.avatarUrl])

  // 将头像压缩到 200KB 以内
  const compressImageToDataUrl = (file: File, maxBytes = 200 * 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const maxSides = [512, 384, 256]
          const tryCompress = (index: number): string | null => {
            if (index >= maxSides.length) return null
            const maxSide = maxSides[index]

            let width = img.width
            let height = img.height
            if (width > height) {
              if (width > maxSide) {
                height = Math.round((height * maxSide) / width)
                width = maxSide
              }
            } else {
              if (height > maxSide) {
                width = Math.round((width * maxSide) / height)
                height = maxSide
              }
            }

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) return null

            ctx.clearRect(0, 0, width, height)
            ctx.drawImage(img, 0, 0, width, height)

            let quality = 0.9
            let bestDataUrl = canvas.toDataURL('image/jpeg', quality)

            while (quality >= 0.4) {
              const approxBytes = Math.round(bestDataUrl.length * 0.75)
              if (approxBytes <= maxBytes) {
                return bestDataUrl
              }
              quality -= 0.1
              bestDataUrl = canvas.toDataURL('image/jpeg', quality)
            }

            return tryCompress(index + 1)
          }

          const result = tryCompress(0)
          if (!result) {
            reject(new Error('图片过大，压缩失败'))
          } else {
            resolve(result)
          }
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = event.target?.result as string
      }
      reader.onerror = () => reject(new Error('图片读取失败'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLocalAlert({
        title: '上传失败',
        message: '请选择图片文件。',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalAlert({
        title: '上传失败',
        message: '图片大小不能超过 5MB，请选择更小的图片。',
      })
      return
    }

    try {
      const base64String = await compressImageToDataUrl(file, 200 * 1024)
      setAvatarPreview(base64String)
      setFormData({ ...formData, avatarUrl: base64String })
    } catch (error) {
      console.error(error)
      setLocalAlert({
        title: '上传失败',
        message: '头像压缩失败，请尝试选择分辨率更小的图片。',
      })
    }
  }

  return (
    <div className="mt-6 space-y-6 p-6 bg-slate-50 rounded-xl border-2 border-primary-200">
      <AlertDialog
        open={!!localAlert}
        title={localAlert?.title || ''}
        message={localAlert?.message}
        onClose={() => setLocalAlert(null)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 昵称 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            昵称
          </label>
          <input
            type="text"
            value={formData.nickname || ''}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="请输入昵称"
          />
        </div>

        {/* 性别 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            性别
          </label>
          <select
            value={formData.gender || 'prefer-not-to-say'}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="prefer-not-to-say">不愿透露</option>
          </select>
        </div>

        {/* 专业 / 大学：仅学长学姐需要填写，学生可以不填 */}
        {user.role === 'alumni' && (
          <>
            {/* 专业 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                专业
              </label>
              <select
                value={formData.major || ''}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">请选择专业</option>
                {majors.map((major) => (
                  <option key={major.id} value={major.name}>
                    {major.name}
                  </option>
                ))}
                <option value="其他/不填写">其他 / 不填写</option>
              </select>
            </div>

            {/* 大学 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                大学
              </label>
              <select
                value={formData.universityId || ''}
                onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">请选择大学</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.id}>
                    {uni.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 年级 / 毕业年份 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            年级
          </label>
          {user.role === 'student' ? (
            <select
              value={formData.graduationYear as string || ''}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">请选择</option>
              <option value="gaoyi">高一</option>
              <option value="gaoer">高二</option>
              <option value="gaosan">高三</option>
            </select>
          ) : (
            <select
              value={formData.graduationYear as string || ''}
              onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value === '非宝中毕业生' ? '' : e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">非宝中毕业生</option>
              {Array.from({ length: new Date().getFullYear() - 2000 + 2 }, (_, i) => {
                const year = 2001 + i
                return (
                  <option key={year} value={year.toString()}>
                    {year}届
                  </option>
                )
              })}
            </select>
          )}
        </div>

        {/* 头像 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            头像
          </label>
          <div className="flex items-center gap-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="头像预览"
                className="w-16 h-16 rounded-lg object-cover border-2 border-slate-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                无头像
              </div>
            )}
            <label className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer text-sm">
              选择图片
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 自我介绍 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          自我介绍
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          rows={4}
          placeholder="介绍一下自己..."
          maxLength={200}
        />
        <div className="text-xs text-slate-500 mt-1 text-right">
          {(formData.bio || '').length}/200
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
