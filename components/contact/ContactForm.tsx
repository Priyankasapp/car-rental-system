"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { contactForm } from "@/data/contact";
import { useContact } from "@/context/ContactContext";


// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ContactForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const floatingCardRef = useRef<HTMLDivElement>(null);
  
  //  Use Contact Context
  const { 
    formData, 
    setFormData, 
    submitContact, 
    loading, 
    error, 
    success,
    clearError,
    resetForm
  } = useContact();

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  //  Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  //  Handle field blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  //  Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await submitContact(formData);
    } catch (err) {
      // Error is already handled in context
      console.error('Form submission error:', err);
    }
  };

  //  Validation helper
  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName]) return null;
    
    switch (fieldName) {
      case 'firstName':
        if (!formData.firstName || formData.firstName.length < 2) {
          return 'First name is required (minimum 2 characters)';
        }
        break;
      case 'lastName':
        if (!formData.lastName || formData.lastName.length < 2) {
          return 'Last name is required (minimum 2 characters)';
        }
        break;
      case 'email':
        if (!formData.email || !formData.email.includes('@')) {
          return 'Valid email is required';
        }
        break;
      case 'service':
        if (!formData.service) {
          return 'Please select a service';
        }
        break;
      case 'message':
        if (!formData.message || formData.message.length < 10) {
          return 'Message is required (minimum 10 characters)';
        }
        break;
    }
    return null;
  };

  const isFormValid = () => {
    return (
      formData.firstName.length >= 2 &&
      formData.lastName.length >= 2 &&
      formData.email.includes('@') &&
      formData.service &&
      formData.message.length >= 10
    );
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      
      // Form Left Side Animation
      gsap.fromTo(
        '.form-content',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );

      // Image Animation
      gsap.fromTo(
        '.form-image',
        { opacity: 0, x: 30, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Floating Card Animation
      gsap.fromTo(
        '.floating-card',
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      );

      // Form Fields Stagger
      const formFields = document.querySelectorAll('.form-field');
      gsap.fromTo(
        formFields,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 75%",
            toggleActions: "play none none none"
          }
        }
      );

      // Submit Button Animation
      gsap.fromTo(
        '.form-submit',
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.6,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 70%",
            toggleActions: "play none none none"
          }
        }
      );

      // Floating Card Pulse Animation
      gsap.to('.floating-card', {
        scale: 1.03,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  //  Success Message View
  if (success) {
    return (
      <section ref={sectionRef} className="bg-gray-50 py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Contacting Us! 
            </h2>
            <p className="text-lg text-gray-600 max-w-md">
              We have received your message and our team will review your travel plans carefully. 
              We will get back to you shortly with the best recommendations for your journey.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Please check your email for confirmation.
            </p>
            <button
              onClick={resetForm}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="bg-gray-50 py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        
        {/* ===== LEFT SIDE ===== */}
        <div ref={formRef} className="form-content">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
            Contact Form
          </span>

          <h2 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {contactForm.title}
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            {contactForm.subtitle}
          </p>

          {/*  Error Message */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={clearError}
                  className="mt-1 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-10 space-y-6" noValidate>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-field w-full rounded-2xl border px-5 py-4 outline-none transition ${
                    getFieldError('firstName') 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-black'
                  }`}
                  disabled={loading}
                />
                {getFieldError('firstName') && (
                  <p className="mt-1 text-xs text-red-500">{getFieldError('firstName')}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-field w-full rounded-2xl border px-5 py-4 outline-none transition ${
                    getFieldError('lastName') 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-black'
                  }`}
                  disabled={loading}
                />
                {getFieldError('lastName') && (
                  <p className="mt-1 text-xs text-red-500">{getFieldError('lastName')}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`form-field w-full rounded-2xl border px-5 py-4 outline-none transition ${
                    getFieldError('email') 
                      ? 'border-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:border-black'
                  }`}
                  disabled={loading}
                />
                {getFieldError('email') && (
                  <p className="mt-1 text-xs text-red-500">{getFieldError('email')}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="form-field w-full rounded-2xl border border-gray-300 px-5 py-4 outline-none transition focus:border-black"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="relative">
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-field w-full rounded-2xl border px-5 py-4 outline-none transition ${
                  getFieldError('service') 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-black'
                }`}
                disabled={loading}
              >
                <option value="">Select Service</option>
                {contactForm.services.map((service) => (
                  <option key={service} value={service.toUpperCase().replace(/ /g, '_')}>
                    {service}
                  </option>
                ))}
              </select>
              {getFieldError('service') && (
                <p className="mt-1 text-xs text-red-500">{getFieldError('service')}</p>
              )}
            </div>

            <div className="relative">
              <textarea
                name="message"
                rows={6}
                placeholder="Tell us about your journey..."
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-field w-full resize-none rounded-2xl border px-5 py-4 outline-none transition ${
                  getFieldError('message') 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-black'
                }`}
                disabled={loading}
              />
              {getFieldError('message') && (
                <p className="mt-1 text-xs text-red-500">{getFieldError('message')}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="form-submit group inline-flex items-center justify-center gap-3 rounded-full bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  Send Request
                  <ArrowRight className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ===== RIGHT SIDE ===== */}
        <div ref={imageRef} className="relative">
          {/* Image */}
          <div className="form-image overflow-hidden rounded-3xl">
            <Image
              src={contactForm.image}
              alt={contactForm.title}
              width={700}
              height={800}
              className="h-175 w-full object-cover"
            />
          </div>

          {/* Floating Card with Animation */}
          <div ref={floatingCardRef} className="floating-card absolute bottom-8 left-8 rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Average Response
            </p>

            <h3 className="mt-2 text-3xl font-bold text-black">&lt; 30 min</h3>

            <p className="mt-2 text-gray-600">
              Our concierge team typically replies within half an hour.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}