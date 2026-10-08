import CampusTransitionProvider from '@/components/universities/CampusTransition'
import './universities.css'
export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  return <CampusTransitionProvider><div className="uni-world"><div className="uni-ambient" aria-hidden="true"><i className="uni-ambient-light uni-ambient-light-one" /><i className="uni-ambient-light uni-ambient-light-two" /><div className="uni-ambient-grain" /></div>{children}</div></CampusTransitionProvider>
}


