type Props = { entrance: number; progress: number; mobile: boolean }

function reveal(start: number, end: number, progress: number) {
  const value = Math.max(0, Math.min(1, (progress - start) / (end - start)))
  return value * value * (3 - 2 * value)
}

const words = [
  { text: '求知', english: 'Stay curious', side: 'left', top: 27, size: 34, angle: -7, slot: 0 },
  { text: '探索', english: 'Beyond the familiar', side: 'left', top: 40, size: 27, angle: 4, slot: 1 },
  { text: '远方', english: 'Your next chapter', side: 'left', top: 53, size: 36, angle: -5, slot: 2 },
  { text: '勇气', english: 'Take the first step', side: 'left', top: 66, size: 28, angle: 6, slot: 3 },
  { text: '自由', english: 'Find your own way', side: 'left', top: 79, size: 31, angle: -3, slot: 4 },
  { text: '相遇', english: 'Stories to share', side: 'right', top: 27, size: 29, angle: 6, slot: 0 },
  { text: '热爱', english: 'Follow your passion', side: 'right', top: 40, size: 36, angle: -4, slot: 1 },
  { text: '成长', english: 'Become yourself', side: 'right', top: 53, size: 28, angle: 5, slot: 2 },
  { text: '同行', english: 'Together, onward', side: 'right', top: 66, size: 32, angle: -6, slot: 3 },
  { text: '可能', english: 'A world of possibility', side: 'right', top: 79, size: 26, angle: 4, slot: 4 },
]

// Quiet handwritten words share the letter timeline without receiving input.
export default function AdmissionLandscape({ entrance, progress, mobile }: Props) {
  const arrival = reveal(.25, .9, entrance)
  const marginOpacity = mobile ? 1 - reveal(.32, .43, progress) : 1
  return <div className="admission-landscape" aria-hidden="true" style={{ opacity: arrival }}>
    <div className="admission-daylight admission-daylight-gold" />
    <div className="admission-daylight admission-daylight-green" />
    {words.map((word, index) => {
      const show = Math.min(1, reveal(.15 + word.slot * .07, .55 + word.slot * .07, entrance) * .7 + reveal(.18 + index * .05, .40 + index * .05, progress) * .3)
      return <div key={word.text} className={`admission-margin-word admission-word-${word.side}`} data-slot={word.slot} style={{ top: `${word.top}%`, opacity: show * (.52 + index % 3 * .1) * marginOpacity, transform: `translateY(${(1 - show) * 12}px) rotate(${word.angle}deg)` }}>
        <div className="admission-word-float" style={{ animationDelay: `${-index * 1.7}s`, animationDuration: `${9 + index % 4 * 2}s` }}>
          <span style={{ fontSize: mobile ? 23 + index % 3 * 2 : word.size }}>{word.text}</span>
          <small lang="en">{word.english}</small>
        </div>
      </div>
    })}
  </div>
}
