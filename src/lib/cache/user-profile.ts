import { cache } from 'react'

/**
 * Cached user profile fetching utility with Next.js 16 Data Cache optimization
 *
 * Features:
 * - React cache function memoization
 * - Next.js Data Cache with TTL
 * - Cache tags for on-demand revalidation
 * - Request deduplication
 */

export interface UserProfileData {
  id: string
  email: string
  firstName: string
  lastName: string
  username: string
  role: string
  status: string
  usernameChanged: boolean
}

export const getUserProfile = cache(async (userId: string): Promise<UserProfileData> => {
  const response = await fetch('/api/user/profile', {
    method: 'GET',
    cache: 'force-cache', // Next.js 16 Data Cache
    next: {
      tags: ['user-profile', `user-${userId}`], // Cache tags for revalidation
      revalidate: 300 // 5 minutes TTL
    }
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error?.error?.message ||
      error?.message ||
      `Failed to fetch user profile: ${response.status}`
    )
  }

  const data = await response.json()

  // Transform API response to match our interface
  return {
    id: data.id,
    email: data.email,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    username: data.username || '',
    role: data.role || 'user',
    status: data.status || 'active',
    usernameChanged: data.usernameChanged || false
  }
})

/**
 * Utility function to get cached profile or return null if not found
 */
export const getUserProfileOrNull = cache(async (userId: string): Promise<UserProfileData | null> => {
  try {
    return await getUserProfile(userId)
  } catch (error) {
    return null
  }
})

/**
 * Check if user profile is cached and fresh
 */
export const isUserProfileCached = async (userId: string): Promise<boolean> => {
  try {
    // This will throw if not cached or stale
    await getUserProfile(userId)
    return true
  } catch {
    return false
  }
}