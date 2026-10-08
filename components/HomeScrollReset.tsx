'use client'

import { useLayoutEffect } from 'react'

// A new homepage visit starts with the intact title, before scroll scenes initialise.
export default function HomeScrollReset() {
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    return () => { window.history.scrollRestoration = previousRestoration }
  }, [])

  return null
}
