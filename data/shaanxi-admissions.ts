export type AdmissionRecord = {
  code: string
  label: string
  subject: 'arts' | 'science'
  score: number
  highest?: number
  /** Exact minimum rank from a provincial submission table. */
  rank?: number
  /** Rank reproduced as published by the university; its tie-break precision is not inferred. */
  publishedRank?: number
  planned?: number
  submitted?: number
  requirement?: string
  additional?: boolean
  batch?: string
  source?: string
  derived?: boolean
  majorCount?: number
  category?: string
}
export type AdmissionYear = {
  kind: 'submission' | 'admission' | 'reference'
  source: string
  artsSource?: string
  sourceName: string
  batch?: string
  published?: string
  note?: string
  distribution?: Partial<Record<'arts' | 'science', {
    source: string
    scores: Record<number, { count: number; cumulative: number }>
  }>>
  records: AdmissionRecord[]
}
export type UniversityAdmissions = {
  universityId: string
  name: string
  checkedAt: string
  years: number[]
  officialUrl: string
  yearNotes?: Partial<Record<number, { text: string; source: string }>>
  records: Partial<Record<number, AdmissionYear>>
}

// One-point tables identify the tied-score cohort, never the exact last admit.
export function admissionScoreRank(dataset: AdmissionYear | undefined, subject: 'arts' | 'science', score: number) {
  const distribution = dataset?.distribution?.[subject]
  const band = distribution?.scores[score]
  return band && distribution ? { start: band.cumulative - band.count + 1, end: band.cumulative, source: distribution.source } : undefined
}
