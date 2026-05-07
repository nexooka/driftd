'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  alpha: number
  size: number
  vx: number
  vy: number
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const lastPos = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current = particles.current.filter(p => p.alpha > 0.01)

      for (const p of particles.current) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        p.alpha *= 0.88
        p.size *= 0.97
      }

      // Park the loop when no particles remain; mousemove will restart it
      if (particles.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw)
      } else {
        rafRef.current = 0
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      if (Math.sqrt(dx * dx + dy * dy) < 8) return
      lastPos.current = { x: e.clientX, y: e.clientY }

      particles.current.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 0.55,
        size: Math.random() * 2 + 1.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.3,
      })
      if (particles.current.length > 60) particles.current.shift()

      // Restart RAF if it was parked
      if (rafRef.current === 0) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      aria-hidden
    />
  )
}
