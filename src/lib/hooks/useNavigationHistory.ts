'use client'

import { useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Cookies from 'js-cookie'

const HISTORY_COOKIE = 'nav_history'
const MAX_HISTORY = 10

interface NavigationHistoryEntry {
  path: string
  timestamp: number
}

export function useNavigationHistory() {
  const router = useRouter()
  const pathname = usePathname()

  // Save current page to history
  useEffect(() => {
    const history = getHistory()
    const lastEntry = history[history.length - 1]

    // Don't add duplicate consecutive entries
    if (lastEntry?.path === pathname) {
      return
    }

    const newEntry: NavigationHistoryEntry = {
      path: pathname,
      timestamp: Date.now(),
    }

    const updatedHistory = [...history, newEntry].slice(-MAX_HISTORY)
    saveHistory(updatedHistory)
  }, [pathname])

  const goBack = useCallback((fallbackUrl: string = '/decks') => {
    const history = getHistory()

    // Remove current page
    const filteredHistory = history.filter((entry) => entry.path !== pathname)

    if (filteredHistory.length > 0) {
      // Get the most recent page that's not the current one
      const previousPage = filteredHistory[filteredHistory.length - 1]

      // Update history (remove the page we're going back to)
      saveHistory(filteredHistory.slice(0, -1))

      router.push(previousPage.path)
    } else {
      // No history, go to fallback
      router.push(fallbackUrl)
    }
  }, [router, pathname])

  const getPreviousPath = useCallback((): string | null => {
    const history = getHistory()
    const filteredHistory = history.filter((entry) => entry.path !== pathname)

    if (filteredHistory.length > 0) {
      return filteredHistory[filteredHistory.length - 1].path
    }

    return null
  }, [pathname])

  const hasHistory = useCallback((): boolean => {
    const history = getHistory()
    return history.filter((entry) => entry.path !== pathname).length > 0
  }, [pathname])

  return {
    goBack,
    getPreviousPath,
    hasHistory,
  }
}

function getHistory(): NavigationHistoryEntry[] {
  try {
    const cookie = Cookies.get(HISTORY_COOKIE)
    if (!cookie) return []
    return JSON.parse(cookie)
  } catch {
    return []
  }
}

function saveHistory(history: NavigationHistoryEntry[]) {
  try {
    Cookies.set(HISTORY_COOKIE, JSON.stringify(history), {
      expires: 7, // 7 days
      sameSite: 'lax',
    })
  } catch (error) {
    console.error('Failed to save navigation history:', error)
  }
}
