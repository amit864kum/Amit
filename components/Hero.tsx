'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { PERSONAL_DATA } from '@/utils/constants'
import { FiArrowDown } from 'react-icons/fi'
import { 
  RiCodeSSlashLine, 
  RiReactjsLine,
  RiTerminalBoxLine, 
  RiBracesFill,
  RiGithubLine,
  RiHtml5Line,
  RiCss3Line,
  RiJavascriptLine,
  RiNpmjsLine,
  RiDatabase2Line,
  RiLayoutGridLine,
  RiStackLine
} from 'react-icons/ri'
import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'

const FloatingIcons = [
  { icon: RiReactjsLine, color: 'text-blue-400 hover:text-blue-300' },
  { icon: RiTerminalBoxLine, color: 'text-purple-400 hover:text-purple-300' },
  { icon: RiCodeSSlashLine, color: 'text-orange-400 hover:text-orange-300' },
  { icon: RiBracesFill, color: 'text-green-400 hover:text-green-300' },
  { icon: RiGithubLine, color: 'text-gray-400 hover:text-gray-300' },
  { icon: RiHtml5Line, color: 'text-red-400 hover:text-red-300' },
  { icon: RiCss3Line, color: 'text-blue-500 hover:text-blue-400' },
  { icon: RiJavascriptLine, color: 'text-yellow-400 hover:text-yellow-300' },
  { icon: RiNpmjsLine, color: 'text-red-500 hover:text-red-400' },
  { icon: RiDatabase2Line, color: 'text-green-500 hover:text-green-400' },
  { icon: RiLayoutGridLine, color: 'text-purple-500 hover:text-purple-400' },
  { icon: RiStackLine, color: 'text-cyan-400 hover:text-cyan-300' }
]

interface MousePosition {
  x: number;
  y: number;
}

