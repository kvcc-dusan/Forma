import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// The SPA keeps window scroll position across route changes by default —
// without this, navigating into a long page (e.g. Exercise Detail) can land
// scrolled to wherever the previous page happened to be.
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
