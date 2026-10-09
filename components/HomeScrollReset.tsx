'use client'

import { useLayoutEffect } from 'react'

// Keep visit memory on the document: internal navigation preserves it; reload resets it.
export default function HomeScrollReset() {
  useLayoutEffect(() => {
    const page = document as Document & { homeVisited?: boolean }
    const home = document.querySelector<HTMLElement>('.home-animated')
    if (home) home.dataset.homeReturn = page.homeVisited ? 'true' : 'false'
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    return () => {
      // Only a real route departure counts; Strict Mode remounts remain first visits.
      if (window.location.pathname !== '/') page.homeVisited = true
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  return null
}
