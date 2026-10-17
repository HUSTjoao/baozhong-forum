import HomeScrollReset from '@/components/HomeScrollReset'
import UniversityJourney from '@/components/UniversityJourney'
import AdmissionLetter from '@/components/AdmissionLetter'
import GaokaoTimeline from '@/components/GaokaoTimeline'
import CampusFrames from '@/components/CampusFrames'
import photos from '@/data/optimized-campus-photos.json'

export default function Home() {
  return (
    <div className="home-animated flex flex-col">
      <link rel="preload" as="image" href={photos['/home-campus-blossoms-clean.png'].src} imageSrcSet={photos['/home-campus-blossoms-clean.png'].srcSet} imageSizes="(max-aspect-ratio: 16/9) 178vh, 100vw" fetchPriority="high" />
      <HomeScrollReset />
      <UniversityJourney />
      <AdmissionLetter />
      <GaokaoTimeline />
      <CampusFrames />
    </div>
  )
}
