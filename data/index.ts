// data/index.ts
import { Car, Collection, Feature, Stat, NavLink, FooterSection } from '@/types'

// Navigation Links
export const navLinks: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/fleet', label: 'Fleet' },
  { href: '/about', label: 'About' },
  { href:'/contact', label:"Contact"}

]

// Collections Data with category
export const collections: Collection[] = [
  {
    id: 'sports',
    name: 'Sports',
    icon: 'speed',
    description: 'High-performance machines',
    count: 24,
    category: 'sports', 
  },
  {
    id: 'suv',
    name: 'SUV',
    icon: 'grid_view',
    description: 'Luxury and space',
    count: 18,
    category: 'suv', 
  },
  {
    id: 'electric',
    name: 'Electric',
    icon: 'bolt',
    description: 'Sustainable power',
    count: 12,
    category: 'electric',  // ✅ For filtering
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: 'history',
    description: 'Classic elegance',
    count: 8,
    category: 'vintage',  // ✅ For filtering
  },
]

// Featured Cars Data
export const featuredCars: Car[] = [
  {
    id: '1',
    name: 'Porsche Taycan Turbo S',
    model: '2024',
    description: 'Excellence in Motion',
    price: 499,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtrCUhlB0AYpvLfhIFJCP9SsLjuK2FGFTfk-rfgjgNe8ZjsvInmJG-aQeRKuIN138NyW3QsDvojqMOSoMvupBLpaoa7LX9_gMyyqDt_IHguhmR2FiQaY-KZautlljdOO-QFUDH1CvC0IdB6AgB5QDURnbixKL0denSdVYyZRrc8b0YGXeuwW_mzN3bq78MWohEB8i1SVvW3x2MHA4PSceZ4dSB9MYdWokguP0BxrBDZXSS4cXUyDuA4zlIG6PMRUGoGX6UKXaOiIKX',
    category: 'electric',
    badge: 'Electric',
    specs: {
      transmission: 'Auto',
      power: '750 HP',
      acceleration: '2.6s',
      range: '350 mi',
    },
    featured: true,
    rating: 4.9,
    reviews: 124,
  },
  {
    id: '2',
    name: 'Range Rover Autobiography',
    model: '2024',
    description: 'Unmatched Comfort',
    price: 350,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAprxxhu5rMc_h0TXUyZ7RY_vxogjPr6rhOfw7jFmOaky_zZ9nxxbXRE98zyHss8lC9xdmhr152bVo3oF9r7GT_RAMo67bzH1Xg_VCIlrj2tiL3W7XRbBZTLS8gaaobZl3oD9XY5z8ws5TKFIfAG-lm_yaGXnmlJ6Tz_cR7InBx2BupMJnxWl_w22_LL1yLyoe-_vI6wGU4Jj967TMpwPMxmcHWv-SfaskDrHpgodx17VhOtnVokVk1tAZybZqT5otnxub3MCU1E4hn',
    category: 'suv',
    badge: 'Luxury SUV',
    specs: {
      transmission: 'Auto',
      power: '523 HP',
      passengers: 5,
    },
    featured: true,
    rating: 4.8,
    reviews: 98,
  },
  {
    id: '3',
    name: 'Mercedes-AMG GT 63',
    model: '2024',
    description: 'Performance Redefined',
    price: 450,
    image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&auto=format&fit=crop',
    category: 'sports',
    badge: 'Sports',
    specs: {
      transmission: 'Auto',
      power: '630 HP',
      acceleration: '3.2s',
    },
    featured: true,
    rating: 4.7,
    reviews: 87,
  },
  {
    id: '4',
    name: 'Tesla Model S Plaid',
    model: '2024',
    description: 'The Future of Driving',
    price: 399,
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop',
    category: 'electric',
    badge: 'Electric',
    specs: {
      transmission: 'Auto',
      power: '1,020 HP',
      acceleration: '1.99s',
      range: '396 mi',
    },
    featured: false,
    rating: 4.6,
    reviews: 156,
  },
]

// All Cars (for fleet page)
export const allCars: Car[] = [
  ...featuredCars,
  {
    id: '5',
    name: 'Lamborghini Huracán',
    model: '2023',
    description: 'Italian Excellence',
    price: 650,
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&auto=format&fit=crop',
    category: 'sports',
    badge: 'Sports',
    specs: {
      transmission: 'Auto',
      power: '640 HP',
      acceleration: '2.9s',
    },
    rating: 4.9,
    reviews: 203,
  },
  {
    id: '6',
    name: 'Bentley Continental GT',
    model: '2024',
    description: 'Luxury Perfected',
    price: 550,
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop',
    category: 'luxury',
    badge: 'Luxury',
    specs: {
      transmission: 'Auto',
      power: '550 HP',
      acceleration: '3.6s',
      passengers: 4,
    },
    rating: 4.8,
    reviews: 67,
  },
  {
    id: '7',
    name: 'Audi RS e-tron GT',
    model: '2024',
    description: 'Electric Performance',
    price: 420,
    image: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&auto=format&fit=crop',
    category: 'electric',
    badge: 'Electric',
    specs: {
      transmission: 'Auto',
      power: '637 HP',
      acceleration: '2.9s',
      range: '280 mi',
    },
    rating: 4.7,
    reviews: 45,
  },
]

// Features Data
export const features: Feature[] = [
  {
    id: 'curated',
    title: 'Curated Excellence',
    description: 'Every vehicle in our fleet undergoes a rigorous 200-point inspection before every delivery.',
    icon: 'verified',
  },
  {
    id: 'speed',
    title: 'Instant Approval',
    description: 'Our advanced vetting system means you can be behind the wheel in under 15 minutes.',
    icon: 'speed',
  },
  {
    id: 'support',
    title: '24/7 Concierge',
    description: 'A dedicated specialist is available round-the-clock for any request during your rental period.',
    icon: 'support_agent',
  },
]

// Statistics Data
export const stats: Stat[] = [
  { label: 'Major Cities', value: 12 },
  { label: 'Premium Cars', value: 150 },
  { label: 'Hour Support', value: 24 },
  { label: '% Satisfaction', value: 98, suffix: '%' },
]

// Footer Links
export const footerSections: FooterSection[] = [
  {
    title: 'Fleet',
    links: [
      { href: '/fleet/exotic-sports', label: 'Exotic Sports' },
      { href: '/fleet/executive-suvs', label: 'Executive SUVs' },
      { href: '/fleet/next-gen-electric', label: 'Next-Gen Electric' },
      { href: '/fleet/classic-collection', label: 'Classic Collection' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/process', label: 'Our Process' },
      { href: '/contact', label: 'Contact' },
      { href: '/locations', label: 'Locations' },
    ],
  },
]

// Social Links
export const socialLinks = [
  { href: '#', icon: 'share', label: 'Share' },
  { href: '#', icon: 'camera', label: 'Camera' },
]

// Bottom Navigation (Mobile)
export const bottomNavLinks = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/explore', label: 'Explore', icon: 'explore' },
  { href: '/fleet', label: 'Fleet', icon: 'directions_car' },
  { href: '/profile', label: 'Profile', icon: 'person' },
]