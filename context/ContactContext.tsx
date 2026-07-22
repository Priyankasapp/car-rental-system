// contexts/ContactContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
  source?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ContactContextType {
  // State
  formData: ContactFormData;
  loading: boolean;
  error: string | null;
  success: boolean;
  submitted: boolean;
  
  // Actions
  setFormData: (data: Partial<ContactFormData>) => void;
  resetForm: () => void;
  submitContact: (data: ContactFormData) => Promise<ContactResponse>;
  clearError: () => void;
  clearSuccess: () => void;
}

// Initial form data
const initialFormData: ContactFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  source: 'website',
};

// Create context
const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Provider component
export function ContactProvider({ children }: { children: ReactNode }) {
  const [formData, setFormDataState] = useState<ContactFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Update form data
  const setFormData = (data: Partial<ContactFormData>) => {
    setFormDataState((prev) => ({ ...prev, ...data }));
  };

  // Reset form
  const resetForm = () => {
    setFormDataState(initialFormData);
    setError(null);
    setSuccess(false);
    setSubmitted(false);
    setLoading(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Clear success
  const clearSuccess = () => {
    setSuccess(false);
  };

  // Submit contact form
  const submitContact = async (data: ContactFormData): Promise<ContactResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit contact form');
      }

      setSuccess(true);
      setSubmitted(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 3000);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    formData,
    loading,
    error,
    success,
    submitted,
    setFormData,
    resetForm,
    submitContact,
    clearError,
    clearSuccess,
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
}

// Custom hook to use contact context
export function useContact() {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
}