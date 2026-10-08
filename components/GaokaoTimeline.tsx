'use client'

import AnimationControl from './AnimationControl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getGaokaoCountdowns } from '@/lib/gaokao-countdown'
import { shuffleStudyPrompts, studyPrompts } from '@/lib/study-prompts'
import { countdownSlogans, pickCountdownSlogan } from '@/lib/countdown-slogans'
import CountdownArtwork from './CountdownArtwork'
import { SubjectIcon, YearArrowIcon, RefreshStudyIcon } from './StudyIcons'
import CountdownCampus from './CountdownCampus'
import useViewportReveal from './useViewportReveal'
import useFirstSectionTransition from './useFirstSectionTransition'

const chapters = [
  { label: '让努力有回声。', note: '把模糊的知识学清楚，把绕过的难题想明白。', closing: '每一点进步，都在靠近你想去的地方。' },
  { label: '给热爱一点时间。', note: '从一道题到一个新的发现，给好奇心留一点空间。', closing: '你喜欢的事，也值得认真投入。' },
  { label: '未来，正向你走来。', note: '大学的模样，可以从现在开始想象。', closing: '先做好眼前的一件事，再去遇见更大的世界。' },
]

function CalendarFlipIcon() {
  return <svg className="calendar-flip-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <path d="M11 5h9l6 6v15H11V5Z" /><path d="M20 5v6h6M15 16h7M15 20h5" />
    <path className="calendar-flip-arrow" d="M7 25C1 20 2 11 7 8M3 8h4v4" />
  </svg>
}

