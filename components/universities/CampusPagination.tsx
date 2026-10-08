'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
export default function CampusPagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  const visible = [...new Set([1, pages, page - 1, page, page + 1].filter(n => n >= 1 && n <= pages))].sort((a, b) => a - b)
  return <nav className="uni-pagination" aria-label="大学列表页码"><button className="uni-page-direction" aria-label="上一页" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft size={19} strokeWidth={1.4} /></button><div className="uni-page-numbers">{visible.map((n, index) => <span key={n}>{index > 0 && n - visible[index - 1] > 1 && <i aria-hidden="true">…</i>}<button aria-label={'第' + n + '页'} aria-current={n === page ? 'page' : undefined} onClick={() => onChange(n)}>{String(n).padStart(2, '0')}</button></span>)}</div><button className="uni-page-direction" aria-label="下一页" disabled={page === pages} onClick={() => onChange(page + 1)}><ChevronRight size={19} strokeWidth={1.4} /></button></nav>
}
