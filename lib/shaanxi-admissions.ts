import catalog from '@/data/shaanxi-admissions-catalog.json'
import distributions from '@/data/shaanxi-score-distributions.json'
import type { UniversityAdmissions, AdmissionYear } from '@/data/shaanxi-admissions'

// Used only by the server detail page: send this school's records and only the
// relevant score bands to the browser, not the complete university catalog.
export function getShaanxiAdmissions(id: string): UniversityAdmissions | undefined {
  const original = (catalog as unknown as Record<string, UniversityAdmissions>)[id]
  if (!original) return undefined
  const records: UniversityAdmissions['records'] = {}
  for (const year of original.years) {
    const entry = original.records[year]
    if (!entry) continue
    const distribution = (distributions as unknown as Record<number, NonNullable<AdmissionYear['distribution']>>)[year]
    const selected: NonNullable<AdmissionYear['distribution']> = {}
    if (entry.kind !== 'submission' && distribution) {
      for (const subject of ['science', 'arts'] as const) {
        const source = distribution[subject]
        if (!source) continue
        const scores: Record<number, { count: number; cumulative: number }> = {}
        for (const record of entry.records.filter(row => row.subject === subject)) {
          if (source.scores[record.score]) scores[record.score] = source.scores[record.score]
        }
        selected[subject] = { source: source.source, scores }
      }
    }
    records[year] = { ...entry, distribution: selected }
  }
  return { ...original, records }
}
