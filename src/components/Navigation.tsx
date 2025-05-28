'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from './ConnectButton'
import { APP_CONFIG } from '@/lib/config'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/mint', label: 'Manifest' },
    { href: '/collection', label: 'Collection' },
    { href: '/profile', label: 'Profile' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="glass-mystical border-b border-purple-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mystical Logo */}
          <Link href="/" className="flex items-center space-x-2">

            <span className="font-bold text-xl text-cosmic hidden sm:block font-serif">
              {APP_CONFIG.name}
            </span>
            <span className="font-bold text-xl text-cosmic sm:hidden font-serif">
              Gratitude
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'glass-card text-purple-200 border border-purple-400/40'
                    : 'text-purple-300 hover:text-purple-100 hover:bg-purple-500/20'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Connect Button */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-500/20">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'glass-card text-purple-200 border border-purple-400/40'
                      : 'text-purple-300 hover:text-purple-100 hover:bg-purple-500/20'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-purple-500/20">
                <ConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 