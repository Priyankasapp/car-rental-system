// data/about.ts
import { AboutData } from '@/types/about'

export const aboutData: AboutData = {
  // ===== HERO SECTION =====
  hero: {
    label: 'Est. 2014',
    title: 'The UrbanDrive Philosophy',
    description: 'Precision engineering meets bespoke service. We provide more than transportation; we deliver an uncompromising standard of executive mobility.',
    buttonText: 'Explore Excellence',
    buttonLink: '/fleet',
    backgroundImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1920',
  },

  // ===== STORY SECTION =====
  story: {
    title: 'A Heritage of Curation',
    paragraphs: [
      'UrbanDrive began as a private collective of automotive enthusiasts dedicated to the preservation and performance of high-end machinery. What started as a shared passion for precision became the blueprint for a global mobility platform.',
      'Every vehicle in our fleet is hand-selected. We do not just look for specifications; we look for character, heritage, and the tactile sensations that define a premium driving experience. From the grain of the leather to the response of the throttle, excellence is our only metric.'
    ],
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200',
    stats: [
      { value: '50+', label: 'Handpicked Models' },
      { value: '12', label: 'Global Hubs' }
    ]
  },

  // ===== BRAND CARDS SECTION =====
  brandCards: [
    {
      icon: 'verified',
      title: 'Curated Excellence',
      description: 'Every vehicle undergoes a 120-point diagnostic before it enters your service.'
    },
    {
      icon: 'visibility_off',
      title: 'Absolute Discretion',
      description: 'Seamless logistics and anonymous delivery for the discerning executive.'
    },
    {
      icon: 'speed',
      title: 'Unrivaled Performance',
      description: 'Experience high-fidelity engineering in its purest, most visceral form.'
    }
  ],

  // ===== FEATURES SECTION =====
  features: [
    { icon: 'check_circle', text: 'Bespoke Audio Landscapes' },
    { icon: 'check_circle', text: 'Intelligent Driving Assistance' },
    { icon: 'check_circle', text: 'Ventilated Nappa Leather Seating' }
  ],

  // ===== BEHIND THE WHEEL SECTION =====
  wheel: {
    label: 'Command Center',
    title: 'Behind the Wheel',
    description: 'The interior of our vehicles is an extension of your workspace. We prioritize ergonomic perfection, intuitive technology, and silent cabins that allow for focus in a moving world.',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1200',
    features: [
      { icon: 'check_circle', text: 'Bespoke Audio Landscapes' },
      { icon: 'check_circle', text: 'Intelligent Driving Assistance' },
      { icon: 'check_circle', text: 'Ventilated Nappa Leather Seating' }
    ]
  },

  // ===== CTA SECTION =====
  cta: {
    title: 'Define Your Journey.',
    subtitle: '"Luxury is not an option; it is our base state."',
    primaryButton: {
      label: 'Experience the Fleet',
      href: '/fleet'
    },
    secondaryButton: {
      label: 'Contact Concierge',
      href: '/contact'
    }
  }
}