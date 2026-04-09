'use client'

import { useEffect } from 'react'

export default function ScrollReset() {
  useEffect(() => {
    // Prevent browser from restoring scroll position or sticking to a hash
    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual'
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [])

  return null
}
