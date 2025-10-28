'use client'

import { useState, useEffect } from 'react'

export function NotificationBadgeToggle() {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('show-submission-badge')
    if (stored !== null) {
      setEnabled(stored === 'true')
    }
  }, [])

  const handleToggle = () => {
    const newValue = !enabled
    setEnabled(newValue)
    localStorage.setItem('show-submission-badge', String(newValue))
    // Dispatch custom event to update header
    window.dispatchEvent(new Event('submission-badge-toggle'))
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-tinted bg-card-tinted">
      <div className="space-y-1">
        <div className="text-base font-medium">Show Submission Notifications</div>
        <p className="text-sm text-muted-foreground">
          Display a badge in the header when there are pending deck submissions
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={enabled} onChange={handleToggle} />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )
}
