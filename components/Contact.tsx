'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PERSONAL_DATA } from '@/utils/constants'
import { RiGithubLine, RiInstagramLine, RiLinkedinBoxLine, RiWhatsappLine, RiSendPlaneLine } from 'react-icons/ri'
import { useState } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import emailjs from '@emailjs/browser'

const Contact = () => {
  const { ref, controls } = useScrollAnimation(0.2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          to_email: 'vatsahhc@gmail.com',
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      )

      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (error) {
      console.error('Error sending email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <section id="contact" className="min-h-[90vh] py-16 md:py-20 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-8 md:gap-12 items-start"
        >
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
            >
              Get in Touch
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-400 max-w-md"
            >
              Have a project in mind? Let's work together to create something amazing. Feel free to reach out!
            </motion.p>

            {/* Social Links - Updated styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex gap-4"
            >
              {[
                { icon: RiGithubLine, href: PERSONAL_DATA.social.github, label: 'GitHub' },
                { icon: RiLinkedinBoxLine, href: PERSONAL_DATA.social.linkedin, label: 'LinkedIn' },
                { icon: RiInstagramLine, href: PERSONAL_DATA.social.instagram, label: 'Instagram' },
                { icon: RiWhatsappLine, href: PERSONAL_DATA.social.whatsapp, label: 'WhatsApp' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative w-12 h-12 rounded-full overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {/* Background */}
                  <div className="absolute inset-0 bg-white/5 transition-colors duration-300 group-hover:bg-white/10" />
                  
                  {/* Accent Border */}
                  <div className="absolute inset-0 border border-white/10 rounded-full transition-colors duration-300 group-hover:border-accent/30" />
                  
                  {/* Icon */}
                  <div className="relative flex items-center justify-center w-full h-full">
                    <social.icon 
                      className="text-2xl text-gray-400 transition-all duration-300 
                                group-hover:text-accent group-hover:-translate-y-0.5" 
                    />
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder:text-gray-500"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder:text-gray-500"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent text-white placeholder:text-gray-500 resize-none"
                  required
                />
              </motion.div>
            </div>

            {/* Submit Button with improved styling */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative px-8 py-4 rounded-xl text-white font-medium 
                         transition-all duration-300 flex items-center justify-center gap-2
                         ${isSubmitting 
                           ? 'bg-surface/50 cursor-not-allowed' 
                           : 'bg-accent/10 hover:bg-accent/20'}`}
            >
              {/* Button background */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 opacity-0 
                           group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              
              {/* Button border */}
              <motion.div
                className="absolute inset-0 rounded-xl border border-accent/30"
                whileHover={{
                  boxShadow: '0 0 10px rgba(var(--accent-color), 0.2)',
                }}
              />

              {/* Button content */}
              <span className="relative flex items-center gap-2">
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <motion.span
                  animate={isSubmitting ? {} : { x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <RiSendPlaneLine className="text-xl" />
                </motion.span>
              </span>
            </motion.button>

            {/* Status Messages with improved styling */}
            <AnimatePresence mode="wait">
              {submitStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 text-center p-4 rounded-xl backdrop-blur-sm border ${
                    submitStatus === 'success' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  {submitStatus === 'success' 
                    ? 'Message sent successfully!'
                    : 'Failed to send message. Please try again.'}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </motion.div>

        {/* Improved Footer Spacing and Style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 md:mt-24 pt-8 border-t border-white/10"
        >
          <div className="max-w-4xl mx-auto text-center space-y-4">
            {/* Additional footer content */}
            <p className="text-gray-400 text-sm md:text-base">
              Let's create something amazing together
            </p>
            
            {/* Copyright with improved spacing */}
            <p className="text-gray-500 text-sm pb-6">
              © {new Date().getFullYear()} {PERSONAL_DATA.name}. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Contact 