'use client'

import { useState } from 'react'

export default function UniversityEmblem({ src, name, size, priority = false }: { src: string | null; name: string; size: number; priority?: boolean }) {
  const [failed, setFailed] = useState<string | null>(null)
  if (!src || failed === src) return <span role="img" aria-label={name + '校徽暂缺'}>{name.slice(0, 1)}</span>
  return <img src={src} alt={name + '校徽'} width={size} height={size} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" onError={() => setFailed(src)} />
}
