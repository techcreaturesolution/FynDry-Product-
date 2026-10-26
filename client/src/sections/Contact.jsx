import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, User, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, MapPin, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import SectionTitle from '../components/SectionTitle';
import Button from '../components/Button';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Client-side validation function
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message or question.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field once user starts correcting it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    /*
     * -------------------------------------------------------------
     * TODO: [Backend / MERN API Integration]
     * In future phases, replace this simulated block with an API call:
     *
     * try {
     *   const res = await fetch('/api/contact', {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(formData),
     *   });
     *   const data = await res.json();
     * } catch (error) { ... }
     * -------------------------------------------------------------
     */

    // Simulated short processing delay for realism
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });

      // Trigger celebratory confetti if reduced motion is not preferred
      if (!shouldReduceMotion) {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1F6B3A', '#F2B705', '#A3260F', '#8B5A2B'],
          });
        } catch (err) {
          // graceful fallback
        }
      }

      // Automatically hide toast after 6 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 6000);
    }, 600);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-cream-light relative overflow-hidden">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-banana/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <SectionTitle
          badge="Get In Touch"
          title="We'd Love to Hear From You"
          subtitle="Interested in stocking FynDry in your store, asking about custom culinary powders, or just saying hello? Send us a quick note."
          align="center"
          badgeColor="bg-primary-100 text-primary-700 border-primary-200"
        />

        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Info Card */}
          <div className="md:col-span-5 bg-primary text-cream rounded-3xl p-8 shadow-card flex flex-col justify-between h-full space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent-banana block mb-2">
                Pure Natural Inquiries
              </span>
              <h3 className="font-heading text-2xl font-bold text-white mb-4">
                Fresh &amp; Wholesome Partnerships
              </h3>
              <p className="text-cream/90 text-sm leading-relaxed mb-6">
                Whether you are a health-conscious consumer, retail store buyer, or artisan chef, we provide dehydrated bulk and packaged goods tailored to your needs.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-accent-banana">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-cream/70 block">Email Us</span>
                    <span className="font-semibold text-white">hello@fyndry.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-accent-banana">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-cream/70 block">Origin</span>
                    <span className="font-semibold text-white">Fresh Farm Orchards &amp; Pantry</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-accent-banana">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-cream/70 block">Commitment</span>
                    <span className="font-semibold text-white">100% Dehydrated • Zero Oil</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/15 text-xs text-cream/80">
              Response time: typically within 24 business hours.
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 sm:p-9 shadow-card border border-gray-100 relative">
            
            {/* Success Toast Banner */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 p-4 rounded-2xl bg-primary-50 border border-primary-200 text-primary-800 flex items-start gap-3 shadow-soft"
                  role="alert"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-heading font-bold text-base block text-primary-900">
                      Thanks! We'll get back to you soon.
                    </strong>
                    <span className="text-xs text-primary-700">
                      Your message has been received by the FynDry team.
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              
              {/* Name field */}
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-bold text-gray-800 mb-1.5"
                >
                  Your Name <span className="text-brandRed">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Radhe Sharma"
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-cream-light text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? 'border-brandRed focus:ring-brandRed/30'
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-xs text-brandRed font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-bold text-gray-800 mb-1.5"
                >
                  Email Address <span className="text-brandRed">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. radhe@example.com"
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-cream-light text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-brandRed focus:ring-brandRed/30'
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-brandRed font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Message field */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-bold text-gray-800 mb-1.5"
                >
                  Your Message <span className="text-brandRed">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-3.5 pointer-events-none text-gray-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what products you are interested in, retail inquiries, or recipe questions..."
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border bg-cream-light text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.message
                        ? 'border-brandRed focus:ring-brandRed/30'
                        : 'border-gray-200 focus:border-primary focus:ring-primary/20'
                    }`}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                </div>
                {errors.message && (
                  <p id="message-error" className="mt-1.5 text-xs text-brandRed font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  icon={Send}
                  iconPosition="right"
                  className="w-full text-base py-3.5"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </div>

              <p className="text-center text-xs text-gray-500 pt-2">
                We never share your email address. Client-side verified.
              </p>

            </form>
          </div>

        </div>

      </div>
    </section>
  );
}
