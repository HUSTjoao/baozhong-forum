'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Shield,
  Users,
  GraduationCap,
  BookOpenCheck,
  Ban,
  Check,
  XCircle,
  MessageCircle,
  Trash2,
  BookOpen,
  AlertTriangle,
  Edit,
  Eye,
} from 'lucide-react'
import {
  getUsers,
  type User,
  isUserMuted,
  setUserMuted,
  deleteAlumniMessage,
} from '@/data/users'
import {
  getUserAddedUniversities,
  approveUserUniversity,
  deleteUserUniversity,
  updateUserUniversity,
  type University,
} from '@/data/universities'
import {
  getUserAddedMajors,
  approveUserMajor,
  deleteUserMajor,
  updateUserMajor,
  type Major,
} from '@/data/majors'
import { 
  getQuestions, 
  deleteQuestion, 
  deleteReply,
  getReports,
  updateReportStatus,
  type Question,
  type Report,
} from '@/data/questions'
import { AlertDialog } from '@/components/Dialog'
import { BackButton } from '@/components/BackButton'

type AdminTab = 'users' | 'universities' | 'majors' | 'questions' | 'messages' | 'reports'

export default function AdminPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [checkedAdmin, setCheckedAdmin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  const [users, setUsers] = useState<User[]>([])
  const [userUniversities, setUserUniversities] = useState<University[]>([])
  const [userMajors, setUserMajors] = useState<Major[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [messages, setMessages] = useState<(any)[]>([])
  const [reports, setReports] = useState<Report[]>([])

  // 编辑弹窗状态
  const [editingItem, setEditingItem] = useState<{
    type: 'university' | 'major'
    data: any
  } | null>(null)

  // 拒绝原因弹窗状态
  const [rejectingItem, setRejectingItem] = useState<{
    type: 'university' | 'major'
    id: string
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const [alertConfig, setAlertConfig] = useState<{ title: string; message?: string } | null>(
    null
  )

  // 检查管理员权限（仅依赖登录态中的 role）
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasRoleAdmin = session?.user?.role === 'admin'

    if (!hasRoleAdmin) {
      // 未通过管理员验证，跳回登录页
      setIsAdmin(false)
      setCheckedAdmin(true)
      const callbackUrl = encodeURIComponent('/admin')
      router.replace(`/auth/login?callbackUrl=${callbackUrl}`)
      return
    }

    setIsAdmin(true)
    setCheckedAdmin(true)
    refreshData()
  }, [router, session?.user?.role])

  const refreshData = () => {
    const allUsers = getUsers()
    setUsers(allUsers)
    setUserUniversities(getUserAddedUniversities())
    setUserMajors(getUserAddedMajors())
    setQuestions(getQuestions())
    setReports(getReports())
    
    const allMessages: any[] = []
    allUsers.forEach((u) => {
      if (u.alumniMessages && u.alumniMessages.length > 0) {
        u.alumniMessages.forEach((m) =>
          allMessages.push({
            ...m,
            user: u,
          })
        )
      }
    })
    setMessages(allMessages)
  }

  const showAlert = (title: string, message?: string) => {
    setAlertConfig({ title, message })
  }

  const handleToggleMute = (userId: string) => {
    const muted = isUserMuted(userId)
    const updated = setUserMuted(userId, !muted)
    if (!updated) return

    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
    showAlert(muted ? '已解除禁言' : '已禁言用户', muted ? '该用户已恢复发言权限。' : '该用户已被禁言，无法再发帖或回复。')
  }

  const handleReviewUniversity = (id: string, action: 'approve' | 'reject' | 'edit') => {
    if (action === 'edit') {
      const uni = userUniversities.find(u => u.id === id)
      if (uni) setEditingItem({ type: 'university', data: { ...uni } })
      return
    }

    if (action === 'reject') {
      setRejectingItem({ type: 'university', id })
      return
    }

    const ok = approveUserUniversity(id)
    if (ok) {
      setUserUniversities(getUserAddedUniversities())
      showAlert('已通过大学申请', '该用户提交的大学现已对所有用户可见。')
    }
  }

  const handleReviewMajor = (id: string, action: 'approve' | 'reject' | 'edit') => {
    if (action === 'edit') {
      const major = userMajors.find(m => m.id === id)
      if (major) setEditingItem({ type: 'major', data: { ...major } })
      return
    }

    if (action === 'reject') {
      setRejectingItem({ type: 'major', id })
      return
    }

    const ok = approveUserMajor(id)
    if (ok) {
      setUserMajors(getUserAddedMajors())
      showAlert('已通过专业申请', '该用户提交的专业现已对所有用户可见。')
    }
  }

  const handleConfirmReject = () => {
    if (!rejectingItem) return

    const ok = rejectingItem.type === 'university' 
      ? deleteUserUniversity(rejectingItem.id, rejectionReason)
      : deleteUserMajor(rejectingItem.id, rejectionReason)

    if (ok) {
      if (rejectingItem.type === 'university') {
        setUserUniversities(getUserAddedUniversities())
      } else {
        setUserMajors(getUserAddedMajors())
      }
      showAlert('已拒绝申请', '已发送拒绝反馈并记录原因。')
      setRejectingItem(null)
      setRejectionReason('')
    }
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    const ok = editingItem.type === 'university'
      ? updateUserUniversity(editingItem.data.id, editingItem.data)
      : updateUserMajor(editingItem.data.id, editingItem.data)

    if (ok) {
      if (editingItem.type === 'university') {
        setUserUniversities(getUserAddedUniversities())
      } else {
        setUserMajors(getUserAddedMajors())
      }
      showAlert('修改成功', '信息已更新。')
      setEditingItem(null)
    }
  }

  const handleResolveReport = (reportId: string, action: 'resolve' | 'ignore') => {
    const ok = updateReportStatus(reportId, action === 'resolve' ? 'resolved' : 'ignored')
    if (ok) {
      setReports(getReports())
      showAlert(action === 'resolve' ? '已处理举报' : '已忽略举报')
    }
  }

  const handleDeleteQuestion = (id: string) => {
    const ok = deleteQuestion(id, 'admin', { isAdmin: true })
    if (ok) {
      setQuestions((prev) => prev.filter((q) => q.id !== id))
      showAlert('已删除提问', '该提问及其所有回复已被永久删除。')
    }
  }

  const handleDeleteMessage = (m: any) => {
    const ok = deleteAlumniMessage(m.id, m.userId, { isAdmin: true })
    if (ok) {
      setMessages((prev) => prev.filter((x) => x.id !== m.id))
      showAlert('已删除寄语', '该学长学姐寄语已被永久删除。')
    }
  }

  if (!checkedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">正在校验管理员权限...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-sm">正在跳转到登录页...</div>
      </div>
    )
  }

  const pendingUniversities = userUniversities.filter(
    (u) => u.reviewStatus === 'pending' || (!u.reviewStatus && u.isUserAdded)
  )
  const pendingMajors = userMajors.filter(
    (m) => m.reviewStatus === 'pending' || (!m.reviewStatus && m.isUserAdded)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6">
      <AlertDialog
        open={!!alertConfig}
        title={alertConfig?.title || ''}
        message={alertConfig?.message}
        onClose={() => setAlertConfig(null)}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton href="/" label="返回首页" />

        {/* 顶部信息 */}
        <div className="bg-white rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] border border-slate-100 px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-indigo-100 p-2">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                管理员控制台
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                对用户发言进行管理，并审核用户提交的大学和专业信息，保障论坛内容质量。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>用户总数</span>
              </div>
              <div className="text-base font-semibold text-slate-900">{users.length}</div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>待审高校</span>
              </div>
              <div className="text-base font-semibold text-slate-900">
                {pendingUniversities.length}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <BookOpenCheck className="w-3.5 h-3.5" />
                <span>待审专业</span>
              </div>
              <div className="text-base font-semibold text-slate-900">
                {pendingMajors.length}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-1 text-slate-500 mb-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>讨论帖子</span>
              </div>
              <div className="text-base font-semibold text-slate-900">
                {questions.length}
              </div>
            </div>
            <div className="rounded-xl bg-red-50 px-3 py-2 border border-red-100">
              <div className="flex items-center gap-1 text-red-500 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>待处举报</span>
              </div>
              <div className="text-base font-semibold text-red-600">
                {reports.filter(r => r.status === 'pending').length}
              </div>
            </div>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="bg-white rounded-2xl shadow-[0_10px_24px_rgba(15,23,42,0.06)] border border-slate-100">
          <div className="border-b border-slate-100 px-4 sm:px-6">
            <div className="flex flex-wrap gap-2 py-3">
              {[
                { id: 'users', label: '用户管理', icon: Users },
                { id: 'universities', label: '大学审核', icon: GraduationCap },
                { id: 'majors', label: '专业审核', icon: BookOpenCheck },
                { id: 'questions', label: '讨论审核', icon: MessageCircle },
                { id: 'messages', label: '寄语审核', icon: BookOpen },
                { id: 'reports', label: '举报审核', icon: AlertTriangle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-4 sm:p-6">
            {activeTab === 'users' && (
              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="text-sm text-slate-500">当前没有用户。</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-left text-slate-500">
                          <th className="py-2 pr-4 font-medium">昵称 / 账号</th>
                          <th className="py-2 pr-4 font-medium">身份</th>
                          <th className="py-2 pr-4 font-medium">毕业/年级</th>
                          <th className="py-2 pr-4 font-medium">状态</th>
                          <th className="py-2 pr-4 font-medium text-right">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => {
                          const muted = !!u.isMuted
                          let roleLabel = '未设置'
                          if (u.role === 'student') roleLabel = '学生'
                          if (u.role === 'alumni') roleLabel = '学长/学姐'
                          if (u.role === 'admin') roleLabel = '管理员'

                          const graduation =
                            typeof u.graduationYear === 'number'
                              ? `${u.graduationYear}届`
                              : typeof u.graduationYear === 'string'
                              ? u.graduationYear
                              : ''

                          return (
                            <tr
                              key={u.id}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="py-2 pr-4 align-top">
                                <div className="flex flex-col">
                                  <Link
                                    href={`/users/${u.id}`}
                                    className="font-medium text-slate-900 hover:text-indigo-600 hover:underline transition-colors"
                                  >
                                    {u.nickname || u.name || u.username}
                                  </Link>
                                  <span className="text-[11px] text-slate-400">
                                    {u.username || u.email}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2 pr-4 align-top">
                                <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                                  {roleLabel}
                                </span>
                              </td>
                              <td className="py-2 pr-4 align-top text-slate-600">
                                {graduation || '-'}
                              </td>
                              <td className="py-2 pr-4 align-top">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                    muted
                                      ? 'bg-red-50 text-red-600'
                                      : 'bg-emerald-50 text-emerald-600'
                                  }`}
                                >
                                  {muted ? '已禁言' : '正常'}
                                </span>
                              </td>
                              <td className="py-2 pl-2 align-top text-right">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMute(u.id)}
                                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                                    muted
                                      ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                                  }`}
                                >
                                  {muted ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      解除禁言
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3.5 h-3.5" />
                                      禁言
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'universities' && (
              <div className="space-y-4">
                {pendingUniversities.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    当前没有待审核的用户新增大学。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUniversities.map((uni) => (
                      <div
                        key={uni.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* 用户上传的校徽（如有） */}
                            {uni.logoUrl && (
                              <div className="mb-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={uni.logoUrl}
                                  alt={`${uni.name} 校徽`}
                                  className="w-16 h-16 rounded-md border border-slate-200 bg-white object-contain"
                                  onError={(e) => {
                                    // 若图片加载失败则隐藏，避免破坏布局
                                    const img = e.currentTarget as HTMLImageElement
                                    img.style.display = 'none'
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-semibold text-slate-900">
                                {uni.name}
                              </span>
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 border border-indigo-100">
                                {uni.level || '等级未填写'}
                              </span>
                              {uni.province && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 border border-slate-200">
                                  {uni.province}
                                  {uni.city ? ` · ${uni.city}` : ''}
                                </span>
                              )}
                            </div>
                            {uni.motto && (
                              <p className="text-[11px] text-slate-500 mb-1">
                                校训：{uni.motto}
                              </p>
                            )}
                            {uni.students !== undefined && uni.students > 0 && (
                              <p className="text-[11px] text-slate-500 mb-1">
                                已收录该校宝中学子：{uni.students} 人
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 justify-end shrink-0">
                            <button
                              type="button"
                              onClick={() => handleReviewUniversity(uni.id, 'edit')}
                              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewUniversity(uni.id, 'reject')}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              拒绝
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewUniversity(uni.id, 'approve')}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                              通过
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="font-medium">学校简介：</span>
                          <span className="whitespace-pre-wrap break-words">{uni.description}</span>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="font-medium">热门专业：</span>
                          {uni.majors && uni.majors.length > 0
                            ? uni.majors.join('、')
                            : '（未填写）'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'majors' && (
              <div className="space-y-4">
                {pendingMajors.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    当前没有待审核的用户新增专业。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingMajors.map((major) => (
                      <div
                        key={major.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 flex flex-col gap-3"
                      >
                          <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-semibold text-slate-900">
                                {major.name}
                              </span>
                              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 border border-indigo-100">
                                {major.category === 'science'
                                  ? '理科'
                                  : major.category === 'engineering'
                                  ? '工科'
                                  : major.category === 'arts'
                                  ? '文科'
                                  : '医科'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-end shrink-0">
                            <button
                              type="button"
                              onClick={() => handleReviewMajor(major.id, 'edit')}
                              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-100"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              编辑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewMajor(major.id, 'reject')}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600 hover:bg-red-100"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              拒绝
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewMajor(major.id, 'approve')}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-700"
                            >
                              <Check className="w-3.5 h-3.5" />
                              通过
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600">
                          <span className="font-medium">专业介绍：</span>
                          <span className="whitespace-pre-wrap break-words">
                            {major.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-sm text-slate-500">当前没有讨论帖子。</div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                          <span className="text-xs text-slate-500">
                            {q.universityId ? '大学论坛' : q.majorId ? '专业论坛' : '公开论坛'}
                          </span>
                          <span className="text-[10px] text-slate-400">{q.date}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">
                          {q.title}
                        </h3>
                        <div className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                          {q.content}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">
                              发布者: {q.asker} {q.isAnonymous && '(匿名)'}
                            </span>
                            <Link
                              href={`/forum/${q.id}`}
                              className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              查看详情管理
                            </Link>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-sm text-slate-500">当前没有学长学姐寄语。</div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                        {messages.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 flex flex-col gap-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-slate-900">
                                {m.user.nickname || m.user.name || m.user.username}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {m.user.graduationYear ? `${m.user.graduationYear}届` : ''}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">赞 {m.likes || 0}</span>
                          </div>
                          <p className="text-xs text-slate-700 whitespace-pre-wrap break-words">
                            {m.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-end pt-2 border-t border-slate-200/50">
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m)}
                            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-medium text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="w-3 h-3" />
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-sm text-slate-500">当前没有举报信息。</div>
                ) : (
                  <div className="space-y-3">
                    {reports.sort((a, b) => (a.status === 'pending' ? -1 : 1)).map((r) => (
                      <div
                        key={r.id}
                        className={`rounded-xl border p-4 flex flex-col gap-3 ${
                          r.status === 'pending'
                            ? 'border-red-200 bg-red-50/30'
                            : 'border-slate-200 bg-slate-50/50 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                r.type === 'question' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {r.type === 'question' ? '举报提问' : '举报回复'}
                              </span>
                              <span className="text-xs text-slate-500">
                                {formatRelativeTime(r.date)}
                              </span>
                              {r.status !== 'pending' && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  r.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {r.status === 'resolved' ? '已处理' : '已忽略'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-slate-900 mb-1">
                              举报人：{r.reporterName}
                            </div>
                            <div className="text-xs text-red-600 font-medium mb-2">
                              举报原因：{r.reason}
                            </div>
                          </div>
                          {r.status === 'pending' && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleResolveReport(r.id, 'ignore')}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                忽略
                              </button>
                              <button
                                onClick={() => handleResolveReport(r.id, 'resolve')}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-700"
                              >
                                <Check className="w-3.5 h-3.5" />
                                标记处理
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="rounded-lg bg-white/80 p-3 border border-slate-100">
                          <div className="text-[11px] text-slate-400 mb-1">被举报内容：</div>
                          {r.targetTitle && <div className="text-sm font-bold mb-1">{r.targetTitle}</div>}
                          <div className="text-xs text-slate-700 line-clamp-3">{r.targetContent}</div>
                          <div className="mt-2">
                            <Link
                              href={`/forum/${r.questionId}`}
                              className="text-[10px] text-indigo-600 hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              查看上下文
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 拒绝原因弹窗 */}
      {rejectingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-w-md w-[90%] rounded-2xl border border-white/60 bg-white/95 px-6 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">填写拒绝原因</h2>
            <p className="text-xs text-slate-500 mb-4">
              拒绝后，用户将在申请列表中看到此原因。
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="请输入拒绝的具体理由（如：信息不实、简介内容过短、图片不清晰等）"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-900 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectingItem(null)
                  setRejectionReason('')
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑弹窗 */}
      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/60 bg-white px-6 py-6 shadow-[0_22px_45px_rgba(15,23,42,0.35)]">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              编辑{editingItem.type === 'university' ? '大学' : '专业'}信息
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">名称</label>
                <input
                  type="text"
                  value={editingItem.data.name}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    data: { ...editingItem.data, name: e.target.value }
                  })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500"
                  required
                />
              </div>
              {editingItem.type === 'university' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">等级</label>
                    <input
                      type="text"
                      value={editingItem.data.level}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, level: e.target.value }
                      })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">地点</label>
                    <input
                      type="text"
                      value={editingItem.data.location}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, location: e.target.value }
                      })}
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">介绍</label>
                <textarea
                  value={editingItem.data.description}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    data: { ...editingItem.data, description: e.target.value }
                  })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-indigo-500"
                  rows={6}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
