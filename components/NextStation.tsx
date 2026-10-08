'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'

type Props = { message: string; author: string }

export default function NextStation({ message, author }: Props) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight * .25)))
      section.style.setProperty('--explore-progress', String(progress))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-visible', 'true')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' })
    const configure = () => {
      section.dataset.animate = String(!motion.matches)
      section.querySelectorAll('[data-explore-reveal]').forEach(item => {
        if (motion.matches) item.setAttribute('data-visible', 'true')
        else observer.observe(item)
      })
    }
    configure()
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', configure)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', configure)
      delete section.dataset.animate
    }
  }, [])

  return (
    <section ref={sectionRef} id="home-explore" tabIndex={-1} className="home-explore next-station" aria-labelledby="next-station-title">
      <svg className="next-station-trace" viewBox="0 0 1200 180" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M 600 0 C 600 90 64 20 64 110 L 64 180" /><circle cx="64" cy="175" r="3" /></svg>
      <div className="next-station-layout">
        <div className="next-station-intro" data-explore-reveal>
          <p className="next-station-kicker">THE NEXT CHAPTER</p>
          <h2 id="next-station-title">下一站，<br /><span>大学。</span></h2>
          <p className="next-station-lead">看看不同的校园，<br />也听听走在前面的他们。</p>
          <div className="next-station-direction" aria-hidden="true"><span>从这里，继续出发</span><span>↘</span></div>
          <div className="next-station-rail" aria-hidden="true"><i /></div>
        </div>
        <div className="next-station-entries">
          <Link href="/universities" className="station-entry station-campus" data-explore-reveal>
            <div className="station-entry-top"><span className="station-number">01</span><h3>大学介绍</h3><ArrowUpRight aria-hidden="true" /></div>
            <div className="station-campus-visual" aria-hidden="true">
              <span className="station-campus-english">Campus</span><span className="station-campus-word">大学</span>
              <svg viewBox="0 0 480 220" fill="none"><path d="M0 170 H480 M75 170 V110 L240 35 L405 110 V170 M100 170 V115 H380 V170 M195 170 V115 M240 170 V115 M285 170 V115 M135 115 V170 M345 115 V170 M68 110 H412 M175 65 H305 M155 80 H325" /><path className="station-campus-route" pathLength="1" d="M10 200 C90 195 110 185 145 175 S240 160 300 175 S405 210 470 193" /></svg>
            </div>
            <p className="station-entry-headline">一座校园，<br />另一种可能。</p>
            <p className="station-entry-description">走进不同的大学，了解校园、课程与生活。</p>
            <span className="station-entry-action">去看见更大的世界 <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/majors" className="station-entry station-majors" data-explore-reveal>
            <div className="station-entry-top"><span className="station-number">02</span><h3>专业认知</h3><ArrowUpRight aria-hidden="true" /></div>
            <p className="station-entry-headline">找到你想<br />深入的方向。</p>
            <div className="station-subjects" aria-hidden="true"><span>计算机</span><span>建筑</span><span>医学</span><span>经济学</span></div>
            <p className="station-entry-description">从兴趣到课程，从选择到未来，慢慢认识一个专业。</p>
            <span className="station-entry-action">探索专业 <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/forum" className="station-entry station-questions" data-explore-reveal>
            <div className="station-entry-top"><span className="station-number">03</span><h3>问答论坛</h3><ArrowUpRight aria-hidden="true" /></div>
            <p className="station-entry-headline">你想问的，<br />他们经历过。</p>
            <p className="station-entry-description">选专业的犹豫，初入大学的好奇，都可以从一次对话开始。</p>
            <span className="station-entry-action">聊聊你的问题 <span aria-hidden="true">→</span></span>
          </Link>
          <Link href="/messages" className="station-entry station-letter" data-explore-reveal>
            <div className="station-entry-top"><span className="station-number">04</span><h3>学长学姐寄语</h3><ArrowUpRight aria-hidden="true" /></div>
            <span className="station-letter-mark" aria-hidden="true">“</span>
            {message ? <blockquote><p>{message}</p>{author && <cite>{author}</cite>}</blockquote> : <p className="station-letter-invitation">留一句话，<br />给还在出发的他们。</p>}
            <span className="station-entry-action">读一封来自学长的信 <span aria-hidden="true">→</span></span>
          </Link>
        </div>
      </div>
    </section>
  )
}
