import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TickerBar from '@/components/TickerBar'
import HowItWorks from '@/components/HowItWorks'
import FeatureTicker from '@/components/FeatureTicker'
import AICompanion from '@/components/AICompanion'
import Manifesto from '@/components/Manifesto'
import ForCities from '@/components/ForCities'
import AntiFaq from '@/components/AntiFaq'
import WaitlistSection from '@/components/WaitlistSection'
import Footer from '@/components/Footer'
import ScrollReset from '@/components/ScrollReset'

const DemoAnimation = dynamic(() => import('@/components/DemoAnimation'), { ssr: false })
const CityEnergy = dynamic(() => import('@/components/CityEnergy'), { ssr: false })

export default function Home() {
  return (
    <main>
      <ScrollReset />
      <Navbar />
      <HeroSection />
      <TickerBar />
      <HowItWorks />
      <FeatureTicker />
      <DemoAnimation />
      <AICompanion />
      <Manifesto />
      <ForCities />
      <AntiFaq />
      <CityEnergy />
      <WaitlistSection />
      <Footer />
    </main>
  )
}
