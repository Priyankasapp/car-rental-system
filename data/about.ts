import { AboutData } from '@/types/about'

export const aboutData: AboutData = {
  hero: {
    label: 'Est. 2014',
    title: 'The UrbanDrive Philosophy',
    description: 'Precision engineering meets bespoke service. We provide more than transportation; we deliver an uncompromising standard of executive mobility.',
    buttonText: 'Explore Excellence',
    buttonLink: '/fleet',
    backgroundImage: 'https://lh3.googleusercontent.com/aida/AP1WRLu3hMpwhUOavpEe8Wlu3BOeuQPz8-lVpLttGRd6XDrO62sGuqyRjFihe-eLDyZvFUv7OsuzSozvCYlqBUgS7lWnyJTrqVrF8WH2w7gXO-elkCwJJwCWoSdqAPfkCWTL9lranPX72nkUKHyRTkzygL1NmoIk8EB2LK3sexOO9_DpceTLzMvlYt2WZYkLCbBSBPYf9FjiuLRSS5O-Si6U6RR8hx7-4WUk0cx-jpe9KNdys59Hc-DSuAIQR3V8'
  },

  story: {
    title: 'A Heritage of Curation',
    paragraphs: [
      'UrbanDrive began as a private collective of automotive enthusiasts dedicated to the preservation and performance of high-end machinery. What started as a shared passion for precision became the blueprint for a global mobility platform.',
      'Every vehicle in our fleet is hand-selected. We do not just look for specifications; we look for character, heritage, and the tactile sensations that define a premium driving experience. From the grain of the leather to the response of the throttle, excellence is our only metric.'
    ],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsnGUQkJqcMt2ze0HcFClQVg4s1-JDIUFJSJD0Es_7W8uaSCt-yVi1VeynkIk9Y8tayXAUvr9fWObLf6r0nfUo4PNlNnbMvOd77OjZm-H7AjLyMaAk9XKtBsWLqAqIDnfcjulanhSeVuttjYpZIfVp3yFIdHDYluWVpRlZ_9-SZCjz63gcUMDq2LHKRTZBBddu2OCZE37gjXNXk3d-6Q755kks8fxgOG8U6d8KpmwlVxsxDSFSyu1vY7t1C',
    stats: [
      { value: '50+', label: 'Handpicked Models' },
      { value: '12', label: 'Global Hubs' }
    ]
  },

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

  features: [
    { icon: 'check_circle', text: 'Bespoke Audio Landscapes' },
    { icon: 'check_circle', text: 'Intelligent Driving Assistance' },
    { icon: 'check_circle', text: 'Ventilated Nappa Leather Seating' }
  ],

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