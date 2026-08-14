import UnifiedHero from '@/components/Hero/UnifiedHero'
import { contactHero } from '@/data/contact'

export default function ContactPage() {
  return (
    <UnifiedHero
      variant="contact"
      badge={contactHero.badge}
      title={contactHero.title}
      subtitle={contactHero.description}
      imageSrc={contactHero.image}
      primaryButtonText={contactHero.primaryButton}
      primaryButtonHref="/fleet"
    />
  )
}