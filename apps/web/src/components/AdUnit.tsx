import { useEffect, useRef } from 'react'

interface AdUnitProps {
  /**
   * The AdSense Slot ID (optional for auto ads, but required for manual units)
   */
  slot: string
  /**
   * Ad format (e.g., 'auto', 'rectangle', 'horizontal')
   * Default: 'auto'
   */
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical' | string
  /**
   * Whether the ad is responsive (default: true)
   */
  responsive?: boolean
  /**
   * Custom style object
   */
  style?: React.CSSProperties
  /**
   * Client ID (optional, defaults to global env or placeholder if not provided)
   * In a real app, this should consistently be your publisher ID.
   */
  client?: string
  /**
   * Layout key (required for in-feed ads)
   */
  layoutKey?: string
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdUnit({
  slot,
  format = 'auto',
  responsive = true,
  style,
  client = 'ca-pub-3048752081726867', // PLACEHOLDER: Replace with actual Publisher ID
  layoutKey,
  className
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null)

  useEffect(() => {
    // Determine if we should push a new ad
    // This simple check prevents duplicate pushes in StrictMode or re-renders
    // A more robust implementation might check if the element already has content
    try {
      const adsbygoogle = window.adsbygoogle || []
      // Only push if the element is empty (hasn't been filled by Google yet)
      if (adRef.current && adRef.current.innerHTML.trim() === '') {
        adsbygoogle.push({})
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, []) // Empty dependency array means this runs once on mount

  return (
    <div className={`ad-container overflow-hidden ${className || ''}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        data-ad-layout-key={layoutKey}
      />
    </div>
  )
}
