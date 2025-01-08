'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { RiBookmarkLine, RiCloseLine, RiMenuLine } from 'react-icons/ri'
import { useState, useEffect, useMemo } from 'react'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  const menuItems = useMemo(() => [
    { title: 'Home', href: '#', id: 'home' },
    { title: 'About', href: '#about', id: 'about' },
    { title: 'Projects', href: '#projects', id: 'projects' },
    { title: 'Contact', href: '#contact', id: 'contact' },
  ], [])

  // Update scroll effect and active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      
      // Determine active section
      const sections = menuItems.map(item => item.id)
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (section === 'home') {
            // Special case for home section
            return rect.bottom > 0
          }
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      }) || 'home' // Default to home if no section is found
      
      setActiveSection(current)
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [menuItems])

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
          scrolled ? 'bg-primary/80 backdrop-blur-sm' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo - Updated from SM to AK */}
          <motion.a
            href="#"
            className="text-xl font-bold relative group"
            whileHover="hover"
          >
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
              AK
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <motion.a
                key={item.title}
                href={item.href}
                className={`relative text-sm transition-colors ${
                  activeSection === item.id ? 'text-white' : 'text-gray-500'
                }`}
                whileHover={{ y: -2 }}
              >
                {item.title}
                {activeSection === item.id && (
                  <motion.span
                    layoutId="activeSection"
                    className="absolute -bottom-2 left-0 right-0 h-px bg-white"
                    initial={false}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.a>
            ))}
          </div>

          {/* Updated Blog Button */}
          <div className="hidden md:block">
            <Link href="/blog" passHref>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-accent/10 backdrop-blur-sm rounded-full border border-accent/20 flex items-center gap-2 hover:bg-accent/20 transition-colors"
              >
                <RiBookmarkLine className="text-lg text-accent" />
                <span className="text-accent">Blog</span>
              </motion.div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden relative z-50 p-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RiCloseLine className="text-2xl" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 45, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RiMenuLine className="text-2xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu with updated styling */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 backdrop-blur-xl pt-24 px-6 bg-black/50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-6"
            >
              {menuItems.map((item, i) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  className="text-2xl font-light text-white/90 hover:text-white transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: i * 0.1 + 0.2 }
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: menuItems.length * 0.1 + 0.2 }
                }}
              >
                <Link href="/blog">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-accent/10 px-6 py-3 rounded-full hover:bg-accent/20 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <RiBookmarkLine className="text-lg text-accent" />
                    <span className="text-accent">Blog</span>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navigation 