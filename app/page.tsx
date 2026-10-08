import HomeScrollReset from '@/components/HomeScrollReset'
import UniversityJourney from '@/components/UniversityJourney'
import AdmissionLetter from '@/components/AdmissionLetter'
import GaokaoTimeline from '@/components/GaokaoTimeline'
import CampusFrames from '@/components/CampusFrames'

export default function Home() {
  return (
    <div className="home-animated flex flex-col">
      <HomeScrollReset />
      <UniversityJourney />
      <AdmissionLetter />
      <GaokaoTimeline />
      <CampusFrames />
    </div>
  )
}
