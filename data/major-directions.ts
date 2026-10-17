import { majors, type Major, type MajorCategory } from './majors'

// These are concise browsing directions, not additional official degree levels.
export const majorDirections: Record<MajorCategory, { id: string; name: string; prefixes: string[] }[]> = {
  arts: [
    { id: 'language', name: '语言文学', prefixes: ['0501', '0502'] },
    { id: 'history', name: '历史哲学', prefixes: ['01', '06'] },
    { id: 'society', name: '法律社会', prefixes: ['03'] },
    { id: 'media', name: '新闻传播', prefixes: ['0503'] },
    { id: 'economics', name: '经济金融', prefixes: ['02'] },
    { id: 'management', name: '管理商科', prefixes: ['12'] },
    { id: 'education', name: '教育', prefixes: ['0401'] },
  ],
  science: [
    { id: 'mathematics', name: '数学统计', prefixes: ['0701', '0712'] },
    { id: 'physics', name: '物理天文', prefixes: ['0702', '0704'] },
    { id: 'chemistry', name: '化学', prefixes: ['0703'] },
    { id: 'biology', name: '生物生态', prefixes: ['0710'] },
    { id: 'earth', name: '地球环境', prefixes: ['0705', '0706', '0707', '0708', '0709'] },
    { id: 'psychology', name: '心理', prefixes: ['0711'] },
  ],
  engineering: [
    { id: 'computing', name: '计算机', prefixes: ['0809'] },
    { id: 'electronics', name: '电子电气与自动化', prefixes: ['0803', '0806', '0807', '0808', '0826'] },
    { id: 'mechanics', name: '机械与交通', prefixes: ['0801', '0802', '0818', '0819', '0823', '0824'] },
    { id: 'materials', name: '材料与化工', prefixes: ['0804', '0813', '0816', '0817', '0827', '0830'] },
    { id: 'energy', name: '能源与环境', prefixes: ['0805', '0814', '0815', '0822', '0825', '0829'] },
    { id: 'construction', name: '土木与建筑', prefixes: ['0810', '0811', '0812', '0828'] },
    { id: 'aerospace', name: '航空航天', prefixes: ['0820', '0821'] },
  ],
  medicine: [
    { id: 'clinical', name: '临床与口腔', prefixes: ['1002', '1003'] },
    { id: 'chinese-medicine', name: '中医中药', prefixes: ['1005', '1006', '1008'] },
    { id: 'pharmacy', name: '药学', prefixes: ['1007'] },
    { id: 'public-health', name: '公共卫生', prefixes: ['1004'] },
    { id: 'nursing', name: '护理与医学技术', prefixes: ['1010', '1011'] },
    { id: 'basic-medicine', name: '基础医学', prefixes: ['1001', '1009'] },
  ],
  other: [
    { id: 'agriculture', name: '农林', prefixes: ['0901', '0902', '0905', '0907'] },
    { id: 'animals', name: '动物与水产', prefixes: ['0903', '0904', '0906'] },
    { id: 'design', name: '艺术设计', prefixes: ['1301', '1304', '1305'] },
    { id: 'performance', name: '音乐与表演', prefixes: ['1302', '1303'] },
    { id: 'sports', name: '体育', prefixes: ['0402'] },
  ],
}

const catalogCodes = new Map(majors.map(major => [major.name, major.officialCode]))
export function majorDirectionOf(major: Pick<Major, 'name' | 'category' | 'officialCode'>): string {
  const code = major.officialCode || catalogCodes.get(major.name)
  if (!code) return 'uncategorized'
  if (major.category === 'other' && code === '130310') return 'design' // Animation belongs with visual design in this browsing layout.
  return majorDirections[major.category]?.find(direction => direction.prefixes.some(prefix => code.startsWith(prefix)))?.id || 'uncategorized'
}
