export const studyPrompts = [
  { subject: '语文', text: '再背一首古诗。', detail: '合上书默写一遍，把易错的字再记牢。' },
  { subject: '语文', text: '积累一则作文素材。', detail: '试着用自己的话，写出它能支撑的观点。' },
  { subject: '数学', text: '再做一道压轴题。', detail: '先拆解条件，再找关键的一步。' },
  { subject: '数学', text: '梳理函数与导数。', detail: '把图像、单调性与极值放在一起理解。' },
  { subject: '英语', text: '读完一篇英语文章。', detail: '找出主旨，再回到原文定位关键信息。' },
  { subject: '英语', text: '复习一组易混词。', detail: '放进例句里，比较它们的语义与用法。' },
  { subject: '物理', text: '复习电学知识。', detail: '从电场到电路，把概念与规律连起来。' },
  { subject: '物理', text: '画一张受力分析图。', detail: '选好研究对象，逐一标出力的方向。' },
  { subject: '化学', text: '梳理氧化还原反应。', detail: '标出化合价变化，追踪电子的转移。' },
  { subject: '化学', text: '复习化学平衡。', detail: '比较条件改变前后，判断平衡移动方向。' },
  { subject: '生物', text: '复盘一道遗传题。', detail: '从表现型出发，一步步推导基因型。' },
  { subject: '生物', text: '整理细胞代谢。', detail: '画出过程，把物质、能量与场所对应起来。' },
  { subject: '政治', text: '梳理一个政治概念。', detail: '把概念、材料与论证连在一起。' },
  { subject: '政治', text: '练一道材料分析题。', detail: '提取材料中的线索，再组织自己的论述。' },
  { subject: '历史', text: '画一条历史时间轴。', detail: '串起关键事件，标出它们之间的联系。' },
  { subject: '历史', text: '读懂一段历史史料。', detail: '结合时代背景，辨析作者的立场。' },
  { subject: '地理', text: '读一张等高线地图。', detail: '观察疏密与弯曲，辨认地形和坡度。' },
  { subject: '地理', text: '梳理大气环流。', detail: '从气压带与风带出发，联系气候特征。' },
] as const

// Every suggestion appears once per shuffled round; the boundary cannot repeat.
export function shuffleStudyPrompts(previous = -1) {
  const order = studyPrompts.map((_, index) => index)
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[order[index], order[other]] = [order[other], order[index]]
  }
  if (order[0] === previous) [order[0], order[1]] = [order[1], order[0]]
  return order
}
