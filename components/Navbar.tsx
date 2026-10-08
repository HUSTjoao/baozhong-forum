'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { getUserById } from '@/data/users'
import SiteSearch from './SiteSearch'

const navItems = [
  { href: '/', label: '首页' },
  { href: '/universities', label: '大学介绍' },
  { href: '/majors', label: '专业认知' },
  { href: '/forum', label: '问答论坛' },
  { href: '/messages', label: '学长学姐寄语' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [searchOpen, setSearchOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const searchRef = useRef<HTMLButtonElement>(null)
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const latestUser = typeof window !== 'undefined' && session?.user?.id
    ? getUserById(session.user.id)
    : undefined
  const avatarUrl = latestUser?.avatarUrl || session?.user?.avatarUrl
  const displayName = latestUser?.nickname || latestUser?.name || session?.user?.nickname || session?.user?.name || '我'
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [pathname])
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) { setSearchOpen(false) }
    }
    if (searchOpen) document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [searchOpen])
  useEffect(() => { setSearchOpen(false) }, [pathname])
  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <a href="#main-content" className="site-skip-link">跳到主要内容</a>
      <header ref={headerRef} className={`site-header site-header-glass ${isHome ? 'site-header-home' : 'site-header-interior'}`} data-scrolled={scrolled} onKeyDown={event => {
        if (event.key === 'Escape') {
          if (searchOpen) { setSearchOpen(false); searchRef.current?.focus() }
        }
      }}>
        <div className="site-header-inner">
          <Link href="/" className="site-brand" onClick={() => setSearchOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/baoji-school-emblem.png" alt="" width={48} height={48} />
            <span className="site-brand-copy"><strong>宝鸡中学高校论坛</strong></span>
          </Link>
          <div className="site-search-toggle">
            <button ref={searchRef} type="button" aria-label={searchOpen ? '关闭搜索' : '打开搜索'} aria-expanded={searchOpen} aria-controls="site-search" onClick={() => { setSearchOpen(!searchOpen) }}>{searchOpen ? <X size={23} /> : <Search size={23} />}<span>搜索</span></button>
          </div>
          {searchOpen && <div id="site-search"><SiteSearch onClose={() => setSearchOpen(false)} /></div>}
          <nav id="site-navigation" aria-label="主导航" className="site-nav">
            {navItems.map(item => {
              const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
              return <Link href={item.href} key={item.href} aria-current={active ? 'page' : undefined} onClick={() => setSearchOpen(false)}>{item.label}</Link>
            })}
            {session?.user?.role === 'admin' && <Link href="/admin" onClick={() => setSearchOpen(false)}>管理后台</Link>}
          </nav>
          <div className="site-account">
            {status === 'loading' ? <span className="site-auth-loading" aria-label="正在检查登录状态">…</span> : session?.user ? <>
              <Link href={`/users/${session.user.id}`} className="site-avatar" aria-label="我的个人主页">
                {avatarUrl ? <img src={avatarUrl} alt="" width={32} height={32} /> : displayName.slice(0, 1)}
              </Link>
              <button type="button" className="site-signout" onClick={() => setConfirmLogout(true)}>退出</button>
            </> : <Link href="/auth/login" className="site-login">登录 / 注册</Link>}
          </div>
        </div>
      </header>
      {confirmLogout && <div className="site-modal-backdrop" onKeyDown={event => { if (event.key === 'Escape') setConfirmLogout(false) }}>
        <section role="dialog" aria-modal="true" aria-labelledby="logout-heading" className="site-modal">
          <h2 id="logout-heading">退出当前账号？</h2><p>你随时可以重新登录，继续参与交流。</p>
          <div><button type="button" autoFocus onClick={() => setConfirmLogout(false)}>取消</button><button type="button" onClick={() => signOut({ callbackUrl: '/' })}>退出登录</button></div>
        </section>
      </div>}
    </>
  )
}
