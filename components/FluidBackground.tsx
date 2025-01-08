'use client'

import { useEffect, useRef } from 'react'

interface Ripple {
  x: number
  y: number
  size: number
  alpha: number
  velocity: number
  force: number
  birth: number
}

const FluidBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas with device pixel ratio
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

    // Enhanced fluid simulation
    const ripples: Ripple[] = []
    let animationFrameId: number
    const rippleSettings = {
      initialSize: 1,
      maxSize: 50,
      thickness: 0.2,
      rippleSpeed: 6,
      dampening: 0.98,
      tension: 0.99,
      spread: 0.2
    }

    // Create ripple with physics
    const createRipple = (x: number, y: number, force = 1) => {
      const speedVariation = Math.random() * 0.2 + 0.9
      ripples.push({
        x,
        y,
        size: rippleSettings.initialSize,
        alpha: 0.5 * force,
        velocity: rippleSettings.rippleSpeed * speedVariation * force,
        force,
        birth: Date.now()
      })
    }

    // Track mouse movement for velocity
    let lastX = 0
    let lastY = 0
    let lastTime = Date.now()

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = Date.now()
      const dt = (currentTime - lastTime) / 1000
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const speed = Math.sqrt(dx * dx + dy * dy) / dt
      const force = Math.min(speed / 500, 1)

      createRipple(e.clientX, e.clientY, force)

      lastX = e.clientX
      lastY = e.clientY
      lastTime = currentTime
    }

    const handleTouchMove = (e: TouchEvent) => {
      Array.from(e.touches).forEach(touch => {
        createRipple(touch.clientX, touch.clientY, 0.5)
      })
    }

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('touchmove', handleTouchMove)
    canvas.style.pointerEvents = 'auto'

    // Animation loop with improved physics
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio)

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i]
        const age = (Date.now() - ripple.birth) / 1000

        // Update ripple physics
        ripple.size += ripple.velocity
        ripple.alpha *= rippleSettings.dampening
        ripple.velocity *= rippleSettings.tension

        // Calculate wave distortion
        const waveAmplitude = Math.sin(age * 10) * ripple.force * 2
        const distortionAlpha = Math.max(0, ripple.alpha * 0.5)

        // Draw main ripple with distortion
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha * 0.3})`
        ctx.lineWidth = rippleSettings.thickness
        
        // Create distorted circle
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const distortion = waveAmplitude * Math.sin(angle * 6 + age * 5)
          const x = ripple.x + Math.cos(angle) * (ripple.size + distortion)
          const y = ripple.y + Math.sin(angle) * (ripple.size + distortion)
          
          if (angle === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        
        ctx.closePath()
        ctx.stroke()

        // Draw caustics effect
        const causticGlow = ctx.createRadialGradient(
          ripple.x, ripple.y, ripple.size * 0.8,
          ripple.x, ripple.y, ripple.size * 1.2
        )
        causticGlow.addColorStop(0, `rgba(255, 255, 255, 0)`)
        causticGlow.addColorStop(0.5, `rgba(255, 255, 255, ${distortionAlpha * 0.1})`)
        causticGlow.addColorStop(1, `rgba(255, 255, 255, 0)`)
        
        ctx.fillStyle = causticGlow
        ctx.fill()

        // Remove old ripples
        if (ripple.alpha < 0.01 || ripple.size > rippleSettings.maxSize) {
          ripples.splice(i, 1)
        }
      }

      // Add subtle ambient movement
      if (Math.random() < 0.03) {
        createRipple(
          Math.random() * canvas.width / pixelRatio,
          Math.random() * canvas.height / pixelRatio,
          0.3
        )
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', setSize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchmove', handleTouchMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 select-none"
      style={{
        background: 'transparent',
        mixBlendMode: 'soft-light',
        opacity: 0.8,
        filter: 'blur(0.5px)',
        pointerEvents: 'auto'
      }}
    />
  )
}

export default FluidBackground 