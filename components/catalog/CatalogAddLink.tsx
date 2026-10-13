import Link from 'next/link'
import { Plus, ArrowUpRight } from 'lucide-react'
import './catalog-add-link.css'

export default function CatalogAddLink({ kind }: { kind: 'universities' | 'majors' }) {
  return <Link className="catalog-add-link" href={`/${kind}/add`}><span className="catalog-add-mark"><Plus size={17} strokeWidth={1.5} /></span><span>补充{kind === 'universities' ? '大学' : '专业'}</span><ArrowUpRight className="catalog-add-arrow" size={18} strokeWidth={1.5} /></Link>
}
