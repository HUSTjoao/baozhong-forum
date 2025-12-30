'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GraduationCap, MessageCircle, Users, BookOpen, Heart, Send } from 'lucide-react'
import { getAllUniversities } from '@/data/universities'
import { getAllAlumniMessages } from '@/data/users'

type StarRainItem = {
  id: number
  left: number
  delay: number
  kind: 'star' | 'text'
  text?: string
  symbol?: string
}

export default function Home() {
  const [daysUntilGaokao, setDaysUntilGaokao] = useState(0)
  const [previewMessage, setPreviewMessage] = useState('')
  const [previewAuthor, setPreviewAuthor] = useState('')
  const [alumniMessages, setAlumniMessages] = useState<{ message: string; author: string }[]>([])
  const [currentAlumniIndex, setCurrentAlumniIndex] = useState(0)
  const [starRainItems, setStarRainItems] = useState<StarRainItem[]>([])

  useEffect(() => {
    // 计算距离高考还有多少天（高考通常在6月7日）
    const calculateDaysUntilGaokao = () => {
      const now = new Date()
      const currentYear = now.getFullYear()
      
      // 高考日期：6月7日
      let gaokaoDate = new Date(currentYear, 5, 7) // 月份从0开始，所以5表示6月
      
      // 如果今年的高考已经过了，计算明年的
      if (now > gaokaoDate) {
        gaokaoDate = new Date(currentYear + 1, 5, 7)
      }
      
      // 计算天数差
      const timeDiff = gaokaoDate.getTime() - now.getTime()
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      
      setDaysUntilGaokao(daysDiff > 0 ? daysDiff : 0)
    }
    
    calculateDaysUntilGaokao()
    // 每天更新一次
    const interval = setInterval(calculateDaysUntilGaokao, 1000 * 60 * 60 * 24)
    
    return () => clearInterval(interval)
  }, [])

  // 获取寄语预览
  useEffect(() => {
    const loadPreviewMessage = () => {
      try {
        const allMessages = getAllAlumniMessages()
        
        if (allMessages.length > 0) {
          // 按照实际寄语数据整理出轮播列表
          const formatted = allMessages.map((msg) => {
            const content = msg.content || ''
            const shortMessage =
              content.length > 50 ? content.substring(0, 50) + '...' : content
            const authorName =
              msg.user.nickname || msg.user.name || msg.user.username || '学长/学姐'

            return {
              message: shortMessage,
              author: `—— 来自${authorName}`,
            }
          })

          setAlumniMessages(formatted)
          // 初始显示第一条
          setPreviewMessage(formatted[0].message)
          setPreviewAuthor(formatted[0].author)
        } else {
          // 没有寄语时的占位文案
          setPreviewMessage('学长学姐还没有留下寄语，欢迎第一位来点亮这里 ✨')
          setPreviewAuthor('')
        }
      } catch (error) {
        console.error('Error loading preview message:', error)
      }
    }
    
    loadPreviewMessage()
  }, [])

  // 学长学姐寄语轮播
  useEffect(() => {
    if (alumniMessages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentAlumniIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % alumniMessages.length
        const next = alumniMessages[nextIndex]
        setPreviewMessage(next.message)
        setPreviewAuthor(next.author)
        return nextIndex
      })
    }, 6000) // 每 6 秒切换一条

    return () => clearInterval(interval)
  }, [alumniMessages])

  // 星星雨自动清理
  useEffect(() => {
    if (starRainItems.length === 0) return
    const timer = setTimeout(() => {
      setStarRainItems([])
    }, 4500)
    return () => clearTimeout(timer)
  }, [starRainItems])

  const triggerStarRain = () => {
    // 防抖：当前星星雨仍在播放时不重复触发
    if (starRainItems.length > 0) return

    const items: StarRainItem[] = []
    const messages = [
      '加油，宝中人',
      '清华见',
      '北大见',
      '未来可期',
      '心怀山海',
      '一步一脚印',
      '星光不负赶路人',
    ]
    const symbols = ['★', '❤', '👍', '✨']

    // 星星 / 爱心 / 大拇指 等小图标
    for (let i = 0; i < 20; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      items.push({
        id: i,
        left: 5 + Math.random() * 90,
        delay: Math.random() * 1.8,
        kind: 'star',
        symbol,
      })
    }

    // 励志短句
    messages.forEach((text, index) => {
      items.push({
        id: 100 + index,
        left: 10 + Math.random() * 80,
        delay: 1 + index * 0.35,
        kind: 'text',
        text,
      })
    })

    setStarRainItems(items)
  }

  return (
    <div className="flex flex-col">
      {/* 鼠标悬停触发的星星雨效果 */}
      {starRainItems.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {starRainItems.map((item) => (
            <div
              key={item.id}
              className="star-rain-item"
              style={{
                left: `${item.left}%`,
                animationDelay: `${item.delay}s`,
              }}
            >
              {item.kind === 'star' ? (
                <span className="text-amber-300 text-xl md:text-2xl drop-shadow-[0_0_16px_rgba(251,191,36,0.9)]">
                  {item.symbol || '★'}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-white/85 text-xs md:text-sm text-primary-700 font-semibold shadow-md whitespace-nowrap">
                  {item.text}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-24 px-4 overflow-hidden">
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文案 */}
            <div className="text-left">
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl font-black mb-12 drop-shadow-lg"
                style={{
                  lineHeight: '1.15',
                  letterSpacing: '-0.02em'
                }}
              >
                宝鸡中学<br />
                高校论坛
              </h1>
              <p className="text-sm md:text-base mb-3 text-white/80 font-normal leading-relaxed">
                连接宝鸡中学学子与各大学学长学姐的桥梁
              </p>
              <p className="text-xs md:text-sm mb-10 text-white/80 font-normal leading-relaxed">
                了解大学信息，获取专业建议，为你的未来选择做好准备
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/universities"
                  className="bg-transparent border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  浏览大学
                </Link>
                <Link
                  href="/majors"
                  className="bg-transparent border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
                >
                  浏览专业
                </Link>
                <Link
                  href="/forum"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  进入论坛
                </Link>
              </div>
            </div>
            
            {/* 右侧3D教育场景 */}
            <div className="hidden lg:flex relative items-center justify-center min-h-[500px]">
              <div className="relative w-full max-w-lg h-[500px]">
                {/* 3D书本 - 浮空效果 */}
                <div className="absolute left-1/4 top-1/3 transform -translate-x-1/2 -translate-y-1/2 animate-float-slow">
                  <div className="relative w-36 h-28" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-15deg) rotateX(5deg)' }}>
                    {/* 书封面 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-lg shadow-2xl border-2 border-amber-300/50" style={{ transform: 'translateZ(8px)' }}>
                      <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-md"></div>
                      <div className="absolute top-4 left-4 right-4 h-1.5 bg-white/60 rounded"></div>
                      <div className="absolute top-6 left-4 right-4 h-0.5 bg-white/40 rounded"></div>
                      <div className="absolute top-8 left-4 right-4 h-0.5 bg-white/40 rounded"></div>
                    </div>
                    {/* 书页厚度 */}
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-amber-600/80 to-amber-500/60 rounded-l" style={{ transform: 'rotateY(-90deg) translateZ(-18px)' }}></div>
                  </div>
                </div>

                {/* 学位帽 - 浮空旋转 */}
                <div className="absolute right-1/4 top-1/4 transform -translate-x-1/2 -translate-y-1/2 animate-float">
                  <div className="relative w-24 h-24" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(20deg)' }}>
                    {/* 帽顶 */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-t-full shadow-2xl" style={{ transform: 'translateZ(0px)' }}>
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg"></div>
                    </div>
                    {/* 帽檐 */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-8 bg-gradient-to-b from-gray-800 to-gray-700 rounded-full shadow-xl" style={{ transform: 'translateY(4px)' }}></div>
                  </div>
                </div>

                {/* 对话气泡1 - 右上角 */}
                <div className="absolute right-0 top-20 animate-bubble-1">
                  <div className="relative bg-gradient-to-br from-white to-amber-50/80 rounded-2xl px-5 py-4 shadow-2xl border-2 border-amber-300/80 backdrop-blur-sm">
                    <div className="text-base font-bold text-gray-800">加油！💪</div>
                    <div className="absolute -bottom-2 right-8 w-5 h-5 bg-white border-r-2 border-b-2 border-amber-300/80 transform rotate-45"></div>
                  </div>
                </div>

                {/* 对话气泡2 - 左上角 */}
                <div className="absolute left-0 top-32 animate-bubble-2">
                  <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl px-5 py-4 shadow-2xl border-2 border-orange-400/80 backdrop-blur-sm">
                    <div className="text-base font-bold text-orange-900">一起努力！🚀</div>
                    <div className="absolute -bottom-2 left-8 w-5 h-5 bg-amber-100 border-l-2 border-b-2 border-orange-400/80 transform rotate-45"></div>
                  </div>
                </div>

                {/* 对话气泡3 - 右下角 */}
                <div className="absolute right-8 bottom-32 animate-bubble-3">
                  <div className="relative bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl px-5 py-4 shadow-2xl border-2 border-yellow-400/80 backdrop-blur-sm">
                    <div className="text-base font-bold text-yellow-900">未来可期✨</div>
                    <div className="absolute -bottom-2 right-10 w-5 h-5 bg-yellow-100 border-r-2 border-b-2 border-yellow-400/80 transform rotate-45"></div>
                  </div>
                </div>

                {/* 星星装饰 - 更大更明显 */}
                <div className="absolute top-16 left-1/3 text-4xl text-yellow-300 drop-shadow-lg animate-twinkle" style={{ textShadow: '0 0 10px rgba(251, 191, 36, 0.8)' }}>✦</div>
                <div className="absolute bottom-24 right-1/4 text-4xl text-amber-300 drop-shadow-lg animate-twinkle" style={{ animationDelay: '1s', textShadow: '0 0 10px rgba(245, 158, 11, 0.8)' }}>✦</div>
                <div className="absolute top-40 right-1/3 text-3xl text-orange-300 drop-shadow-lg animate-twinkle" style={{ animationDelay: '0.5s', textShadow: '0 0 10px rgba(251, 146, 60, 0.8)' }}>⭐</div>

                {/* 装饰性光晕 - 暖色调增强 */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-amber-400/50 to-orange-400/40 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-orange-400/50 to-amber-400/40 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-400/35 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部动态标语 */}
        <div className="mt-10 flex justify-center relative z-10">
          {/* 渐变炫酷背景光带 */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-8 h-40">
            <div className="mx-auto h-full w-3/4 max-w-3xl rounded-full bg-gradient-to-r from-sky-400/35 via-emerald-300/25 to-amber-300/40 blur-3xl opacity-80" />
          </div>
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-[0_0_30px_rgba(251,191,36,0.55)] animate-pulse cursor-pointer"
              onMouseEnter={triggerStarRain}
            >
              <span className="text-amber-200 text-lg">✦</span>
              <span className="bg-gradient-to-r from-amber-100 via-yellow-50 to-sky-100 bg-clip-text text-transparent font-semibold tracking-[0.15em] text-xs md:text-sm uppercase">
                在这里，遇到未来的自己
              </span>
              <span className="text-amber-200 text-lg">✦</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            平台特色
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-7 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] transition-all duration-300 cursor-pointer group">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 bg-primary-600/5 rounded-full"></div>
                <GraduationCap className="w-12 h-12 text-primary-600 relative z-10 transition-colors duration-300 group-hover:text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">大学介绍</h3>
              <p className="text-gray-600">
                详细了解各大学的专业设置、校园环境、校训校徽、就业前景等信息
              </p>
            </div>
            <div className="bg-white p-7 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] transition-all duration-300 cursor-pointer group">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 bg-primary-600/5 rounded-full"></div>
                <BookOpen className="w-12 h-12 text-primary-600 relative z-10 transition-colors duration-300 group-hover:text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">浏览专业</h3>
              <p className="text-gray-600">
                按理工文分类查看热门专业，了解课程设置、适合人群、就业方向及强势院校
              </p>
            </div>
            <div className="bg-white p-7 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] transition-all duration-300 cursor-pointer group">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 bg-primary-600/5 rounded-full"></div>
                <MessageCircle className="w-12 h-12 text-primary-600 relative z-10 transition-colors duration-300 group-hover:text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">在线答疑</h3>
              <p className="text-gray-600">
                在总论坛与各大学、各专业的学长学姐交流，获得第一手经验和建议
              </p>
            </div>
            <div className="bg-white p-7 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] transition-all duration-300 cursor-pointer group">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 bg-primary-600/5 rounded-full"></div>
                <Users className="w-12 h-12 text-primary-600 relative z-10 transition-colors duration-300 group-hover:text-primary-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">社区交流</h3>
              <p className="text-gray-600">
                通过学校论坛与专业论坛，与同校同专业的同学和学长学姐建立长期联系
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 学长学姐寄语预览 */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] relative overflow-hidden">
        {/* 噪点纹理背景 */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧文字引导 - 非对称布局 */}
            <div className="text-left">
              {/* 引号图标 */}
              <div className="text-6xl md:text-7xl text-primary-300/50 font-serif mb-2 leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                "
              </div>
              
              {/* 主标题 - 深藏青色，字号2rem */}
              <h2 className="text-4xl font-bold mb-4" style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 700 }}>
                学长学姐寄语
              </h2>
              
              {/* 副标题 - 颜色调淡，字间距放大 */}
              <p className="text-lg mb-8" style={{ color: '#64748B', letterSpacing: '0.05em', lineHeight: '1.6' }}>
                来自学长学姐的温暖话语，为你的求学之路点亮明灯
              </p>
              
              {/* 寄语预览 - 毛玻璃磨砂效果 */}
              <div className="bg-white/70 backdrop-blur-[10px] rounded-xl p-6 border border-white/50 shadow-lg mb-6">
                <p className="text-gray-700 leading-relaxed italic text-base">
                  "{previewMessage}"
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  {previewAuthor}
                </p>
              </div>
              
              {/* 胶囊按钮 - 幽灵特效，全圆角50px */}
              <Link 
                href="/messages"
                className="inline-flex items-center gap-2 bg-white border-2 border-primary-500 text-primary-600 px-8 py-4 rounded-[50px] font-semibold hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-300 shadow-md hover:shadow-xl group"
              >
                <span>查看全部寄语</span>
                <span className="inline-block group-hover:translate-x-[2px] transition-transform duration-300">→</span>
              </Link>
            </div>
            
            {/* 右侧：视觉装饰元素 - 光斑、线描图标、卡片堆叠 */}
            <div className="hidden lg:block relative h-full min-h-[400px]">
              {/* 3. 抽象光斑/流体效果 - Mesh Gradient */}
              <div 
                className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] opacity-60"
                style={{
                  background: `
                    radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.25) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(96, 165, 250, 0.2) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(147, 197, 253, 0.15) 0%, transparent 60%)
                  `,
                  filter: 'blur(80px)',
                }}
              />
              
              {/* 4. 情感化线描图标 - 纸飞机（1px线条，不闭合） */}
              <div className="absolute right-24 top-1/2 transform -translate-y-1/2 z-10">
                <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-400/50">
                  {/* 纸飞机 - 极细线条1px，手绘风格，线条不闭合 */}
                  <path 
                    d="M70 30 L25 70 L70 95" 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                    className="animate-float-slow"
                  />
                  <path 
                    d="M70 30 L115 70 L70 95" 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="none"
                    className="animate-float-slow"
                  />
                  {/* 底部线条 - 不闭合，形成开放的形状 */}
                  <path 
                    d="M25 70 L115 70" 
                    stroke="currentColor" 
                    strokeWidth="1" 
                    strokeLinecap="round"
                    fill="none"
                    className="animate-float-slow"
                  />
                </svg>
              </div>
              
              {/* 5. 卡片堆叠效果 - 2-3个错落叠放的半透明方块 */}
              <div className="absolute right-16 top-20 w-48 h-56 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg transform rotate-3"></div>
              <div className="absolute right-24 top-28 w-48 h-56 bg-white/25 backdrop-blur-sm rounded-2xl border border-white/30 shadow-md transform -rotate-2"></div>
              <div className="absolute right-20 top-36 w-48 h-56 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm transform rotate-1"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section - 重构后的居中布局 */}
      <section className="py-20 px-4 relative overflow-hidden min-h-[600px] flex items-center justify-center" style={{
        background: 'radial-gradient(circle at center, rgba(30, 64, 175, 0.95) 0%, rgba(15, 23, 42, 0.98) 70%, rgba(15, 23, 42, 1) 100%)'
      }}>
        {/* 背景装饰 - 放大的纸飞机图标作为背景纹理（透明度极低） */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.05 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white" preserveAspectRatio="xMidYMid meet">
            {/* 纸飞机主体 - 放大并作为背景纹理 */}
            <path 
              d="M400 150 L150 500 L400 575" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
              strokeDasharray="20,10"
            />
            <path 
              d="M400 150 L650 500 L400 575" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
              strokeDasharray="20,10"
            />
            <path 
              d="M150 500 L350 500" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
              strokeDasharray="15,15"
            />
            <path 
              d="M450 500 L650 500" 
              stroke="currentColor" 
              strokeWidth="3" 
              strokeLinecap="round"
              fill="none"
              strokeDasharray="15,15"
            />
          </svg>
        </div>

        {/* 背景渐变光斑 - 极光效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: `
                radial-gradient(ellipse at 30% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 70% 60%, rgba(96, 165, 250, 0.25) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(147, 197, 253, 0.2) 0%, transparent 60%)
              `,
              filter: 'blur(100px)',
              animation: 'pulse-slow 8s ease-in-out infinite'
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="flex flex-col items-center justify-center min-h-[500px] space-y-8">
            {/* 上方提示文字 */}
            <div className="text-white/70 text-lg md:text-xl font-normal text-center">
              距离高考还有
            </div>

            {/* 倒计时卡片 - 玻璃拟态效果 */}
            <div 
              className="relative bg-white/15 backdrop-blur-[20px] rounded-3xl p-12 md:p-16 lg:p-20 shadow-2xl w-full max-w-lg"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* 数字 - 带外发光效果 */}
              <div className="relative flex items-baseline justify-center">
                <div 
                  className="text-8xl md:text-9xl lg:text-[12rem] font-black text-white text-center relative"
                  style={{
                    lineHeight: '1',
                    textShadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 0 60px rgba(251, 191, 36, 0.3), 0 0 90px rgba(251, 191, 36, 0.1)',
                    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.4))'
                  }}
                >
                  {daysUntilGaokao}
                </div>
                {/* "天"字 - 放在右下角 */}
                <span 
                  className="text-2xl md:text-3xl lg:text-4xl font-medium text-white/80 ml-2"
                  style={{ alignSelf: 'flex-end', paddingBottom: '0.15em' }}
                >
                  天
                </span>
              </div>
            </div>

            {/* 高考加油文字 - 卡片下方 */}
            <div className="relative flex flex-col items-center space-y-3 mt-4">
              {/* 极细的横线装饰 */}
              <div className="flex items-center w-full max-w-md">
                <div className="flex-1 h-px bg-white/20"></div>
                {/* 文字渐变 - 金黄色到亮橙色 */}
                <p
                  className="px-6 text-3xl md:text-4xl lg:text-5xl font-black relative z-10"
                  style={{
                    fontFamily: '"Microsoft YaHei", "PingFang SC", "SimHei", sans-serif',
                    fontWeight: 900,
                    letterSpacing: '0.15em',
                    background: 'linear-gradient(to right, #fbbf24, #fb923c, #f59e0b, #fb923c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 4px 20px rgba(251, 191, 36, 0.6))'
                  }}
                >
                  高考加油！
                </p>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>
            </div>

            {/* 底部感性文字 - 极小字号，淡化处理 */}
            <div className="mt-12 text-center">
              <p className="text-white/30 text-xs md:text-sm leading-relaxed max-w-2xl mx-auto" style={{ letterSpacing: '0.05em' }}>
                宝中的你们向往着大学的我们<br />
                大学的我们怀念着宝中的你们
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}




