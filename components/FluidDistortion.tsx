'use client'

import { useEffect, useRef } from 'react'

interface FluidDistortionProps {
  children: React.ReactNode
}

interface SmokeParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  opacity: number
  rotation: number
  rotationSpeed: number
  initialSize: number
  hue: number
}

const FluidDistortion: React.FC<FluidDistortionProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixelRatio = window.devicePixelRatio || 1
    const setSize = () => {
      canvas.width = window.innerWidth * pixelRatio
      canvas.height = window.innerHeight * pixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(pixelRatio, pixelRatio)
    }
    setSize()
    window.addEventListener('resize', setSize)

    const particles: SmokeParticle[] = []
    const maxParticles = 500
    const particleLifespan = 60
    let mouseX = 0
    let mouseY = 0
    let isMouseMoving = false
    let lastEmitTime = 0

    const getMousePos = (e: MouseEvent | Touch): { x: number; y: number } => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      }
    }

    const createParticle = (x: number, y: number) => {
      if (particles.length >= maxParticles) return

      const baseSize = Math.random() * 4 + 1
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.5 + 0.1

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.2,
        size: baseSize,
        initialSize: baseSize,
        life: 0,
        opacity: Math.random() * 0.15 + 0.05,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        hue: Math.random() * 20 - 10
      })
    }

    const emitParticles = (x: number, y: number) => {
      const now = Date.now()
      if (now - lastEmitTime < 16) return
      lastEmitTime = now

      const particlesToEmit = 3
      for (let i = 0; i < particlesToEmit; i++) {
        const offsetX = (Math.random() - 0.5) * 2
        const offsetY = (Math.random() - 0.5) * 2
        createParticle(x + offsetX, y + offsetY)
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getMousePos(e)
      mouseX = x
      mouseY = y
      isMouseMoving = true
      emitParticles(x, y)
    }

    const handleMouseLeave = () => {
      isMouseMoving = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const { x, y } = getMousePos(e.touches[0])
      mouseX = x
      mouseY = y
      isMouseMoving = true
      emitParticles(x, y)
    }

    const handleTouchEnd = () => {
      isMouseMoving = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (isMouseMoving) {
        emitParticles(mouseX, mouseY)
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += 1

        if (p.life > particleLifespan) {
          particles.splice(i, 1)
          continue
        }

        p.vy += 0.01
        p.vx *= 0.99
        p.vy *= 0.99

        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        const lifeRatio = 1 - (p.life / particleLifespan)
        p.size = p.initialSize * Math.pow(lifeRatio, 0.5)
        const currentOpacity = p.opacity * lifeRatio

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size)
        const baseColor = `rgba(${255 + p.hue}, ${255 + p.hue}, ${255 + p.hue}`
        gradient.addColorStop(0, `${baseColor}, ${currentOpacity})`)
        gradient.addColorStop(0.6, `${baseColor}, ${currentOpacity * 0.3})`)
        gradient.addColorStop(1, `${baseColor}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setSize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="z-10">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          mixBlendMode: 'plus-lighter',
          opacity: 0.35,
          background: 'transparent',
          zIndex: 50
        }}
      />
    </div>
  )
}

export default FluidDistortion 