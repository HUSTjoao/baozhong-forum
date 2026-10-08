import strokes from '@/data/college-strokes.json'

type Props = { fracture: number; escape: number; opacity: number; mobile: boolean }

export default function CollegeStrokeFragments({ fracture, escape, opacity, mobile }: Props) {
  const advance = mobile ? 1040 : 1070
  // Match the current title font's ascent/descent within its 1.35em line box.
  const baseline = 1107.5

  return (
    <svg className="journey-stroke-fragments" viewBox={`0 0 ${advance * 2} 1350`} preserveAspectRatio="none" aria-hidden="true" style={{ opacity }}>
      {strokes.map((stroke, index) => {
        const direction = stroke.cy >= 430 ? -1 : 1
        const spreadX = (stroke.cx / 500 - 1) * 1.8 + ((index % 5) - 2) * .5 + (stroke.letter ? .8 : -.8)
        const spreadY = .65 + (index % 5) * .35 + Math.abs(stroke.cy / 1000 - .45)
        const x = spreadX * fracture * 1000
        const y = direction * (escape * (1.3 + (index % 4) * .28) + spreadY * fracture) * 1000
        const rotate = ((index % 5) - 2) * 10 * fracture
        return <g key={stroke.id} data-stroke={stroke.id} transform={`translate(${x} ${y}) rotate(${rotate} ${stroke.letter * advance + stroke.cx} ${baseline - stroke.cy})`}>
          <path d={stroke.path} transform={`translate(${stroke.letter * advance} ${baseline}) scale(1 -1)`} />
        </g>
      })}
    </svg>
  )
}
