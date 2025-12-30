'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { BookOpen, Flame, Filter, Plus, Search, Building2, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllMajors, addUserMajor, type Major, type MajorCategory } from '@/data/majors'
import { getAllUniversities, type University as Uni } from '@/data/universities'
import { AlertDialog } from '@/components/Dialog'
import { getUserById } from '@/data/users'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: 'dot' | 'line'
}

export default function MajorsPage() {
  const [majors, setMajors] = useState<Major[]>([])
  const [universities, setUniversities] = useState<Uni[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState<'all' | MajorCategory>('all')
  const [adding, setAdding] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [newMajor, setNewMajor] = useState<{
    name: string
    category: MajorCategory
    description: string
    strongUniversities: string[]
  }>({
    name: '',
    category: 'science',
    description: '',
    strongUniversities: [],
  })
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [alertConfig, setAlertConfig] = useState<{ title: string; message?: string } | null>(
    null
  )
  const { data: session } = useSession()

  useEffect(() => {
    setMajors(getAllMajors().sort((a, b) => b.hotScore - a.hotScore))
    setUniversities(getAllUniversities())
    
    // 初始化粒子
    const initialParticles: Particle[] = []
    const particleCount = 50 // 粒子数量
    
    for (let i = 0; i < particleCount; i++) {
      initialParticles.push({
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
        vx: (Math.random() - 0.5) * 0.5, // 缓慢移动速度
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1, // 1-4px
        opacity: Math.random() * 0.4 + 0.2, // 0.2-0.6
        type: Math.random() > 0.7 ? 'line' : 'dot', // 70%圆点，30%线段
      })
    }
    
    setParticles(initialParticles)
  }, [])

  // 粒子动画
  useEffect(() => {
    if (particles.length === 0) return

    const animate = () => {
      setParticles((prev) =>
        prev.map((p) => {
          let { x, y, vx, vy } = p
          
          // 更新位置
          x += vx
          y += vy
          
          // 边界反弹
          const maxX = typeof window !== 'undefined' ? window.innerWidth : 1920
          const maxY = typeof window !== 'undefined' ? window.innerHeight : 1080
          
          if (x < 0) {
            x = 0
            vx *= -1
          } else if (x > maxX) {
            x = maxX
            vx *= -1
          }
          
          if (y < 0) {
            y = 0
            vy *= -1
          } else if (y > maxY) {
            y = maxY
            vy *= -1
          }
          
          // 鼠标交互：粒子会被鼠标轻微吸引（在鼠标附近时）
          if (mousePos.x > 0 && mousePos.y > 0) {
            const dx = mousePos.x - x
            const dy = mousePos.y - y
            const distance = Math.sqrt(dx * dx + dy * dy)
            const maxInteractionDistance = 150 // 影响范围
            
            if (distance > 0 && distance < maxInteractionDistance) {
              const force = (maxInteractionDistance - distance) / maxInteractionDistance * 0.02
              vx += (dx / distance) * force
              vy += (dy / distance) * force
            }
          }
          
          // 速度衰减（保持平滑）
          vx *= 0.99
          vy *= 0.99
          
          // 限制速度
          const maxSpeed = 1
          const speed = Math.sqrt(vx * vx + vy * vy)
          if (speed > maxSpeed) {
            vx = (vx / speed) * maxSpeed
            vy = (vy / speed) * maxSpeed
          }
          
          return { ...p, x, y, vx, vy }
        })
      )
    }
    
    const interval = setInterval(animate, 30) // 约30fps
    return () => clearInterval(interval)
  }, [particles.length, mousePos])

  // 监听鼠标移动和窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    
    const handleResize = () => {
      // 窗口大小变化时，调整超出边界的粒子位置
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: Math.min(p.x, window.innerWidth),
          y: Math.min(p.y, window.innerHeight),
        }))
      )
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const filtered = majors.filter((m) => {
    const matchesCategory = category === 'all' || m.category === category
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)

    return matchesCategory && matchesSearch
  })

  // 分页计算
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedMajors = filtered.slice(startIndex, endIndex)

  // 当筛选条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, category])

  // 翻页时滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const handleAddMajor = (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
      setAlertConfig({
        title: '需要登录',
        message: '请先登录后再添加自定义专业。',
      })
      return
    }
    // 禁言用户无法添加自定义专业
    if (session.user.id) {
      const me = getUserById(session.user.id)
      if (me?.isMuted) {
        setAlertConfig({
          title: '已被禁言',
          message: '你已被管理员禁言，暂时无法添加自定义专业。',
        })
        return
      }
    }

    if (!newMajor.name.trim() || !newMajor.description.trim()) {
      setAlertConfig({
        title: '提示',
        message: '请填写完整的专业名称和专业介绍',
      })
      return
    }

    const created = addUserMajor({
      name: newMajor.name.trim(),
      category: newMajor.category,
      description: newMajor.description.trim(),
      strongUniversities: newMajor.strongUniversities,
      creatorId: session.user.id,
    })

    setNewMajor({
      name: '',
      category: 'science',
      description: '',
      strongUniversities: [],
    })
    setAdding(false)
    setAlertConfig({
      title: '申请已提交',
      message: '自定义专业申请已提交，请等待管理员审核。审核通过后将正式显示在列表中。',
    })
  }

  const getCategoryLabel = (cat: MajorCategory): string => {
    switch (cat) {
      case 'science':
        return '理科'
      case 'engineering':
        return '工科'
      case 'arts':
        return '文科'
      case 'medicine':
        return '医科'
      default:
        return '其他'
    }
  }

  const getStrongUniversityNames = (ids: string[]) => {
    if (!ids.length) return '暂未收录推荐院校'
    return ids
      .map((id) => universities.find((u) => u.id === id)?.name)
      .filter(Boolean)
      .join('、')
  }

  const getStrongUniversitiesDisplay = (ids: string[]) => {
    if (!ids.length) return { displayed: [], hasMore: false }
    const names = ids
      .map((id) => universities.find((u) => u.id === id)?.name)
      .filter(Boolean) as string[]
    return {
      displayed: names.slice(0, 5),
      hasMore: names.length > 5,
      total: names.length
    }
  }

  // 热门搜索标签
  const hotSearches = ['计算机', '人工智能', '临床医学']

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      <AlertDialog
        open={!!alertConfig}
        title={alertConfig?.title || ''}
        message={alertConfig?.message}
        onClose={() => setAlertConfig(null)}
      />
      {/* 方案3：动态微粒子 - 背景粒子系统 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 粒子容器 */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.6 }}
        >
          {particles.map((p, index) => {
            if (p.type === 'dot') {
              // 圆点粒子
              return (
                <circle
                  key={index}
                  cx={p.x}
                  cy={p.y}
                  r={p.size}
                  fill="rgba(251, 146, 60, 0.4)"
                  opacity={p.opacity}
                  style={{
                    transition: 'cx 0.1s ease-out, cy 0.1s ease-out',
                  }}
                />
              )
            } else {
              // 线段粒子（小短线）
              const length = p.size * 8
              const angle = Math.atan2(p.vy, p.vx) * (180 / Math.PI)
              return (
                <line
                  key={index}
                  x1={p.x}
                  y1={p.y}
                  x2={p.x + Math.cos(angle * Math.PI / 180) * length}
                  y2={p.y + Math.sin(angle * Math.PI / 180) * length}
                  stroke="rgba(251, 146, 60, 0.3)"
                  strokeWidth={p.size * 0.5}
                  opacity={p.opacity}
                  strokeLinecap="round"
                  style={{
                    transition: 'x1 0.1s ease-out, y1 0.1s ease-out, x2 0.1s ease-out, y2 0.1s ease-out',
                  }}
                />
              )
            }
          })}
        </svg>
        
        {/* 连接线（近距离粒子之间的连线，类似神经元） */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.15 }}
        >
          {particles.map((p1, i) => {
            const connections: JSX.Element[] = []
            particles.slice(i + 1).forEach((p2, j) => {
              const dx = p2.x - p1.x
              const dy = p2.y - p1.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              // 如果粒子距离小于150px，则连线
              if (distance < 150) {
                const opacity = (1 - distance / 150) * 0.3
                connections.push(
                  <line
                    key={`${i}-${i + j + 1}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="rgba(251, 146, 60, 0.4)"
                    strokeWidth="0.5"
                    opacity={opacity}
                    style={{
                      transition: 'x1 0.1s ease-out, y1 0.1s ease-out, x2 0.1s ease-out, y2 0.1s ease-out',
                    }}
                  />
                )
              }
            })
            return connections
          }).flat()}
        </svg>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* 标题区（第二层） */}
        <div className="pt-10 pb-6">
          <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            发现你的热爱所在
          </h1>
          <p className="text-lg text-gray-600" style={{ fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>
            按学科门类深度解析，寻找最适合你的专业赛道
          </p>
        </div>

        {/* 操作层（第三层） */}
        <div className="bg-white/95 rounded-2xl border border-amber-100/70 shadow-[0_22px_55px_rgba(146,64,14,0.18)] backdrop-blur-xl p-7 mb-8">
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
            <button
              type="button"
              onClick={() => setAdding((prev) => !prev)}
              className="inline-flex items-center bg-gradient-to-r from-primary-600 to-blue-500 text-white px-6 py-4 rounded-[50px] font-semibold hover:from-primary-700 hover:to-blue-600 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              自定义专业
            </button>
          </div>

          {/* 热门搜索 */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-gray-500">热门搜索：</span>
            {hotSearches.map((tag, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(tag)}
                className="text-xs text-gray-400 hover:text-primary-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 筛选器 - 视觉降权 */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                  category === 'all'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                全部
              </button>
              <button
                type="button"
                onClick={() => setCategory('science')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                  category === 'science'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                理科
              </button>
              <button
                type="button"
                onClick={() => setCategory('engineering')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                  category === 'engineering'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                工科
              </button>
              <button
                type="button"
                onClick={() => setCategory('arts')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                  category === 'arts'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                文科
              </button>
              <button
                type="button"
                onClick={() => setCategory('medicine')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 border ${
                  category === 'medicine'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                医科
              </button>
            </div>
          </div>
        </div>

        {/* 自定义专业表单 */}
        {adding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">添加自定义专业</h2>
            <form onSubmit={handleAddMajor} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    专业名称
                  </label>
                  <input
                    type="text"
                    value={newMajor.name}
                    onChange={(e) => setNewMajor({ ...newMajor, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="例如：数据科学与大数据技术"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    学科类别
                  </label>
                  <select
                    value={newMajor.category}
                    onChange={(e) =>
                      setNewMajor({ ...newMajor, category: e.target.value as MajorCategory })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="science">理科</option>
                    <option value="engineering">工科</option>
                    <option value="arts">文科</option>
                    <option value="medicine">医科</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  专业介绍
                </label>
                <textarea
                  value={newMajor.description}
                  onChange={(e) =>
                    setNewMajor({ ...newMajor, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="可以简单介绍课程设置、适合人群、就业方向等信息，方便学弟学妹了解。"
                  required
                />
              </div>

              {/* 在该专业上较强的院校（选填，多选） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在该专业上较强的院校（选填，可多选）
                </label>
                <div className="grid md:grid-cols-3 gap-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-3 bg-gray-50">
                  {universities.map((uni) => {
                    const checked = newMajor.strongUniversities.includes(uni.id)
                    return (
                      <label
                        key={uni.id}
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={checked}
                          onChange={() => {
                            setNewMajor((prev) => {
                              const exists = prev.strongUniversities.includes(uni.id)
                              return {
                                ...prev,
                                strongUniversities: exists
                                  ? prev.strongUniversities.filter((id) => id !== uni.id)
                                  : [...prev.strongUniversities, uni.id],
                              }
                            })
                          }}
                        />
                        <span>{uni.name}</span>
                      </label>
                    )
                  })}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  可以勾选几所你认为在这个专业方面比较强的大学，方便学弟学妹参考。
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
                >
                  保存专业
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 结果统计 */}
        {filtered.length > 0 && (
          <div className="mb-6 text-sm text-gray-600">
            找到 <span className="font-semibold text-primary-600">{filtered.length}</span> 个专业
            {filtered.length > itemsPerPage && (
              <span className="ml-2 text-gray-500">
                （第 {currentPage}/{totalPages} 页）
              </span>
            )}
          </div>
        )}

        {/* 专业列表 */}
        {filtered.length === 0 ? (
          <div className="bg-white/95 rounded-2xl border border-amber-100/70 shadow-[0_22px_55px_rgba(146,64,14,0.18)] backdrop-blur-xl p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">暂时没有匹配的专业</p>
            <p className="text-gray-500 text-sm">可以尝试放宽筛选条件，或者添加一个自定义专业。</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              {paginatedMajors.map((major) => {
              const categoryColors = {
                science: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
                engineering: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
                arts: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
                medicine: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
              }
              const colors = categoryColors[major.category]
              const universitiesDisplay = getStrongUniversitiesDisplay(major.strongUniversities)
              
              return (
                <div
                  key={major.id}
                  className="relative overflow-hidden bg-white/95 rounded-2xl border border-amber-50 shadow-[0_22px_55px_rgba(146,64,14,0.18)] hover:shadow-[0_26px_65px_rgba(146,64,14,0.25)] hover:-translate-y-[6px] transition-all duration-300 p-7 flex flex-col h-full backdrop-blur-xl"
                >
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-800 flex-1">
                        {major.name}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border} ml-2 flex-shrink-0`}>
                        {getCategoryLabel(major.category)}
                      </span>
                    </div>
                    {major.isUserAdded && (
                      <span className="inline-block px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs mb-2">
                        用户添加
                      </span>
                    )}
                    
                    {/* 热度指数可视化 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600 flex items-center">
                          <Flame className="w-3.5 h-3.5 mr-1 text-orange-500" />
                          热度指数
                        </span>
                        <span className="text-xs font-bold text-orange-600">{major.hotScore}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-300"
                          style={{ width: `${major.hotScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3" style={{ lineHeight: '1.8' }}>
                    {major.description}
                  </p>

                  <div className="mt-auto">
                    <div className="mb-4">
                      <div className="flex items-center text-sm font-semibold text-gray-800 mb-2">
                        <Building2 className="w-4 h-4 mr-1 text-primary-600" />
                        在该专业上较强的院校
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {universitiesDisplay.displayed.map((name, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                          >
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-1.5"></span>
                            {name}
                          </span>
                        ))}
                        {universitiesDisplay.hasMore && (
                          <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                            + {universitiesDisplay.total - 5} 更多
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 border-t flex justify-between items-center gap-4">
                      <span className="text-xs text-[#999] flex-shrink-0">
                        提示：点击下方进入该专业的讨论专区
                      </span>
                      <Link
                        href={`/majors/${major.id}/forum`}
                        className="inline-flex items-center text-sm bg-gradient-to-r from-primary-600 to-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-primary-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4 mr-1.5" />
                        进入专业论坛
                      </Link>
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
      </div>
    </div>
  )
}




