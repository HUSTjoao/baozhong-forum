// Format the reviewed introduction without rewriting any school facts.
const keyTerms = [
  '综合性研究型大学', '中国科学院', '中国西部科技创新港', '航空航天', '人文社会科学',
  '生命医学', '生命科学', '信息技术', '计算机', '人工智能', '电子信息', '材料科学',
  '基础研究', '基础学科', '工程教育', '师范教育', '医学教育', '教师教育',
  '文理基础', '农林', '农业', '林业', '医学', '药学', '中医药', '理工', '机械工程', '光电信息科学与工程', '控制科学与工程',
  '经济', '金融', '法学', '管理', '艺术', '音乐', '美术', '体育', '外语',
  '地质', '海洋', '交通', '建筑', '水利', '电力', '通信', '化工', '纺织', '矿业',
  '跨学科', '实践教学', '西迁精神', '求是精神'
].sort((a, b) => b.length - a.length)
const emphasis = new RegExp(`(?:18|19|20)\\d{2}年|${keyTerms.join('|')}`, 'g')

function readingParagraphs(text: string) {
  const existing = text.trim().split(/\n\s*\n|\n/).filter(Boolean)
  if (existing.length >= 2) return [existing[0], existing.slice(1).join('')]
  const sentences = text.match(/[^。！？]+[。！？]?/g) || [text]
  if (sentences.length < 2) return [text]
  // Keep sentences intact and choose a balanced reading break.
  let split = 1
  let closest = Infinity
  for (let index = 1; index < sentences.length; index++) {
    const distance = Math.abs(sentences.slice(0, index).join('').length - text.length * .45)
    if (distance < closest) { closest = distance; split = index }
  }
  return [sentences.slice(0, split).join(''), sentences.slice(split).join('')]
}

function highlight(text: string) {
  const parts = []
  let cursor = 0
  let count = 0
  const seen = new Set<string>()
  for (const match of text.matchAll(emphasis)) {
    if (count >= 3) break
    if (seen.has(match[0])) continue
    seen.add(match[0])
    const start = match.index!
    parts.push(text.slice(cursor, start))
    parts.push(<strong key={start}>{match[0]}</strong>)
    cursor = start + match[0].length
    count++
  }
  parts.push(text.slice(cursor))
  return parts
}

export default function CampusIntroduction({ text }: { text: string }) {
  return <div className="uni-school-reading">{readingParagraphs(text).map((paragraph, index) => <p className="uni-school-description" key={index}>{highlight(paragraph)}</p>)}</div>
}
