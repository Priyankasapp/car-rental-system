// components/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'
import { navLinks } from '@/data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  // Handle scroll effect for dynamic padding & shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
    router.push('/')
  }

  return (
    <>
      <header 
        className={cn(
          'fixed top-0 left-0 w-full z-50 bg-white transition-all duration-300',
          isScrolled ? 'py-3 shadow-sm' : 'py-5'
        )}
      >
        <div className="max-w-[1440px] mx-auto flex justify-between items-center px-5 md:px-16 w-full">
          
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-black focus:outline-none hover:opacity-70 transition-opacity"
              aria-label="Toggle Menu"
            >
              <Icon 
                name={isMobileMenuOpen ? "close" : "menu"} 
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
                    "text-xs tracking-[0.05em] uppercase text-black transition-opacity",
                    isActive ? "font-semibold opacity-100" : "font-normal opacity-60 hover:opacity-100"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity"
                  aria-label="User Account"
                >
                  <Icon name="account_circle" className="text-2xl" />
                  <span className="hidden md:inline text-sm font-medium">
                    {user?.firstName}
                  </span>
                  <Icon 
                    name={isDropdownOpen ? "expand_less" : "expand_more"} 
                    className="text-xl hidden md:inline" 
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
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

                    {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 transition border-t border-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition border-t border-gray-100"
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

      {/* Mobile Navigation Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-white transition-transform duration-300 ease-in-out md:hidden pt-24 px-5",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
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
                  "text-lg text-black transition-opacity",
                  isActive ? "font-semibold opacity-100" : "font-normal opacity-70 hover:opacity-100"
                )}
              >
                {link.label}
              </Link>
            )
          })}
          
          {/* Mobile Auth Links */}
          {isAuthenticated ? (
            <>
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
                className="text-lg text-red-600 text-left font-normal"
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