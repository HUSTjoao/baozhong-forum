// Count calendar days in China, independently of the visitor's timezone.
export function getGaokaoCountdowns(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(now)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value)
  const year = value('year')
  const today = Date.UTC(year, value('month') - 1, value('day'))
  const firstYear = today > Date.UTC(year, 5, 7) ? year + 1 : year
  return Array.from({ length: 3 }, (_, index) => {
    const targetYear = firstYear + index
    return { year: targetYear, days: Math.round((Date.UTC(targetYear, 5, 7) - today) / 86400000) }
  })
}
