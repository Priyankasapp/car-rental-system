'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { footerSections, socialLinks } from '@/data'
import Icon from '@/components/ui/Icon'
import Input from '@/components/ui/Input'
import { Button } from '../ui/Button'

//  Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const footerRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      //  1. Fade in entire footer content
      gsap.fromTo(
        '.footer-content',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none none"
          }
        }
      )

      //  2. Stagger animation for brand and sections
      gsap.fromTo(
        '.footer-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      )

      //  3. Social icons hover animation (bounce)
      document.querySelectorAll('.social-link').forEach((link) => {
        const element = link as HTMLElement
        
        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            y: -4,
            scale: 1.1,
            duration: 0.2,
            ease: "power2.out"
          })
        })
        
        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            duration: 0.2,
            ease: "power2.in"
          })
        })
      })

      //  4. Newsletter button hover pulse
      const newsletterBtn = document.querySelector('.newsletter-btn')
      if (newsletterBtn) {
        newsletterBtn.addEventListener('mouseenter', () => {
          gsap.to(newsletterBtn, {
            scale: 1.05,
            duration: 0.2,
            ease: "power2.out"
          })
        })
        
        newsletterBtn.addEventListener('mouseleave', () => {
          gsap.to(newsletterBtn, {
            scale: 1,
            duration: 0.2,
            ease: "power2.in"
          })
        })
      }

      //  5. Bottom bar fade in
      gsap.fromTo(
        '.bottom-bar',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      )

    }, footerRef)

    return () => ctx.revert()
  }, [])

  return (
    <footer ref={footerRef} className="bg-white pt-24 pb-12 border-t border-gray-100 overflow-hidden">
      {/*  Content with animation class */}
      <div ref={contentRef} className="footer-content max-w-360 mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/*  Brand Block */}
          <div className="footer-item flex flex-col">
            <h2 className="text-2xl font-bold tracking-tight text-black mb-4">
              UrbanDrive
            </h2>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-6">
              The worlds most exclusive car rental platform. Defined by performance, delivered with precision.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="social-link w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                  <Icon name={social.icon} className="text-base" />
                </Link>
              ))}
            </div>
          </div>

          {/*  Navigation Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="footer-item lg:justify-self-center">
              <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em] mb-6">
                {section.title}
              </h5>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-400 hover:text-black transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/*  Newsletter */}
          <div className="footer-item lg:justify-self-end w-full max-w-xs">
            <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em] mb-6">
              Newsletter
            </h5>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Stay updated with our latest fleet arrivals.
            </p>
            <div className="flex gap-2 w-full">
              <Input
                placeholder="Email Address"
                className="bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-gray-300 flex-1"
              />
              <Button className="newsletter-btn bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors">
                Join
              </Button>
            </div>
          </div>
        </div>

        {/*  Bottom Bar */}
        <div className="bottom-bar flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
          <p className="text-[10px] font-medium text-gray-400 tracking-wider">
            © {currentYear} URBAN DRIVE EXECUTIVE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[10px] font-medium text-gray-400 hover:text-black tracking-wider transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[10px] font-medium text-gray-400 hover:text-black tracking-wider transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}