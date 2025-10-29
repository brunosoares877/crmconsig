import * as React from "react"

const MOBILE_BREAKPOINT = 768 // md: 768px
const TABLET_BREAKPOINT = 1024 // lg: 1024px  
const LAPTOP_BREAKPOINT = 1280 // xl: 1280px

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useScreenSize() {
  const [screenSize, setScreenSize] = React.useState<{
    isMobile: boolean
    isTablet: boolean  
    isLaptop: boolean
    isDesktop: boolean
    width: number
  }>({
    isMobile: false,
    isTablet: false,
    isLaptop: false, 
    isDesktop: false,
    width: 0
  })

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      setScreenSize({
        isMobile: width < MOBILE_BREAKPOINT,
        isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
        isLaptop: width >= TABLET_BREAKPOINT && width < LAPTOP_BREAKPOINT,
        isDesktop: width >= LAPTOP_BREAKPOINT,
        width
      })
    }

    const mql = window.matchMedia('(max-width: 1023px)')
    mql.addEventListener("change", updateScreenSize)
    updateScreenSize()
    
    return () => mql.removeEventListener("change", updateScreenSize)
  }, [])

  return screenSize
}
