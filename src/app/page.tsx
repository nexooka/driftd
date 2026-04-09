import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import HowItWorks from '@/components/HowItWorks'
import AICompanion from '@/components/AICompanion'
import ForCities from '@/components/ForCities'
import WaitlistSection from '@/components/WaitlistSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <AICompanion />
      <ForCities />
      <WaitlistSection />
      <Footer />
    </main>
  )
}
