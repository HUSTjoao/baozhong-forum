'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { MessageCircle, Clock, Search, Heart } from 'lucide-react'
import { getQuestions, toggleQuestionLike, type Question } from '@/data/questions'
import { getAllUniversities, type University } from '@/data/universities'
import { getUserById, type User } from '@/data/users'
import { BackButton } from '@/components/BackButton'

export default function UniversityForumPage(props: { params: { id: string } }) {
  const { params } = props
  const { data: session } = useSession()

  const [university, setUniversity] = useState<University | undefined>(undefined)
  const [questions, setQuestions] = useState<Question[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const allUnis = getAllUniversities()
    const found = allUnis.find((u) => u.id === params.id)
    setUniversity(found)

    const allQuestions = getQuestions()
    const uniQuestions = allQuestions.filter((q) => q.universityId === params.id)
    setQuestions(uniQuestions)
    setLoading(false)
  }, [params.id])

  const handleLike = (questionId: string) => {
    if (!session?.user?.id) {
      alert('请先登录后再点赞')
      return
    }
    const updated = toggleQuestionLike(questionId, session.user.id)
    if (updated) {
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)))
    }
  }

  const filteredQuestions = questions.filter((q) => {
    const text = searchQuery.toLowerCase()
    return (
      q.title.toLowerCase().includes(text) ||
      q.content.toLowerCase().includes(text)
    )
  })

  const isLiked = (question: Question) => {
    if (!session?.user?.id) return false
    return question.likedBy?.includes(session.user.id) || false
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center text-gray-600">加载中...</div>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7ff] via-[#eef4ff] to-[#e6f7ff] py-16 px-4">
        <div className="max-w-4xl mx-auto text-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/70 px-8 py-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">未找到该大学</h1>
          <p className="text-sm md:text-base text-slate-600 mb-8">
            可能是链接已失效，或者该学校暂未收录到论坛中。
          </p>
          <BackButton href="/universities" label="返回大学列表" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f5f7ff] via-[#eef4ff] to-[#e6f7ff] py-12 px-4">
      {/* 背景光斑 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 w-72 h-72 bg-primary-300/35 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-[-60px] w-80 h-80 bg-sky-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-40 bg-white/40 blur-2xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* 顶部返回与状态 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton href="/universities" label="返回大学列表" />
          </div>
          <div className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/80 text-[11px] text-slate-600 shadow-sm">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            正在浏览
            <span className="font-semibold text-primary-600">{university.name}</span>
            的讨论区
          </div>
        </div>

        {/* 内容卡片 */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white/70 shadow-[0_24px_80px_rgba(15,23,42,0.18)] px-5 py-6 md:px-10 md:py-8">
          {/* 标题与简介 */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-[11px] text-primary-700 border border-primary-100 mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                高校专属讨论区
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-1">
                {university.name}讨论区
              </h1>
              <p className="text-sm md:text-base text-slate-600">
                与{university.name}的学长学姐交流观点，获取专业建议与升学经验。
              </p>
            </div>
            <div className="flex md:flex-col items-end gap-2 text-[11px] text-slate-500">
              <div className="px-3 py-1 rounded-full bg-slate-900/90 text-white shadow-md">
                共
                <span className="mx-1 font-semibold">{questions.length}</span>
                条讨论
              </div>
              <div className="hidden md:block">
                <span>可以匿名发起话题，或为他人提供建设性建议</span>
              </div>
            </div>
          </div>

          {/* 搜索 + 发起讨论 */}
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] mb-6">
            {/* 搜索框 */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-100/60 via-sky-100/40 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center rounded-2xl bg-white/90 border border-slate-200 shadow-sm focus-within:border-primary-300 focus-within:shadow-md transition-all">
                <Search className="ml-3 mr-1 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索讨论标题或内容..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-0 outline-none px-2 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* 发起讨论 CTA */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#005BAC] via-[#0066CC] to-[#3B82F6] shadow-lg text-white px-5 py-4 flex items-center justify-between">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -right-6 -top-10 w-32 h-32 rounded-full bg-white/50 blur-3xl" />
                <div className="absolute -left-10 bottom-[-40px] w-40 h-40 rounded-full bg-sky-300/60 blur-3xl" />
              </div>
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/80 mb-1">
                  想法值得被听见
                </p>
                <p className="text-sm md:text-base font-semibold">
                  有想法？发起一场新的讨论吧
                </p>
              </div>
              <Link
                href={`/forum/ask?university=${university.id}`}
                className="relative inline-flex items-center gap-2 rounded-full bg-white text-primary-700 px-4 py-2 text-xs md:text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100">
                  <MessageCircle className="w-3.5 h-3.5 text-primary-600" />
                </span>
                <span>提出观点</span>
              </Link>
            </div>
          </div>

          {/* 讨论列表 */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-dashed border-slate-200 px-8 py-12 text-center shadow-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <p className="text-base md:text-lg font-semibold text-slate-700 mb-2">
                  暂无相关讨论
                </p>
                <p className="text-xs md:text-sm text-slate-500 mb-6">
                  可以成为第一个发起话题的人，分享你对学校、专业或校园生活的真实看法。
                </p>
                <Link
                  href={`/forum/ask?university=${university.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-5 py-2.5 text-sm font-semibold shadow-md hover:bg-primary-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  成为第一个提出观点的人
                </Link>
              </div>
            ) : (
              filteredQuestions.map((question, index) => {
                const liked = isLiked(question)
                const askerUser: User | undefined =
                  !question.isAnonymous && question.askerId
                    ? getUserById(question.askerId)
                    : undefined
                const displayName = question.isAnonymous
                  ? '匿名用户'
                  : askerUser?.nickname || askerUser?.name || question.asker || '匿名用户'

                return (
                  <Link
                    key={question.id}
                    href={`/forum/${question.id}`}
                    className="group block"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-100/80 shadow-md hover:shadow-2xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-0.5">
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary-400/70 via-sky-400/70 to-indigo-400/70 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-5 md:p-6">
                        <div className="mb-3">
                          <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                            {question.title}
                          </h2>
                          <p className="text-sm text-slate-600 line-clamp-2">{question.content}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[11px] md:text-xs text-slate-500">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <div className="flex items-center gap-2">
                              {question.isAnonymous || !askerUser ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-600">
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
                                    className="h-6 w-6 rounded-full object-cover border border-slate-200"
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
                              <span className="text-slate-700">{displayName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{question.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-primary-600">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{question.replies} 条回复</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              handleLike(question.id)
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                              liked
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                liked ? 'fill-current animate-pulse' : ''
                              }`}
                            />
                            <span>{question.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

