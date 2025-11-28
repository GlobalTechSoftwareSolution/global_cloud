"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{type: string, message: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for your message! We'll contact you soon."
        });
        
        setFormData({
          name: "",
          phone: "",
          email: "",
          service: "",
          message: ""
        });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Oops! Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-gray-900">
      
      <div className="flex-grow py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions or want to learn more about our services? Get in touch with us!
            </p>
          </div>

          <div className="bg-[#0D1117] dark:bg-[#0D1117] rounded-xl shadow-xl border border-gray-800 overflow-hidden">
            <div className="md:flex">

              {/* LEFT PANEL */}
              <div className="md:w-2/5 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white p-6 md:p-8 border-r border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  
                  {/* PHONE */}
                  <div className="flex items-start">
                    <button
                      onClick={() => window.location.href = "tel:+918495862494"}
                      className="flex-shrink-0 bg-blue-600 p-3 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>

                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Phone</h3>
                      <a 
                        href="tel:+918495862494"
                        className="mt-1 text-sm md:text-base underline text-blue-300 hover:text-blue-200"
                      >
                        +91 8495862494
                      </a>
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div className="flex items-start">
                    <button
                      onClick={() => window.location.href = "mailto:tech@globaltechsoftwaresolutions.com"}
                      className="flex-shrink-0 bg-blue-600 p-3 rounded-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <div className="ml-4 break-words max-w-[250px]">
                      <h3 className="text-lg font-semibold">Email</h3>
                      
                      <a
                        href="mailto:tech@globaltechsoftwaresolutions.com"
                        className="mt-1 text-sm md:text-base break-all underline text-blue-300 hover:text-blue-200"
                      >
                        tech@globaltechsoftwaresolutions.com
                      </a>
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-600 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>

                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Office</h3>
                      <p className="mt-1 text-sm md:text-base">
                        No 10, 4th Floor, Gaduniya Complex, Ramaiah Layout, Vidyaranyapura, Bangalore - 560097
                      </p>
                    </div>
                  </div>

                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between text-sm md:text-base">
                      <span>Monday-Saturday</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* RIGHT FORM PANEL */}
              <div className="md:w-3/5 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>

                {submitStatus && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    submitStatus.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {submitStatus.message}
                  </div>
                )}

                {/* FORM */}
                <form onSubmit={handleSubmit}>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-[#111827] dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-[#111827] dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (123) 456-7890"
                      />
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-[#111827] dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="mb-4 md:mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Interested In
                    </label>
                    <select
                      name="service"
                      required
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-[#111827] dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a service</option>
                      <option value="Software Development">Software Development</option>
                      <option value="Web Development">App Development</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-3 py-2 md:px-4 md:py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-[#111827] dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about your project..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 md:py-3 px-4 rounded-lg transition duration-300 disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>

                </form>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
