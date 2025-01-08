'use client'

import FluidBackground from './FluidBackground'

const BackgroundEffect = () => {
  return (
    <>
      {/* Base background */}
      <div className="fixed inset-0 -z-10">
        {/* Dark background */}
        <div className="absolute inset-0 bg-black/90" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]"
          style={{
            backgroundSize: '3rem 3rem',
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Fluid effect - Now on top */}
      <FluidBackground />
    </>
  )
}

export default BackgroundEffect 