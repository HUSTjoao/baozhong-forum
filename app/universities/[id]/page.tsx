'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Users, Book, MessageCircle, Shield } from 'lucide-react'
import { getAllUniversities, type University } from '@/data/universities'
import { getUniversityForumUserCount } from '@/data/questions'
import { BackButton } from '@/components/BackButton'

export default function UniversityDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [university, setUniversity] = useState<University | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const [forumUserCount, setForumUserCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const flag = window.localStorage.getItem('bz_forum_admin')
      setIsAdmin(flag === 'true')
    }
    const allUnis = getAllUniversities()
    const found = allUnis.find((u) => u.id === params.id)
    setUniversity(found)
    if (found) {
      const count = getUniversityForumUserCount(found.id)
      setForumUserCount(count)
    }
    setLoading(false)
    setLogoError(false) // 重置logo错误状态
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">加载中...</div>
        </div>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">未找到该大学信息</p>
          <BackButton href="/universities" label="返回大学列表" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <BackButton href="/universities" label="返回大学列表" />
        </div>

        <div className="space-y-6">
          {/* 顶部信息卡片 */}
          <div className="bg-white/90 rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-white/70 backdrop-blur-xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* 左侧：校徽 + 基本信息 */}
            <div className="flex items-start gap-6 flex-1">
              {university.logoUrl && !logoError ? (
                // 校徽
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={university.logoUrl}
                  alt={`${university.name} 校徽`}
                  className="w-24 h-24 rounded-2xl object-contain border-4 border-slate-100 bg-white p-3 shadow-md"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-3xl border-4 border-slate-100 shadow-md">
                  {university.name.charAt(0)}
                </div>
              )}

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                  {university.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {university.level}
                  </span>
                  {university.isUserAdded && (
                    <span className="text-xs text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                      用户添加
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base text-slate-600">
                  <div className="inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                    <span>{university.location}</span>
                  </div>
                  <div className="inline-flex items-center">
                    <Users className="w-4 h-4 mr-2 text-primary-500" />
                    <span>{forumUserCount} 名用户进入论坛</span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-slate-600">
                  校训：
                  <span className="font-semibold text-slate-900 ml-1">
                    {university.motto || '校训信息暂未收录'}
                  </span>
                </p>
              </div>
            </div>

            {/* 右侧：进入论坛 CTA */}
            <div className="w-full md:w-auto md:self-stretch flex md:flex-col gap-3 justify-end">
              <div className="flex-1 md:flex-none bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 flex items-center justify-between md:justify-start gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">论坛活跃度</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {forumUserCount} 名宝中同学来过这里
                  </p>
                </div>
              </div>
              <Link
                href={`/universities/${university.id}/forum`}
                className="inline-flex items-center justify-center w-full md:w-auto bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                进入{university.name}论坛
              </Link>
            </div>
          </div>

          {/* 下方信息区：学校简介 + 热门专业 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-slate-100 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
                学校简介
              </h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {university.description}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-slate-100 p-6 sm:p-8 flex flex-col">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 flex items-center">
                <Book className="w-5 h-5 mr-2 text-primary-600" />
                热门专业
              </h2>
              <p className="text-sm text-slate-500 mb-3">
                以下专业在宝中同学中讨论度较高，可作为了解这所大学的一个入口。
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {university.majors.map((major, index) => (
                  <span
                    key={index}
                    className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
                  >
                    {major}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

