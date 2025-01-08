'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { PERSONAL_DATA } from '@/utils/constants'
import Image from 'next/image'
import { RiAiGenerate, RiCodeSSlashFill, RiLayoutGridFill } from 'react-icons/ri'
import { useState, useEffect } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const skills = [
  {
    title: "Awesome UI/UX",
    icon: RiAiGenerate,
    description: "Creating beautiful and functional user interfaces"
  },
  {
    title: "Modern Development",
    icon: RiCodeSSlashFill,
    description: "Building with the latest web technologies and best practices"
  },
  {
    title: "Responsive Design",
    icon: RiLayoutGridFill,
    description: "Creating seamless experiences across all devices and platforms"
  }
]

const useSkillMotion = () => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useSpring(1, { stiffness: 300, damping: 20 })

  return { x, y, rotateX, rotateY, scale }
}

const About = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  // Mouse position values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation config
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 }

  // Create smooth values for rotation and movement
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig)
  const translateX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig)
  const translateY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig)
  const scale = useSpring(1, springConfig)

  // Initialize skill motions for each skill
  const skillMotion1 = useSkillMotion()
  const skillMotion2 = useSkillMotion()
  const skillMotion3 = useSkillMotion()
  
  // Create an array of skill motions
  const skillMotions = [skillMotion1, skillMotion2, skillMotion3]

  // Handle skill card hover
  const handleSkillCardMove = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (isMobile) return

    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = event.clientX - centerX
    const mouseY = event.clientY - centerY

    // Calculate rotation based on mouse position
    const rotateXValue = (mouseY / (rect.height / 2)) * -5
    const rotateYValue = (mouseX / (rect.width / 2)) * 5

    // Update motion values
    skillMotions[index].rotateX.set(rotateXValue)
    skillMotions[index].rotateY.set(rotateYValue)
    skillMotions[index].scale.set(1.02)
  }

  const handleSkillCardLeave = (index: number) => {
    skillMotions[index].rotateX.set(0)
    skillMotions[index].rotateY.set(0)
    skillMotions[index].scale.set(1)
  }

  // Handle device detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle mouse movement
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate normalized mouse position (-0.5 to 0.5)
    mouseX.set((event.clientX - centerX) / rect.width)
    mouseY.set((event.clientY - centerY) / rect.height)
    
    scale.set(1.05)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    scale.set(1)
  }

  // Handle touch movement for mobile
  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return
    
    const touch = event.touches[0]
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    mouseX.set((touch.clientX - centerX) / rect.width)
    mouseY.set((touch.clientY - centerY) / rect.height)
  }

  const { ref, controls } = useScrollAnimation()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] // Custom easing for smoother animation
      }
    }
  }

  return (
    <section id="about" className="min-h-screen py-12 md:py-20 bg-gradient-to-b from-black to-primary">
      <motion.div
        ref={ref}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
        className="max-w-6xl mx-auto px-4 md:px-6"
      >
        {/* Mobile Title - Shown only on mobile */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500 mb-8 md:hidden text-center"
        >
          About Me
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Image container */}
          <motion.div 
            variants={itemVariants}
            className="md:sticky md:top-24 mx-auto w-full max-w-[300px] md:max-w-none"
          >
            {/* Image Container with 3D effect */}
            <motion.div 
              className="relative perspective-1000"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseLeave}
            >
              <motion.div
                className="relative w-full aspect-square rounded-2xl overflow-hidden"
                style={{
                  rotateX: isMobile ? 0 : rotateX,
                  rotateY: isMobile ? 0 : rotateY,
                  translateX: isMobile ? 0 : translateX,
                  translateY: isMobile ? 0 : translateY,
                  scale,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Glow Effect */}
                <motion.div
                  className="absolute -inset-2 rounded-2xl"
                  style={{
                    background: useTransform(
                      mouseX,
                      [-0.5, 0, 0.5],
                      [
                        "radial-gradient(circle at 0% 50%, var(--accent-color) 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 50%, var(--accent-color) 0%, transparent 50%)",
                        "radial-gradient(circle at 100% 50%, var(--accent-color) 0%, transparent 50%)"
                      ]
                    ),
                    opacity: 0.2,
                    filter: "blur(1rem)"
                  }}
                />

                {/* Main Image */}
                <Image
                  src="/images/amit_about.jpg"
                  alt="Amit Kumar"
                  fill
                  className="object-cover rounded-2xl transition-all duration-300"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,..."
                />

                {/* Dynamic Shine Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl"
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
          </motion.div>

          {/* Content Side */}
          <motion.div 
            variants={itemVariants}
            className="space-y-6 md:space-y-8"
          >
            {/* Desktop Title - Hidden on mobile */}
            <motion.h2
              variants={itemVariants}
              className="hidden md:block text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
            >
              About Me
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-gray-300 leading-relaxed text-base md:text-lg"
            >
              {PERSONAL_DATA.about}
            </motion.p>

            {/* Skills */}
            <div className="grid gap-4 md:gap-6 pt-4">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.title}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: {
                        duration: 0.5,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: index * 0.1
                      }
                    }
                  }}
                  style={{
                    rotateX: skillMotions[index].rotateX,
                    rotateY: skillMotions[index].rotateY,
                    scale: skillMotions[index].scale,
                    transformStyle: 'preserve-3d',
                    perspective: 1000
                  }}
                  onMouseMove={(e) => handleSkillCardMove(e, index)}
                  onMouseLeave={() => handleSkillCardLeave(index)}
                  className="relative group"
                >
                  <motion.div 
                    className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-white/5 
                               backdrop-blur-sm hover:bg-white/10 transition-all duration-300 
                               cursor-pointer"
                  >
                    {/* Glow effect */}
                    <motion.div
                      className="absolute -inset-[1px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--accent-color) 0%, transparent 60%)',
                        opacity: 0.15,
                        filter: 'blur(8px)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
                        pointerEvents: 'none'
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex-shrink-0">
                      <skill.icon className="text-xl md:text-2xl text-accent" />
                    </div>
                    <div className="relative z-10 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-accent 
                                   transition-colors truncate">
                        {skill.title}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors 
                                  line-clamp-2 md:line-clamp-none">
                        {skill.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default About 