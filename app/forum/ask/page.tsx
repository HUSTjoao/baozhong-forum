'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { MessageCircle, Tag } from 'lucide-react'
import { addQuestion } from '@/data/questions'
import { getUserById } from '@/data/users'
import RequireAuth from '@/components/RequireAuth'
import { useNotification } from '@/components/Notification'
import { BackButton } from '@/components/BackButton'

const CATEGORY_OPTIONS = [
  { value: '升学择校', label: '升学择校' },
  { value: '志愿填报', label: '志愿填报' },
  { value: '专业选择', label: '专业选择' },
  { value: '复习备考', label: '复习备考' },
  { value: '学习攻略', label: '学习攻略' },
  { value: '心理压力', label: '心理压力' },
  { value: '校园琐事', label: '校园琐事' },
  { value: '其他', label: '其他' },
]

export default function AskQuestionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { showNotification, NotificationComponent } = useNotification()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    universityId: searchParams?.get('university') || '',
    isAnonymous: false,
  })

  const isUniversityContext = !!(formData.universityId || searchParams?.get('university'))
  const backHref =
    isUniversityContext && formData.universityId
      ? `/universities/${formData.universityId}/forum`
      : '/forum'

  useEffect(() => {
    const universityParam = searchParams?.get('university')
    if (universityParam) {
      setFormData((prev) => ({ ...prev, universityId: universityParam }))
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user) {
      showNotification('请先登录', 'warning')
      return
    }

    // 禁言用户无法发帖
    if (session.user.id) {
      const me = getUserById(session.user.id)
      if (me?.isMuted) {
        showNotification('你已被管理员禁言，暂时无法发帖。', 'warning')
        return
      }
    }

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      (!isUniversityContext && !formData.category)
    ) {
      showNotification(
        isUniversityContext
          ? '请填写完整的标题和内容'
          : '请填写完整信息，并选择一个问题分类',
        'warning'
      )
      return
    }

    // 确保大学场景下，一定带上 universityId（防止 useEffect 还未同步 formData）
    const universityIdParam = searchParams?.get('university') || formData.universityId || ''

    const newQuestion = addQuestion({
      title: formData.title.trim(),
      content: formData.content.trim(),
      asker: formData.isAnonymous
        ? '匿名用户'
        : session.user.nickname || session.user.name || session.user.email || '匿名用户',
      askerId: formData.isAnonymous ? undefined : session.user.id,
      date: new Date().toISOString(),
      universityId: isUniversityContext ? universityIdParam : '',
      majorId: undefined, // 问答论坛的问题不关联专业
      category: isUniversityContext ? undefined : formData.category,
      isAnonymous: formData.isAnonymous,
    })
    if (!newQuestion) {
      showNotification('你已被管理员禁言，暂时无法发布内容。', 'error')
      return
    }

    showNotification(
      isUniversityContext ? '观点已发布！感谢你的分享。' : '问题已提交！感谢你的提问。',
      'success'
    )
    setTimeout(() => {
      router.push(`/forum/${newQuestion.id}`)
    }, 1500)
  }

  return (
    <>
      {NotificationComponent}
      <RequireAuth>
        <div className="min-h-screen bg-gradient-to-br from-[#f5f0ff] via-[#f2f7ff] to-[#e6f9ff] relative overflow-hidden py-10 px-4 sm:px-6 lg:px-8">
          {/* 背景光斑 */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full opacity-40 blur-[90px]"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.45), transparent 60%)',
              }}
            />
            <div
              className="absolute -bottom-40 -right-40 h-[460px] w-[460px] opacity-40 blur-[90px]"
              style={{
                background:
                  'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4), transparent 60%)',
              }}
            />
          </div>

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-6">
            <BackButton href={backHref} label="返回论坛" />

            <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-7 shadow-[0_22px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:px-8 sm:py-9">
              {/* 头部 */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    {isUniversityContext ? '高校讨论区 · 发表观点' : '学长学姐一对一答疑'}
                  </div>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {isUniversityContext ? '我要发表观点' : '我要提问'}
                  </h1>
                  <p className="mt-2 text-sm text-slate-500 sm:text-sm">
                    {isUniversityContext
                      ? '描述你对该大学、专业或校园生活的真实感受和观点，帮助更多同学获取一手体验。'
                      : '描述清楚你的情况和疑惑，方便学长学姐快速抓住重点、给出更有针对性的建议。'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 分类：仅问答论坛显示；大学观点发表不需要分类 */}
                {!isUniversityContext && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="flex items-center text-sm font-medium text-slate-800">
                        <Tag className="mr-1.5 h-4 w-4 text-primary-500" />
                        问题分类
                        <span className="ml-1 text-xs text-red-500">*</span>
                      </label>
                      <span className="text-xs text-slate-400">
                        选择一个最贴近你问题的分类，方便其他同学快速找到。
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((option) => {
                        const active = formData.category === option.value
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, category: option.value }))
                            }
                            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                              active
                                ? 'bg-primary-600 text-white shadow-sm'
                                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* 标题 */}
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    {isUniversityContext ? '观点标题' : '问题标题'}
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={
                      isUniversityContext
                        ? '一句话概括你的观点，例如：我在某大学计算机专业的真实体验'
                        : '一句话概括你的问题，例如：如何选择适合自己的大学和专业？'
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    required
                  />
                </div>

                {/* 详情 */}
                <div>
                  <label
                    htmlFor="content"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    {isUniversityContext ? '观点详情' : '问题详情'}
                  </label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder={
                      isUniversityContext
                        ? '请详细分享你在该大学/专业/城市的感受、课程体验、学习氛围、生活环境等，这些都能帮到正在选择的同学～'
                        : '请详细描述你的背景（年级、目标方向等）、目前的困惑，以及你已经了解或尝试过的方案，这样学长学姐能更高效地帮你分析～'
                    }
                    rows={8}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                    required
                  />
                </div>

                {/* 匿名选项 */}
                <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isAnonymous: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor="isAnonymous"
                      className="ml-2 text-sm font-medium text-slate-700"
                    >
                      匿名发表
                    </label>
                  </div>
                  <p className="text-xs text-slate-400">
                    开启后，学长学姐和其他同学只会看到“匿名用户”，不会显示你的昵称。
                  </p>
                </div>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Link
                    href={
                      isUniversityContext && formData.universityId
                        ? `/universities/${formData.universityId}/forum`
                        : '/forum'
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    取消
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {isUniversityContext ? '发表观点' : '提交问题'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </RequireAuth>
    </>
  )
}
