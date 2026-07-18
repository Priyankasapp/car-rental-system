'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const AboutSectionHeader = ({
  estYear = "EST. 2014",
  title = "The UrbanDrive Philosophy",
  subtitle = "Precision engineering meets bespoke service. We provide more than transportation; we deliver an uncompromising standard of executive mobility.",
  buttonText = "EXPLORE EXCELLENCE",
  onButtonClick = () => {},
  backgroundImage = "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1800&q=80" 
}) => {
  const headerRef = useRef(null);

  useEffect(() => {
    // GSAP Context scopes animations inside headerRef
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.animate-fade-bg',
        { opacity: 0 },
        { opacity: 1, duration: 1.2 }
      ).fromTo(
        ['.animate-tag', '.animate-title', '.animate-sub', '.animate-btn'],
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          stagger: 0.15 
        },
        '-=0.8' // Starts text entry slightly before background finishes fading
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={headerRef} 
      className="relative w-full min-h-[90vh] flex items-center bg-white overflow-hidden mt-[-80px] pt-[80px]"
    >
      
      {/* Background Image Container */}                                                                                    
      <div 
        className="animate-fade-bg absolute inset-0 w-full h-full bg-cover bg-center md:bg-[right_center]"
        style={{ backgroundImage: `url('${backgroundImage}')` }}                                                                                                                                    
      />

      {/* Toned Down Gradient Overlay 
          Ensures the text is readable on solid white, but the car remains crisp and visible on the right */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 via-35% to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 w-full py-20">
        <div className="max-w-xl md:max-w-2xl">
          
          {/* Est. Year Tag */}
          <span className="animate-tag block text-xs md:text-sm font-semibold tracking-[0.25em] text-gray-500 uppercase mb-4">
            {estYear}
          </span>

          {/* Heading */}
          <h1 className="animate-title text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
            {title}
          </h1>

          {/* Subtitle / Description */}
          <p className="animate-sub text-sm md:text-base text-gray-600 leading-relaxed max-w-lg mb-8">
            {subtitle}
          </p>

          {/* Call to Action Button */}
          <button
            onClick={onButtonClick}
            className="animate-btn inline-block bg-black hover:bg-neutral-800 text-white font-semibold text-xs tracking-[0.2em] px-8 py-4 transition-all duration-300 ease-in-out uppercase"
          >
            {buttonText}
          </button>

        </div>
      </div>
    </section>
  );
};

export default AboutSectionHeader;