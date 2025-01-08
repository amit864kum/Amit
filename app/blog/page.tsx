'use client'

import { motion } from 'framer-motion'

export default function BlogPage() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-4"
      >
        <motion.h1 
          className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent 
                     bg-gradient-to-r from-accent via-purple-500 to-accent"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "linear" 
          }}
          style={{ backgroundSize: '200% auto' }}
        >
          Blog Coming Soon...
        </motion.h1>
        <motion.p 
          className="mt-4 text-gray-400 text-lg md:text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Stay tuned for exciting content!
        </motion.p>
      </motion.div>
    </section>
  )
} 