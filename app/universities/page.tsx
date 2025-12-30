'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MapPin, Users, Book, Search, Filter, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAllUniversities, type University } from '@/data/universities'
import { ALL_PROVINCES_CITIES, getAllProvinces, getCitiesByProvince } from '@/data/provinces-cities'
import { getUniversityForumUserCount } from '@/data/questions'

export default function UniversitiesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedProvince, setSelectedProvince] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [allUniversities, setAllUniversities] = useState<University[]>([])
  const [logoErrors, setLogoErrors] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // 加载所有大学（包括用户添加的）
  const loadUniversities = () => {
    setAllUniversities(getAllUniversities())
  }

  useEffect(() => {
    loadUniversities()
    
    // 监听页面焦点，当从添加页面返回时刷新数据
    const handleFocus = () => {
      loadUniversities()
    }
    
    // 监听localStorage变化（跨标签页）
    const handleStorage = () => {
      loadUniversities()
    }
    
    // 监听自定义事件（同标签页）
    const handleUniversitiesUpdated = () => {
      loadUniversities()
    }
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('storage', handleStorage)
    window.addEventListener('universitiesUpdated', handleUniversitiesUpdated)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('universitiesUpdated', handleUniversitiesUpdated)
    }
  }, [])

  // 获取所有省份（使用完整的省份列表）
  const provinces = getAllProvinces()

  // 根据选中的省份获取对应的城市
  const cities = selectedProvince === 'all' 
    ? Array.from(new Set(
        allUniversities
          .map(u => u.city || '')
          .filter(c => c)
      )).sort()
    : getCitiesByProvince(selectedProvince)

  // 当省份改变时，重置城市选择
  useEffect(() => {
    if (selectedProvince === 'all') {
      setSelectedCity('all')
    }
  }, [selectedProvince])

  // 筛选大学
  const filteredUniversities = allUniversities.filter((university) => {
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      university.name.toLowerCase().includes(query) ||
      university.location.toLowerCase().includes(query) ||
      university.description.toLowerCase().includes(query) ||
      university.majors.some((major) => major.toLowerCase().includes(query))

    const matchesLevel =
      selectedLevel === 'all' ||
      university.level.toLowerCase().includes(selectedLevel.toLowerCase())

    // 省份匹配：优先用解析出的 province，解析失败时回退到 location 字符串包含判断
    const matchesProvince =
      selectedProvince === 'all' ||
      (university.province && university.province === selectedProvince) ||
      university.location.includes(selectedProvince)

    // 城市匹配：优先用解析出的 city，解析失败时回退到 location 字符串包含判断
    const matchesCity =
      selectedCity === 'all' ||
      (university.city && university.city === selectedCity) ||
      university.location.includes(selectedCity)

    return matchesSearch && matchesLevel && matchesProvince && matchesCity
  })

  // 分页计算
  const totalPages = Math.ceil(filteredUniversities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedUniversities = filteredUniversities.slice(startIndex, endIndex)

  // 当筛选条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedLevel, selectedProvince, selectedCity])

  // 翻页时滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // 等级选项
  const levelOptions = [
    { value: 'all', label: '全部等级' },
    { value: '985/211', label: '985/211' },
    { value: '985', label: '985' },
    { value: '211/双一流', label: '211/双一流' },
    { value: '211', label: '211' },
    { value: '双一流', label: '双一流' },
    { value: '省重点', label: '省重点' },
    { value: '一本', label: '一本' },
    { value: '二本', label: '二本' },
    { value: '中外合作', label: '中外合作' },
    { value: '其他', label: '其他' },
  ]

  // 热门搜索标签
  const hotSearches = ['清华大学', '复旦大学', '西安交大']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative overflow-hidden">
      {/* 方案4：几何分割 - 巨大半透明圆形/多边形色块 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 左上角 - 巨大半透明圆形 */}
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.15] blur-[80px]"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
          }}
        />
        {/* 右下角 - 不规则多边形（使用圆形模拟不规则形状） */}
        <div 
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] opacity-[0.12] blur-[90px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(147, 51, 234, 0.25) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 80%)',
            borderRadius: '40% 60% 70% 30% / 60% 30% 70% 40%',
          }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* 标题区（第二层） */}
        <div className="pt-10 pb-6">
          <h1 className="text-5xl font-bold text-gray-800 mb-4" style={{ fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            探索你的理想院校
          </h1>
          <p className="text-lg text-gray-600" style={{ fontWeight: 400, color: 'rgba(0,0,0,0.45)' }}>
            从这里开始，跨越距离，预见未来的大学生活
          </p>
        </div>

        {/* 操作层（第三层） - 玻璃拟态效果 */}
        <div 
          className="bg-white/80 backdrop-blur-[10px] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] p-7 mb-8 border border-white/50"
          style={{
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
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
              href="/universities/add"
              className="inline-flex items-center bg-gradient-to-r from-primary-600 to-blue-500 text-white px-6 py-4 rounded-[50px] font-semibold hover:from-primary-700 hover:to-blue-600 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加大学
            </Link>
          </div>

          {/* 热门搜索 */}
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>

        {/* 筛选器 - 视觉降权 */}
        <div className="mb-8 px-2">
          {/* 等级筛选 */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {levelOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedLevel(option.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedLevel === option.value
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

          {/* 地区筛选 - 省-市二级 */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-500">省份：</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedProvince('all')
                    setSelectedCity('all')
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    selectedProvince === 'all'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  全部省份
                </button>
                {provinces.map((province) => (
                  <button
                    key={province}
                    onClick={() => {
                      setSelectedProvince(province)
                      setSelectedCity('all')
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedProvince === province
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {province}
                  </button>
                ))}
              </div>
            </div>
            {selectedProvince !== 'all' && (
              <div className="flex items-center gap-3 ml-8">
                <span className="text-sm text-gray-500">城市：</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCity('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      selectedCity === 'all'
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    全部城市
                  </button>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => setSelectedCity(city)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        selectedCity === city
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 结果统计 */}
          <div className="mt-6 text-sm text-gray-600">
            找到 <span className="font-semibold text-primary-600">{filteredUniversities.length}</span> 所大学
            {filteredUniversities.length > itemsPerPage && (
              <span className="ml-2 text-gray-500">
                （第 {currentPage}/{totalPages} 页）
              </span>
            )}
          </div>
        </div>

        {/* 大学列表 */}
        {filteredUniversities.length === 0 ? (
          <div 
            className="bg-white/80 backdrop-blur-[10px] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] p-12 text-center border border-white/50"
            style={{
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">没有找到匹配的大学</p>
            <p className="text-gray-500 text-sm mt-2">请尝试调整搜索条件</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedUniversities.map((university) => (
                <Link
                  key={university.id}
                  href={`/universities/${university.id}`}
                  className="bg-white/80 backdrop-blur-[10px] rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] transition-all duration-300 p-7 block group border border-white/50"
                  style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
              <div className="flex items-start gap-3 mb-4">
                {university.logoUrl && !logoErrors.has(university.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={university.logoUrl}
                    alt={`${university.name} 校徽`}
                    className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white p-1 flex-shrink-0"
                    onError={() => setLogoErrors(prev => new Set(prev).add(university.id))}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-700 font-bold text-base border border-primary-100 flex-shrink-0">
                    {university.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-800 flex-1 truncate">
                      {university.name}
                    </h2>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                      {university.level}
                    </span>
                  </div>
                  {university.isUserAdded && (
                    <span className="inline-block text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                      用户添加
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm">{university.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <Users className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <span className="text-sm">
                    <span className="font-bold text-primary-600">{getUniversityForumUserCount(university.id)}</span> 名用户进入论坛
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <Book className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                  <span className="text-sm">
                    <span className="font-bold text-primary-600">{university.majors.length}</span> 个热门专业
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {university.description}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="inline-flex items-center bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium text-sm group-hover:bg-primary-100 transition-colors duration-200">
                  <span>查看详情</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
                </Link>
              ))}
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
                        // 如果总页数不超过10页，显示所有页码
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // 如果总页数超过10页
                        if (currentPage <= 6) {
                          // 当前页靠前，显示前10页
                          for (let i = 1; i <= maxVisiblePages; i++) {
                            pages.push(i)
                          }
                          pages.push('...')
                          pages.push(totalPages)
                        } else if (currentPage >= totalPages - 5) {
                          // 当前页靠后，显示后10页
                          pages.push(1)
                          pages.push('...')
                          for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // 当前页在中间，显示当前页前后各5页
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

