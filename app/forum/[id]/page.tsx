'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Clock, MessageCircle, Heart, Send, Trash2 } from 'lucide-react'
import {
  questionsApi,
  repliesApi,
  reportsApi,
  formatRelativeTime,
  type Question,
  type Reply,
} from '@/lib/api-client'
import { getAllUniversities } from '@/data/universities'
import { BackButton } from '@/components/BackButton'

// 根据用户信息生成"高一/高二/高三/20xx届"等学籍标签
function getUserAcademicLabel(user?: any): string | null {
  if (!user) return null

  const gy = user.graduationYear

  if (user.role === 'student') {
    if (typeof gy === 'string') {
      if (gy === 'gaoyi') return '高一'
      if (gy === 'gaoer') return '高二'
      if (gy === 'gaosan') return '高三'
    }
    return '在读学生'
  }

  if (user.role === 'alumni') {
    if (gy === 'non-baozhong') return '非宝中毕业生'
    if (typeof gy === 'number' || (typeof gy === 'string' && gy.trim() !== '')) {
      return `${gy}届`
    }
    return '毕业生'
  }

  return null
}

export default function QuestionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [question, setQuestion] = useState<Question | null>(null)
  const [universities, setUniversities] = useState<any[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<{ replyId: string; replier: string } | null>(null)
  const [replyingContent, setReplyingContent] = useState('')
  const [replyingAnonymous, setReplyingAnonymous] = useState(false)
  const [messagePanel, setMessagePanel] = useState<{
    title: string
    message: string
  } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'question' | 'reply'
    replyId?: string
  } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [reportingTarget, setReportingTarget] = useState<{
    type: 'question' | 'reply'
    id: string
    content: string
    title?: string
  } | null>(null)
  const [reportReason, setReportReason] = useState('')

  // 当前登录用户是否被禁言（从 session 中读取）
  const isMutedUser = !!(session?.user as any)?.isMuted

  useEffect(() => {
    loadQuestion()
    setUniversities(getAllUniversities())
  }, [params.id])

  // 管理员标记
  useEffect(() => {
    setIsAdmin(session?.user?.role === 'admin')
  }, [session?.user?.role])

  const loadQuestion = async () => {
    try {
      const data = await questionsApi.get(params.id)
      setQuestion(data)
    } catch (error) {
      console.error('加载问题失败:', error)
      router.push('/forum')
    } finally {
      setLoading(false)
    }
  }

  const handleQuestionLike = async () => {
    if (!session?.user?.id) {
      setMessagePanel({
        title: '需要登录',
        message: '请先登录后再为问题点赞。',
      })
      return
    }
    if (isMutedUser) {
      setMessagePanel({
        title: '已被禁言',
        message: '你已被管理员禁言，暂时无法点赞或发表评论。',
      })
      return
    }
    if (!question) return

    try {
      const updated = await questionsApi.toggleLike(question.id)
      setQuestion(updated)
    } catch (error: any) {
      setMessagePanel({
        title: '操作失败',
        message: error.message || '点赞失败，请稍后重试',
      })
    }
  }

  const handleQuestionDelete = () => {
    if (!session?.user?.id || !question) return
    setDeleteConfirm({ type: 'question' })
  }

  const handleReplyLike = async (replyId: string) => {
    if (!session?.user?.id) {
      setMessagePanel({
        title: '需要登录',
        message: '请先登录后再为回复点赞。',
      })
      return
    }
    if (isMutedUser) {
      setMessagePanel({
        title: '已被禁言',
        message: '你已被管理员禁言，暂时无法点赞或发表评论。',
      })
      return
    }
    if (!question) return

    try {
      await repliesApi.toggleLike(question.id, replyId)
      // 重新加载问题以更新点赞状态
      await loadQuestion()
    } catch (error: any) {
      setMessagePanel({
        title: '操作失败',
        message: error.message || '点赞失败，请稍后重试',
      })
    }
  }

  const handleReplyDelete = (replyId: string) => {
    if (!session?.user?.id || !question) return
    setDeleteConfirm({ type: 'reply', replyId })
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setMessagePanel({
        title: '需要登录',
        message: '请先登录后再发表回复。',
      })
      return
    }
    if (isMutedUser) {
      setMessagePanel({
        title: '已被禁言',
        message: '你已被管理员禁言，暂时无法点赞或发表评论。',
      })
      return
    }
    if (!question || !replyContent.trim()) return

    setIsSubmitting(true)

    try {
      const updated = await repliesApi.create(question.id, {
        content: replyContent.trim(),
        isAnonymous: isReplyAnonymous,
      })
      setQuestion(updated)
      setReplyContent('')
      setIsReplyAnonymous(false)
    } catch (error: any) {
      setMessagePanel({
        title: '发表失败',
        message: error.message || '发表回复失败，请稍后重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReplyToReply = async (parentReplyId: string, parentReplier: string) => {
    if (!session?.user) {
      setMessagePanel({
        title: '需要登录',
        message: '请先登录后再回复他人的评论。',
      })
      return
    }
    if (isMutedUser) {
      setMessagePanel({
        title: '已被禁言',
        message: '你已被管理员禁言，暂时无法点赞或发表评论。',
      })
      return
    }
    if (!question || !replyingContent.trim()) return

    setIsSubmitting(true)

    try {
      const updated = await repliesApi.create(question.id, {
        content: `回复${parentReplier}:${replyingContent.trim()}`,
        isAnonymous: replyingAnonymous,
        parentReplyId: parentReplyId,
      })
      setQuestion(updated)
      setReplyingContent('')
      setReplyingAnonymous(false)
      setReplyingTo(null)
    } catch (error: any) {
      setMessagePanel({
        title: '回复失败',
        message: error.message || '回复失败，请稍后重试',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    )
  }

  if (!question) {
    return null
  }

  const university = universities.find((u) => u.id === question.universityId)
  
  // 检查当前用户是否点赞了问题
  const isQuestionLiked = !!(
    session?.user?.id && 
    question.likesRel?.some(like => like.userId === session.user.id)
  )
  
  // 检查当前用户是否点赞了回复
  const isReplyLiked = (reply: Reply) =>
    !!(session?.user?.id && reply.likesRel?.some(like => like.userId === session.user.id))

  const questionUserDetail = question.asker
  const questionAcademicLabel = getUserAcademicLabel(questionUserDetail)

  // 返回链接逻辑
  let backHref = '/forum'
  let backLabel = '返回问答论坛'

  if (question.majorId) {
    backHref = `/majors/${question.majorId}/forum`
    backLabel = '返回本专业论坛'
  } else if (question.universityId) {
    backHref = `/universities/${question.universityId}/forum`
    backLabel = university ? `返回${university.name}讨论区` : '返回学校讨论区'
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm || !question || !session?.user?.id) {
      setDeleteConfirm(null)
      return
    }

    try {
      if (deleteConfirm.type === 'question') {
        await questionsApi.delete(question.id)
        let backHref = '/forum'
        if (question.majorId) {
          backHref = `/majors/${question.majorId}/forum`
        } else if (question.universityId) {
          backHref = `/universities/${question.universityId}/forum`
        }
        router.push(backHref)
      } else if (deleteConfirm.type === 'reply' && deleteConfirm.replyId) {
        await repliesApi.delete(question.id, deleteConfirm.replyId)
        await loadQuestion()
      }
    } catch (error: any) {
      setMessagePanel({
        title: '删除失败',
        message: error.message || '删除失败，请稍后重试',
      })
    }

    setDeleteConfirm(null)
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user || !reportingTarget) return

    try {
      await reportsApi.create({
        type: reportingTarget.type,
        targetId: reportingTarget.id,
        targetTitle: reportingTarget.title,
        targetContent: reportingTarget.content,
        reason: reportReason,
        questionId: question.id,
      })

      setMessagePanel({
        title: '举报已提交',
        message: '感谢您的反馈，管理员将尽快处理违规内容。',
      })
      setReportingTarget(null)
      setReportReason('')
    } catch (error: any) {
      setMessagePanel({
        title: '举报失败',
        message: error.message || '提交举报失败，请稍后重试',
      })
    }
  }

  // 将回复列表转换为嵌套结构
  const buildReplyTree = (replies: Reply[]): Reply[] => {
    const topLevelReplies = replies.filter(r => !r.parentReplyId)
    const addChildren = (reply: Reply): Reply => {
      const children = replies.filter(r => r.parentReplyId === reply.id)
      return {
        ...reply,
        children: children.map(addChildren),
      }
    }
    return topLevelReplies.map(addChildren)
  }

  const replyTree = question.replies ? buildReplyTree(question.replies) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0f7ff] py-12 px-4 relative overflow-hidden">
      {/* 背景柔光色块 */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 h-[380px] w-[380px] rounded-full opacity-40 blur-[90px]"
          style={{
            background:
              'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.45), transparent 60%)',
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[420px] w-[420px] opacity-40 blur-[90px]"
          style={{
            background:
              'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4), transparent 60%)',
          }}
        />
      </div>
      
      {/* 顶部提示面板 */}
      {messagePanel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-w-sm w-[90%] rounded-2xl border border-white/60 bg-white/95 px-6 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {messagePanel.title}
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {messagePanel.message}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMessagePanel(null)}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 删除确认面板 */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-w-sm w-[90%] rounded-2xl border border-white/60 bg-white/95 px-6 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              {deleteConfirm.type === 'question' ? '删除提问' : '删除回复'}
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {deleteConfirm.type === 'question'
                ? '确定要删除这个提问吗？删除后该提问下的所有回复都会一起删除。'
                : '确定要删除这条回复吗？其下的所有子回复也会同时删除。'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 举报弹窗 */}
      {reportingTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="max-w-md w-[90%] rounded-2xl border border-white/60 bg-white/95 px-6 py-5 shadow-[0_22px_45px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">举报违规内容</h2>
            <p className="text-xs text-slate-500 mb-4">
              您正在举报：{reportingTarget.type === 'question' ? '提问' : '回复'}
            </p>
            <form onSubmit={handleReportSubmit}>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="请详细描述违规原因（如：人身攻击、垃圾广告、虚假信息等）"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-900 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 mb-4"
                rows={4}
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReportingTarget(null)
                    setReportReason('')
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
                >
                  提交举报
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href={backHref} label={backLabel} />
        </div>

        {/* 问题卡片 */}
        <div className="rounded-2xl border border-slate-100/80 bg-white/95 p-7 md:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                问答详情
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <MessageCircle className="w-3 h-3" />
                {question.repliesCount || 0} 条回复
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4 leading-snug">
              {question.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-600 mb-4">
              <div className="flex items-center gap-2">
                {/* 发布者头像 */}
                {question.isAnonymous || !question.askerId ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] text-slate-600">
                    匿
                  </div>
                ) : questionUserDetail?.avatarUrl ? (
                  <Link
                    href={`/users/${question.askerId}`}
                    className="shrink-0 hover:opacity-90 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={questionUserDetail.avatarUrl}
                      alt={
                        questionUserDetail.nickname ||
                        questionUserDetail.name ||
                        question.askerName
                      }
                      className="h-8 w-8 rounded-full object-cover border border-primary-100 shadow-sm"
                    />
                  </Link>
                ) : questionUserDetail ? (
                  <Link
                    href={`/users/${question.askerId}`}
                    className="shrink-0 hover:opacity-90 transition-opacity"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 border border-primary-100 shadow-sm">
                      {(
                        questionUserDetail.nickname ||
                        questionUserDetail.name ||
                        question.askerName ||
                        'U'
                      ).charAt(0)}
                    </div>
                  </Link>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[11px] text-slate-600">
                    匿
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {question.isAnonymous || !question.askerId ? (
                    <span className="font-medium">
                      {question.isAnonymous ? '匿名用户' : question.askerName}
                    </span>
                  ) : (
                    <Link
                      href={`/users/${question.askerId}`}
                      className="font-medium text-slate-900 hover:text-primary-600 transition-colors"
                    >
                      {question.askerName}
                    </Link>
                  )}
                  {questionAcademicLabel && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {questionAcademicLabel}
                    </span>
                  )}
                  {!question.isAnonymous &&
                    questionUserDetail?.role === 'alumni' && (
                      <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] text-primary-700">
                        学长/学姐
                      </span>
                    )}
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-slate-400" />
                <span>{formatRelativeTime(question.date)}</span>
              </div>
              {question.category && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {question.category}
                </span>
              )}
              {university && (
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                  {university.name}
                </span>
              )}
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {question.content}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleQuestionLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isQuestionLiked
                  ? 'bg-red-50/90 text-red-600 shadow-sm hover:bg-red-100'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${isQuestionLiked ? 'fill-current' : ''}`} />
              <span>{question.likes || 0}</span>
            </button>
            <div className="flex items-center gap-3">
              {session && (
                <button
                  onClick={() => setReportingTarget({
                    type: 'question',
                    id: question.id,
                    content: question.content,
                    title: question.title
                  })}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  举报
                </button>
              )}
              {session && (session.user?.id === question.askerId || isAdmin) && (
                <button
                  onClick={handleQuestionDelete}
                  className="inline-flex items-center px-3 py-1.5 rounded-full border border-red-200 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  删除提问
                </button>
              )}
              {university && (
                <Link
                  href={`/universities/${university.id}/forum`}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  查看{university.name}论坛 →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 回复区域 */}
        <div className="rounded-2xl border border-slate-100/80 bg-slate-50/95 p-7 md:p-8 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-primary-600" />
              回复 ({question.repliesCount || 0})
            </h2>
            <span className="hidden md:inline text-xs text-slate-500">
              与学长学姐或同学交流想法，让更多人看到你的观点
            </span>
          </div>

          {replyTree.length > 0 ? (
            <div className="space-y-5">
              {replyTree.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  questionId={question.id}
                  session={session}
                  isReplyLiked={isReplyLiked}
                  onReplyLike={handleReplyLike}
                  onReplyDelete={handleReplyDelete}
                  onReplyToReply={handleSubmitReplyToReply}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyingContent={replyingContent}
                  setReplyingContent={setReplyingContent}
                  replyingAnonymous={replyingAnonymous}
                  setReplyingAnonymous={setReplyingAnonymous}
                  isSubmitting={isSubmitting}
                  depth={0}
                  isAdmin={isAdmin}
                  onReport={(r) => setReportingTarget({
                    type: 'reply',
                    id: r.id,
                    content: r.content
                  })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无回复，成为第一个回复的人吧！</p>
            </div>
          )}

          {session ? (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <form onSubmit={handleSubmitReply}>
                <textarea
                  placeholder="写下你的回复..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-900 outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 mb-4"
                  rows={4}
                  required
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isReplyAnonymous"
                      checked={isReplyAnonymous}
                      onChange={(e) => setIsReplyAnonymous(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isReplyAnonymous" className="ml-2 text-sm text-gray-700">
                      匿名回复
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !replyContent.trim()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? '发布中...' : '发布回复'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-gray-600 mb-4">请先登录后才能回复</p>
              <Link
                href="/auth/login"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                去登录
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 递归回复组件
function ReplyItem({
  reply,
  questionId,
  session,
  isReplyLiked,
  onReplyLike,
  onReplyDelete,
  onReplyToReply,
  replyingTo,
  setReplyingTo,
  replyingContent,
  setReplyingContent,
  replyingAnonymous,
  setReplyingAnonymous,
  isSubmitting,
  depth,
  isAdmin,
  onReport,
}: {
  reply: Reply
  questionId: string
  session: any
  isReplyLiked: (reply: Reply) => boolean
  onReplyLike: (replyId: string) => void
  onReplyDelete: (replyId: string) => void
  onReplyToReply: (parentReplyId: string, parentReplier: string) => void
  replyingTo: { replyId: string; replier: string } | null
  setReplyingTo: (value: { replyId: string; replier: string } | null) => void
  replyingContent: string
  setReplyingContent: (value: string) => void
  replyingAnonymous: boolean
  setReplyingAnonymous: (value: boolean) => void
  isSubmitting: boolean
  depth: number
  isAdmin: boolean
  onReport: (reply: Reply) => void
}) {
  const liked = isReplyLiked(reply)
  const isReplying = replyingTo?.replyId === reply.id
  const userDetail = reply.replier
  const academicLabel = getUserAcademicLabel(userDetail)

  return (
    <div
      className={`${
        depth > 0 ? 'ml-8 mt-4 border-l-2 border-slate-200 pl-4' : ''
      }`}
    >
      <div
        className={`rounded-xl px-4 py-3 shadow-sm border ${
          depth === 0
            ? 'border-primary-100 bg-white/95'
            : 'border-slate-200 bg-slate-50/90'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3 flex-wrap">
            {/* 头像 */}
            {reply.isAnonymous || !reply.replierId ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                匿
              </div>
            ) : userDetail?.avatarUrl ? (
              <Link
                href={`/users/${reply.replierId}`}
                className="shrink-0 hover:opacity-90 transition-opacity"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={userDetail.avatarUrl}
                  alt={userDetail.nickname || userDetail.name || reply.replierName || ''}
                  className="w-8 h-8 rounded-full object-cover border border-primary-100"
                />
              </Link>
            ) : (
              <Link
                href={`/users/${reply.replierId}`}
                className="shrink-0 hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
                  {(
                    userDetail?.nickname ||
                    userDetail?.name ||
                    reply.replierName ||
                    'U'
                  ).charAt(0)}
                </div>
              </Link>
            )}

            <div className="flex items-center space-x-2 flex-wrap">
              {reply.isAnonymous || !reply.replierId ? (
                <span className="font-semibold text-gray-800">
                  {reply.isAnonymous ? '匿名用户' : reply.replierName}
                </span>
              ) : (
                <Link
                  href={`/users/${reply.replierId}`}
                  className="font-semibold text-gray-800 hover:text-primary-600 transition-colors"
                >
                  {reply.replierName || userDetail?.nickname || userDetail?.name}
                </Link>
              )}
              {academicLabel && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {academicLabel}
                </span>
              )}
              <span className="text-sm text-gray-500">
                · {formatRelativeTime(reply.date)}
              </span>
              {!reply.isAnonymous && userDetail?.role === 'alumni' && (
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                  学长/学姐
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReplyLike(reply.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{reply.likes || 0}</span>
            </button>
            {session && (
              <>
                <button
                  onClick={() => onReport(reply)}
                  className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded transition-colors"
                >
                  举报
                </button>
                <button
                  onClick={() =>
                    setReplyingTo(isReplying ? null : { replyId: reply.id, replier: reply.replierName || '' })
                  }
                  className="text-sm text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                >
                  回复
                </button>
                {(reply.replierId && session.user?.id === reply.replierId) || isAdmin ? (
                  <button
                    onClick={() => onReplyDelete(reply.id)}
                    className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    删除
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed mb-3 text-sm md:text-base">{reply.content}</p>

        {/* 回复输入框 */}
        {isReplying && (
          <div className="mt-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <textarea
              placeholder={`回复${reply.replierName || ''}...`}
              value={replyingContent}
              onChange={(e) => setReplyingContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-3"
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={replyingAnonymous}
                  onChange={(e) => setReplyingAnonymous(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">匿名回复</label>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyingContent('')
                    setReplyingAnonymous(false)
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => onReplyToReply(reply.id, reply.replierName || '')}
                  disabled={isSubmitting || !replyingContent.trim()}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '发布中...' : '发布'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 递归显示子回复 */}
      {reply.children && reply.children.length > 0 && (
        <div className="mt-4">
          {reply.children.map((subReply) => (
            <ReplyItem
              key={subReply.id}
              reply={subReply}
              questionId={questionId}
              session={session}
              isReplyLiked={isReplyLiked}
              onReplyLike={onReplyLike}
              onReplyDelete={onReplyDelete}
              onReplyToReply={onReplyToReply}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyingContent={replyingContent}
              setReplyingContent={setReplyingContent}
              replyingAnonymous={replyingAnonymous}
              setReplyingAnonymous={setReplyingAnonymous}
              isSubmitting={isSubmitting}
              depth={depth + 1}
              isAdmin={isAdmin}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