export default function GaokaoTimeline() {
  const sectionRef = useRef<HTMLElement>(null)
  const calendarRef = useRef<HTMLButtonElement>(null)
  const { completed, skipAnimation, replayAnimation } = useViewportReveal(sectionRef, '.future-scene-heading, .future-calendar-space, .future-scene-letter, .future-scene-years')
  useFirstSectionTransition(sectionRef, '.campus-frames', completed)
  const [countdowns, setCountdowns] = useState<ReturnType<typeof getGaokaoCountdowns>>([])
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)
  const [active, setActive] = useState(0)
  const promptQueue = useRef<number[]>([])
  const currentPrompt = useRef(0)
  const pauseUntil = useRef(0)
  const initializedPrompt = useRef(false)
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sloganIndex, setSloganIndex] = useState(0)
  const nextPrompt = useCallback(() => {
    if (!promptQueue.current.length) promptQueue.current = shuffleStudyPrompts(currentPrompt.current)
    const next = promptQueue.current.shift()!
    currentPrompt.current = next
    setIdeaIndex(next)
  }, [])

  useEffect(() => {
    let frame = 0
    const updateHeader = () => {
      frame = 0
      const bounds = sectionRef.current?.getBoundingClientRect()
      document.documentElement.dataset.countdownActive = String(!!bounds && bounds.top <= 80 && bounds.bottom > 80)
    }
    const scheduleUpdate = () => { if (!frame) frame = window.requestAnimationFrame(updateHeader) }
    updateHeader()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      delete document.documentElement.dataset.countdownActive
    }
  }, [])

  useEffect(() => {
    if (initializedPrompt.current) return
    initializedPrompt.current = true
    nextPrompt()
    setSloganIndex(Math.floor(Math.random() * countdownSlogans.length))
  }, [nextPrompt])

  useEffect(() => {
    const update = () => setCountdowns(getGaokaoCountdowns())
    update()
    const timer = window.setInterval(update, 60000)
    const stage = sectionRef.current?.querySelector('.future-time-stage')
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting)
      if (entry.isIntersecting) setEntered(true)
    }, { threshold: .15 })
    if (stage) observer.observe(stage)
    return () => {
      window.clearInterval(timer)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ideas = window.setInterval(() => { if (!document.hidden && Date.now() >= pauseUntil.current) nextPrompt() }, 6500)
    return () => window.clearInterval(ideas)
  }, [visible, nextPrompt])

  useEffect(() => {
    if (!visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setSloganIndex(previous => pickCountdownSlogan(previous))
    }, 12000)
    return () => window.clearInterval(timer)
  }, [visible])

  const choose = (index: number) => {
    setActive(index)
    setFlipped(false)
    pauseUntil.current = Date.now() + 6500
    nextPrompt()
  }
  const flipCalendar = () => { pauseUntil.current = Date.now() + 6500; setFlipped(value => !value) }
  const chapter = chapters[active]
  const idea = studyPrompts[ideaIndex]
  const slogan = countdownSlogans[sloganIndex]

  return (
    <section ref={sectionRef} className="future-time future-time-reimagined future-calendar-section future-editorial" data-visible={visible} data-entered={entered} data-chapter={active} aria-labelledby="future-time-title">
      <div className="future-time-stage">
        <CountdownCampus />
        <AnimationControl completed={completed} onSkip={skipAnimation} onReplay={replayAnimation} />
        <div className="future-scene">
          <header className="future-scene-heading">
            <div className="future-countdown-kicker"><span>高考倒计时</span><span lang="en">Make everyday count</span></div>
            <h2 id="future-time-title"><span key={sloganIndex} className="future-heading-slogan">{slogan.lead}<em>{slogan.end}</em></span></h2>
            <div className="future-countdown-range"><span>{countdowns[0]?.year ?? '——'} — {countdowns[2]?.year ?? '——'}</span></div>
          </header>
          <div id="future-year-panel" className="future-scene-main" data-year={active}>
            <div className="future-calendar-space">
              <span className="future-calendar-shadow" aria-hidden="true" />
              <button ref={calendarRef} type="button" className="future-calendar" data-flipped={flipped} aria-label={`${countdowns[active]?.year ?? ''}年高考还有${countdowns[active]?.days ?? ''}天，点击翻转日历`} aria-pressed={flipped} onClick={flipCalendar} onPointerMove={event => {
                if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
                const rect = event.currentTarget.getBoundingClientRect()
                event.currentTarget.style.setProperty('--tilt-x', `${Math.max(-.5, Math.min(.5, (event.clientX - rect.left - rect.width / 2) / rect.width)) * 22}deg`)
                event.currentTarget.style.setProperty('--tilt-y', `${-Math.max(-.5, Math.min(.5, (event.clientY - rect.top - rect.height / 2) / rect.height)) * 18}deg`)
              }} onPointerLeave={() => { calendarRef.current?.style.setProperty('--tilt-x', '0deg'); calendarRef.current?.style.setProperty('--tilt-y', '0deg') }}>
                <span className="future-calendar-turn">
                <span className="future-calendar-sheet future-calendar-front" aria-hidden={flipped}>
                  <span className="future-calendar-binding" aria-hidden="true"><i /><i /></span>
                  <span className="future-calendar-date"><strong>{countdowns[active]?.year ?? '——'}</strong><small>06 / 07</small></span>
                  <span className="future-calendar-caption">距高考</span>
                  <span className="future-calendar-days"><strong>{countdowns[active]?.days ?? '—'}</strong><small>天</small></span>
                  <CountdownArtwork index={active} />
                  <span className="future-calendar-corner" aria-hidden="true"><CalendarFlipIcon /></span>
                </span>
                <span className="future-calendar-sheet future-calendar-back" aria-hidden={!flipped}>
                  <span className="future-calendar-binding" aria-hidden="true"><i /><i /></span>
                  <span className="future-note-heading"><span className="study-subject-label"><SubjectIcon subject={idea.subject} /><span>{idea.subject}</span></span><span lang="en">Study notes</span></span>
                  <span className="future-note-body"><strong>{idea.text}</strong><span>{idea.detail}</span></span>
                  <span className="future-note-footer"><span>写下今天的收获</span><span aria-hidden="true">06 / 07</span></span>
                </span>
                </span>
              </button>
              <button type="button" className="future-calendar-help" aria-pressed={flipped} onClick={flipCalendar}><CalendarFlipIcon /><span>轻点翻面</span></button>
            </div>
            <div className="future-scene-letter">
              <h3>{chapter.label}</h3>
              <p className="future-chapter-note">{chapter.note}<span>{chapter.closing}</span></p>
              <div className="future-study-meta"><span className="study-subject-label"><SubjectIcon subject={idea.subject} /><span>{idea.subject}</span></span><button type="button" onClick={() => { pauseUntil.current = Date.now() + 6500; nextPrompt() }}><span>换一个</span><RefreshStudyIcon /></button></div>
              <div className="future-scene-idea"><p>{idea.text}</p><div className="future-study-detail">{idea.detail}</div></div>
              <div className="future-calendar-arrows"><button type="button" aria-label="上一个年份" onClick={() => choose((active + 2) % 3)}><YearArrowIcon previous /></button><button type="button" aria-label="下一个年份" onClick={() => choose((active + 1) % 3)}><YearArrowIcon /></button></div>
            </div>
          </div>
          <nav className="future-scene-years" aria-label="选择倒计时年份">
            {chapters.map((_, index) => <button key={index} type="button" aria-label={`${countdowns[index]?.year ?? ''}年高考，${countdowns[index]?.days ?? ''}天`} aria-current={active === index ? 'true' : undefined} aria-controls="future-year-panel" onClick={() => choose(index)}><strong>{countdowns[index]?.year ?? '——'}</strong></button>)}
            <span className="future-scene-year-line" aria-hidden="true" style={{ transform: `translateX(${active * 100}%)` }} />
          </nav>
          <p className="sr-only">倒计时按北京时间、每年6月7日计算；可选择未来三个年份，点击日历查看每日灵感。</p>
        </div>
      </div>
    </section>
  )
}
