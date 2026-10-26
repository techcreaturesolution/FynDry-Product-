import React from 'react';
import SEO from '../../components/common/SEO';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-body text-gray-800">
      <SEO
        title="Privacy Policy | FynDry"
        description="FynDry Privacy Policy: Learn how we collect, protect, and handle your personal data when ordering dehydrated foods."
        canonical="https://fyndry.com/privacy-policy"
      />

      <div className="border-b border-gray-100 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-black text-gray-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Last Updated: October 2026 • Effective Date: October 2026
        </p>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none space-y-8 text-gray-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
            <span>1. Overview & Commitment</span>
          </h2>
          <p>
            Welcome to <strong>FynDry</strong> (operated under registered business entity <em>[FynDry Agro Private Limited / Enterprise Name]</em>). We value your trust and are deeply committed to protecting your personal information. This Privacy Policy outlines our practices regarding data collection, usage, and disclosure when you browse our website (<strong>fyndry.com</strong>) or purchase our solar-dehydrated foods.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            2. Information We Collect
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>Account & Profile Details:</strong> Your full name, email address, contact phone number, and password hash.
            </li>
            <li>
              <strong>Delivery & Billing Addresses:</strong> House/flat number, street, landmark, city, state, 6-digit Indian PIN code, and optional GPS coordinates when you use live location pinning.
            </li>
            <li>
              <strong>Transaction & Payment Information:</strong> Payment method selected (Razorpay UPI, Cards, NetBanking, COD), order ID, payment status, and gateway transaction tokens. <em>Note: We NEVER store credit card numbers, CVVs, or bank net banking passwords on our servers. All sensitive financial transactions are encrypted and processed by RBI-licensed payment aggregators (Razorpay).</em>
            </li>
            <li>
              <strong>Device & Browsing Analytics:</strong> IP address, browser type, referral URLs, operating system, and session cookies for authentication.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            3. How We Use Your Data
          </h2>
          <p>We process collected customer information strictly to:</p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Process, assemble, pack, and ship your ordered food items.</li>
            <li>Send order confirmation notifications, courier tracking updates, and digital invoices.</li>
            <li>Provide customer support and resolve product delivery queries.</li>
            <li>Prevent fraudulent transactions and secure our platform.</li>
            <li>Comply with Indian tax, GST, and e-commerce consumer protection regulations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            4. Data Sharing & Third-Party Disclosure
          </h2>
          <p>
            We do not sell, rent, or trade your personal information to marketing brokers. Information is shared only with verified service providers:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li><strong>Logistics & Courier Partners:</strong> (e.g. Delhivery, Shiprocket, BlueDart) to execute doorstep parcel delivery.</li>
            <li><strong>Payment Gateways:</strong> (Razorpay Software Private Limited) for processing encrypted payments.</li>
            <li><strong>Transactional Messaging:</strong> Email / SMS services for order confirmations and OTP verification.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            5. Cookies and Security Safeguards
          </h2>
          <p>
            We deploy strict industry security safeguards: secure HTTPS (TLS 1.3), hashed passwords with Bcrypt (cost factor 10), encrypted JWT tokens in HTTP-only SameSite cookies, and NoSQL injection sanitizers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-heading font-bold text-gray-900">
            6. Grievance Officer & Contact
          </h2>
          <p>
            In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules 2020, our designated Grievance Officer details are:
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200 text-xs sm:text-sm space-y-1">
            <p><strong>Grievance Officer:</strong> Ravi S. / Legal Desk</p>
            <p><strong>Entity:</strong> FynDry Foods</p>
            <p><strong>Email:</strong> support@fyndry.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Office Address:</strong> 108 Greenfield Agro Estate, Nashik, Maharashtra 422001, India</p>
          </div>
        </section>
      </div>
    </div>
  );
}
