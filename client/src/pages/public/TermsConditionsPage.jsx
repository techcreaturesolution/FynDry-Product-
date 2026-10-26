import React from 'react';
import SEO from '../../components/common/SEO';
import { FileText, CheckCircle } from 'lucide-react';

export default function TermsConditionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-body text-gray-800">
      <SEO
        title="Terms & Conditions | FynDry"
        description="FynDry Terms and Conditions of service, user agreements, purchasing terms, and legal governing law."
        canonical="https://fyndry.com/terms-and-conditions"
      />

      <div className="border-b border-gray-100 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <FileText className="w-4 h-4" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Last Updated: October 2026
        </p>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or ordering from <strong>fyndry.com</strong> (&quot;Website&quot; or &quot;Service&quot;), you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you must discontinue use of the website immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            2. Product Information & Natural Produce Variance
          </h2>
          <p>
            FynDry produces 100% natural, solar-dehydrated whole fruits and vegetable powders. Because no artificial colors, chemical bleaching, or artificial waxes are used, minor natural variations in fruit color, slice geometry, and natural sweetness levels may occur across seasonal harvests.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            3. Pricing, GST, and Payment Processing
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>All prices listed on the website are displayed in Indian National Rupees (INR ₹) inclusive of applicable Goods and Services Tax (GST).</li>
            <li>We reserve the right to revise prices, promotional discounts, or shipping thresholds without prior notice.</li>
            <li>Payments are accepted via UPI, Credit/Debit cards, Net Banking via Razorpay, and Cash on Delivery (COD) where eligible.</li>
            <li>Orders placed via COD may be subject to automated or telephonic verification before packing.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            4. User Account & Password Confidentiality
          </h2>
          <p>
            When creating an account, you agree to provide truthful, accurate, and current contact details. You are responsible for safeguarding your login credentials and password. Notify us immediately at support@fyndry.com if you suspect unauthorized access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            5. Limitation of Liability & Governing Law
          </h2>
          <p>
            To the maximum extent permitted by Indian Law, FynDry shall not be liable for indirect, incidental, or consequential damages resulting from website use or delayed third-party courier services.
          </p>
          <p>
            These terms are governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts located in Nashik / Mumbai, Maharashtra.
          </p>
        </section>
      </div>
    </div>
  );
}
