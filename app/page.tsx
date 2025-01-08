import Hero from '../components/Hero'
import Navigation from '../components/Navigation'
import About from '../components/About'
import Projects from '../components/Projects'
import Contact from '../components/Contact'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary to-black relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
      
      {/* Content */}
      <div className="relative">
        <Navigation />
        <Hero />
        <About />
        <Projects />
        <Contact />
      </div>
    </main>
  )
} 