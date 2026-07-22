// Types for the car rental system

import { Key } from "react"

export interface Car {
  id: string
  name: string
  model: string
  description: string
  price: number
  image: string
  category: 'sports' | 'suv' | 'electric' | 'vintage' | 'luxury'
  badge?: string
  specs: {
    transmission: string
    power: string
    acceleration?: string
    passengers?: number
    range?: string
  }
  featured?: boolean
  rating?: number
  reviews?: number
}

export interface Collection {
  id: string
  name: string
  icon: string
  description?: string
  count?: number
  category?: string 
}

export interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

export interface NavLink {
  href: string
  label: string
}

export interface FooterLink {
  id: Key | null | undefined
  href: string
  label: string
}

export interface FooterSection {
  title: string
  links: FooterLink[]
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

export interface BookingFormData {
  pickupLocation: string
  dropoffLocation?: string
  startDate: string
  endDate: string
  pickupTime?: string
  carType?: string
}