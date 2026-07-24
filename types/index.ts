// types/index.ts
import { Key } from 'react'

// ============ Car & Vehicle Types ============
export type CarCategory = 'sports' | 'suv' | 'electric' | 'vintage' | 'luxury'

export interface CarSpecs {
  transmission: string
  power: string
  acceleration?: string
  passengers?: number
  range?: string
}

export interface Car {
  id: string
  name: string
  model: string
  description: string
  price: number
  image: string
  category: CarCategory
  badge?: string
  specs: CarSpecs
  featured?: boolean
  rating?: number
  reviews?: number
}

// ============ UI & Section Types ============
export interface Collection {
  id: string
  name: string
  icon: string
  description?: string
  count?: number
  category?: CarCategory | string
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface Stat {
  label: string
  value: number
  suffix?: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  avatar?: string
  rating: number
}

// ============ Navigation & Footer Types ============
export interface NavLink {
  href: string
  label: string
}

export interface FooterLink {
  id?: Key | null
  href: string
  label: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
}

// ============ Booking & Reservation Types ============
export interface BookingFormData {
  pickupLocation: string
  dropoffLocation?: string
  startDate: string
  endDate: string
  pickupTime?: string
  carType?: CarCategory | string
}