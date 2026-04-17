'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-[var(--bg-surface)] rounded-full border border-[var(--border)]" />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-300 flex items-center p-1
        ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-amber-100 border-amber-200'}
        border shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent)]
      `}
      aria-label="Toggle theme"
    >
      <div
        className={`
          absolute w-6 h-6 rounded-full transition-all duration-500 transform flex items-center justify-center
          ${isDark ? 'translate-x-8 bg-slate-900' : 'translate-x-0 bg-white shadow-md'}
        `}
      >
        {isDark ? (
          <Moon size={14} className="text-blue-300" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </div>
      <div className="flex-1 flex justify-between px-1.5 pointer-events-none">
        <Sun
          size={12}
          className={isDark ? 'text-slate-500 opacity-20' : 'text-amber-500 opacity-100'}
        />
        <Moon
          size={12}
          className={isDark ? 'text-blue-300 opacity-100' : 'text-slate-400 opacity-20'}
        />
      </div>
    </button>
  )
}