const Hero = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check if device is touch-enabled
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

  // Enhanced mouse/touch movement handler
  useEffect(() => {
    const handleMovement = (e: MouseEvent | TouchEvent) => {
      const pos = {
        x: 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX,
        y: 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      }
      setMousePosition(pos)
    }

    if (!isTouchDevice) {
      window.addEventListener('mousemove', handleMovement as (e: MouseEvent) => void)
      window.addEventListener('mouseleave', () => setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
    } else {
      window.addEventListener('touchmove', handleMovement as (e: TouchEvent) => void)
      window.addEventListener('touchend', () => setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
    }

    return () => {
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', handleMovement as (e: MouseEvent) => void)
        window.removeEventListener('mouseleave', () => setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
      } else {
        window.removeEventListener('touchmove', handleMovement as (e: TouchEvent) => void)
        window.removeEventListener('touchend', () => setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))
      }
    }
  }, [isTouchDevice])

  // Remove the transforms as we don't need them anymore
  const starElements = useMemo(() => 
    [...Array(150)].map(() => ({
      size: Math.random() * 2 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 3 + 2
    })), []
  )

  const floatingElements = useMemo(() => 
    FloatingIcons.map(() => ({
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      scale: Math.random() * 0.4 + 0.4,
      duration: Math.random() * 15 + 25,
      delay: Math.random() * 5,
      moveRadius: Math.random() * (isTouchDevice ? 20 : 40) + (isTouchDevice ? 10 : 20),
      rotationSpeed: Math.random() * 15 + 15,
      initialRotation: Math.random() * 360,
      movementPath: Math.random() > 0.5
    })), [isTouchDevice]
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToNext = () => {
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Calculate distance from cursor/touch to icon for dynamic interaction
  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  // Scroll to projects section
  const scrollToProjects = () => {
    const projectsSection = document.getElementById('projects')
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!mounted) return null

  return (
    <section id="home" className="h-screen relative overflow-hidden bg-black">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Stars remain same */}
        {starElements.map((star, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: star.size,
              height: star.size,
              left: star.left,
              top: star.top,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Floating icons - Hide some on mobile */}
        {FloatingIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className={`absolute ${index > 5 ? 'hidden md:block' : ''}`} // Hide some icons on mobile
            style={{
              left: `${floatingElements[index].x}%`,
              top: `${floatingElements[index].y}%`,
              scale: floatingElements[index].scale,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1,
              delay: floatingElements[index].delay * 0.2,
            }}
          >
            <motion.div
              className={`absolute ${isTouchDevice ? 'touch-none' : 'cursor-pointer'}`}
              style={{
                left: `${floatingElements[index].x}%`,
                top: `${floatingElements[index].y}%`,
                scale: floatingElements[index].scale
              }}
              animate={{
                x: floatingElements[index].movementPath 
                  ? [
                      -floatingElements[index].moveRadius,
                      floatingElements[index].moveRadius,
                      -floatingElements[index].moveRadius
                    ]
                  : [
                      floatingElements[index].moveRadius,
                      -floatingElements[index].moveRadius,
                      floatingElements[index].moveRadius
                    ],
                y: [
                  -floatingElements[index].moveRadius,
                  floatingElements[index].moveRadius,
                  -floatingElements[index].moveRadius
                ],
                rotate: [
                  floatingElements[index].initialRotation,
                  floatingElements[index].initialRotation + 360
                ]
              }}
              transition={{
                duration: floatingElements[index].duration,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.5, 1]
              }}
              whileHover={!isTouchDevice ? {
                scale: 1.5,
                transition: { duration: 0.2 }
              } : undefined}
            >
              <motion.div
                className={`p-4 rounded-xl backdrop-blur-sm ${Icon.color} transition-all duration-300`}
                animate={{
                  x: (mousePosition.x - window.innerWidth / 2) * (isTouchDevice ? 0.02 : 0.05) * 
                    (1 - getDistance(
                      mousePosition.x,
                      mousePosition.y,
                      (window.innerWidth * floatingElements[index].x) / 100,
                      (window.innerHeight * floatingElements[index].y) / 100
                    ) / Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))),
                  y: (mousePosition.y - window.innerHeight / 2) * (isTouchDevice ? 0.02 : 0.05) * 
                    (1 - getDistance(
                      mousePosition.x,
                      mousePosition.y,
                      (window.innerWidth * floatingElements[index].x) / 100,
                      (window.innerHeight * floatingElements[index].y) / 100
                    ) / Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))),
                  rotateX: (mousePosition.y - window.innerHeight / 2) * (isTouchDevice ? 0.01 : 0.02),
                  rotateY: (mousePosition.x - window.innerWidth / 2) * (isTouchDevice ? 0.01 : 0.02),
                  scale: 1 + (0.3 * (1 - getDistance(
                    mousePosition.x,
                    mousePosition.y,
                    (window.innerWidth * floatingElements[index].x) / 100,
                    (window.innerHeight * floatingElements[index].y) / 100
                  ) / Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2))))
                }}
                transition={{
                  type: "spring",
                  stiffness: isTouchDevice ? 100 : 150,
                  damping: isTouchDevice ? 20 : 15,
                  mass: isTouchDevice ? 1 : 0.5
                }}
                initial={{ boxShadow: '0 0 0 rgba(255, 255, 255, 0)' }}
                whileHover={!isTouchDevice ? {
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  scale: 1.2,
                  rotateX: 0,
                  rotateY: 0
                } : undefined}
              >
                <Icon.icon 
                  className="text-3xl transition-transform duration-300" 
                  style={{ 
                    filter: 'drop-shadow(0 0 8px currentColor)',
                    transformStyle: 'preserve-3d'
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/0" />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative z-20 px-4 max-w-6xl mx-auto w-full"
        >
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-left space-y-4 md:space-y-8"
            >
              {/* AI Developer Title */}
              <div className="space-y-2 md:space-y-3">
                <motion.div 
                  className="inline-block mb-2 md:mb-4"
                  animate={{ 
                    boxShadow: ['0 0 20px rgba(59, 130, 246, 0.3)', '0 0 40px rgba(59, 130, 246, 0.5)', '0 0 20px rgba(59, 130, 246, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="bg-accent/10 backdrop-blur-sm text-accent px-4 py-1.5 text-sm md:text-base font-mono rounded-full">
                    Hi, I am Amit Kumar
                  </span>
                </motion.div>
                <h1 className="text-2xl md:text-6xl font-bold leading-relaxed md:leading-tight tracking-wide">
                  Crafting
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-purple-500 to-accent ml-2">
                    Digital
                  </span>
                  <br className="hidden md:block" />
                  <span className="inline-flex items-center">
                    <span className="text-white">with</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-500 ml-2">
                      Code
                    </span>
                  </span>
                </h1>
              </div>

              {/* Description with increased line height */}
              <motion.div 
                className="relative font-mono text-gray-400 text-sm md:text-lg leading-relaxed md:leading-loose"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <span className="text-accent">&gt;</span> 
                <span className="hidden md:inline">Full-stack developer specializing in</span>
                <span className="md:hidden text-sm leading-loose">
                  Building modern web applications
                </span>
                <motion.span
                  className="inline-block ml-2 text-white"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  _
                </motion.span>
                {/* Tree structure with increased spacing */}
                <motion.div className="mt-4 hidden md:block space-y-2">
                  <span className="text-accent">├─</span> Create scalable web solutions<br />
                  <span className="text-accent">├─</span> Build responsive user interfaces<br />
                  <span className="text-accent">└─</span> Develop robust backend systems
                </motion.div>
              </motion.div>

              {/* CTA Buttons - Now functional */}
              <motion.div
                className="flex gap-2 md:gap-4 mt-4 md:mt-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <motion.button
                  onClick={scrollToProjects}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-6 py-3 bg-accent/20 backdrop-blur-sm rounded-xl 
                             border border-accent/30 text-white"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span>View Projects</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent to-blue-500 
                               opacity-0 group-hover:opacity-20 transition-opacity"
                    initial={false}
                  />
                </motion.button>

                <motion.a
                  href={PERSONAL_DATA.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-6 py-3 rounded-xl border border-white/10 
                             hover:bg-white/5 backdrop-blur-sm transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <RiGithubLine className="text-xl transition-transform group-hover:-translate-y-0.5" />
                    <span>GitHub</span>
                  </span>
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 
                               opacity-0 group-hover:opacity-20 transition-opacity"
                    initial={false}
                  />
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <HeroImage />
          </div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        onClick={scrollToNext}
      >
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="p-3 rounded-full bg-accent/10 backdrop-blur-sm border border-accent/20 hover:bg-accent/20 transition-colors"
        >
          <FiArrowDown className="text-2xl text-accent" />
        </motion.div>
      </motion.div>
    </section>
  )
}

const HeroImage = () => {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation config
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }

  // Create smooth values for rotation and movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig)
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig)
  const scale = useSpring(1, springConfig)

  // Handle mouse movement for 3D effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set((event.clientX - centerX) / rect.width)
    mouseY.set((event.clientY - centerY) / rect.height)
    scale.set(1.05)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    scale.set(1)
  }

  return (
    <motion.div
      className="relative md:block order-first md:order-last"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 1 }}
    >
      <div className="relative w-full aspect-square max-w-[280px] md:max-w-[450px] mx-auto">
        <motion.div
          className="relative w-full h-full perspective-1000"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            translateX,
            translateY,
            scale,
            transformStyle: "preserve-3d"
          }}
        >
          {/* Glow Effect Container - Reduced opacity */}
          <motion.div
            className="absolute -inset-2 rounded-3xl opacity-40 blur-xl"
            style={{
              background: useTransform(
                mouseX,
                [-0.5, 0, 0.5],
                [
                  "radial-gradient(circle at 0% 50%, var(--accent-color) 0%, transparent 70%)",
                  "radial-gradient(circle at 50% 50%, var(--accent-color) 0%, transparent 70%)",
                  "radial-gradient(circle at 100% 50%, var(--accent-color) 0%, transparent 70%)"
                ]
              ),
              opacity: useTransform(scale, [1, 1.05], [0, 0.12])
            }}
          />

          {/* Image Container - Removed background */}
          <motion.div
            className="relative w-full h-full overflow-hidden rounded-3xl"
            style={{
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <Image
              src="/images/hero.png"
              alt="Hero Image"
              width={600}
              height={600}
              className="w-full h-full object-cover scale-110 transition-transform duration-500"
              priority
            />

            {/* Shine Effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: useTransform(
                  mouseX,
                  [-0.5, 0, 0.5],
                  [
                    "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0.1) 60%, transparent 80%)",
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.1) 60%, transparent 80%)",
                    "linear-gradient(105deg, transparent 60%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.1) 80%, transparent 100%)"
                  ]
                )
              }}
            />
          </motion.div>

          {/* Interactive Particles - Adjusted for larger size */}
          <motion.div
            className="absolute -inset-6 z-20 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-accent rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  filter: "blur(0.5px)"
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Hero 