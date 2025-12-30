import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col">
        <div className="flex-grow">
          {children}
        </div>
        <Footer />
      </main>
    </>
  )
}

