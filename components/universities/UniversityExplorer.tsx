'use client'
import { useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CampusPagination from './CampusPagination'
import CampusMap from './CampusMap'
import CampusCard, { type Campus } from './CampusCard'
import { Search, ChevronDown } from 'lucide-react'


export default function UniversityExplorer({ universities }: { universities: Campus[] }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useSearchParams()
  const query = params.get('q') || ''
  const province = params.get('province') || '全部'
  const level = params.get('level') || '全部'
  const [activeId, setActiveId] = useState<string | null>(null)

  const filtered = universities.filter(u => (province === '全部' || u.province === province) && (level === '全部' || (level === '其他' ? !/985|211|双一流/.test(u.level || '') : (u.level || '').includes(level))) && [u.name, u.englishName, u.city, u.province].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / 18))
  const requestedPage = Number(params.get('page') || 1)
  const page = Math.max(1, Math.min(pages, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1))
  const visible = filtered.slice((page - 1) * 18, page * 18)
  function browse(next: { query?: string; province?: string; level?: string; page?: number }, scroll = false) {
    const search = new URLSearchParams()
    const q = next.query ?? query
    const region = next.province ?? province
    const tier = next.level ?? level
    const targetPage = next.page ?? 1
    if (q) search.set('q', q)
    if (region !== '全部') search.set('province', region)
    if (tier !== '全部') search.set('level', tier)
    if (targetPage > 1) search.set('page', String(targetPage))
    setActiveId(null)
    router.replace('/universities' + (search.size ? '?' + search.toString() : ''), { scroll: false })
    if (scroll) gridRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return <div className="uni-shell uni-map-explorer">
    <div className="uni-explorer-columns">
      <aside className="uni-explorer-left">
        <header className="uni-intro"><div><h1 className="uni-art-heading"><span className="uni-art-line-one">你的未来，</span><span className="uni-art-line-two">有不止一种<span className="uni-art-coordinate">坐标。</span></span></h1><p className="uni-lead"><span>从一枚校徽、一句校训开始，<br />认识一所大学。</span><span>再向经历过的人，<br />问一问真正的校园生活。</span></p></div></header>
        <CampusMap active={filtered.find(u => u.id === activeId) || null} campuses={visible} onSelect={setActiveId} />
      </aside>
      <section className="uni-explorer-right" aria-label="探索大学">
        <div className="uni-tools"><label className="uni-search"><Search size={20} /><input aria-label="搜索大学或城市" value={query} onChange={e => browse({ query: e.target.value })} placeholder="搜索大学、城市或英文名称" /></label><span className="uni-total" aria-label={filtered.length + '所大学'}><b>{filtered.length.toString().padStart(2, '0')}</b><span>所大学</span></span></div>
        <div className="uni-select-filters"><label className="uni-filter-select"><span>地区</span><select aria-label="地区筛选" value={province} onChange={e => browse({ province: e.target.value }, true)}><option value="全部">全部地区</option>{Array.from(new Set(universities.map(u => u.province))).filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></label><label className="uni-filter-select"><span>学校层次</span><select aria-label="学校层次筛选" value={level} onChange={e => browse({ level: e.target.value }, true)}>{['全部', '985', '211', '双一流', '其他'].map(t => <option key={t} value={t}>{t === '全部' ? '全部层次' : t}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></label></div>
        <div className="uni-grid" ref={gridRef} tabIndex={0} aria-label="本页学校，向下滚动浏览">{visible.map((u, index) => <CampusCard key={u.id} campus={u} index={index} active={activeId === u.id} onActivate={() => setActiveId(u.id)} />)}</div>
        {filtered.length === 0 && <p className="uni-empty">暂时没有匹配的大学。试试其他名称或地区。</p>}
        {filtered.length > 0 && <CampusPagination page={page} pages={pages} onChange={n => browse({ page: n }, true)} />}
        <p className="uni-editor-note">高校资料持续整理中。先认真认识一所，再遇见更多可能。</p>
      </section>
    </div>
  </div>
}












