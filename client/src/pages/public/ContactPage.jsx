import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SectionTitle from '../../components/SectionTitle';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be a valid 10-digit number'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

const faqs = [
  {
    q: 'How long do FynDry dehydrated products stay fresh?',
    a: 'Because moisture is thoroughly removed and our pouches are nitrogen-sealed with a moisture barrier, unopened packs stay fresh for 12 months. Once opened, reseal the ziplock pouch to keep them crisp for up to 30 days.',
  },
  {
    q: 'Are any preservatives, sulfur, or sugar added?',
    a: 'None! Every FynDry product is single-ingredient or all-natural whole food with absolutely zero added preservatives, zero chemical sulfites, zero added sugars, and zero frying oils.',
  },
  {
    q: 'How do I use FynDry vegetable powders in cooking?',
    a: 'Our Garlic Powder and Red Onion Powder can be added directly into hot curries, marinades, soups, gravies, or dry rubs without needing to chop or fry in advance. 1 tsp of powder equals roughly 1 medium fresh onion or 3–4 garlic cloves.',
  },
  {
    q: 'What are the delivery timelines and shipping charges?',
    a: 'Orders are dispatched within 24 hours from our kitchen. Standard courier delivery takes 2–4 business days across metro cities in India and 3–6 days for regional locations. Orders over ₹499 enjoy free shipping!',
  },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    // Simulate API contact inquiry
    await new Promise((res) => setTimeout(res, 800));
    setSubmitting(false);
    toast.success('Thank you! Your message has been sent. Our team will contact you shortly.');
    reset();
  };

  return (
    <div className="py-8 sm:py-16 space-y-16 sm:space-y-24">
      {/* 1. Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>We are here to help</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-black text-gray-900 tracking-tight max-w-2xl mx-auto">
          Get in Touch with the FynDry Team
        </h1>

        <p className="mt-4 text-base text-gray-600 max-w-xl mx-auto font-body">
          Questions about our dehydrated foods, wholesale & B2B bulk supply, or order assistance?
          Send us a note!
        </p>
      </section>

      {/* 2. Contact Grid: Contact Info Cards + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-heading font-bold text-gray-900">Email Inquiries</h4>
                <p className="text-xs text-gray-500 font-body mb-2">We reply within 12 hours</p>
                <a
                  href="mailto:support@fyndry.com"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  support@fyndry.com
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-heading font-bold text-gray-900">Phone Support</h4>
                <p className="text-xs text-gray-500 font-body mb-2">Mon – Sat, 9:00 AM – 6:00 PM</p>
                <a href="tel:+919876543210" className="text-sm font-bold text-primary hover:underline">
                  +91 98765 43210
                </a>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-soft flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-heading font-bold text-gray-900">Facility & Headquarters</h4>
                <p className="text-sm text-gray-600 font-body mt-1">
                  Plot 42, Green Agro Park, MIDC Industrial Area, Pune, Maharashtra 411018, India
                </p>
              </div>
            </div>

            <div className="bg-primary/10 rounded-3xl p-6 sm:p-7 border border-primary/20">
              <h4 className="text-sm font-heading font-bold text-primary uppercase tracking-wider mb-1">
                Wholesale & Bulk Supply
              </h4>
              <p className="text-xs text-gray-600 font-body leading-relaxed">
                Looking for 5kg+ food service or bakery packs of our garlic, onion, or fruit powders?
                Email our institutional desk at <strong>wholesale@fyndry.com</strong>.
              </p>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xl">
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Send a Direct Message
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 font-body mb-8">
                Fill in the details below and our team will get back to you promptly.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Full Name"
                    placeholder="e.g. Aditi Sharma"
                    error={errors.name?.message}
                    required
                    {...register('name')}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. aditi@example.com"
                    error={errors.email?.message}
                    required
                    {...register('email')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number (10 digits)"
                    placeholder="e.g. 9876543210"
                    error={errors.phone?.message}
                    required
                    {...register('phone')}
                  />

                  <Input
                    label="Subject"
                    placeholder="e.g. Order Inquiry / Bulk"
                    error={errors.subject?.message}
                    required
                    {...register('subject')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 font-body">
                    Message <span className="text-brandRed">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you today?"
                    className={`w-full font-body rounded-xl border bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.message
                        ? 'border-brandRed focus:border-brandRed'
                        : 'border-gray-200 focus:border-primary'
                    }`}
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-brandRed font-semibold">
                      • {errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  icon={Send}
                  iconPosition="right"
                  className="w-full sm:w-auto mt-2"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Frequently Asked Questions"
          subtitle="Quick answers to common questions about storage, usage, and purity"
          centered
        />

        <div className="mt-10 space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full flex items-center justify-between p-5 text-left font-heading font-bold text-gray-900 text-base sm:text-lg hover:text-primary transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-sm sm:text-base text-gray-600 font-body leading-relaxed border-t border-gray-50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
