'use client'

type Props = {
  completed: boolean
  onSkip: () => void
  onReplay: () => void
  className?: string
}

export default function AnimationControl({ completed, onSkip, onReplay, className = 'section-animation-skip' }: Props) {
  return <button type="button" className={`${className} animation-control`} data-action={completed ? 'replay' : 'skip'} onClick={completed ? onReplay : onSkip}>
    <span className="animation-control-label">{completed ? '再次播放动画' : '跳过动画'}</span>
    <svg className="animation-control-icon" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false">
      {completed ? <>
        <path className="animation-control-ring" d="M7 7.7a9 9 0 1 1-2 9.1M7 3.8v3.9H3.1" />
        <path className="animation-control-play" d="m11.8 9.9 6.4 4.1-6.4 4.1V9.9Z" />
      </> : <>
        <circle className="animation-control-ring" cx="14" cy="14" r="10.5" />
        <path className="animation-control-play" d="m10 9.7 6.4 4.3-6.4 4.3V9.7Z" />
        <path d="M19.2 9.7v8.6" />
      </>}
    </svg>
  </button>
}
