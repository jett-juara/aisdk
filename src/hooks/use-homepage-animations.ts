"use client"

import { useState, useEffect, useRef } from "react"
import { ANIMATION_STAGES } from "@/lib/animations/timing"

interface AnimationClasses {
  svg: string
  text: string
  button1: string
  button2: string
}

interface UseHomepageAnimationsReturn {
  stage: number
  getClasses: () => AnimationClasses
  prefersReducedMotion: boolean
  resetAnimations: () => void
}

/**
 * Homepage Animation Hook
 * Manages staggered animation sequence for SVG, text, and buttons
 *
 * Animation Timeline:
 * - SVG: T=200ms (stage 1)
 * - Text: T=800ms (stage 2)
 * - Button 1: T=1200ms (stage 3)
 * - Button 2: T=1400ms (stage 4)
 */
export const useHomepageAnimations = (): UseHomepageAnimationsReturn => {
  const [stage, setStage] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
      const timer = setTimeout(() => {
        setPrefersReducedMotion(mediaQuery.matches)
      }, 0)

      const handleChange = (e: MediaQueryListEvent) => {
        const changeTimer = setTimeout(() => {
          setPrefersReducedMotion(e.matches)
        }, 0)
        return () => clearTimeout(changeTimer)
      }

      mediaQuery.addEventListener("change", handleChange)
      return () => {
        clearTimeout(timer)
        mediaQuery.removeEventListener("change", handleChange)
      }
    }
  }, [])

  // Animation sequence controller
  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip all animations if user prefers reduced motion
      const timer = setTimeout(() => {
        setStage(4)
      }, 0)
      return () => clearTimeout(timer)
    }

    // Clear any existing timeouts
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    // Start animation sequence
    const timeouts = [
      setTimeout(() => setStage(ANIMATION_STAGES.SVG), 200),      // SVG: T=200ms
      setTimeout(() => setStage(ANIMATION_STAGES.TEXT), 800),     // Text: T=800ms
      setTimeout(() => setStage(ANIMATION_STAGES.BUTTON_1), 1200), // Button 1: T=1200ms
      setTimeout(() => setStage(ANIMATION_STAGES.BUTTON_2), 1400), // Button 2: T=1400ms
    ]

    timeoutsRef.current = timeouts

    // Cleanup function
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [prefersReducedMotion])

  // Get animation classes based on current stage
  const getClasses = (): AnimationClasses => {
    const classes: AnimationClasses = {
      svg: "",
      text: "",
      button1: "",
      button2: ""
    }

    // SVG Animation Classes
    classes.svg = stage >= ANIMATION_STAGES.SVG
      ? "opacity-100 scale-100 blur-0"
      : "opacity-0 scale-75 blur-sm"

    // Text Animation Classes
    classes.text = stage >= ANIMATION_STAGES.TEXT
      ? "opacity-100 translate-y-0 blur-0"
      : "opacity-0 translate-y-8 blur-md"

    // Button 1 Animation Classes
    classes.button1 = stage >= ANIMATION_STAGES.BUTTON_1
      ? "opacity-100 translate-y-0 scale-100"
      : "opacity-0 translate-y-6 scale-95"

    // Button 2 Animation Classes
    classes.button2 = stage >= ANIMATION_STAGES.BUTTON_2
      ? "opacity-100 translate-y-0 scale-100"
      : "opacity-0 translate-y-6 scale-95"

    return classes
  }

  // Reset animations function
  const resetAnimations = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setStage(0)

    // Restart sequence after reset
    if (!prefersReducedMotion) {
      timeoutsRef.current = [
        setTimeout(() => setStage(ANIMATION_STAGES.SVG), 200),
        setTimeout(() => setStage(ANIMATION_STAGES.TEXT), 800),
        setTimeout(() => setStage(ANIMATION_STAGES.BUTTON_1), 1200),
        setTimeout(() => setStage(ANIMATION_STAGES.BUTTON_2), 1400),
      ]
    } else {
      setStage(4)
    }
  }

  return {
    stage,
    getClasses,
    prefersReducedMotion,
    resetAnimations
  }
}
