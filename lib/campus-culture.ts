// Official culture descriptions are labelled separately from formal mottos.
// PKU: https://www.pku.edu.cn/about.html
// DUT: https://dgc.dlut.edu.cn/info/1341/1421.htm
// BJFU: https://www.bjfu.edu.cn/xxgk/xxzc/index.htm
const cultureDescriptions: Record<string, string> = {
  pku: '学风 · 勤奋、严谨、求实、创新',
  dlut: '大学精神 · 海纳百川、自强不息、厚德笃学、知行合一',
  bjfu: '办学理念 · 知山知水、树木树人',
}
export function campusCulture(id: string, motto: string) {
  return cultureDescriptions[id] || motto
}
