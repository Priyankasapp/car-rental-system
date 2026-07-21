import {
  ContactCTA,
  ContactFormSection,
  ContactHero,
  ContactInfoSection,
  FAQSection,
  OfficeLocation,
} from "@/types/ contact";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
export const contactHero: ContactHero = {
  badge: "Luxury Concierge",

  title: "Let's Begin Your Journey.",

  description:
    "Whether you're reserving a weekend supercar or arranging executive transportation, our concierge team is ready to assist.",

  image: "/assets/car1.jpeg",

  primaryButton: "Book a Vehicle",

  secondaryButton: "Call Concierge",
};

export const contactInfo: ContactInfoSection = {
  title: "Get in Touch",

  subtitle:
    "Our team is available around the clock to provide a seamless luxury experience.",

  cards: [
    {
      title: "Phone",
      value: "+91 98765 43210",
      description: "24/7 Concierge",
      icon: Phone,
    },
    {
      title: "Email",
      value: "hello@urbandrive.com",
      description: "Replies within one hour",
      icon: Mail,
    },
    {
      title: "Headquarters",
      value: "Ahmedabad, Gujarat",
      description: "Luxury Experience Center",
      icon: MapPin,
    },
    {
      title: "Working Hours",
      value: "Open Every Day",
      description: "24 Hours",
      icon: Clock,
    },
  ],
};

export const contactForm: ContactFormSection = {
  title: "Send us a Message",

  subtitle:
    "Share your travel plans and we'll recommend the perfect luxury vehicle.",

  image: "/images/contact/form.jpg",

  services: [
    "Luxury Sedan",
    "SUV",
    "Sports Car",
    "Wedding Car",
    "Airport Transfer",
    "Corporate Rental",
  ],
};

export const officeLocation: OfficeLocation = {
  badge: "Visit Us",

  title: "Our Experience Center",

  subtitle:
    "Visit our flagship showroom and meet our luxury mobility specialists.",

  address:
    "UrbanDrive Experience Center,\nSG Highway,\nAhmedabad, Gujarat 380015",

  phone: "+91 98765 43210",

  email: "hello@urbandrive.com",

  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=YOUR_GOOGLE_MAP_EMBED_LINK",
};

export const faqSection: FAQSection = {
  badge: "FAQ",

  title: "Frequently Asked Questions",

  faqs: [
    {
      question: "How do I reserve a vehicle?",
      answer:
        "Choose your preferred vehicle, submit your booking request, and our concierge team will contact you shortly to confirm your reservation.",
    },
    {
      question: "Can I rent a luxury car with a chauffeur?",
      answer:
        "Yes. We offer professional chauffeur services for selected luxury vehicles.",
    },
    {
      question: "Do you provide doorstep delivery?",
      answer:
        "Absolutely. We can deliver and collect your vehicle from your preferred location.",
    },
    {
      question: "Which payment methods are accepted?",
      answer:
        "We accept major credit cards, debit cards, bank transfers, and secure online payments.",
    },
  ],
};

export const contactCTA: ContactCTA = {
  title: "Ready to Experience UrbanDrive?",

  subtitle:
    "Reserve your luxury vehicle today and enjoy a first-class driving experience.",

  primaryButton: "Explore Fleet",

  secondaryButton: "Contact Concierge",
};
