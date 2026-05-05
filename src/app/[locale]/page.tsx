import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import TickerBar from '@/components/TickerBar'
import HowItWorks from '@/components/HowItWorks'
import FeatureTicker from '@/components/FeatureTicker'
import DemoAnimation from '@/components/DemoAnimation'
import AICompanion from '@/components/AICompanion'
import Manifesto from '@/components/Manifesto'
import ForCities from '@/components/ForCities'
import AntiFaq from '@/components/AntiFaq'
import CityEnergy from '@/components/CityEnergy'
import WaitlistSection from '@/components/WaitlistSection'
import Footer from '@/components/Footer'
import ScrollReset from '@/components/ScrollReset'

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
