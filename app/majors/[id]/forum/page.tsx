'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen, Clock, Heart, MessageCircle, Search, Building2 } from 'lucide-react'
import { getMajorById, type Major } from '@/data/majors'
import {
  getQuestions,
  toggleQuestionLike,
  addQuestion,
  formatRelativeTime,
  type Question,
} from '@/data/questions'
import { getAllUniversities } from '@/data/universities'
import { getUserById, type User } from '@/data/users'
import { AlertDialog } from '@/components/Dialog'
import { BackButton } from '@/components/BackButton'

export default function MajorForumPage(props: { params: { id: string } }) {
  const { params } = props
  const { data: session } = useSession()

  const [major, setMajor] = useState<Major | undefined>(undefined)
  const [questions, setQuestions] = useState<Question[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    isAnonymous: false,
  })
  const [alertConfig, setAlertConfig] = useState<{ title: string; message?: string } | null>(null)

  useEffect(() => {
    const found = getMajorById(params.id)
    setMajor(found)
    setUniversities(getAllUniversities())

    const all = getQuestions()
    const list = all.filter((q) => q.majorId === params.id)
    setQuestions(list)
    setLoading(false)
  }, [params.id])

  const handleLike = (questionId: string) => {
    if (!session?.user?.id) {
      setAlertConfig({
        title: '需要登录',
        message: '请先登录后再为讨论点赞。',
      })
      return
    }

    const updated = toggleQuestionLike(questionId, session.user.id)
    if (updated) {
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)))
    }
  }

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      setAlertConfig({
        title: '需要登录',
        message: '请先登录后再发布内容。',
      })
      return
    }
    if (!major) return

    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      setAlertConfig({
        title: '内容不完整',
        message: '请填写完整的标题和内容后再发布。',
      })
      return
    }

    const created = addQuestion({
      title: newQuestion.title.trim(),
      content: newQuestion.content.trim(),
      asker: newQuestion.isAnonymous
        ? '匿名用户'
        : session.user.nickname || session.user.name || session.user.email || '匿名用户',
      askerId: newQuestion.isAnonymous ? undefined : session.user.id,
      date: new Date().toISOString(),
      universityId: '',
      majorId: major.id,
      category: '其他',
      isAnonymous: newQuestion.isAnonymous || false,
    })

    if (!created) {
      setAlertConfig({
        title: '已被禁言',
        message: '你已被管理员禁言，暂时无法发布讨论或点赞。',
      })
      return
    }

    setQuestions((prev) => [created, ...prev])
    setNewQuestion({
      title: '',
      content: '',
      isAnonymous: false,
    })
    setAlertConfig({
      title: '发布成功',
      message: '你的讨论已发布到本专业论坛。',
    })
  }

  const filtered = questions.filter((q) => {
    const qstr = searchQuery.toLowerCase()
    return (
      q.title.toLowerCase().includes(qstr) || q.content.toLowerCase().includes(qstr)
    )
  })

  const isLiked = (question: Question) => {
    if (!session?.user?.id) return false
    return question.likedBy?.includes(session.user.id) || false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!major) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">未找到该专业</h1>
          <BackButton href="/majors" label="返回专业列表" className="justify-center mb-0 mt-4" />
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
      <AlertDialog
        open={!!alertConfig}
        title={alertConfig?.title || ''}
        message={alertConfig?.message}
        onClose={() => setAlertConfig(null)}
      />
        <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton href="/majors" label="返回专业列表" />
        </div>

          <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{major.name} 论坛</h1>
            <p className="text-gray-600 mb-4">
              围绕 <span className="font-semibold">{major.name}</span> 的课程、院校选择、发展方向等话题进行交流
            </p>
          </div>

          {/* 专业介绍和强势学校 */}
        <div className="bg白 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] p-7 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                专业介绍
              </h2>
            <p className="text-gray-700 leading-relaxed text-base">{major.description}</p>
            </div>

            {major.strongUniversities && major.strongUniversities.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-primary-600" />
                  强势院校
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const validUniversities = major.strongUniversities
                    .map((id) => {
                      const uni = universities.find((u) => u.id === id)
                        return uni ? { id, name: uni.name } : null
                      })
                    .filter(Boolean) as { id: string; name: string }[]
                    
                    const displayed = validUniversities.slice(0, 5)
                    const hasMore = validUniversities.length > 5
                    
                    return (
                      <>
                        {displayed.map((uni) => (
                          <Link
                            key={uni.id}
                            href={`/universities/${uni.id}`}
                            className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-800 transition-colors border border-primary-200"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            {uni.name}
                          </Link>
                        ))}
                        {hasMore && (
                          <span className="inline-flex items-center bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200">
                            +{validUniversities.length - 5} 所
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* 搜索与发布提问 */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-white/90 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-sky-400 to-emerald-400" />
          <div className="relative p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">在本专业发起讨论</h2>
                <p className="mt-1 text-xs md:text-sm text-slate-500">
                  一边搜索历史问题，一边把自己的困惑交给学长学姐。
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.25fr)]">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
                  搜索已有讨论
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                    placeholder="在本专业论坛中搜索问题、关键词..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-9 py-2 text-sm text-slate-900 outline-none transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                />
                </div>
                <p className="text-[11px] text-slate-400">
                  例如：课程难度、转专业、保研就业、竞赛实践…
                </p>
              </div>

              <form
                onSubmit={handleSubmitQuestion}
                className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-sky-500 px-4 py-4 text-white shadow-[0_18px_40px_rgba(30,64,175,0.45)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-semibold">发起新讨论</span>
                  </div>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[11px]">
                    面向所有对 {major.name} 感兴趣的同学
                  </span>
            </div>

              <input
                type="text"
                  placeholder="一句话概括你的问题，例如：这个专业需要哪些高中基础？"
                value={newQuestion.title}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, title: e.target.value }))
                }
                  className="w-full rounded-lg border border-white/40 bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
              <textarea
                  placeholder="详细描述你的现状、困惑，以及已经了解的信息，这样更容易获得有针对性的回答～"
                rows={3}
                value={newQuestion.content}
                onChange={(e) =>
                  setNewQuestion((prev) => ({ ...prev, content: e.target.value }))
                }
                  className="w-full resize-none rounded-lg border border白/40 bg-white/95 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
              />
                <div className="mt-1 flex items-center justify-between gap-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAnonymousMajor"
                    checked={newQuestion.isAnonymous}
                    onChange={(e) =>
                        setNewQuestion((prev) => ({
                          ...prev,
                          isAnonymous: e.target.checked,
                        }))
                    }
                      className="h-4 w-4 rounded border-primary-100 bg-white/90 text-primary-600 focus:ring-white/70"
                  />
                    <label
                      htmlFor="isAnonymousMajor"
                      className="ml-2 text-xs md:text-sm text-white/90"
                    >
                    匿名发表
                      <span className="ml-1 text-[11px] text-white/70">（只显示“匿名用户”）</span>
                  </label>
                </div>
                <button
                  type="submit"
                    className="inline-flex items-center rounded-lg bg白 px-4 py-2 text-sm font-semibold text-primary-600 shadow-sm transition-all hover:bg-amber-50 hover:text-primary-700 hover:shadow-md"
                >
                    <MessageCircle className="mr-1 h-4 w-4" />
                  发布到本专业论坛
                </button>
              </div>
            </form>
            </div>
          </div>

          {/* 问题列表 */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-10 text-center">
                <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">本专业还没有问题，快来第一个发帖吧！</p>
              </div>
            ) : (
              filtered.map((question) => {
                const liked = isLiked(question)
                const askerUser: User | undefined =
                  !question.isAnonymous && question.askerId
                    ? getUserById(question.askerId)
                    : undefined
                const displayName = question.isAnonymous
                  ? '匿名用户'
                  : askerUser?.nickname || askerUser?.name || question.asker || '匿名用户'

                return (
                  <div
                    key={question.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    <Link href={`/forum/${question.id}`}>
                      <h2 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary-600 transition-colors">
                        {question.title}
                      </h2>
                      <p className="text-gray-700 text-sm line-clamp-3 mb-3">{question.content}</p>
                    </Link>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center gap-2">
                          {question.isAnonymous || !askerUser ? (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] text-gray-600">
                              匿
                            </div>
                          ) : askerUser.avatarUrl ? (
                            <Link
                              href={`/users/${askerUser.id}`}
                              className="shrink-0 hover:opacity-80 transition-opacity"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={askerUser.avatarUrl}
                                alt={displayName}
                                className="h-6 w-6 rounded-full object-cover border border-gray-200"
                              />
                            </Link>
                          ) : (
                            <Link
                              href={`/users/${askerUser.id}`}
                              className="shrink-0 hover:opacity-80 transition-opacity"
                            >
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700 border border-primary-100">
                                {displayName.charAt(0)}
                              </div>
                            </Link>
                          )}
                          <span className="text-gray-700">{displayName}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatRelativeTime(question.date)}</span>
                        </div>
                        <div className="flex items-center text-primary-600">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span>{question.replies} 条回复</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleLike(question.id)
                        }}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                          liked
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                        <span>{question.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
















