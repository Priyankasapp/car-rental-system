// About page specific types

export interface AboutHero {
  label: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  backgroundImage: string
}

export interface AboutStory {
  title: string
  paragraphs: string[]
  image: string
  stats: AboutStat[]
}

export interface AboutStat {
  value: string
  label: string
}

export interface AboutBrandCard {
  icon: string
  title: string
  description: string
}

export interface AboutFeature {
  icon: string
  text: string
}

export interface AboutCTA {
  title: string
  subtitle: string
  primaryButton: {
    label: string
    href: string
  }
  secondaryButton?: {
    label: string
    href: string
  }
}

export interface AboutData {
  hero: AboutHero
  story: AboutStory
  brandCards: AboutBrandCard[]
  features: AboutFeature[]
  cta: AboutCTA
}