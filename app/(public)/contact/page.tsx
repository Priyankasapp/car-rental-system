import ContactHero from "@/components/contact/ContactHero";
import ContactInfo from "@/components/contact/ContactInfo";
import ContactForm from "@/components/contact/ContactForm";

import FAQ from "@/components/contact/FAQ";
import CTA from "@/components/contact/CTA";
import Map from "@/components/contact/Map";


const Page = () => {
  return (
    <>
  
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <Map />
      <FAQ />
      <CTA />
   
    </>
  );
};

export default Page;
