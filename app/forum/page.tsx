'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { MessageCircle, User, Clock, Search, Filter, Heart, Pencil, Flame, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { getQuestions, toggleQuestionLike, deleteQuestion, formatRelativeTime, type Question } from '@/data/questions'
import { getAllUniversities } from '@/data/universities'

export default function ForumPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [questions, setQuestions] = useState<Question[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    setQuestions(getQuestions())
    setUniversities(getAllUniversities())
  }, [])

  const handleLike = (questionId: string) => {
    if (!session?.user?.id) {
      alert('请先登录')
      return
    }
    
    const updated = toggleQuestionLike(questionId, session.user.id)
    if (updated) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? updated : q))
      )
    }
  }

  const handleDelete = (questionId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!session?.user?.id) {
      alert('请先登录')
      return
    }
    
    if (!confirm('确定要删除这个问题吗？删除后不可恢复。')) {
      return
    }
    
    const success = deleteQuestion(questionId, session.user.id)
    if (success) {
      // 从列表中移除该问题
      setQuestions((prev) => prev.filter((q) => q.id !== questionId))
      alert('问题已删除')
    } else {
      alert('删除失败，只能删除自己发布的问题')
    }
  }

  const filteredQuestions = questions.filter((q) => {
    // 问答论坛只显示不关联专业、也不绑定具体大学的问题
    // 1）majorId 为空：不是专业论坛的帖子
    // 2）universityId 为空：不是某个大学讨论区的观点
    if (q.majorId) return false
    if (q.universityId && q.universityId.trim() !== '') return false
    
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // 分页计算
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

  // 当筛选条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // 翻页时滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // 问题分类选项
  const categoryOptions = [
    { value: 'all', label: '全部' },
    { value: '升学择校', label: '升学择校' },
    { value: '志愿填报', label: '志愿填报' },
    { value: '专业选择', label: '专业选择' },
    { value: '复习备考', label: '复习备考' },
    { value: '学习攻略', label: '学习攻略' },
    { value: '心理压力', label: '心理压力' },
    { value: '校园琐事', label: '校园琐事' },
    { value: '其他', label: '其他' },
  ]

  const isLiked = (question: Question) => {
    if (!session?.user?.id) return false
    return question.likedBy?.includes(session.user.id) || false
  }

  // 生成随机颜色的头像
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400',
      'bg-purple-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  // 获取大学颜色（一校一色）
  const getUniversityColor = (universityName: string) => {
    const colorMap: { [key: string]: { bg: string; text: string } } = {
      '北京大学': { bg: 'bg-red-100', text: 'text-red-700' },
      '清华大学': { bg: 'bg-purple-100', text: 'text-purple-700' },
      '复旦大学': { bg: 'bg-blue-100', text: 'text-blue-700' },
      '上海交通大学': { bg: 'bg-green-100', text: 'text-green-700' },
      '浙江大学': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      '南京大学': { bg: 'bg-orange-100', text: 'text-orange-700' },
    }
    return colorMap[universityName] || { bg: 'bg-primary-50', text: 'text-primary-700' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 relative overflow-hidden">
      {/* 方案4：几何分割 - 半透明圆形色块 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 左上角 - 巨大半透明圆形 */}
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
          }}
        />
        {/* 右下角 - 不规则多边形（使用圆形模拟） */}
        <div 
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.12] blur-[90px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(236, 72, 153, 0.25) 0%, rgba(251, 113, 133, 0.2) 50%, transparent 80%)',
            borderRadius: '40% 60% 70% 30% / 60% 30% 70% 40%',
          }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* 标题区（第二层） */}
        <div className="pt-10 pb-6">
          <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            对话学长学姐
          </h1>
          <p className="text-lg text-gray-600" style={{ fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>
            解答你的升学疑惑，让学长学姐的经验成为你的导航
          </p>
        </div>

        {/* 操作层（第三层） - 玻璃拟态 */}
        <div 
          className="bg-white/90 backdrop-blur-[12px] rounded-2xl shadow-[0_22px_55px_rgba(190,24,93,0.16)] p-7 mb-8 border border-pink-100/70"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {/* 搜索框和操作按钮 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <input
                type="text"
                placeholder="🔍 输入名称、关键词或相关话题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-5 py-4 border border-gray-200 rounded-[50px] focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <Link
              href="/forum/ask"
              className="inline-flex items-center bg-gradient-to-r from-primary-600 to-blue-500 text-white px-6 py-4 rounded-[50px] font-semibold hover:from-primary-700 hover:to-blue-600 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <Pencil className="w-4 h-4 mr-2" />
              我要提问
            </Link>
          </div>

          {/* 筛选器 - 视觉降权 */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">分类：</span>
              <div className="flex gap-2 flex-wrap">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedCategory(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedCategory === option.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        {filteredQuestions.length > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            找到 <span className="font-semibold text-primary-600">{filteredQuestions.length}</span> 条咨询
            {filteredQuestions.length > itemsPerPage && (
              <span className="ml-2 text-gray-500">
                （第 {currentPage}/{totalPages} 页）
              </span>
            )}
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-5">
          {filteredQuestions.length === 0 ? (
            <div 
              className="bg-white/90 backdrop-blur-[12px] rounded-2xl shadow-[0_22px_55px_rgba(190,24,93,0.16)] p-12 text-center border border-pink-100/70"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">暂无相关问题</p>
            </div>
          ) : (
            <>
              {paginatedQuestions.map((question) => {
              const university = universities.find((u) => u.id === question.universityId)
              const liked = isLiked(question)
              const displayName = question.isAnonymous ? '匿名用户' : question.asker
              const avatarColor = getAvatarColor(displayName)
              const universityColor = university ? getUniversityColor(university.name) : { bg: 'bg-primary-50', text: 'text-primary-700' }
              const isHot = question.replies >= 10
              const isFeatured = (question.likes || 0) >= 5 // 简单判断精华帖
              const isOwner = session?.user?.id && question.askerId === session.user.id // 判断是否是问题的发布者
              
              return (
                <div
                  key={question.id}
                  className="bg-white/95 backdrop-blur-[14px] rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,0.14)] hover:shadow-[0_28px_70px_rgba(15,23,42,0.2)] hover:-translate-y-[6px] transition-all duration-300 p-7 cursor-pointer border border-white/70"
                  style={{
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                  }}
                  onClick={() => window.location.href = `/forum/${question.id}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {isFeatured && (
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-yellow-500 text-lg">⭐</span>
                      </div>
                    )}
                    <Link href={`/forum/${question.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <h2 className="text-xl font-bold text-gray-800 mb-3 hover:text-primary-600 transition-colors leading-tight">
                        {question.title}
                      </h2>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-0 leading-relaxed">
                        {question.content}
                      </p>
                    </Link>
                  </div>
                  
                  {/* 底部信息行：浅底背景，强化层级 */}
                  <div className="mt-4 rounded-xl bg-slate-50/80 px-4 py-3 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center flex-wrap gap-4">
                      <div className="flex items-center">
                        {question.isAnonymous || !question.askerId ? (
                          <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold mr-2`}>
                            {(question.isAnonymous ? '匿' : question.asker).charAt(0)}
                          </div>
                        ) : (
                          <Link href={`/users/${question.askerId}`} className="hover:opacity-80 transition-opacity">
                            <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold mr-2 cursor-pointer`}>
                              {question.asker.charAt(0)}
                            </div>
                          </Link>
                        )}
                        {question.isAnonymous || !question.askerId ? (
                          <span>{question.isAnonymous ? '匿名用户' : question.asker}</span>
                        ) : (
                          <Link href={`/users/${question.askerId}`} className="hover:text-primary-600 transition-colors">
                            {question.asker}
                          </Link>
                        )}
                      </div>
                      {question.category && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs">
                          {question.category}
                        </span>
                      )}
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{formatRelativeTime(question.date)}</span>
                      </div>
                      {university && (
                        <Link
                          href={`/universities/${university.id}/forum`}
                          className={`${universityColor.bg} ${universityColor.text} px-2.5 py-1 rounded-md hover:opacity-80 transition-opacity`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {university.name}
                        </Link>
                      )}
                      <div className={`flex items-center px-2.5 py-1 rounded-md ${isHot ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isHot && <Flame className="w-3.5 h-3.5 mr-1" />}
                        <MessageCircle className={`w-3.5 h-3.5 ${!isHot ? 'mr-1' : ''}`} />
                        <span className="font-medium">{question.replies} 条回复</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <button
                          onClick={(e) => handleDelete(question.id, e)}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600"
                          title="删除问题"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
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
                </div>
              )
              })}
              
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
        </div>
      </div>
    </div>
  )
}


