'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PROJECTS } from '@/utils/constants'
import { useState, useEffect } from 'react'
import { RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'

const AUTOPLAY_INTERVAL = 5000 // 5 seconds between slides

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROJECTS.length)
    }, AUTOPLAY_INTERVAL)

    return () => clearInterval(timer)
  }, [isPaused])

  // Pause auto-play on hover/touch
  const handleInteractionStart = () => setIsPaused(true)
  const handleInteractionEnd = () => setIsPaused(false)

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % PROJECTS.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handlePrev = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    handleInteractionStart()
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }

    setTouchStart(0)
    setTouchEnd(0)
    handleInteractionEnd()
  }

  // Mouse position values for 3D effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation config
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }

  // Create smooth values for rotation and movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig)
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig)
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-10, 10]), springConfig)
  const scale = useSpring(1, springConfig)

  // Handle mouse movement for 3D effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set((event.clientX - centerX) / rect.width)
    mouseY.set((event.clientY - centerY) / rect.height)
    scale.set(1.02)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    scale.set(1)
  }

  return (
    <motion.section 
      id="projects" 
      className="min-h-screen py-20 bg-gradient-to-b from-primary to-black"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 bg-clip-text text-transparent 
                     bg-gradient-to-r from-white to-gray-500"
        >
          Featured Projects
        </motion.h2>

        <div 
          className="relative max-w-4xl mx-auto"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="overflow-hidden rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ 
                  type: "spring", 
                  damping: 20, 
                  stiffness: 100,
                  duration: 0.5 
                }}
                className="w-full"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  rotateX: isMobile ? 0 : rotateX,
                  rotateY: isMobile ? 0 : rotateY,
                  translateX: isMobile ? 0 : translateX,
                  translateY: isMobile ? 0 : translateY,
                  scale,
                  transformStyle: "preserve-3d",
                  perspective: 1000
                }}
              >
                <motion.div
                  className="bg-surface/30 backdrop-blur-sm rounded-lg overflow-hidden 
                             hover:bg-surface-light/30 transition-all duration-300 relative"
                >
                  {/* Project Content */}
                  <div className="relative z-10">
                    {/* Image Container */}
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={`/images/projects/${PROJECTS[currentIndex].image}`}
                        alt={PROJECTS[currentIndex].title}
                        width={1280}
                        height={720}
                        className="w-full h-full object-cover transition-all duration-500"
                        priority={currentIndex === 0}
                      />
                      {/* Overlay with reduced opacity for better image visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent opacity-50" />
                    </div>

                    {/* Project Info */}
                    <div className="p-5 md:p-6 space-y-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {PROJECTS[currentIndex].tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs bg-surface/50 text-gray-300 
                                     rounded-full border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-accent 
                                   transition-colors"
                      >
                        {PROJECTS[currentIndex].title}
                      </h3>

                      <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                        {PROJECTS[currentIndex].description}
                      </p>

                      {/* Project Links with improved styling */}
                      <div className="pt-4">
                        <motion.a
                          href={PROJECTS[currentIndex].liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 
                                     text-accent text-sm font-medium rounded-xl border border-accent/30 
                                     transition-all duration-300"
                        >
                          <span>View Project</span>
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </motion.a>
                      </div>
                    </div>
                  </div>

                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: useTransform(
                        mouseX,
                        [-0.5, 0, 0.5],
                        [
                          "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
                          "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
                          "linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)"
                        ]
                      )
                    }}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                className="p-3 rounded-full bg-accent/10 hover:bg-accent/20 
                           transition-colors text-accent border border-accent/30"
              >
                <RiArrowLeftSLine className="text-lg" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                className="p-3 rounded-full bg-accent/10 hover:bg-accent/20 
                           transition-colors text-accent border border-accent/30"
              >
                <RiArrowRightSLine className="text-lg" />
              </motion.button>
            </div>

            {/* Progress Indicators */}
            <div className="flex gap-2">
              {PROJECTS.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index)
                    handleInteractionStart()
                    setTimeout(handleInteractionEnd, 2000)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'w-8 bg-accent' 
                      : 'w-1.5 bg-accent/30 hover:bg-accent/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

export default Projects 