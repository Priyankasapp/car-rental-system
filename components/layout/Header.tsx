/* eslint-disable react-hooks/set-state-in-effect */
// components/Header.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { navLinks } from '@/data'
import { cn } from '@/lib/utils'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Memoized auth checker
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 
          'Cache-Control': 'no-store, max-age=0',
        },
        credentials: 'include', // Ensures HTTP-only auth cookies are sent
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.data?.user) {
          setUser(data.data.user)
          return
        }
      }
      setUser(null)
    } catch (err) {
      console.error('Error fetching auth state:', err)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Re-run authentication check whenever route changes
  useEffect(() => {
    checkAuth()
  }, [pathname, checkAuth])

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      setUser(null)
      setIsDropdownOpen(false)
      setIsMobileMenuOpen(false)
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isAuthenticated = !!user

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 w-full z-50 bg-white transition-all duration-300',
          isScrolled ? 'py-3 shadow-sm' : 'py-5'
        )}
      >
        <div className="max-w-360 mx-auto flex justify-between items-center px-5 md:px-16 w-full">
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-black focus:outline-none hover:opacity-70 transition-opacity"
              aria-label="Toggle Menu"
            >
              <Icon
                name={isMobileMenuOpen ? 'close' : 'menu'}
                className="text-2xl"
              />
            </button>

            <Link href="/" className="hover:opacity-90 transition-opacity">
              <h1 className="text-2xl md:text-2xl font-bold tracking-tighter text-black">
                UrbanDrive
              </h1>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-xs tracking-wider uppercase text-black transition-opacity',
                    isActive
                      ? 'font-semibold opacity-100'
                      : 'font-normal opacity-60 hover:opacity-100'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity"
                  aria-label="User Account"
                >
                  <Icon name="account_circle" className="text-2xl" />
                  <span className="hidden md:inline text-sm font-medium">
                    {user?.firstName || 'Account'}
                  </span>
                  <Icon
                    name={isDropdownOpen ? 'expand_less' : 'expand_more'}
                    className="text-xl hidden md:inline"
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Profile
                    </Link>

                    <Link
                      href="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      My Bookings
                    </Link>

                    {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'STAFF') && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 transition border-t border-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition border-t border-gray-100 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden md:block text-sm text-gray-600 hover:text-black transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out md:hidden pt-24 px-5',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'text-lg text-black transition-opacity',
                  isActive
                    ? 'font-semibold opacity-100'
                    : 'font-normal opacity-70 hover:opacity-100'
                )}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Mobile Auth Links */}
          {isAuthenticated ? (
            <>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 mb-4">{user?.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-black font-normal opacity-70"
              >
                My Profile
              </Link>
              <Link
                href="/bookings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-black font-normal opacity-70"
              >
                My Bookings
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsMobileMenuOpen(false)
                }}
                className="text-lg text-red-600 text-left font-normal cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-black font-normal opacity-70"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg text-black font-semibold"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  )
}