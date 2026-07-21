import { LucideIcon } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface CarsHeroData {
  badge: string;
  title: string;
  subtitle: string;
}

export interface Car {
  id: string;
  slug: string;
  brand: string;
  name: string;
  image: string;
  horsepower: number;
  transmission: string;
  fuelType: string;
  seats: number;
}

export interface ContactHero {
  badge: string;
  title: string;
  description: string;
  image: string;
  primaryButton: string;
  secondaryButton: string;
}

// === ADD THESE MISSING INTERFACES BELOW ===

export interface ContactCard {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon; // This allows you to pass Lucide components like Phone, Mail, etc.
}

export interface ContactInfoSection {
  title: string;
  subtitle: string;
  cards: ContactCard[];
}

export interface ContactFormSection {
  title: string;
  subtitle: string;
  image: string;
  services: string[];
}

export interface OfficeLocation {
  badge: string;
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  badge: string;
  title: string;
  faqs: FAQItem[];
}

export interface ContactCTA {
  title: string;
  subtitle: string;
  primaryButton: string;
  secondaryButton: string;
}
