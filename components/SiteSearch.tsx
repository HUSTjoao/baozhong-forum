'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'

type Result = { id: string; name: string; type: string; href: string }

export default function SiteSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  useEffect(() => {
    if (!query.trim()) return
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        if (!response.ok) throw new Error('Search failed')
        const data = await response.json()
        if (!controller.signal.aborted) { setResults(data.results); setStatus('ready') }
      } catch {
        if (!controller.signal.aborted) setStatus('error')
      }
    }, 200)
    return () => { clearTimeout(timeout); controller.abort() }
  }, [query])
  return (
    <section className="home-search-panel" aria-label="站内搜索">
      <label htmlFor="site-search-input">寻找大学与专业</label>
      <div className="home-search-input"><Search size={20} aria-hidden="true" /><input id="site-search-input" type="search" autoFocus maxLength={80} placeholder="输入大学或专业名称" value={query} onChange={event => { setQuery(event.target.value); setResults([]); setStatus(event.target.value.trim() ? 'loading' : 'idle') }} /></div>
      <p role="status">{status === 'idle' ? '从一所大学，或一个感兴趣的专业开始。' : status === 'loading' ? '正在搜索…' : status === 'error' ? '搜索暂时不可用，请稍后重试。' : results.length ? `找到 ${results.length} 个匹配项` : '没有找到匹配项，试试更短的名称。'}</p>
      <div className="home-search-results">{results.map(item => <Link key={`${item.type}-${item.id}`} href={item.href} onClick={onClose}><span><small>{item.type}</small>{item.name}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div>
    </section>
  )
}
