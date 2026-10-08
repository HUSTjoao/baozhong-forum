'use client'

import AnimationControl from './AnimationControl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import useViewportReveal from './useViewportReveal'

export default function Footer() {
  const pathname = usePathname()
  const footerRef = useRef<HTMLElement>(null)
  const { completed, skipAnimation, replayAnimation } = useViewportReveal(footerRef, '.community-footer-inner > *', pathname, 170)
  if (pathname?.startsWith('/admin')) return null

  return (
    <footer ref={footerRef} className="community-footer">
      {pathname === '/' && <AnimationControl completed={completed} onSkip={skipAnimation} onReplay={replayAnimation} />}
      <div className="community-footer-inner">
        <div className="community-footer-intro">
          <h2>交流与合作</h2>
          <p>本论坛致力于为宝鸡中学学子提供大学与专业信息交流的空间。欢迎分享求学经历、提出建设性意见，共同完善论坛内容与体验。</p>
          <p>如发现内容疏漏或使用问题，欢迎反馈；亦诚邀有意参与建设的同学与校友交流合作。</p>
        </div>
        <nav className="community-footer-explore" aria-label="底部链接">
          <h3>探索更多</h3>
          <Link href="/universities">大学介绍</Link>
          <Link href="/majors">专业认知</Link>
          <Link href="/forum">问答论坛</Link>
          <Link href="/messages">学长学姐寄语</Link>
        </nav>
        <div className="community-footer-contact">
          <span>联系方式</span>
          <a href="mailto:erhao2007@gmail.com">erhao2007@gmail.com ↗</a>
          <p>QQ · 1750453328</p>
          <Link href="/forum">前往问答论坛交流与反馈 ↗</Link>
        </div>
        <div className="community-footer-colophon">
          <p>网站制作于丙午马年夏末秋序之际</p>
          <p>湖北·武汉 华中科技大学</p>
        </div>
      </div>
    </footer>
  )
}
