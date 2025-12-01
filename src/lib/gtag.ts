// Google Analytics 4 Event Tracking Utility
// This module provides type-safe event tracking functions for GA4

// Declare gtag as a global function
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Track a custom event in Google Analytics 4
 * @param action - The action name (e.g., 'click', 'submit', 'view')
 * @param label - Optional label to identify the specific element (e.g., 'instagram', 'email')
 * @param category - Optional category for grouping events (defaults to 'interaction')
 */
export function trackEvent(
  action: string,
  label?: string,
  category: string = 'interaction'
): void {
  // Only track if gtag is available (client-side and GA is loaded)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
}

/**
 * Track a click event - convenience wrapper for common click tracking
 * @param label - The label identifying what was clicked (e.g., 'instagram', 'theme_toggle')
 */
export function trackClick(label: string): void {
  trackEvent('click_action', label, 'interaction');
}

/**
 * Track social link clicks with standardized naming
 * @param platform - The social media platform name
 */
export function trackSocialClick(platform: string): void {
  trackEvent('social_click', platform.toLowerCase(), 'social');
}

/**
 * Track CTA button clicks
 * @param buttonName - The name/identifier of the CTA button
 */
export function trackCTAClick(buttonName: string): void {
  trackEvent('cta_click', buttonName, 'cta');
}

