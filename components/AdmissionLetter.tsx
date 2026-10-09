'use client'

import AnimationControl from './AnimationControl'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import AdmissionLandscape from './AdmissionLandscape'
import InkTrail from './InkTrail'
import AdmissionSketch from './AdmissionSketch'
import useScrollChapters from './useScrollChapters'

const letterChapters = [
  { progress: .6073, duration: 4800 },
  { progress: 1, duration: 2000 },
] as const
const nextCountdown = { selector: '.future-editorial', stageSelector: '.future-time-stage', progress: 0, duration: 1000 } as const


function phase(start: number, end: number, progress: number) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)))
  return value * value * (3 - 2 * value)
}

export default function AdmissionLetter() {
  const sectionRef = useRef<HTMLElement>(null)
  const { playing, progress, completed, skipAnimation, replayAnimation } = useScrollChapters(sectionRef, '.admission-stage', letterChapters, 1, nextCountdown)
  const [entrance, setEntrance] = useState(0)
  const [reduced, setReduced] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      const section = sectionRef.current
      const stage = section?.querySelector<HTMLElement>('.admission-stage')
      if (!section || !stage) return
      setMobile(window.innerWidth <= 760)
      const sectionTop = section.getBoundingClientRect().top
      setEntrance(motion.matches ? 1 : Math.max(0, Math.min(1, (stage.offsetHeight * .85 - sectionTop) / (stage.offsetHeight * .85))))
      setReduced(motion.matches)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    motion.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      motion.removeEventListener('change', schedule)
    }
  }, [])

  const sceneEntrance = progress > .001 ? 1 : entrance
  const arrive = phase(.30, .84, sceneEntrance)
  const titleReveal = phase(.03, .29, sceneEntrance)
  // Drawing continues after pinning, before opening starts.
  const drawing = Math.min(1, sceneEntrance * .35 + progress * 3)
  const letterProgress = Math.max(0, Math.min(1, (progress - .23) / .77))
  const contentReveal = phase(.46, .50, letterProgress)
  const open = phase(.02, .16, letterProgress)
  const extract = phase(.16, .32, letterProgress)
  const enlarge = phase(.32, .43, letterProgress)
  const greetingIn = phase(.18, .28, letterProgress)
  const greetingOut = phase(.32, .43, letterProgress)
  const greetingOpacity = greetingIn * (1 - greetingOut)
  const envelope = 1 - phase(.29, .35, letterProgress)
  const envelopeStyle = { opacity: envelope, transform: `translateY(${extract * 90}%)` }
  const initialScale = mobile ? .70 : .76
  const paperScale = initialScale + (1 - initialScale) * enlarge
  const ink = (start: number, end: number) => ({ strokeDasharray: 1, strokeDashoffset: 1 - phase(.15 + start * 4, .15 + end * 4, drawing) })
  const entries = [
    { href: '/universities', title: '大学介绍', english: 'Campus', headline: '一座校园，另一种可能。', description: '了解学校特色与校园生活，寻找向往的大学。', topics: ['学校特色', '校园生活', '院系专业'] },
    { href: '/majors', title: '专业认知', english: 'Majors', headline: '找到你想深入的方向。', description: '从课程到就业方向，让兴趣有更清晰的落点。', topics: ['学什么', '适合谁', '走向哪里'] },
    { href: '/forum', title: '问答论坛', english: 'Q&A', headline: '你想问的，他们经历过。', description: '把选校、专业和生活的疑问，交给经历过的人。', topics: ['选校困惑', '专业选择', '大学日常'] },
    { href: '/messages', title: '学长学姐寄语', english: 'Letters', headline: '留一句话，给还在出发的他们。', description: '读一段真实的求学故事，也留下自己的心声。', topics: ['求学故事', '成长感悟', '给你的话'] },
  ]
  const entryActions = ['走进校园', '探索专业', '参与问答', '读一封寄语']

  return (
    <section ref={sectionRef} id="home-explore" tabIndex={-1} className="home-explore admission-letter" data-progress={progress.toFixed(3)} data-entrance={entrance.toFixed(3)} data-playing={playing} data-reduced-motion={reduced} aria-labelledby="next-station-title">
      <div className="admission-stage">
        <div className="admission-sky" aria-hidden="true"><div className="admission-nebula" />{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ left: `${(index * 37 + 11) % 100}%`, top: `${(index * 23 + 7) % 100}%`, width: index % 7 === 0 ? 3 : 1.5, height: index % 7 === 0 ? 3 : 1.5, animationDelay: `${-index * .73}s`, animationDuration: `${5 + index % 6}s` }} />)}</div>
        <AdmissionLandscape entrance={sceneEntrance} progress={letterProgress} mobile={mobile} />
        <InkTrail />
        <header className="admission-heading" style={{ opacity: titleReveal, transform: `translateY(${(1 - titleReveal) * 22}px)`, filter: `blur(${(1 - titleReveal) * 4}px)` }}>
          <p lang="en">A LETTER TO YOUR FUTURE</p>
          <h2 id="next-station-title">下一站，大学。</h2>
        </header>
        <div className="admission-artboard" style={{ opacity: phase(.30, .42, sceneEntrance), transform: `translate(-50%, calc(-50% + ${(1 - arrive) * 35}px)) rotate(${(1 - arrive) * -2}deg)` }}>
          <div className="admission-envelope-back" aria-hidden="true" style={envelopeStyle}>
            <svg viewBox="0 0 800 420" preserveAspectRatio="none"><path pathLength="1" style={ink(0, .09)} d="M 0 0 H 800 V 420 H 0 Z" /></svg>
          </div>
          <div className="admission-envelope-flap" aria-hidden="true" style={{ opacity: envelope, transform: `translateY(${extract * 281.25}%) rotateX(${-open * 180}deg)`, zIndex: open < .5 ? 6 : 1 }}>
            <svg viewBox="0 0 800 134.4" preserveAspectRatio="none"><path pathLength="1" style={ink(.025, .115)} d="M 0 0 L 400 134.4 L 800 0 Z" /></svg>
          </div>
          <div className="admission-sheet" data-enlarge={enlarge.toFixed(3)} style={{ opacity: phase(.14, .16, letterProgress), transform: enlarge === 1 ? 'none' : `translateY(${(6 - extract * 16) * (1 - enlarge)}%) scale(${paperScale})` }}>
          <div className="admission-paper" data-extract={extract.toFixed(3)} data-unfold={enlarge.toFixed(3)}>
            <div className="admission-greeting" aria-hidden={greetingOpacity < .01} style={{ opacity: greetingOpacity, transform: `translateY(${(1 - greetingIn) * 14 - greetingOut * 8}px)` }}>
              <span className="admission-greeting-rule" aria-hidden="true" />
              <p>致未来的你</p>
              <span lang="en">A LETTER TO YOUR FUTURE</span>
            </div>
            <div className="admission-paper-heading" style={{ opacity: contentReveal }}><span>致正在出发的你</span><span lang="en">THE NEXT CHAPTER</span></div>
            <div className="admission-entries admission-directory">
              {entries.map(({ href, title, english, headline, description, topics }, index) => {
                const reveal = phase(.52 + index * .11, .615 + index * .11, letterProgress)
                const ready = reveal > .9
                return <Link key={href} href={href} className={`admission-entry admission-entry-${index}`} onPointerMove={event => { if (event.pointerType !== 'mouse') return; const bounds = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty('--entry-x', `${event.clientX - bounds.left}px`); event.currentTarget.style.setProperty('--entry-y', `${event.clientY - bounds.top}px`) }} tabIndex={ready ? 0 : -1} aria-hidden={!ready} data-reveal={reveal.toFixed(3)} style={{ opacity: reveal, transform: reveal === 1 ? 'none' : `translateY(${(1 - reveal) * 12}px)` }}>
                  <span className="admission-directory-number" aria-hidden="true">0{index + 1}</span>
                  <AdmissionSketch index={index} drawn={ready} />
                  <div className="admission-entry-top"><h3>{title}</h3><span className="admission-entry-english" lang="en">{english}</span></div>
                  <div className="admission-entry-copy"><p className="admission-entry-headline">{headline}</p><p className="admission-entry-description">{description}</p><div className="admission-entry-topics">{topics.map(topic => <span key={topic}>{topic}</span>)}</div></div>
                  <span className="admission-entry-link">{entryActions[index]}<ArrowUpRight aria-hidden="true" /></span>
                </Link>
              })}
            </div>
          </div>
          </div>
          <div className="admission-envelope-front" aria-hidden="true" style={envelopeStyle}>
            <svg viewBox="0 0 800 420" preserveAspectRatio="none">
              <path pathLength="1" style={ink(.02, .1)} d="M 0 0 L 400 134.4 L 800 0 V 420 H 0 Z" />
              <path className="admission-envelope-fold" pathLength="1" style={ink(.045, .135)} d="M 0 420 L 275 92.4 M 800 420 L 525 92.4" />
              <path className="admission-cover-rule" pathLength="1" style={ink(.09, .17)} d="M 235 362 L 565 362 M 258 369 L 541 369" />
              <path className="admission-cover-corner" pathLength="1" style={ink(.06, .15)} d="M 22 363 L 22 397 L 59 397 M 739 397 L 776 397 L 776 363" />
            </svg>
            <div className="admission-envelope-address" style={{ opacity: phase(.72, .94, drawing) }}><strong>录取通知书</strong><span lang="en">ADMISSION NOTICE</span><small>致 · 正在出发的你</small></div>
            <span className="admission-cover-number" style={{ opacity: phase(.80, 1, drawing) }}><strong>1940</strong><span lang="en">A BEGINNING · A FUTURE</span></span>
          </div>
        </div>
        <p className="admission-scroll-cue" aria-live="polite" style={{ opacity: playing ? .55 : 1 }}>{playing ? '正在展开下一段故事…' : progress < .60 ? '滚动一次，勾勒通知书并打开来信' : progress < .995 ? '再次滚动，发现四个新的方向' : '再次滚动，继续向下探索'}<span aria-hidden="true">{playing ? '· · ·' : '↓'}</span></p>
        <AnimationControl completed={completed} onSkip={skipAnimation} onReplay={replayAnimation} />
      </div>
    </section>
  )
}
