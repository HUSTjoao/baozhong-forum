import 'dotenv/config'
import { prisma } from '../lib/prisma'
const profiles = [
  { id: 'hust', name: '华中科技大学', level: '985/211/双一流', province: '湖北', city: '武汉', logoUrl: '/logos/hust.png', englishName: 'Huazhong University of Science and Technology', motto: '明德厚学 · 求是创新', introduction: '华中科技大学位于湖北武汉，是教育部直属的综合性研究型大学。学校于2000年由华中理工大学、同济医科大学和武汉城市建设学院合并成立，学科覆盖理、工、医、文等多个领域。机械工程、光学工程、生物医学工程、公共卫生与预防医学是其特色学科。校园绿树成荫，被称为“森林式大学”，学习之外也有丰富的社团与校园生活。', website: 'https://www.hust.edu.cn/', sourceUrl: 'https://www.hust.edu.cn/xxgk/xxjj.htm', accent: 'cyan' },
  { id: 'tsinghua', name: '清华大学', level: '985/211/双一流', province: '北京', city: '北京', logoUrl: '/logos/tsinghua.png', englishName: 'Tsinghua University', motto: '自强不息 · 厚德载物', introduction: '清华大学位于北京清华园，前身是1911年创办的清华学堂。学校从以工科见长的大学发展为综合性、研究型、开放式大学，学科覆盖理、工、文、艺术、经济、管理、医学等领域。这里既有工程与科研的传统，也重视人文艺术和跨学科学习。二校门、大礼堂与清华学堂，记录着校园的历史；“自强不息、厚德载物”是学校的校训。', website: 'https://www.tsinghua.edu.cn/', sourceUrl: 'https://www.tsinghua.edu.cn/xxgk/xxyg.htm', accent: 'violet' },
]
async function main() {
  if (process.env.DATABASE_PROVIDER === 'postgresql') throw new Error('Local development only.')
  for (const { id, name, level, province, city, logoUrl, ...profile } of profiles) {
    await prisma.$transaction(async tx => {
      await tx.university.upsert({ where: { id }, create: { id, name, level, province, city, logoUrl }, update: { name, level, province, city, logoUrl } })
      await tx.universityProfile.upsert({ where: { id }, create: { id, ...profile }, update: {} })
    })
  }
  console.log('Prepared 2 newly researched profiles; existing editorial content preserved.')
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())


