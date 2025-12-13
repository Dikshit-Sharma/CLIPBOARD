import { logEvent, setUserProperties, setUserId } from 'firebase/analytics'
import { analytics } from './firebase'

/**
 * Log a custom event to Firebase Analytics
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>): void {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams)
    } catch (error) {
      // Silently fail in development or if analytics is not available
      if (import.meta.env.DEV) {
        console.log('[Analytics]', eventName, eventParams)
      }
    }
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, pagePath?: string): void {
  trackEvent('page_view', {
    page_title: pageName,
    page_path: pagePath || window.location.pathname,
    page_location: window.location.href
  })
}

/**
 * Track clipboard creation
 */
export function trackClipboardCreated(clipboardId: string, hasPassword: boolean, expiresIn: string): void {
  trackEvent('clipboard_created', {
    clipboard_id: clipboardId,
    has_password: hasPassword,
    expires_in: expiresIn
  })
}

/**
 * Track clipboard opened
 */
export function trackClipboardOpened(clipboardId: string, source: 'code' | 'link' | 'recent'): void {
  trackEvent('clipboard_opened', {
    clipboard_id: clipboardId,
    source
  })
}

/**
 * Track clipboard shared
 */
export function trackClipboardShared(clipboardId: string, shareType: 'read' | 'write' | 'current'): void {
  trackEvent('clipboard_shared', {
    clipboard_id: clipboardId,
    share_type: shareType
  })
}

/**
 * Track clipboard deleted
 */
export function trackClipboardDeleted(clipboardId: string): void {
  trackEvent('clipboard_deleted', {
    clipboard_id: clipboardId
  })
}

/**
 * Track content updated
 */
export function trackContentUpdated(clipboardId: string, contentLength: number): void {
  trackEvent('content_updated', {
    clipboard_id: clipboardId,
    content_length: contentLength
  })
}

/**
 * Track settings updated
 */
export function trackSettingsUpdated(clipboardId: string, settings: Record<string, any>): void {
  trackEvent('settings_updated', {
    clipboard_id: clipboardId,
    ...settings
  })
}

/**
 * Track user engagement
 */
export function trackEngagement(action: string, clipboardId?: string): void {
  trackEvent('user_engagement', {
    engagement_time_msec: 1000, // Approximate engagement time
    action,
    clipboard_id: clipboardId
  })
}

/**
 * Set user ID (if you implement user authentication later)
 */
export function setAnalyticsUserId(userId: string | null): void {
  if (analytics && userId) {
    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.error('Failed to set analytics user ID:', error)
    }
  }
}

/**
 * Set user properties
 */
export function setAnalyticsUserProperties(properties: Record<string, any>): void {
  if (analytics) {
    try {
      setUserProperties(analytics, properties)
    } catch (error) {
      console.error('Failed to set analytics user properties:', error)
    }
  }
}
