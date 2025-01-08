import './globals.css'
import { Inter } from 'next/font/google'
import emailjs from '@emailjs/browser'

// Optimize font loading
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
})

// Initialize EmailJS
emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!)

export const metadata = {
  title: 'Amit Kumar - Full Stack Developer',
  description: 'Portfolio website of Amit Kumar, specializing in full-stack web development and creating exceptional digital experiences.',
  keywords: ['web development', 'React', 'Next.js', 'portfolio', 'full stack'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F172A'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-primary text-white min-h-screen w-full overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
} 