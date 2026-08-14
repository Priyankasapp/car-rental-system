import UnifiedHero from '@/components/Hero/UnifiedHero'

export default function AboutPage() {
  return (
    <UnifiedHero
      variant="about"
      estYear="EST. 2014"
      title="The UrbanDrive Philosophy"
      subtitle="Precision engineering meets bespoke service. We provide more than transportation; we deliver an uncompromising standard of executive mobility."
      imageSrc="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1800&q=80"
      primaryButtonText="EXPLORE EXCELLENCE"
      onPrimaryClick={() => console.log('Button clicked')}
    />
  )
}