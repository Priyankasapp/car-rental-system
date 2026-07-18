import Link from 'next/link'
import { footerSections, socialLinks } from '@/data'
import Icon from '@/components/ui/Icon'
import Input from '@/components/ui/Input'
import { Button } from '../ui/Button'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
      {/* Fixed responsive layout padding */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Brand Block */}
          <div className="flex flex-col">
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
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all duration-300"
                >
                  <Icon name={social.icon} className="text-base" />
                </Link>
              ))}
            </div>
          </div>

          {/* Map Section Navigation Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:justify-self-center">
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

          {/* Newsletter Box Layout */}
          <div className="lg:justify-self-end w-full max-w-xs">
            <h5 className="text-[10px] font-bold text-black uppercase tracking-[0.15em] mb-6">
              Newsletter
            </h5>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Stay updated with our latest fleet arrivals.
            </p>
            {/* Clean Flex input alignment setup */}
            <div className="flex gap-2 w-full">
              <Input
                placeholder="Email Address"
                className="bg-gray-50 border border-gray-100 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-gray-300 flex-1"
              />
              <Button className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors">
                Join
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar Content Alignment Block */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
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