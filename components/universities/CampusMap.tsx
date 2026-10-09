'use client'
import { useId, useRef, useEffect, type CSSProperties, type PointerEvent } from 'react'
import geography from '@/data/china-campus-map.json'
import cityCenters from '@/data/campus-city-centers.json'
import { campusTheme } from '@/lib/campus-themes'

export type MapDestination = { id: string; name: string; city: string; accent: string; province?: string }
const coordinates: Record<string, [number, number]> = { hust: [114.36, 30.54], tsinghua: [116.326, 40.003] }
const project = ([longitude, latitude]: [number, number]) => [(longitude - 73) * 14, (54 - latitude) * 16]
const [originX, originY] = project([107.24, 34.36])

export default function CampusMap({ active, campuses, onSelect }: { active: MapDestination | null; campuses: MapDestination[]; onSelect: (id: string) => void }) {
  const gradient = useId().replace(/:/g, '')
  const panelRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current) }, [])
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      panelRef.current?.style.setProperty('--map-shift-x', `${x * 6}px`)
      panelRef.current?.style.setProperty('--map-shift-y', `${y * 5}px`)
      panelRef.current?.style.setProperty('--map-light-x', `${50 + x * 12}%`)
      panelRef.current?.style.setProperty('--map-light-y', `${50 + y * 12}%`)
      frame.current = null
    })
  }
  function reset() {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    panelRef.current?.style.setProperty('--map-shift-x', '0px')
    panelRef.current?.style.setProperty('--map-shift-y', '0px')
    frame.current = null
  }
  const cityPoint = active ? (cityCenters.cities as Record<string, number[]>)[active.city.replace(/市$/,'')] : null
  const point = active ? coordinates[active.id] || cityPoint : null
  const target = point ? project(point as [number, number]) : null
  const theme = active ? campusTheme(active.id, active.accent) : campusTheme('hust', 'cyan')
  const path = target ? 'M ' + originX + ' ' + originY + ' Q ' + ((originX + target[0]) / 2) + ' ' + (Math.min(originY, target[1]) - 65) + ' ' + target[0] + ' ' + target[1] : ''
  const selectedProvince = active?.province?.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '')
  const labelOnLeft = !!target && target[0] > 600
  return <div ref={panelRef} onPointerMove={move} onPointerLeave={reset} className={'uni-map-panel uni-map-atlas uni-accent-' + (active?.accent || 'cyan')} style={{ '--map-destination-ink': theme.ink } as CSSProperties}>
    <div className="uni-map-atmosphere" aria-hidden="true"><i className="uni-map-light-field" /><i className="uni-map-dot-field" /><i className="uni-map-light-sweep" /></div>
    
    <svg className="uni-china-map" viewBox="0 0 900 820" role="img" aria-label={active ? '陕西宝鸡至' + active.city + '，' + active.name : '中国地图，起点位于陕西宝鸡'}>
      <defs><linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#6a9dc3" /><stop offset="1" stopColor={theme.ink} /></linearGradient><radialGradient id={gradient + '-city'}><stop stopColor={theme.wash} stopOpacity=".7" /><stop offset=".45" stopColor="#f4faff" stopOpacity=".38" /><stop offset="1" stopColor="#ecf7ff" stopOpacity="0" /></radialGradient></defs>
      <defs>
        {[['#dcecf7', '#a1c3dc'], ['#e6f1f9', '#b2cce0'], ['#d2e5f3', '#9ebfd9']].map((colors, i) => <linearGradient key={i} id={`${gradient}-land-${i}`} x1="0" y1="0" x2=".7" y2="1"><stop stopColor={colors[0]} /><stop offset="1" stopColor={colors[1]} /></linearGradient>)}
        <linearGradient id={gradient + '-selected'} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eaf6ff" /><stop offset="1" stopColor={theme.ink} stopOpacity=".55" /></linearGradient>
      </defs>
      <g className="uni-map-contours" fill="none" stroke="#6e9fbe" strokeWidth="1.15" opacity=".17" aria-hidden="true">{[0, 1, 2, 3].map(i => <path key={i} d={`M ${70-i*28} ${560+i*23} C ${130-i*25} ${170-i*22}, ${550+i*28} ${50-i*17}, ${780+i*25} ${360+i*13} S ${710+i*30} ${720+i*21}, ${360-i*25} ${738+i*22}`} />)}</g>
      <g className="uni-map-relief" fill="#6e96b4" stroke="#6e96b4" opacity=".34" aria-hidden="true">{geography.features.map(feature => <path key={feature.adcode} d={feature.path} />)}</g>
      <g className="uni-map-provinces">{geography.features.map((feature, index) => <path key={feature.adcode} d={feature.path} pathLength="1" style={{ fill: `url(#${gradient}-land-${index % 3})`, '--province-delay': `${index % 7 * 65}ms` } as CSSProperties} className={feature.adcode === 610000 ? 'uni-map-home' : ''} />)}</g>
      {selectedProvince && <g key={selectedProvince} className="uni-map-selected-province" aria-hidden="true">{geography.features.filter(feature => feature.name.startsWith(selectedProvince)).map(feature => <path key={feature.adcode} d={feature.path} fill={`url(#${gradient}-selected)`} />)}</g>}
      <g className="uni-map-city-constellation" fill="#547f9f" opacity=".7" aria-hidden="true">{Array.from(new Set(campuses.map(campus => campus.city))).map(city => {
        const location = (cityCenters.cities as Record<string, number[]>)[city.replace(/市$/, '')]
        if (!location) return null
        const [x, y] = project(location as [number, number])
        return <g key={city}><circle cx={x} cy={y} r="7" fill="#ffffff" opacity=".5" className="uni-map-campus-aura" /><circle cx={x} cy={y} r="2.5" /></g>
      })}</g>
      <g className="uni-map-origin-ring" fill="none" stroke="#3b7197" strokeWidth="1.3" opacity=".85" aria-hidden="true"><circle cx={originX} cy={originY} r="11" /><path d={`M ${originX-21} ${originY} h6 M ${originX+15} ${originY} h6 M ${originX} ${originY-21} v6 M ${originX} ${originY+15} v6`} /></g>
      <circle className="uni-origin-halo" cx={originX} cy={originY} r="16" /><circle className="uni-map-origin" cx={originX} cy={originY} r="5" />
      <text x={originX - 18} y={originY + 43} textAnchor="end" className="uni-map-origin-label">宝鸡中学</text>
      {target && active && <g key={active.id} className="uni-map-destination-layer"><circle className="uni-map-city-glow" cx={target[0]} cy={target[1]} r="110" fill={'url(#' + gradient + '-city)'} />
        <path className="uni-map-route-shadow" d={path} />
        <path className="uni-map-route" d={path} stroke={'url(#' + gradient + ')'} pathLength="1" />
        <circle className="uni-map-arrival-halo" cx={target[0]} cy={target[1]} r="17" />
        <circle className="uni-map-arrival" cx={target[0]} cy={target[1]} r="5" />
        <text x={target[0] + (labelOnLeft ? -18 : 18)} textAnchor={labelOnLeft ? 'end' : 'start'} y={target[1] - 25} className="uni-map-target-label">{active.name}</text>
        <text x={target[0] + (labelOnLeft ? -18 : 18)} textAnchor={labelOnLeft ? 'end' : 'start'} y={target[1] + 16} className="uni-map-city-label">{active.city}</text>
        <circle className="uni-map-traveler" r="4" fill={theme.ink}><animateMotion dur="2.8s" repeatCount="indefinite" path={path} /></circle>
      </g>}
    </svg>
    <div className="uni-map-status" aria-live="polite"><div className="uni-route-origin"><small><i />起点</small><strong>宝鸡中学</strong></div><div className="uni-route-destination"><small><i />下一站</small><strong key={active?.id || 'pending'} style={{ '--route-name-length': active?.name.length || 4 } as CSSProperties} className={(active?.name.length || 0) > 10 ? 'uni-route-name-extra-long' : (active?.name.length || 0) > 7 ? 'uni-route-name-long' : ''}>{active?.name || '由你选择'}</strong></div></div>
    <div className="uni-map-mobile-select" aria-label="选择地图终点">{campuses.map(campus => <button key={campus.id} aria-pressed={active?.id === campus.id} onClick={() => onSelect(campus.id)}>{campus.name}</button>)}</div>
    
  </div>
}







