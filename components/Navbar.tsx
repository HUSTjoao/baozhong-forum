'use client'

import schoolEmblem from '@/data/optimized-school-emblem.json'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

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
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [latestUser, setLatestUser] = useState<{ name: string; nickname?: string | null; avatarUrl?: string | null } | null>(null)
  useEffect(() => {
    let controller: AbortController | undefined
    setLatestUser(null)
    const id = session?.user?.id
    if (!id) return
    const refreshProfile = () => {
      controller?.abort()
      const request = new AbortController()
      controller = request
      void fetch(`/api/users/${encodeURIComponent(id)}?summary=1`, { signal: request.signal, cache: 'no-store' }).then(async response => {
        if (!response.ok) return
        const body = await response.json()
        if (!request.signal.aborted) setLatestUser(body.user)
      }).catch(() => {})
    }
    refreshProfile()
    window.addEventListener('profile-updated', refreshProfile)
    return () => { controller?.abort(); window.removeEventListener('profile-updated', refreshProfile) }
  }, [session?.user?.id])
  const avatarUrl = latestUser?.avatarUrl || session?.user?.avatarUrl
  const displayName = latestUser?.nickname || latestUser?.name || session?.user?.nickname || session?.user?.name || '我'
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [pathname])
  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <a href="#main-content" className="site-skip-link">跳到主要内容</a>
      <header className={`site-header site-header-glass ${isHome ? 'site-header-home' : 'site-header-interior'}`} data-scrolled={scrolled}>
        <div className="site-header-inner">
          <Link href="/" className="site-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={schoolEmblem[96]} srcSet={`${schoolEmblem[96]} 1x, ${schoolEmblem[192]} 2x`} alt="" width={48} height={48} loading="eager" fetchPriority="high" decoding="async" />
            <span className="site-brand-copy"><strong>宝鸡中学高校论坛</strong></span>
          </Link>
          <nav id="site-navigation" aria-label="主导航" className="site-nav">
            {navItems.map(item => {
              const active = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href)
              return <Link href={item.href} key={item.href} aria-current={active ? 'page' : undefined}>{item.label}</Link>
            })}
          </nav>
          <div className="site-account">
            {status === 'loading' ? <span className="site-auth-loading" aria-label="正在检查登录状态">…</span> : session?.user ? <>
              {session.user.role === 'admin' && <Link href="/admin" className="site-admin-entry"><ShieldCheck size={18} strokeWidth={1.5}/><span>管理后台</span></Link>}
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
