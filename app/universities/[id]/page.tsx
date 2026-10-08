import { campusTheme } from '@/lib/campus-themes'
import type { CSSProperties } from 'react'
import { CampusReturnLink } from '@/components/universities/CampusTransition'
import { notFound } from 'next/navigation'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCampusComments } from '@/lib/campus-comments'
import UniversityDiscussion from '@/components/universities/UniversityDiscussion'
export const dynamic = 'force-dynamic'
export default async function UniversityDetailPage({ params }: { params: { id: string } }) {
  const profile = await prisma.universityProfile.findUnique({ where: { id: params.id }, include: { university: true } })
  if (!profile) notFound()
  const theme = campusTheme(profile.id, profile.accent)
  const university = profile.university
  const { comments, count } = await getCampusComments(params.id)
  const levels = ['985', '211', '双一流'].filter(level => university.level?.split(/[／/、,，·\s]+/).includes(level))
  return <article className={'uni-shell uni-detail uni-accent-' + theme.key} style={{ '--u-accent': theme.ink, '--campus-page-wash': theme.wash, '--campus-card-wash': theme.card } as CSSProperties}>
    <CampusReturnLink universityId={params.id} />
    <section className="uni-school-summary" aria-label="学校介绍">
      <div className="uni-school-emblem">{university.logoUrl && <img src={university.logoUrl} alt={university.name + '校徽'} width={210} height={210} />}<div className="uni-emblem-links">{profile.website && <a className="uni-emblem-website" href={profile.website} target="_blank" rel="noreferrer">学校官网<ArrowUpRight size={14} /></a>}{profile.sourceUrl && <a className="uni-emblem-website" href={profile.sourceUrl} target="_blank" rel="noreferrer">介绍来源<ArrowUpRight size={14} /></a>}</div></div>
      <div className="uni-school-information">
        <h1>{university.name}</h1>
        {profile.englishName && <p className="uni-school-english" lang="en">{profile.englishName}</p>}
        <div className="uni-school-facts"><span><MapPin size={16} />{university.province === university.city ? university.city : university.province + ' · ' + university.city}</span><div className="uni-campus-levels">{levels.map(level => <span key={level}>{level}</span>)}</div></div>
        {profile.motto && <p className="uni-school-motto">{profile.motto}</p>}
        <p className="uni-school-description">{profile.introduction || '这所大学的校园资料正在整理，欢迎先在下面分享你的校园见闻。'}</p>
        
      </div>
    </section>
    <UniversityDiscussion universityId={params.id} initialComments={comments} count={count} />
  </article>
}





