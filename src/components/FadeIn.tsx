'use client'

import { useInView } from '@/lib/useInView'
import { ReactNode, CSSProperties } from 'react'

interface FadeInProps {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
  threshold?: number
}

export function FadeIn({
  children,
  delay = 0,
  className = '',
  direction = 'up',
  threshold = 0.12,
}: FadeInProps) {
  const { ref, inView } = useInView(threshold)

  const initial: Record<string, string> = {
    up:    'opacity-0 translate-y-6',
    left:  'opacity-0 -translate-x-6',
    right: 'opacity-0 translate-x-6',
    none:  'opacity-0',
  }

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
  }

  return (
    <div
      ref={ref}
      style={style}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-x-0 translate-y-0' : initial[direction]
      } ${className}`}
    >
      {children}
    </div>
  )
}
