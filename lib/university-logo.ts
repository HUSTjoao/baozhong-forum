import manifest from '@/data/optimized-university-logos.json'

export function universityLogo(source: string | null, size: 'list' | 'detail' = 'list') {
  const images = source ? (manifest as Record<string, Record<string, string>>)[source] : undefined
  // User-added or unavailable assets keep their existing URL.
  return images?.[size === 'list' ? '192' : '420'] || source
}
