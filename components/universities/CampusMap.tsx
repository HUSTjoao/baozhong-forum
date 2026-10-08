'use client'
import { useId } from 'react'
import geography from '@/data/china-campus-map.json'
import cityCenters from '@/data/campus-city-centers.json'
import { campusTheme } from '@/lib/campus-themes'

export type MapDestination = { id: string; name: string; city: string; accent: string }
const coordinates: Record<string, [number, number]> = { hust: [114.36, 30.54], tsinghua: [116.326, 40.003] }
const project = ([longitude, latitude]: [number, number]) => [(longitude - 73) * 14, (54 - latitude) * 16]
const [originX, originY] = project([107.24, 34.36])

export default function CampusMap({ active, campuses, onSelect }: { active: MapDestination | null; campuses: MapDestination[]; onSelect: (id: string) => void }) {
  const gradient = useId().replace(/:/g, '')
  const cityPoint = active ? (cityCenters.cities as Record<string, number[]>)[active.city.replace(/市$/,'')] : null
  const point = active ? coordinates[active.id] || cityPoint : null
  const target = point ? project(point as [number, number]) : null
  const theme = active ? campusTheme(active.id, active.accent) : campusTheme('hust', 'cyan')
  const path = target ? 'M ' + originX + ' ' + originY + ' Q ' + ((originX + target[0]) / 2) + ' ' + (Math.min(originY, target[1]) - 65) + ' ' + target[0] + ' ' + target[1] : ''
  return <div className={'uni-map-panel uni-accent-' + (active?.accent || 'cyan')}>
    
    <svg className="uni-china-map" viewBox="0 0 900 820" role="img" aria-label={active ? '陕西宝鸡至' + active.city + '，' + active.name : '中国地图，起点位于陕西宝鸡'}>
      <defs><linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0"><stop stopColor="#6a9dc3" /><stop offset="1" stopColor={theme.ink} /></linearGradient><radialGradient id={gradient + '-city'}><stop stopColor={theme.wash} stopOpacity=".7" /><stop offset=".45" stopColor="#f4faff" stopOpacity=".38" /><stop offset="1" stopColor="#ecf7ff" stopOpacity="0" /></radialGradient></defs>
      <g className="uni-map-provinces">{geography.features.map(feature => <path key={feature.adcode} d={feature.path} className={feature.adcode === 610000 ? 'uni-map-home' : ''} />)}</g>
      <circle className="uni-origin-halo" cx={originX} cy={originY} r="16" /><circle className="uni-map-origin" cx={originX} cy={originY} r="5" />
      <text x={originX - 18} y={originY + 43} textAnchor="end" className="uni-map-origin-label">宝鸡中学</text>
      {target && active && <g key={active.id} className="uni-map-destination-layer"><circle className="uni-map-city-glow" cx={target[0]} cy={target[1]} r="110" fill={'url(#' + gradient + '-city)'} />
        <path className="uni-map-route-shadow" d={path} />
        <path className="uni-map-route" d={path} stroke={'url(#' + gradient + ')'} pathLength="1" />
        <circle className="uni-map-arrival-halo" cx={target[0]} cy={target[1]} r="17" />
        <circle className="uni-map-arrival" cx={target[0]} cy={target[1]} r="5" />
        <text x={target[0] + 18} y={target[1] - 25} className="uni-map-target-label">{active.name}</text>
        <text x={target[0] + 18} y={target[1] + 16} className="uni-map-city-label">{active.city}</text>
        <circle r="3" fill="var(--u-accent)"><animateMotion dur="2.8s" repeatCount="indefinite" path={path} /></circle>
      </g>}
    </svg>
    <div className="uni-map-status" aria-live="polite"><div className="uni-route-origin"><small><i />起点</small><strong>宝鸡中学</strong></div><div className="uni-route-destination"><small><i />下一站</small><strong key={active?.id || 'pending'}>{active?.name || '由你选择'}</strong></div></div>
    <div className="uni-map-mobile-select" aria-label="选择地图终点">{campuses.map(campus => <button key={campus.id} aria-pressed={active?.id === campus.id} onClick={() => onSelect(campus.id)}>{campus.name}</button>)}</div>
    
  </div>
}







