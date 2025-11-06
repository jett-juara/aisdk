/**
 * Animation Timing Constants
 * Centralized configuration for all homepage animations
 */

// Animation stage definitions
export const ANIMATION_STAGES = {
  IDLE: 0,
  SVG: 1,
  TEXT: 2,
  BUTTON_1: 3,
  BUTTON_2: 4,
  COMPLETE: 5
} as const

// Animation duration constants (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 300,     // Quick micro-interactions
  MEDIUM: 500,   // Standard button animations
  SLOW: 700,     // SVG and text reveals
  ELEGANT: 1000  // Complex transitions
} as const

// Animation delay constants
export const ANIMATION_DELAYS = {
  SVG_START: 200,       // SVG appears at T=200ms
  TEXT_DELAY: 600,      // Text delay after SVG (T=200ms + 600ms = 800ms)
  BUTTON_1_DELAY: 400,  // Button 1 delay after text (T=800ms + 400ms = 1200ms)
  BUTTON_2_DELAY: 200   // Button 2 delay after button 1 (T=1200ms + 200ms = 1400ms)
} as const

// ============================================================================
// UNUSED EXPORTS - Commented out for future use
// ============================================================================

/**
 * @deprecated UNUSED - Easing function definitions
 * Currently not utilized in homepage animations but available for future use
 */
// export const ANIMATION_EASING = {
//   EASE_OUT: "ease-out",
//   EASE_IN_OUT: "ease-in-out",
//   EASE_IN: "ease-in",
//   SPRING: "cubic-bezier(0.16, 1, 0.3, 1)",  // Material Design spring
//   ELASTIC: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" // Elastic bounce
// } as const

/**
 * @deprecated UNUSED - Reduced motion breakpoints
 * Reserved for accessibility features (respect user motion preferences)
 */
// export const REDUCED_MOTION_BREAKPOINTS = {
//   ENABLE_ANIMATIONS: true,
//   DISABLE_ANIMATIONS: false
// } as const

/**
 * @deprecated UNUSED - Performance optimization settings
 * Available for advanced GPU acceleration and rendering optimizations
 */
// export const ANIMATION_PERFORMANCE = {
//   TRANSFORM_GPU: "transform-gpu",  // GPU acceleration
//   WILL_CHANGE_AUTO: "will-change: auto",
//   WILL_CHANGE_TRANSFORM: "will-change: transform",
//   BACKFACE_VISIBLE: "backface-visibility: hidden"
// } as const

/**
 * @deprecated UNUSED - Responsive animation settings
 * For future responsive animation breakpoints and configuration
 */
// export const RESPONSIVE_ANIMATION = {
//   MOBILE_THRESHOLD: 768,
//   TABLET_THRESHOLD: 1024,
//   DESKTOP_THRESHOLD: 1024
// } as const

// Animation state type
export type AnimationStage = typeof ANIMATION_STAGES[keyof typeof ANIMATION_STAGES]

/**
 * Get animation stage based on time elapsed
 * @param elapsedTime - Time since animation start (in ms)
 * @returns AnimationStage
 */
export const getAnimationStage = (elapsedTime: number): AnimationStage => {
  if (elapsedTime < ANIMATION_DELAYS.SVG_START) return ANIMATION_STAGES.IDLE
  if (elapsedTime < ANIMATION_DELAYS.SVG_START + ANIMATION_DURATION.SLOW) return ANIMATION_STAGES.SVG
  if (elapsedTime < ANIMATION_DELAYS.SVG_START + ANIMATION_DELAYS.TEXT_DELAY + ANIMATION_DURATION.SLOW) return ANIMATION_STAGES.TEXT
  if (elapsedTime < ANIMATION_DELAYS.SVG_START + ANIMATION_DELAYS.TEXT_DELAY + ANIMATION_DELAYS.BUTTON_1_DELAY + ANIMATION_DURATION.MEDIUM) return ANIMATION_STAGES.BUTTON_1
  if (elapsedTime < ANIMATION_DELAYS.SVG_START + ANIMATION_DELAYS.TEXT_DELAY + ANIMATION_DELAYS.BUTTON_1_DELAY + ANIMATION_DELAYS.BUTTON_2_DELAY + ANIMATION_DURATION.MEDIUM) return ANIMATION_STAGES.BUTTON_2
  return ANIMATION_STAGES.COMPLETE
}

/**
 * Get animation class based on stage and element type
 * @param stage - Current animation stage
 * @param element - Element type (svg, text, button1, button2)
 * @param isActive - Whether element should be visible
 * @returns CSS class string
 */
export const getAnimationClass = (stage: AnimationStage, element: string, isActive: boolean): string => {
  const baseClasses = {
    svg: "transition-all duration-700 ease-out transform-gpu",
    text: "transition-all duration-700 ease-out",
    button1: "transition-all duration-500 ease-out transform-gpu",
    button2: "transition-all duration-500 ease-out transform-gpu"
  }

  const stateClasses = {
    svg: {
      hidden: "opacity-0 scale-75 blur-sm",
      visible: "opacity-100 scale-100 blur-0"
    },
    text: {
      hidden: "opacity-0 translate-y-8 blur-md",
      visible: "opacity-100 translate-y-0 blur-0"
    },
    button1: {
      hidden: "opacity-0 translate-y-6 scale-95",
      visible: "opacity-100 translate-y-0 scale-100"
    },
    button2: {
      hidden: "opacity-0 translate-y-6 scale-95",
      visible: "opacity-100 translate-y-0 scale-100"
    }
  }

  const elementBaseClass = baseClasses[element as keyof typeof baseClasses] || ""
  const elementStateClass = stateClasses[element as keyof typeof stateClasses]

  if (!elementStateClass) return elementBaseClass

  const isVisible = isActive && stage >= getRequiredStage(element)
  const stateClass = isVisible ? elementStateClass.visible : elementStateClass.hidden

  return `${elementBaseClass} ${stateClass}`
}

/**
 * Get required stage for element to be visible
 * @param element - Element type
 * @returns Required animation stage
 */
const getRequiredStage = (element: string): AnimationStage => {
  const stageMap = {
    svg: ANIMATION_STAGES.SVG,
    text: ANIMATION_STAGES.TEXT,
    button1: ANIMATION_STAGES.BUTTON_1,
    button2: ANIMATION_STAGES.BUTTON_2
  }

  return stageMap[element as keyof typeof stageMap] || ANIMATION_STAGES.IDLE
}

/**
 * Calculate total animation timeline duration
 * @returns Total duration in milliseconds
 */
export const getTotalAnimationDuration = (): number => {
  return ANIMATION_DELAYS.SVG_START +
         ANIMATION_DELAYS.TEXT_DELAY +
         ANIMATION_DELAYS.BUTTON_1_DELAY +
         ANIMATION_DELAYS.BUTTON_2_DELAY +
         ANIMATION_DURATION.MEDIUM
}