'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { GraduationCap, User, LogOut, Home, Building2, BookOpen, MessageCircle, Heart, Shield } from 'lucide-react'
import { getUserById } from '@/data/users'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // 如果是管理员相关页面，不显示通用导航栏
  if (pathname?.startsWith('/admin')) {
    return null
  }

  // 始终从最新的用户数据中读取头像 / 昵称，避免资料编辑后导航栏不更新
  const latestUser =
    typeof window !== 'undefined' && session?.user?.id
      ? getUserById(session.user.id)
      : undefined

  const navItems = [
    { href: '/', label: '首页', icon: Home },
    { href: '/universities', label: '大学介绍', icon: Building2 },
    { href: '/majors', label: '浏览专业', icon: BookOpen },
    { href: '/forum', label: '问答论坛', icon: MessageCircle },
    { href: '/messages', label: '学长寄语', icon: Heart },
  ]

  const handleSignOutClick = () => {
    // 打开自定义退出登录确认弹窗
    setShowLogoutModal(true)
  }

  const handleConfirmSignOut = async () => {
    await signOut({ callbackUrl: '/' })
    setShowLogoutModal(false)
  }

  const handleCancelSignOut = () => {
    setShowLogoutModal(false)
  }

  return (
    <>
    <nav className="bg-white/80 backdrop-blur-[10px] sticky top-0 z-50" style={{ 
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-3 group">
            {/* 宝鸡中学校徽 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Baoji_Middle_School_Logo.jpg"
              alt="宝鸡中学校徽"
              className="h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                // 如果图片加载失败，隐藏图片
                const img = e.currentTarget as HTMLImageElement
                img.style.display = 'none'
              }}
            />
            <span className="text-2xl font-medium" style={{ color: '#2d3436', letterSpacing: '-0.01em' }}>
              宝鸡中学高校论坛
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-5 py-2.5 text-base font-normal transition-all duration-300 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-600 hover:text-primary-600'
                  } group`}
                  style={{ letterSpacing: '0.01em' }}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className={`transform transition-transform duration-300 ${!isActive ? 'group-hover:-translate-y-0.5' : ''}`}>
                    {item.label}
                  </span>
                  {/* 激活态底部横线 */}
                  {isActive && (
                    <span 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full"
                      style={{ 
                        backgroundColor: '#005BAC',
                        height: '3px'
                      }}
                    />
                  )}
                </Link>
              )
            })}
            
            {/* 仅管理员可见：后台入口 */}
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full border ${
                  pathname?.startsWith('/admin')
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-primary-600 border-primary-200 hover:bg-primary-50'
                } transition-all duration-300 ml-2`}
              >
                <Shield className="w-4 h-4" strokeWidth={1.7} />
                <span>管理员</span>
              </Link>
            )}
            
            {status === 'loading' ? (
              <div className="text-gray-500 text-sm font-normal">加载中...</div>
            ) : session ? (
              <div className="flex items-center space-x-4 ml-4">
                <Link 
                  href={`/users/${session.user?.id}`} 
                  className="flex items-center space-x-2 text-gray-700 hover:opacity-80 transition-all duration-200 hover:scale-105"
                >
                  {latestUser?.avatarUrl || session.user?.avatarUrl ? (
                    // 头像（优先使用最新资料中的头像）
                    <img
                      src={latestUser?.avatarUrl || session.user.avatarUrl!}
                      alt={
                        latestUser?.nickname ||
                        latestUser?.name ||
                        session.user.nickname ||
                        session.user.name
                      }
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-200 hover:border-primary-400 transition-all duration-200 cursor-pointer shadow-sm"
                    />
                  ) : (
                    // 默认头像（首字母圆形）
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-base font-semibold border-2 border-primary-200 hover:border-primary-400 transition-all duration-200 cursor-pointer shadow-sm">
                      {(
                        latestUser?.nickname ||
                        latestUser?.name ||
                        session.user?.nickname ||
                        session.user?.name ||
                        'U'
                      ).charAt(0)}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleSignOutClick}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 transition-all duration-200 text-base font-normal group"
                  style={{ letterSpacing: '0.01em' }}
                >
                  <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                  <span>退出登录</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-4 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-base font-medium hover:bg-primary-700 transition-all duration-200 hover:shadow-md hover:scale-105 transform"
                style={{ letterSpacing: '0.01em' }}
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* 自定义退出登录确认弹窗 */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-[90%] px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            确认退出登录
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            确定要退出当前账号吗？
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelSignOut}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirmSignOut}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              确定退出
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

